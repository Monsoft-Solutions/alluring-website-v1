/**
 * Analysis Constants
 *
 * Configuration constants for Instagram post analysis operations.
 *
 * @module lib/constants/analysis
 */

/**
 * Concurrency limits for analysis operations
 *
 * These limits balance performance with API rate limits and resource usage:
 * - POSTS: Number of posts to analyze in parallel
 * - IMAGES_PER_POST: Number of images per post to analyze in parallel
 * - MAX_TOTAL_IMAGES: Safety limit for total concurrent API calls
 */
export const ANALYSIS_CONCURRENCY_LIMITS = {
    /** Analyze 3 posts at once (conservative for DB and memory) */
    POSTS: 10,

    /** Analyze 5 images per post concurrently */
    IMAGES_PER_POST: 5,

    /**
     * Safety limit for total concurrent API calls across all posts
     * Prevents overwhelming OpenAI API rate limits
     * 3 posts * 5 images = 15 max concurrent vision API calls
     */
    MAX_TOTAL_IMAGES: 50,
} as const

/**
 * Concurrency limit for Instagram post sync operations
 *
 * Controls how many posts are processed in parallel during sync.
 * Balance between speed and avoiding overwhelming the database and blob storage.
 */
export const SYNC_CONCURRENCY_LIMIT = 5
