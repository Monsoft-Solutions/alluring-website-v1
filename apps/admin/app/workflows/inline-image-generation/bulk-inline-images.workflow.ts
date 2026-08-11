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

import type { InlineImageTypeValue } from '@workspace/ai'

import { analyzeContentStep } from './analyze-content.step'
import { generateImageStep } from './generate-image.step'
import { saveContentStep } from './save-content.step'

/**
 * Maximum number of posts to process concurrently.
 * Adjust this value to balance speed vs API rate limits.
 */
const MAX_CONCURRENT_POSTS = 5

/**
 * Splits an array into chunks of the specified size.
 */
function chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size))
    }
    return chunks
}

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
 * Internal result type for processSinglePost that includes image counts
 */
type SinglePostResult = PostProcessingResult & {
    _imagesGenerated: number
    _imagesInserted: number
}

/**
 * Processes a single blog post to generate and insert inline images.
 *
 * @param postId - The ID of the post to process
 * @param maxImagesPerPost - Maximum number of images to generate for this post
 * @returns Processing result with image counts
 */
async function processSinglePost(
    postId: string,
    maxImagesPerPost: number
): Promise<SinglePostResult> {
    console.log(`[Workflow] Processing post: ${postId}`)

    try {
        // Step 1: Analyze content and generate prompts
        const analysisResult = await analyzeContentStep({
            postId,
            maxImages: maxImagesPerPost,
        })

        if (!analysisResult.success) {
            return {
                postId,
                postTitle: analysisResult.postTitle,
                success: false,
                error: analysisResult.error || 'Analysis failed',
                _imagesGenerated: 0,
                _imagesInserted: 0,
            }
        }

        // No opportunities found - still counts as success
        if (analysisResult.opportunities.length === 0) {
            return {
                postId,
                postTitle: analysisResult.postTitle,
                success: true,
                imagesGenerated: 0,
                imagesInserted: 0,
                _imagesGenerated: 0,
                _imagesInserted: 0,
            }
        }

        // Step 2: Generate images (each is a separate durable step)
        const generatedImages: Array<{
            imageUrl: string
            insertAfterText: string
            altText: string
            imageType: InlineImageTypeValue
            prompt: string
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
                slug: analysisResult.postSlug,
                primaryKeyword: analysisResult.primaryKeyword,
            })

            if (imageResult.success && imageResult.imageUrl) {
                generatedImages.push({
                    imageUrl: imageResult.imageUrl,
                    insertAfterText: imageResult.insertAfterText,
                    altText: imageResult.altText,
                    imageType: imageResult.imageType,
                    prompt: imageResult.prompt,
                })
            }
        }

        // Step 3: Save content with generated images
        let imagesInserted = 0
        if (generatedImages.length > 0) {
            const saveResult = await saveContentStep({
                postId,
                images: generatedImages,
            })

            if (saveResult.success) {
                imagesInserted = saveResult.imagesInserted
            }
        }

        console.log(
            `[Workflow] Completed post "${analysisResult.postTitle}": ${generatedImages.length} images`
        )

        return {
            postId,
            postTitle: analysisResult.postTitle,
            success: true,
            imagesGenerated: generatedImages.length,
            imagesInserted: imagesInserted,
            _imagesGenerated: generatedImages.length,
            _imagesInserted: imagesInserted,
        }
    } catch (error) {
        console.error(`[Workflow] Error processing post ${postId}:`, error)

        return {
            postId,
            success: false,
            error: error instanceof Error ? error.message : 'Processing failed',
            _imagesGenerated: 0,
            _imagesInserted: 0,
        }
    }
}

/**
 * Bulk Inline Images Workflow
 *
 * Processes multiple blog posts to generate and insert inline images.
 * Posts are processed in parallel batches (up to MAX_CONCURRENT_POSTS at a time)
 * for improved performance.
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
        `[Workflow] Starting bulk inline images workflow for ${postIds.length} posts (concurrency: ${MAX_CONCURRENT_POSTS})`
    )

    // Split posts into chunks for parallel processing
    const postChunks = chunkArray(postIds, MAX_CONCURRENT_POSTS)

    for (const chunk of postChunks) {
        console.log(
            `[Workflow] Processing batch of ${chunk.length} posts in parallel`
        )

        // Process all posts in this chunk concurrently
        const batchResults = await Promise.all(
            chunk.map((postId) => processSinglePost(postId, maxImagesPerPost))
        )

        // Aggregate results from this batch
        for (const result of batchResults) {
            // Extract internal counters and create clean result
            const { _imagesGenerated, _imagesInserted, ...cleanResult } = result

            results.push(cleanResult)

            if (result.success) {
                processedCount++
            } else {
                failedCount++
            }

            totalImagesGenerated += _imagesGenerated
            totalImagesInserted += _imagesInserted
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
