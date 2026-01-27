'use server'

/**
 * Instagram SEO Actions
 *
 * Server actions for Instagram SEO operations:
 * - Bulk SEO title generation (via Vercel Workflow)
 *
 * @module @admin/lib/actions/instagram-seo
 */

import { start } from 'workflow/api'

import { requireAuth, UnauthorizedError } from '@/lib/utils/auth.util'
import { bulkSeoTitlesWorkflow } from '@/app/workflows/seo-title-generation/bulk-seo-titles.workflow'

// ============================================================================
// Types
// ============================================================================

type BulkSeoTitlesResult = {
    success: boolean
    error?: string
    /**
     * Run ID for tracking the workflow status.
     * When present, the client should poll /api/workflow/[runId] for status.
     */
    runId?: string
}

// ============================================================================
// Constants
// ============================================================================

const MAX_BULK_SEO_TITLE_GENERATION = 100

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate post IDs array
 */
function validatePostIds(
    postIds: string[] | undefined,
    maxCount: number
): BulkSeoTitlesResult | null {
    if (!postIds || postIds.length === 0) {
        return { success: false, error: 'No post IDs provided' }
    }

    if (postIds.length > maxCount) {
        return {
            success: false,
            error: `Maximum ${maxCount} posts can be processed at once`,
        }
    }

    return null
}

/**
 * Handle action errors with consistent formatting
 */
function handleActionError(
    error: unknown,
    fallbackMessage: string,
    logPrefix?: string
): BulkSeoTitlesResult {
    if (error instanceof UnauthorizedError) {
        return { success: false, error: 'Unauthorized' }
    }

    const errorMessage = logPrefix || fallbackMessage
    console.error(errorMessage, error)

    return {
        success: false,
        error: error instanceof Error ? error.message : fallbackMessage,
    }
}

// ============================================================================
// Bulk SEO Title Generation Action (via Vercel Workflow)
// ============================================================================

/**
 * Generate SEO titles for multiple Instagram posts using AI
 *
 * Uses Vercel Workflow for durable, resumable execution that survives
 * timeouts and crashes. Returns immediately with a run ID that can be
 * polled for status.
 *
 * @param postIds - Array of Instagram post IDs to generate titles for
 * @returns BulkSeoTitlesResult with runId for status polling
 */
export async function bulkGenerateInstagramSeoTitles(
    postIds: string[]
): Promise<BulkSeoTitlesResult> {
    try {
        await requireAuth()

        const validation = validatePostIds(
            postIds,
            MAX_BULK_SEO_TITLE_GENERATION
        )
        if (validation) return validation

        console.log(
            `[Instagram SEO] Starting workflow for ${postIds.length} posts`
        )

        // Start the durable workflow - returns immediately
        const run = await start(bulkSeoTitlesWorkflow, [{ postIds }])

        console.log(
            `[Instagram SEO] Workflow started with run ID: ${run.runId}`
        )

        return {
            success: true,
            runId: run.runId,
        }
    } catch (error) {
        return handleActionError(
            error,
            'Failed to start SEO title generation',
            'Error starting SEO title workflow:'
        )
    }
}
