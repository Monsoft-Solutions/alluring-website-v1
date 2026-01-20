/**
 * Bulk Inline Images Workflow
 *
 * A durable Vercel Workflow that processes multiple blog posts to generate
 * inline images. This workflow can pause, resume, and maintain state across
 * deployments and crashes.
 *
 * Each step (analysis, image generation, content saving) is durable and
 * will be retried automatically on failure.
 *
 * @module @admin/app/workflows/inline-image-generation/bulk-inline-images
 */

import { analyzeContentStep } from './analyze-content.step'
import { generateImageStep } from './generate-image.step'
import { saveContentStep } from './save-content.step'

/**
 * Input for the bulk inline images workflow
 */
export type BulkInlineImagesWorkflowInput = {
    postIds: string[]
    maxImagesPerPost: number
}

/**
 * Result of processing a single post
 */
export type PostProcessingResult = {
    postId: string
    postTitle?: string
    success: boolean
    error?: string
    imagesGenerated?: number
    imagesInserted?: number
}

/**
 * Output of the bulk inline images workflow
 */
export type BulkInlineImagesWorkflowResult = {
    processedCount: number
    failedCount: number
    totalImagesGenerated: number
    totalImagesInserted: number
    results: PostProcessingResult[]
}

/**
 * Bulk Inline Images Workflow
 *
 * Processes multiple blog posts to generate and insert inline images.
 * Each post is processed sequentially, but image generation within a post
 * can be parallelized.
 *
 * @param input - Workflow input containing post IDs and settings
 * @returns Workflow result with processing statistics
 */
export async function bulkInlineImagesWorkflow(
    input: BulkInlineImagesWorkflowInput
): Promise<BulkInlineImagesWorkflowResult> {
    'use workflow'

    const { postIds, maxImagesPerPost } = input
    const results: PostProcessingResult[] = []
    let processedCount = 0
    let failedCount = 0
    let totalImagesGenerated = 0
    let totalImagesInserted = 0

    console.log(
        `[Workflow] Starting bulk inline images workflow for ${postIds.length} posts`
    )

    // Process each post sequentially to avoid overwhelming the AI APIs
    for (const postId of postIds) {
        console.log(`[Workflow] Processing post: ${postId}`)

        try {
            // Step 1: Analyze content and generate prompts
            const analysisResult = await analyzeContentStep({
                postId,
                maxImages: maxImagesPerPost,
            })

            if (!analysisResult.success) {
                failedCount++
                results.push({
                    postId,
                    postTitle: analysisResult.postTitle,
                    success: false,
                    error: analysisResult.error || 'Analysis failed',
                })
                continue
            }

            // No opportunities found - still counts as success
            if (analysisResult.opportunities.length === 0) {
                processedCount++
                results.push({
                    postId,
                    postTitle: analysisResult.postTitle,
                    success: true,
                    imagesGenerated: 0,
                    imagesInserted: 0,
                })
                continue
            }

            // Step 2: Generate images (each is a separate durable step)
            const generatedImages: Array<{
                imageUrl: string
                insertAfterText: string
                altText: string
            }> = []

            for (const opportunity of analysisResult.opportunities) {
                const imageResult = await generateImageStep({
                    postId,
                    opportunityId: opportunity.opportunityId,
                    prompt: opportunity.prompt,
                    imageType: opportunity.imageType,
                    photoStyle: opportunity.photoStyle,
                    insertAfterText: opportunity.insertAfterText,
                    altText: opportunity.altText,
                })

                if (imageResult.success && imageResult.imageUrl) {
                    generatedImages.push({
                        imageUrl: imageResult.imageUrl,
                        insertAfterText: imageResult.insertAfterText,
                        altText: imageResult.altText,
                    })
                    totalImagesGenerated++
                }
            }

            // Step 3: Save content with generated images
            if (generatedImages.length > 0) {
                const saveResult = await saveContentStep({
                    postId,
                    images: generatedImages,
                })

                if (saveResult.success) {
                    totalImagesInserted += saveResult.imagesInserted
                }
            }

            processedCount++
            results.push({
                postId,
                postTitle: analysisResult.postTitle,
                success: true,
                imagesGenerated: generatedImages.length,
                imagesInserted: generatedImages.length,
            })

            console.log(
                `[Workflow] Completed post "${analysisResult.postTitle}": ${generatedImages.length} images`
            )
        } catch (error) {
            console.error(`[Workflow] Error processing post ${postId}:`, error)
            failedCount++
            results.push({
                postId,
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Processing failed',
            })
        }
    }

    console.log(
        `[Workflow] Completed: ${processedCount} processed, ${failedCount} failed, ${totalImagesGenerated} images`
    )

    return {
        processedCount,
        failedCount,
        totalImagesGenerated,
        totalImagesInserted,
        results,
    }
}
