/**
 * Pipeline Utility Functions
 *
 * Helper functions for the blog content pipeline.
 */
import { STAGE_ORDER } from '@/lib/constants/pipeline.constant'
import type { PipelineStatus } from '@/lib/types/blog/blog-action.type'

/**
 * Type guard for PipelineStatus
 */
export function isPipelineStatus(status: unknown): status is PipelineStatus {
    return (
        typeof status === 'string' &&
        (STAGE_ORDER as readonly string[]).includes(status)
    )
}
