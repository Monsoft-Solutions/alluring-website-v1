/**
 * Pipeline Post Detail Type
 *
 * Full post detail for edit dialog with all fields needed for tabs.
 *
 * @module @/lib/types/blog/pipeline-post-detail
 */

import type { PipelineStatus } from '@/lib/types/blog/blog-action.type'

/**
 * Planning data structure for blog posts
 */
export type PipelinePostPlanningData = {
    topic?: string
    uniqueAngle?: string
    targetAudience?: string
    contentType?: string
    estimatedWordCount?: number
}

/**
 * FAQ item structure
 */
export type PipelinePostFaqItem = {
    question: string
    answer: string
}

/**
 * Full post detail for edit dialog with all fields needed for tabs
 */
export type PipelinePostDetail = {
    id: string
    title: string
    slug: string | null
    content: string | null
    status: PipelineStatus
    priority: 'low' | 'medium' | 'high' | 'urgent'
    // Keywords
    primaryKeyword: string | null
    secondaryKeywords: string[] | null
    // SEO fields
    metaTitle: string | null
    metaDescription: string | null
    metaKeywords: string | null
    excerpt: string | null
    // Author
    authorId: string | null
    authorName: string | null
    // Media
    featuredImageId: string | null
    featuredImageUrl: string | null
    aiSummary: string | null
    // Planning & FAQs
    planningData: PipelinePostPlanningData | null
    faqs: PipelinePostFaqItem[] | null
    // Processing
    pipelineProcessingStatus: 'idle' | 'processing' | 'error'
    processingError: string | null
    // Timestamps
    createdAt: string | null
    updatedAt: string | null
    publishedAt: string | null
    readingTime: number | null
}
