/**
 * Blog Action Types
 *
 * Types for blog post server actions including pipeline operations.
 *
 * @module @/lib/types/blog/blog-action
 */

import type { PlanningData } from '@workspace/db/types'

/**
 * All possible pipeline status values
 */
export type PipelineStatus =
    | 'ideation'
    | 'generate'
    | 'ai_review'
    | 'generate_metadata'
    | 'draft'
    | 'ready_to_publish'
    | 'scheduled'
    | 'published'

/**
 * Processing status for pipeline operations
 */
export type ProcessingStatus = 'idle' | 'processing' | 'error'

/**
 * Priority levels for Kanban ordering
 */
export type BlogPostPriority = 'low' | 'medium' | 'high' | 'urgent'

/**
 * Result type for server actions
 */
export type ActionResult = {
    success: boolean
    error?: string
    id?: string
}

/**
 * Form data for creating a new blog post in the pipeline
 */
export type CreatePipelinePostData = {
    title: string
    primaryKeyword?: string | null
    secondaryKeywords?: string[] | null
    authorId?: string | null
    priority?: BlogPostPriority
    planningData?: PlanningData | null
}

/**
 * Form data for updating a pipeline post from the edit dialog
 */
export type UpdatePipelinePostData = {
    title: string
    slug?: string | null
    status: PipelineStatus
    priority: BlogPostPriority
    // Keywords
    primaryKeyword?: string | null
    secondaryKeywords?: string[] | null
    // Content
    content?: string | null
    // SEO
    metaTitle?: string | null
    metaDescription?: string | null
    metaKeywords?: string | null
    excerpt?: string | null
    // Author
    authorId?: string | null
    // Media
    featuredImageId?: string | null
    aiSummary?: string | null
    // Planning & FAQs
    planningData?: PlanningData | null
    faqs?: Array<{ question: string; answer: string }> | null
    // Reading time
    readingTime?: number | null
}
