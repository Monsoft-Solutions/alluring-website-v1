/**
 * Pipeline Types
 *
 * Types for the blog content pipeline Kanban board.
 * Shared between server and client components.
 *
 * @module @admin/lib/types/pipeline
 */
import type { PlanningData, PipelineState } from '@workspace/db/types'
import type {
    PipelineStatus,
    ProcessingStatus,
    BlogPostPriority,
} from './blog/blog-action.type'

import { STAGE_ORDER } from '../constants/pipeline.constant'

/**
 * Type guard for PipelineStatus
 */
export function isPipelineStatus(status: unknown): status is PipelineStatus {
    return (
        typeof status === 'string' &&
        (STAGE_ORDER as readonly string[]).includes(status)
    )
}

/**
 * Blog post item for the Kanban board
 */
export type PipelinePostItem = {
    id: string
    title: string
    slug: string | null
    status: PipelineStatus
    priority: BlogPostPriority
    pipelineProcessingStatus: ProcessingStatus
    processingError: string | null
    primaryKeyword: string | null
    ideaApproval: 'pending' | 'approved' | 'rejected' | null
    /** Set ⇒ this is a hidden refresh working copy (epic #144). */
    refreshOfPostId?: string | null
    authorName: string | null
    featuredImageUrl: string | null
    planningData: PlanningData | null
    pipelineState: PipelineState | null
    createdAt: Date | null
    updatedAt: Date | null
}

/**
 * Posts grouped by pipeline status for Kanban view
 */
export type PostsByStatus = {
    ideation: PipelinePostItem[]
    generate: PipelinePostItem[]
    ai_review: PipelinePostItem[]
    generate_metadata: PipelinePostItem[]
    generate_image: PipelinePostItem[]
    draft: PipelinePostItem[]
    ready_to_publish: PipelinePostItem[]
    scheduled: PipelinePostItem[]
    published: PipelinePostItem[]
}

/**
 * Stats for each pipeline status
 */
export type PipelineStats = {
    ideation: number
    generate: number
    ai_review: number
    generate_metadata: number
    generate_image: number
    draft: number
    ready_to_publish: number
    scheduled: number
    published: number
    processing: number
    error: number
}
