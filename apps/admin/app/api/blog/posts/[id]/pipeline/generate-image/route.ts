/**
 * Pipeline Image Generation Stage API
 *
 * Triggers the featured image generation phase for a blog post.
 * AI selects optimal image options, generates prompt, creates image via fal.ai,
 * and links it as the featured image.
 *
 * @route POST /api/blog/posts/[id]/pipeline/generate-image
 */
import type { NextRequest } from 'next/server'
import { after, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@workspace/db/client'
import { blogPost, images, blogPostImages } from '@workspace/db/schema/blog'
import type { PipelineState } from '@workspace/db/types'
import { runImageGenerationPhase } from '@workspace/ai/pipelines'
import { generateImageAlt } from '@workspace/ai/functions'
import { extractImageConcept } from '@workspace/ai/prompts'

import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'
import { langfuseSpanProcessor } from '@/instrumentation'
import { getBlogAiConfig } from '@/lib/queries/blog-ai-config.query'
import {
    generateImageWithFal,
    getFalModelId,
} from '@/lib/services/fal-image-generation.service'

export const runtime = 'nodejs'
export const maxDuration = 120 // 2 minutes for image generation

type RouteParams = {
    params: Promise<{ id: string }>
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
    const { id } = await params

    try {
        await requireAuth()

        // Fetch the blog post
        const [post] = await db
            .select()
            .from(blogPost)
            .where(eq(blogPost.id, id))
            .limit(1)

        if (!post) {
            return NextResponse.json(
                { success: false, error: 'Blog post not found' },
                { status: 404 }
            )
        }

        // Validate post is in correct stage
        if (post.status !== 'generate_image') {
            return NextResponse.json(
                {
                    success: false,
                    error: `Post must be in "generate_image" status to generate image. Current: ${post.status}`,
                },
                { status: 400 }
            )
        }

        // Check if already processing
        if (post.pipelineProcessingStatus === 'processing') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Image generation already in progress',
                },
                { status: 409 }
            )
        }

        // Validate content exists
        if (!post.content) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Content is required for image generation phase',
                },
                { status: 400 }
            )
        }

        // Set processing status
        await db
            .update(blogPost)
            .set({
                pipelineProcessingStatus: 'processing',
                processingStartedAt: new Date(),
                processingError: null,
            })
            .where(eq(blogPost.id, id))

        // Admin-configured image model and (optionally) a pinned artistic
        // style. A null style means "auto" — the runner's AI picks per topic.
        const aiConfig = await getBlogAiConfig()

        // Run image generation phase. The fal.ai service is injected as the
        // renderer so the AI package stays free of environment dependencies,
        // and so the no-people QA gate can regenerate through the same path.
        const phaseResult = await runImageGenerationPhase({
            title: post.title,
            content: post.content,
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
                    `[Image Generation API] Rendering with fal.ai (${model}, ${aspectRatio}, attempt ${attempt})...`
                )

                const [rendered] = await generateImageWithFal({
                    prompt,
                    blogPostId: id,
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
            // Update with error
            await db
                .update(blogPost)
                .set({
                    pipelineProcessingStatus: 'error',
                    processingError:
                        phaseResult.error || 'Failed to generate image prompt',
                })
                .where(eq(blogPost.id, id))

            // Flush telemetry
            after(async () => await langfuseSpanProcessor.forceFlush())

            return NextResponse.json(
                {
                    success: false,
                    error:
                        phaseResult.error || 'Failed to generate image prompt',
                },
                { status: 500 }
            )
        }

        const generatedImage = phaseResult.image
        if (!generatedImage) {
            await db
                .update(blogPost)
                .set({
                    pipelineProcessingStatus: 'error',
                    processingError: 'Failed to generate image with fal.ai',
                })
                .where(eq(blogPost.id, id))

            return NextResponse.json(
                { success: false, error: 'Failed to generate image' },
                { status: 500 }
            )
        }

        if (phaseResult.peopleDetected) {
            console.warn(
                `[Image Generation API] Image for post ${id} may contain a person and needs human review`
            )
        }

        // Generate alt text describing the image concept, not the raw brief
        console.log('[Image Generation API] Generating alt text...')
        const altResult = await generateImageAlt({
            prompt: phaseResult.prompt,
            concept: extractImageConcept(phaseResult.prompt),
            primaryKeyword: post.primaryKeyword || undefined,
        })

        // Create image record
        console.log('[Image Generation API] Creating image record...')
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
            throw new Error('Failed to create image record')
        }

        // Link image to blog post via junction table
        await db.insert(blogPostImages).values({
            blogPostId: id,
            imageId: imageRecord.id,
            prompt: phaseResult.prompt,
        })

        // Flush telemetry
        after(async () => await langfuseSpanProcessor.forceFlush())

        // Build pipeline state update
        const existingPipelineState = post.pipelineState || {}
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
                aiSummary: phaseResult.summary || post.aiSummary, // Persist summary if generated
                pipelineProcessingStatus: 'idle',
                processingError: null,
                processingStartedAt: null,
                pipelineState: updatedPipelineState,
                status: 'draft', // Auto-advance to draft for human review
            })
            .where(eq(blogPost.id, id))

        console.log('[Image Generation API] Image generation complete')

        return NextResponse.json({
            success: true,
            imageId: imageRecord.id,
            imageUrl: generatedImage.url,
            alt: altResult.alt,
            selectedOptions: phaseResult.selectedOptions,
            artisticStyleId: phaseResult.artisticStyleId,
            peopleDetected: phaseResult.peopleDetected ?? false,
            qaRegenerated: phaseResult.qaRegenerated ?? false,
            timeMs: phaseResult.timeMs,
            nextStatus: 'draft',
        })
    } catch (error) {
        // Reset processing status on error
        await db
            .update(blogPost)
            .set({
                pipelineProcessingStatus: 'error',
                processingError:
                    error instanceof Error ? error.message : 'Unknown error',
            })
            .where(eq(blogPost.id, id))

        return handleApiError(error, 'Failed to run image generation phase')
    }
}
