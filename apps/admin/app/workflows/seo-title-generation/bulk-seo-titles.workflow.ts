/**
 * Bulk SEO Titles Workflow
 *
 * A durable Vercel Workflow that processes multiple Instagram posts to generate
 * unique SEO titles. This workflow can pause, resume, and maintain state across
 * deployments and crashes.
 *
 * Each step (title generation) is durable and will be retried automatically
 * on failure.
 *
 * @module @admin/app/workflows/seo-title-generation/bulk-seo-titles
 */

import { generateTitleStep } from './generate-title.step'

/**
 * Maximum number of posts to process concurrently.
 * Adjust this value to balance speed vs API rate limits.
 */
const MAX_CONCURRENT_POSTS = 100

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
 * Input for the bulk SEO titles workflow
 */
export type BulkSeoTitlesWorkflowInput = {
    postIds: string[]
}

/**
 * Result of processing a single post
 */
export type PostTitleResult = {
    postId: string
    success: boolean
    seoTitle?: string
    error?: string
}

/**
 * Output of the bulk SEO titles workflow
 */
export type BulkSeoTitlesWorkflowResult = {
    processedCount: number
    failedCount: number
    results: PostTitleResult[]
}

/**
 * Processes a single post to generate an SEO title.
 */
async function processSinglePost(postId: string): Promise<PostTitleResult> {
    console.log(`[Workflow] Processing post: ${postId}`)

    try {
        const result = await generateTitleStep({ postId })

        return {
            postId: result.postId,
            success: result.success,
            seoTitle: result.seoTitle,
            error: result.error,
        }
    } catch (error) {
        console.error(`[Workflow] Error processing post ${postId}:`, error)

        return {
            postId,
            success: false,
            error: error instanceof Error ? error.message : 'Processing failed',
        }
    }
}

/**
 * Bulk SEO Titles Workflow
 *
 * Processes multiple Instagram posts to generate unique SEO titles.
 * Posts are processed in parallel batches (up to MAX_CONCURRENT_POSTS at a time)
 * for improved performance.
 *
 * @param input - Workflow input containing post IDs
 * @returns Workflow result with processing statistics
 */
export async function bulkSeoTitlesWorkflow(
    input: BulkSeoTitlesWorkflowInput
): Promise<BulkSeoTitlesWorkflowResult> {
    'use workflow'

    const { postIds } = input
    const results: PostTitleResult[] = []
    let processedCount = 0
    let failedCount = 0

    console.log(
        `[Workflow] Starting bulk SEO title generation for ${postIds.length} posts (concurrency: ${MAX_CONCURRENT_POSTS})`
    )

    // Split posts into chunks for parallel processing
    const postChunks = chunkArray(postIds, MAX_CONCURRENT_POSTS)

    for (const chunk of postChunks) {
        console.log(
            `[Workflow] Processing batch of ${chunk.length} posts in parallel`
        )

        // Process all posts in this chunk concurrently
        const batchResults = await Promise.all(
            chunk.map((postId) => processSinglePost(postId))
        )

        // Aggregate results from this batch
        for (const result of batchResults) {
            results.push(result)

            if (result.success) {
                processedCount++
            } else {
                failedCount++
            }
        }
    }

    console.log(
        `[Workflow] Completed: ${processedCount} processed, ${failedCount} failed`
    )

    return {
        processedCount,
        failedCount,
        results,
    }
}
