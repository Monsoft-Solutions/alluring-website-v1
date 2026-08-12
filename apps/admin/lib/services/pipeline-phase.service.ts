/**
 * Pipeline Phase Service
 *
 * Internal service for running pipeline phases directly without HTTP.
 * Used for server-side chaining of pipeline stages via after() callbacks.
 *
 * @module @admin/lib/services/pipeline-phase
 */
import { eq } from 'drizzle-orm'
import { SpanStatusCode, trace } from '@opentelemetry/api'
import { db } from '@workspace/db/client'
import {
    blogPost,
    images,
    blogPostImages,
    type BlogPost,
} from '@workspace/db/schema/blog'
import type {
    PipelineState,
    PipelineMetrics,
    PipelinePhaseKey,
} from '@workspace/db/types'
import {
    runGenerationPhase,
    runReviewPhase,
    runExtractionPhase,
    runImageGenerationPhase,
} from '@workspace/ai/pipelines'
import { generateImageAlt } from '@workspace/ai/functions'
import { extractImageConcept } from '@workspace/ai/prompts'

import { calculateDuration } from '@/lib/utils/time.util'
import { isTransientProviderError } from '@/lib/utils/transient-error.util'
import { getBlogAiConfig } from '@/lib/queries/blog-ai-config.query'
import { createPagesForQueryAdapter } from '@/lib/services/topic-sourcing.service'
import {
    generateImageWithFal,
    getFalModelId,
} from './fal-image-generation.service'

// ============================================
// Shared Helper Functions
// ============================================

/**
 * Options accepted by every phase runner.
 *
 * `chain` (default true) controls whether the runner invokes the next phase
 * when it completes. The Kanban/HTTP path keeps the default so the pipeline
 * flows end-to-end; the autopilot workflow passes `chain: false` and owns
 * sequencing itself, one budgeted step per phase.
 */
export type PhaseRunOptions = {
    chain?: boolean
    /**
     * Internal: marks the one-shot re-run a phase gets after a transient
     * provider error, so a retried phase can never retry again.
     */
    isAutoRetry?: boolean
}

/**
 * Outcome of a phase runner. `skipped` marks validation-level no-ops (wrong
 * status, already processing, post missing) as opposed to real phase errors.
 */
export type PhaseRunResult = {
    success: boolean
    skipped?: boolean
    error?: string
    /** Generation-only response metadata (word count etc.) for HTTP callers */
    meta?: {
        wordCount: number
        sourcesCount: number
        toolCallCount: number
        timeMs: number
    }
}

type PhaseValidationResult =
    | { valid: true; post: BlogPost }
    | { valid: false; post: null; reason: string }

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
        return { valid: false, post: null, reason: 'Post not found' }
    }

    if (post.status !== expectedStatus) {
        console.log(
            `[Pipeline Service] Post ${postId} not in ${expectedStatus} status (${post.status}), skipping`
        )
        return {
            valid: false,
            post: null,
            reason: `Post not in ${expectedStatus} status (${post.status})`,
        }
    }

    if (post.pipelineProcessingStatus === 'processing') {
        console.log(
            `[Pipeline Service] Post ${postId} already processing, skipping`
        )
        return { valid: false, post: null, reason: 'Post already processing' }
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
        return {
            valid: false,
            post: null,
            reason: `Content is required for ${phaseName} phase`,
        }
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

/**
 * Free the processing flag and record the auto-retry in pipelineState so
 * the admin can see the phase was silently re-run and why.
 */
async function recordAutoRetry(
    postId: string,
    phaseKey: PipelinePhaseKey,
    reason: string
): Promise<void> {
    const [post] = await db
        .select({ pipelineState: blogPost.pipelineState })
        .from(blogPost)
        .where(eq(blogPost.id, postId))
        .limit(1)

    const existingState: PipelineState = post?.pipelineState ?? {}
    await db
        .update(blogPost)
        .set({
            pipelineProcessingStatus: 'idle',
            processingError: null,
            pipelineState: {
                ...existingState,
                autoRetries: {
                    ...existingState.autoRetries,
                    [phaseKey]: {
                        attemptedAt: new Date().toISOString(),
                        reason,
                    },
                },
            },
        })
        .where(eq(blogPost.id, postId))
}

/**
 * Tracer for pipeline phase spans; exported spans land in Langfuse via the
 * globally registered provider in instrumentation.ts.
 */
const pipelineTracer = trace.getTracer('pipeline-phase')

/**
 * Run a phase inside a root span so every AI SDK call it makes joins one
 * trace, and hand back that trace's id for pipelineState — this is what the
 * admin's "open in Langfuse" link points at.
 */
async function withPhaseSpan<T>(
    spanName: string,
    postId: string,
    fn: () => Promise<T>
): Promise<{ result: T; traceId: string }> {
    return pipelineTracer.startActiveSpan(
        spanName,
        { attributes: { 'blog.post.id': postId } },
        async (span) => {
            try {
                const result = await fn()
                return { result, traceId: span.spanContext().traceId }
            } catch (error) {
                span.setStatus({ code: SpanStatusCode.ERROR })
                throw error
            } finally {
                span.end()
            }
        }
    )
}

/**
 * Fail a phase — or, once per phase, re-run it when the failure looks like
 * a transient provider error (rate limit, 5xx, network drop). `isAutoRetry`
 * on the re-run guards the recursion to a single attempt.
 */
async function failPhaseOrAutoRetry(args: {
    postId: string
    phaseKey: PipelinePhaseKey
    phaseName: string
    error: unknown
    options: PhaseRunOptions
    rerun: () => Promise<PhaseRunResult>
}): Promise<PhaseRunResult> {
    const { postId, phaseKey, phaseName, error, options, rerun } = args
    const errorMessage =
        error instanceof Error
            ? error.message
            : typeof error === 'string'
              ? error
              : 'Unknown error'

    if (!options.isAutoRetry && isTransientProviderError(error)) {
        console.warn(
            `[Pipeline Service] ${phaseName} phase hit a transient provider error for post ${postId}; retrying once: ${errorMessage}`
        )
        await recordAutoRetry(postId, phaseKey, errorMessage)
        return rerun()
    }

    await setPhaseResultError(postId, errorMessage, phaseName)
    return { success: false, error: errorMessage }
}

// ============================================
// Pipeline Phase Runners
// ============================================

/**
 * Run the content generation phase for a post.
 *
 * Extracted from the pipeline/generate HTTP route so headless callers
 * (autopilot) can drive generation without cookie auth. Handles its own DB
 * reads/writes and error handling; on success advances the post to
 * `ai_review` and, unless `chain: false`, continues into the review phase.
 *
 * Unlike the later phases, generation runs before content exists — it
 * validates `planningData` instead of `content`.
 */
export async function runGenerationPhaseForPost(
    postId: string,
    options: PhaseRunOptions = {}
): Promise<PhaseRunResult> {
    const chain = options.chain ?? true
    console.log(
        `[Pipeline Service] Starting generation phase for post ${postId}`
    )

    try {
        const [post] = await db
            .select()
            .from(blogPost)
            .where(eq(blogPost.id, postId))
            .limit(1)

        if (!post) {
            console.error(
                `[Pipeline Service] Post ${postId} not found for generation`
            )
            return { success: false, skipped: true, error: 'Post not found' }
        }

        if (post.status !== 'generate') {
            console.log(
                `[Pipeline Service] Post ${postId} not in generate status (${post.status}), skipping`
            )
            return {
                success: false,
                skipped: true,
                error: `Post not in generate status (${post.status})`,
            }
        }

        if (post.pipelineProcessingStatus === 'processing') {
            console.log(
                `[Pipeline Service] Post ${postId} already processing, skipping`
            )
            return {
                success: false,
                skipped: true,
                error: 'Post already processing',
            }
        }

        const planningData = post.planningData
        if (!planningData) {
            await setPhaseResultError(
                postId,
                'Planning data with outline is required for generation',
                'Generation'
            )
            return {
                success: false,
                error: 'Planning data with outline is required for generation',
            }
        }

        await setProcessingStatus(postId)

        // Admin-configured model wins; the runner keeps its own default when
        // no configuration row exists yet.
        const aiConfig = await getBlogAiConfig()

        const { result, traceId } = await withPhaseSpan(
            'pipeline.generation',
            postId,
            () =>
                runGenerationPhase({
                    contentModelId: aiConfig.contentModelId,
                    input: {
                        title: post.title,
                        topic: planningData.topic,
                        primaryKeyword: post.primaryKeyword || undefined,
                        secondaryKeywords: post.secondaryKeywords || undefined,
                        targetAudience: planningData.targetAudience,
                        uniqueAngle: planningData.uniqueAngle,
                        contentType: planningData.contentType,
                        estimatedWordCount: planningData.estimatedWordCount,
                    },
                })
        )

        if (!result.success) {
            return failPhaseOrAutoRetry({
                postId,
                phaseKey: 'generation',
                phaseName: 'Generation',
                error: result.error ?? 'Generation phase failed',
                options,
                rerun: () =>
                    runGenerationPhaseForPost(postId, {
                        ...options,
                        isAutoRetry: true,
                    }),
            })
        }

        const existingPipelineState: PipelineState = post.pipelineState ?? {}
        const updatedPipelineState: PipelineState = {
            ...existingPipelineState,
            generationPhase: {
                startedAt:
                    post.processingStartedAt?.toISOString() ||
                    new Date().toISOString(),
                completedAt: new Date().toISOString(),
                sources: result.sources,
                initialContent: result.content,
                initialWordCount: result.wordCount,
                toolCallCount: result.toolCallCount,
                stepCount: result.stepCount,
                model: result.modelId,
                traceId,
            },
        }

        await db
            .update(blogPost)
            .set({
                content: result.content,
                pipelineProcessingStatus: 'idle',
                processingError: null,
                processingStartedAt: null,
                pipelineState: updatedPipelineState,
                status: 'ai_review',
            })
            .where(eq(blogPost.id, postId))

        console.log(
            `[Pipeline Service] Generation phase complete for post ${postId} - ${result.wordCount} words, Time: ${result.timeMs}ms`
        )

        if (chain) {
            console.log(
                `[Pipeline Service] Chaining to review phase for post ${postId}`
            )
            await runReviewPhaseForPost(postId)
        }

        return {
            success: true,
            meta: {
                wordCount: result.wordCount,
                sourcesCount: result.sources.length,
                toolCallCount: result.toolCallCount,
                timeMs: result.timeMs,
            },
        }
    } catch (error) {
        return failPhaseOrAutoRetry({
            postId,
            phaseKey: 'generation',
            phaseName: 'Generation',
            error,
            options,
            rerun: () =>
                runGenerationPhaseForPost(postId, {
                    ...options,
                    isAutoRetry: true,
                }),
        })
    }
}

/**
 * Run review phase for a post (called internally after generation)
 *
 * Handles its own DB reads/writes and error handling.
 * Sets processing status, runs 5 review agents, and chains to extract phase.
 *
 * @param postId - The blog post ID to run review for
 */
export async function runReviewPhaseForPost(
    postId: string,
    options: PhaseRunOptions = {}
): Promise<PhaseRunResult> {
    const chain = options.chain ?? true
    console.log(`[Pipeline Service] Starting review phase for post ${postId}`)

    try {
        // Validate post for this phase
        const validation = await fetchAndValidatePostForPhase(
            postId,
            'ai_review',
            'review'
        )
        if (!validation.valid) {
            return { success: false, skipped: true, error: validation.reason }
        }

        const { post } = validation

        // Set processing status
        await setProcessingStatus(postId)

        // Admin-configured model wins; the runner keeps its own default when
        // no configuration row exists yet.
        const aiConfig = await getBlogAiConfig()

        // Run review phase
        const planningData = post.planningData
        const { result, traceId } = await withPhaseSpan(
            'pipeline.review',
            postId,
            () =>
                runReviewPhase({
                    content: post.content!,
                    title: post.title,
                    primaryKeyword: post.primaryKeyword || undefined,
                    secondaryKeywords: post.secondaryKeywords || undefined,
                    targetAudience: planningData?.targetAudience,
                    contentType: planningData?.contentType,
                    estimatedWordCount: planningData?.estimatedWordCount,
                    reviewModelId: aiConfig.reviewModelId,
                    currentPostSlug: post.slug || undefined,
                    pagesForQuery: createPagesForQueryAdapter(),
                })
        )

        if (!result.success) {
            return failPhaseOrAutoRetry({
                postId,
                phaseKey: 'review',
                phaseName: 'Review',
                error: result.error ?? 'Review phase failed',
                options,
                rerun: () =>
                    runReviewPhaseForPost(postId, {
                        ...options,
                        isAutoRetry: true,
                    }),
            })
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
                model: result.modelId,
                traceId,
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

        if (chain) {
            // Chain to extraction phase
            console.log(
                `[Pipeline Service] Chaining to extraction phase for post ${postId}`
            )
            await runExtractPhaseForPost(postId)
        }

        return { success: true }
    } catch (error) {
        return failPhaseOrAutoRetry({
            postId,
            phaseKey: 'review',
            phaseName: 'Review',
            error,
            options,
            rerun: () =>
                runReviewPhaseForPost(postId, {
                    ...options,
                    isAutoRetry: true,
                }),
        })
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
export async function runExtractPhaseForPost(
    postId: string,
    options: PhaseRunOptions = {}
): Promise<PhaseRunResult> {
    const chain = options.chain ?? true
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
        if (!validation.valid) {
            return { success: false, skipped: true, error: validation.reason }
        }

        const { post } = validation

        // Set processing status
        await setProcessingStatus(postId)

        // Admin-configured extraction model wins over the code default
        const aiConfig = await getBlogAiConfig()

        // Run extraction phase
        const { result, traceId } = await withPhaseSpan(
            'pipeline.extraction',
            postId,
            () =>
                runExtractionPhase({
                    content: post.content!,
                    title: post.title,
                    primaryKeyword: post.primaryKeyword || undefined,
                    modelId: aiConfig.extractionModelId,
                })
        )

        if (!result.success) {
            return failPhaseOrAutoRetry({
                postId,
                phaseKey: 'extraction',
                phaseName: 'Extraction',
                error: result.error ?? 'Extraction phase failed',
                options,
                rerun: () =>
                    runExtractPhaseForPost(postId, {
                        ...options,
                        isAutoRetry: true,
                    }),
            })
        }

        // Build pipeline state update with metrics. Phase times are derived
        // from each phase's own start/complete timestamps; review time spans
        // review + orchestration (they run as one phase).
        const existingPipelineState: PipelineState = post.pipelineState ?? {}
        const generationTimeMs = calculateDuration(
            existingPipelineState.generationPhase?.startedAt,
            existingPipelineState.generationPhase?.completedAt
        )
        const reviewTimeMs = calculateDuration(
            existingPipelineState.reviewPhase?.startedAt,
            existingPipelineState.reviewPhase?.completedAt
        )
        const orchestrationTimeMs =
            existingPipelineState.orchestrationPhase?.result
                ?.processingTimeMs ?? 0
        const metrics: PipelineMetrics = {
            totalTimeMs: generationTimeMs + reviewTimeMs + result.timeMs,
            generationTimeMs,
            reviewTimeMs,
            orchestrationTimeMs,
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
                model: result.modelId,
                traceId,
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

        if (chain) {
            // Chain to image generation phase
            console.log(
                `[Pipeline Service] Chaining to image generation phase for post ${postId}`
            )
            await runImageGenerationPhaseForPost(postId)
        }

        return { success: true }
    } catch (error) {
        return failPhaseOrAutoRetry({
            postId,
            phaseKey: 'extraction',
            phaseName: 'Extraction',
            error,
            options,
            rerun: () =>
                runExtractPhaseForPost(postId, {
                    ...options,
                    isAutoRetry: true,
                }),
        })
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
    postId: string,
    options: PhaseRunOptions = {}
): Promise<PhaseRunResult> {
    // Terminal phase — `chain` has nothing to flow into; only the
    // auto-retry marker in `options` is meaningful here.
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
        if (!validation.valid) {
            return { success: false, skipped: true, error: validation.reason }
        }

        const { post } = validation

        // Set processing status
        await setProcessingStatus(postId)

        // Admin-configured image model and (optionally) a pinned artistic
        // style. A null style means "auto" — the runner's AI picks per topic.
        const aiConfig = await getBlogAiConfig()

        // Run image generation phase. The fal.ai service is injected as the
        // renderer so the AI package stays free of environment dependencies,
        // and so the no-people QA gate can regenerate through the same path.
        const { result: phaseResult, traceId } = await withPhaseSpan(
            'pipeline.image-generation',
            postId,
            () =>
                runImageGenerationPhase({
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
        )

        if (!phaseResult.success || !phaseResult.prompt) {
            return failPhaseOrAutoRetry({
                postId,
                phaseKey: 'imageGeneration',
                phaseName: 'ImageGeneration',
                error: phaseResult.error || 'Failed to generate image prompt',
                options,
                rerun: () =>
                    runImageGenerationPhaseForPost(postId, {
                        ...options,
                        isAutoRetry: true,
                    }),
            })
        }

        const generatedImage = phaseResult.image
        if (!generatedImage) {
            return failPhaseOrAutoRetry({
                postId,
                phaseKey: 'imageGeneration',
                phaseName: 'ImageGeneration',
                error: 'Failed to generate image with fal.ai',
                options,
                rerun: () =>
                    runImageGenerationPhaseForPost(postId, {
                        ...options,
                        isAutoRetry: true,
                    }),
            })
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
            return { success: false, error: 'Failed to create image record' }
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
                traceId,
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

        return { success: true }
    } catch (error) {
        return failPhaseOrAutoRetry({
            postId,
            phaseKey: 'imageGeneration',
            phaseName: 'ImageGeneration',
            error,
            options,
            rerun: () =>
                runImageGenerationPhaseForPost(postId, {
                    ...options,
                    isAutoRetry: true,
                }),
        })
    }
}
