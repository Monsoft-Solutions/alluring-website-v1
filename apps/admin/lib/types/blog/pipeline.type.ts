/**
 * Pipeline Types
 *
 * Types for the blog content pipeline Kanban board.
 * Separated from queries to be client-safe.
 */
import type { PlanningData, PipelineState } from '@workspace/db/types'
import type {
    PipelineStatus,
    ProcessingStatus,
    BlogPostPriority,
} from './blog-action.type'

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
