/**
 * Pipeline Phase Service
 *
 * Internal service for running pipeline phases directly without HTTP.
 * Used for server-side chaining of pipeline stages via after() callbacks.
 *
 * @module @admin/lib/services/pipeline-phase
 */
import { eq } from 'drizzle-orm'
import { db } from '@workspace/db/client'
import {
    blogPost,
    images,
    blogPostImages,
    type BlogPost,
} from '@workspace/db/schema/blog'
import type { PipelineState, PipelineMetrics } from '@workspace/db/types'
import {
    runReviewPhase,
    runExtractionPhase,
    runImageGenerationPhase,
} from '@workspace/ai/pipelines'
import { generateImageAlt } from '@workspace/ai/functions'
import { extractImageConcept } from '@workspace/ai/prompts'

import { calculateDuration } from '@/lib/utils/time.util'
import { getBlogAiConfig } from '@/lib/queries/blog-ai-config.query'
import {
    generateImageWithFal,
    getFalModelId,
} from './fal-image-generation.service'

// ============================================
// Shared Helper Functions
// ============================================

type PhaseValidationResult =
    | { valid: true; post: BlogPost }
    | { valid: false; post: null }

/**
 * Fetch and validate a post for a pipeline phase
 *
 * Checks that the post exists, is in the expected status,
 * is not already processing, and has content.
 */
async function fetchAndValidatePostForPhase(
    postId: string,
    expectedStatus: string,
    phaseName: string
): Promise<PhaseValidationResult> {
    const [post] = await db
        .select()
        .from(blogPost)
        .where(eq(blogPost.id, postId))
        .limit(1)

    if (!post) {
        console.error(
            `[Pipeline Service] Post ${postId} not found for ${phaseName}`
        )
        return { valid: false, post: null }
    }

    if (post.status !== expectedStatus) {
        console.log(
            `[Pipeline Service] Post ${postId} not in ${expectedStatus} status (${post.status}), skipping`
        )
        return { valid: false, post: null }
    }

    if (post.pipelineProcessingStatus === 'processing') {
        console.log(
            `[Pipeline Service] Post ${postId} already processing, skipping`
        )
        return { valid: false, post: null }
    }

    if (!post.content) {
        console.error(
            `[Pipeline Service] Post ${postId} has no content for ${phaseName}`
        )
        await db
            .update(blogPost)
            .set({
                pipelineProcessingStatus: 'error',
                processingError: `Content is required for ${phaseName} phase`,
            })
            .where(eq(blogPost.id, postId))
        return { valid: false, post: null }
    }

    return { valid: true, post }
}

/**
 * Set a post's processing status to 'processing'
 */
async function setProcessingStatus(postId: string): Promise<void> {
    await db
        .update(blogPost)
        .set({
            pipelineProcessingStatus: 'processing',
            processingStartedAt: new Date(),
            processingError: null,
        })
        .where(eq(blogPost.id, postId))
}

/**
 * Handle a phase error by logging and updating the post status
 */
async function handlePhaseError(
    postId: string,
    error: unknown,
    phaseName: string
): Promise<void> {
    const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
    console.error(
        `[Pipeline Service] ${phaseName} phase error for post ${postId}:`,
        errorMessage
    )

    await db
        .update(blogPost)
        .set({
            pipelineProcessingStatus: 'error',
            processingError: errorMessage,
        })
        .where(eq(blogPost.id, postId))
}

/**
 * Set a phase result error in the database
 */
async function setPhaseResultError(
    postId: string,
    errorMessage: string,
    phaseName: string
): Promise<void> {
    console.error(
        `[Pipeline Service] ${phaseName} phase failed for post ${postId}: ${errorMessage}`
    )
    await db
        .update(blogPost)
        .set({
            pipelineProcessingStatus: 'error',
            processingError: errorMessage,
        })
        .where(eq(blogPost.id, postId))
}

// ============================================
// Pipeline Phase Runners
// ============================================

/**
 * Run review phase for a post (called internally after generation)
 *
 * Handles its own DB reads/writes and error handling.
 * Sets processing status, runs 5 review agents, and chains to extract phase.
 *
 * @param postId - The blog post ID to run review for
 */
export async function runReviewPhaseForPost(postId: string): Promise<void> {
    console.log(`[Pipeline Service] Starting review phase for post ${postId}`)

    try {
        // Validate post for this phase
        const validation = await fetchAndValidatePostForPhase(
            postId,
            'ai_review',
            'review'
        )
        if (!validation.valid) return

        const { post } = validation

        // Set processing status
        await setProcessingStatus(postId)

        // Admin-configured model wins; the runner keeps its own default when
        // no configuration row exists yet.
        const aiConfig = await getBlogAiConfig()

        // Run review phase
        const planningData = post.planningData
        const result = await runReviewPhase({
            content: post.content!,
            title: post.title,
            primaryKeyword: post.primaryKeyword || undefined,
            secondaryKeywords: post.secondaryKeywords || undefined,
            targetAudience: planningData?.targetAudience,
            contentType: planningData?.contentType,
            estimatedWordCount: planningData?.estimatedWordCount,
            reviewModelId: aiConfig.reviewModelId,
        })

        if (!result.success) {
            await setPhaseResultError(
                postId,
                result.error ?? 'Review phase failed',
                'Review'
            )
            return
        }

        // Build pipeline state update
        const existingPipelineState: PipelineState = post.pipelineState ?? {}
        const updatedPipelineState: PipelineState = {
            ...existingPipelineState,
            reviewPhase: {
                startedAt:
                    post.processingStartedAt?.toISOString() ||
                    new Date().toISOString(),
                completedAt: new Date().toISOString(),
                reviews: result.reviews,
            },
            orchestrationPhase: result.orchestratorResult
                ? {
                      startedAt:
                          post.processingStartedAt?.toISOString() ||
                          new Date().toISOString(),
                      completedAt: new Date().toISOString(),
                      result: result.orchestratorResult,
                  }
                : undefined,
        }

        // Update post with revised content and advance to next stage
        const finalContent = result.revisedContent || post.content
        await db
            .update(blogPost)
            .set({
                content: finalContent,
                pipelineProcessingStatus: 'idle',
                processingError: null,
                processingStartedAt: null,
                pipelineState: updatedPipelineState,
                status: 'generate_metadata',
            })
            .where(eq(blogPost.id, postId))

        const avgScore =
            result.reviews.length > 0
                ? Math.round(
                      result.reviews.reduce((sum, r) => sum + r.score, 0) /
                          result.reviews.length
                  )
                : 0

        console.log(
            `[Pipeline Service] Review phase complete for post ${postId} - Avg score: ${avgScore}, Time: ${result.totalTimeMs}ms`
        )

        // Chain to extraction phase
        console.log(
            `[Pipeline Service] Chaining to extraction phase for post ${postId}`
        )
        await runExtractPhaseForPost(postId)
    } catch (error) {
        await handlePhaseError(postId, error, 'Review')
    }
}

/**
 * Run extraction phase for a post (called internally after review)
 *
 * Handles its own DB reads/writes and error handling.
 * Extracts metadata and FAQs, then sets status to draft.
 *
 * @param postId - The blog post ID to run extraction for
 */
export async function runExtractPhaseForPost(postId: string): Promise<void> {
    console.log(
        `[Pipeline Service] Starting extraction phase for post ${postId}`
    )

    try {
        // Validate post for this phase
        const validation = await fetchAndValidatePostForPhase(
            postId,
            'generate_metadata',
            'extraction'
        )
        if (!validation.valid) return

        const { post } = validation

        // Set processing status
        await setProcessingStatus(postId)

        // Admin-configured extraction model wins over the code default
        const aiConfig = await getBlogAiConfig()

        // Run extraction phase
        const result = await runExtractionPhase({
            content: post.content!,
            title: post.title,
            primaryKeyword: post.primaryKeyword || undefined,
            modelId: aiConfig.extractionModelId,
        })

        if (!result.success) {
            await setPhaseResultError(
                postId,
                result.error ?? 'Extraction phase failed',
                'Extraction'
            )
            return
        }

        // Build pipeline state update with metrics
        const existingPipelineState: PipelineState = post.pipelineState ?? {}
        const metrics: PipelineMetrics = {
            totalTimeMs:
                (existingPipelineState.generationPhase
                    ? calculateDuration(
                          existingPipelineState.generationPhase.startedAt,
                          existingPipelineState.generationPhase.completedAt
                      )
                    : 0) + result.timeMs,
            generationTimeMs: 0,
            reviewTimeMs: 0,
            orchestrationTimeMs: 0,
            extractionTimeMs: result.timeMs,
            toolCallCount:
                existingPipelineState.generationPhase?.toolCallCount || 0,
            stepCount: existingPipelineState.generationPhase?.stepCount || 0,
        }

        const updatedPipelineState: PipelineState = {
            ...existingPipelineState,
            extractionPhase: {
                startedAt:
                    post.processingStartedAt?.toISOString() ||
                    new Date().toISOString(),
                completedAt: new Date().toISOString(),
            },
            metrics,
        }

        // Generate slug if not set
        const slug =
            post.slug ||
            post.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')

        // Update post with extracted metadata and advance to generate_image
        await db
            .update(blogPost)
            .set({
                slug,
                metaTitle: result.metaTitle,
                metaDescription: result.metaDescription,
                excerpt: result.excerpt,
                readingTime: result.readingTimeMinutes,
                faqs: result.faqs,
                pipelineProcessingStatus: 'idle',
                processingError: null,
                processingStartedAt: null,
                pipelineState: updatedPipelineState,
                status: 'generate_image', // Chain to image generation
            })
            .where(eq(blogPost.id, postId))

        console.log(
            `[Pipeline Service] Extraction phase complete for post ${postId} - ${result.faqs.length} FAQs, Time: ${result.timeMs}ms`
        )

        // Chain to image generation phase
        console.log(
            `[Pipeline Service] Chaining to image generation phase for post ${postId}`
        )
        await runImageGenerationPhaseForPost(postId)
    } catch (error) {
        await handlePhaseError(postId, error, 'Extraction')
    }
}

/**
 * Run image generation phase for a post (called internally after extraction)
 *
 * Handles its own DB reads/writes and error handling.
 * AI selects image options, generates prompt, creates image via fal.ai,
 * then sets status to draft.
 *
 * @param postId - The blog post ID to run image generation for
 */
export async function runImageGenerationPhaseForPost(
    postId: string
): Promise<void> {
    console.log(
        `[Pipeline Service] Starting image generation phase for post ${postId}`
    )

    try {
        // Validate post for this phase
        const validation = await fetchAndValidatePostForPhase(
            postId,
            'generate_image',
            'image-generation'
        )
        if (!validation.valid) return

        const { post } = validation

        // Set processing status
        await setProcessingStatus(postId)

        // Admin-configured image model and (optionally) a pinned artistic
        // style. A null style means "auto" — the runner's AI picks per topic.
        const aiConfig = await getBlogAiConfig()

        // Run image generation phase. The fal.ai service is injected as the
        // renderer so the AI package stays free of environment dependencies,
        // and so the no-people QA gate can regenerate through the same path.
        const phaseResult = await runImageGenerationPhase({
            title: post.title,
            content: post.content!,
            primaryKeyword: post.primaryKeyword || undefined,
            aiSummary: post.aiSummary || undefined,
            imageModel: aiConfig.imageModelId,
            ...(aiConfig.artisticStyleId
                ? { forcedArtisticStyleId: aiConfig.artisticStyleId }
                : {}),
            imageAdapter: async ({
                prompt,
                aspectRatio,
                model,
                descriptor,
                attempt,
            }) => {
                console.log(
                    `[Pipeline Service] Rendering image for post ${postId} (${model}, ${aspectRatio}, attempt ${attempt})...`
                )

                const [rendered] = await generateImageWithFal({
                    prompt,
                    blogPostId: postId,
                    model,
                    numImages: 1,
                    aspectRatio,
                    slug: post.slug || undefined,
                    descriptor,
                })

                return rendered
                    ? {
                          url: rendered.blobUrl,
                          width: rendered.width,
                          height: rendered.height,
                      }
                    : null
            },
        })

        if (!phaseResult.success || !phaseResult.prompt) {
            await setPhaseResultError(
                postId,
                phaseResult.error || 'Failed to generate image prompt',
                'ImageGeneration'
            )
            return
        }

        const generatedImage = phaseResult.image
        if (!generatedImage) {
            await setPhaseResultError(
                postId,
                'Failed to generate image with fal.ai',
                'ImageGeneration'
            )
            return
        }

        if (phaseResult.peopleDetected) {
            console.warn(
                `[Pipeline Service] Image for post ${postId} may contain a person and needs human review`
            )
        }

        // Generate alt text describing the image concept, not the raw brief
        console.log(
            `[Pipeline Service] Generating alt text for post ${postId}...`
        )
        const altResult = await generateImageAlt({
            prompt: phaseResult.prompt,
            concept: extractImageConcept(phaseResult.prompt),
            primaryKeyword: post.primaryKeyword || undefined,
        })

        // Create image record
        console.log(
            `[Pipeline Service] Creating image record for post ${postId}...`
        )
        const [imageRecord] = await db
            .insert(images)
            .values({
                url: generatedImage.url,
                alt: altResult.alt,
                title: post.title,
                width: generatedImage.width,
                height: generatedImage.height,
                mimeType: 'image/jpeg',
                generationPrompt: phaseResult.prompt,
                generatedBy: getFalModelId(
                    phaseResult.imageModel ?? 'gpt-image-2'
                ),
            })
            .returning({ id: images.id })

        if (!imageRecord) {
            await setPhaseResultError(
                postId,
                'Failed to create image record',
                'ImageGeneration'
            )
            return
        }

        // Link image to blog post via junction table
        await db.insert(blogPostImages).values({
            blogPostId: postId,
            imageId: imageRecord.id,
            prompt: phaseResult.prompt,
        })

        // Build pipeline state update
        const existingPipelineState: PipelineState = post.pipelineState ?? {}
        const updatedPipelineState: PipelineState = {
            ...existingPipelineState,
            imageGenerationPhase: {
                startedAt:
                    post.processingStartedAt?.toISOString() ||
                    new Date().toISOString(),
                completedAt: new Date().toISOString(),
                selectedOptions: phaseResult.selectedOptions,
                prompt: phaseResult.prompt,
                imageId: imageRecord.id,
                imageUrl: generatedImage.url,
                model: phaseResult.imageModel ?? 'gpt-image-2',
                artisticStyleId: phaseResult.artisticStyleId,
                peopleDetected: phaseResult.peopleDetected,
                qaRegenerated: phaseResult.qaRegenerated,
            },
        }

        // Update post with image and advance to draft
        await db
            .update(blogPost)
            .set({
                featuredImageId: imageRecord.id,
                aiSummary: phaseResult.summary || post.aiSummary,
                pipelineProcessingStatus: 'idle',
                processingError: null,
                processingStartedAt: null,
                pipelineState: updatedPipelineState,
                status: 'draft', // Auto-advance to draft for human review
            })
            .where(eq(blogPost.id, postId))

        console.log(
            `[Pipeline Service] Image generation phase complete for post ${postId} - Time: ${phaseResult.timeMs}ms`
        )
        console.log(
            `[Pipeline Service] Pipeline complete! Post ${postId} is now in draft status`
        )
    } catch (error) {
        await handlePhaseError(postId, error, 'ImageGeneration')
    }
}
