/**
 * Pipeline Edit Dialog Shared Types
 *
 * Types used across all tab components in the pipeline edit dialog.
 */

import type { PipelineStatus } from '@/lib/types/blog/blog-action.type'
import type { PlanningData } from '@workspace/db/types'
import type { BlogPostPriority } from '@/lib/types/blog/blog-action.type'
import type { FaqItem } from '@workspace/shared/schemas/blog'

/**
 * Priority option configuration
 */
export type PriorityOption = {
    value: BlogPostPriority
    label: string
    className: string
}

/**
 * Status option configuration
 */
export type StatusOption = {
    value: PipelineStatus
    label: string
    className: string
}

/**
 * Priority options for select dropdown
 */
export const PRIORITY_OPTIONS: PriorityOption[] = [
    { value: 'low', label: 'Low', className: 'bg-stone-100 text-stone-700' },
    {
        value: 'medium',
        label: 'Medium',
        className: 'bg-blue-100 text-blue-700',
    },
    { value: 'high', label: 'High', className: 'bg-amber-100 text-amber-700' },
    { value: 'urgent', label: 'Urgent', className: 'bg-red-100 text-red-600' },
]

/**
 * Status options for select dropdown
 */
export const STATUS_OPTIONS: StatusOption[] = [
    {
        value: 'ideation',
        label: 'Ideation',
        className: 'bg-stone-100 text-stone-700',
    },
    {
        value: 'generate',
        label: 'Generate',
        className: 'bg-amber-100 text-amber-700',
    },
    {
        value: 'ai_review',
        label: 'AI Review',
        className: 'bg-blue-100 text-blue-700',
    },
    {
        value: 'generate_metadata',
        label: 'Metadata',
        className: 'bg-violet-100 text-violet-700',
    },
    { value: 'draft', label: 'Draft', className: 'bg-sky-100 text-sky-700' },
    {
        value: 'ready_to_publish',
        label: 'Ready',
        className: 'bg-emerald-100 text-emerald-700',
    },
    {
        value: 'scheduled',
        label: 'Scheduled',
        className: 'bg-orange-100 text-orange-700',
    },
    {
        value: 'published',
        label: 'Published',
        className: 'bg-purple-100 text-purple-700',
    },
]

/**
 * Content tab props
 */
export type ContentTabProps = {
    title: string
    setTitle: (value: string) => void
    content: string
    setContent: (value: string) => void
    isLoadingDetail: boolean
    markDirty: () => void
    blogPostId?: string
}

/**
 * Details tab props
 */
export type DetailsTabProps = {
    slug: string
    setSlug: (value: string) => void
    status: PipelineStatus
    setStatus: (value: PipelineStatus) => void
    priority: BlogPostPriority
    setPriority: (value: BlogPostPriority) => void
    primaryKeyword: string
    setPrimaryKeyword: (value: string) => void
    secondaryKeywords: string[]
    secondaryInput: string
    setSecondaryInput: (value: string) => void
    handleAddSecondaryKeyword: () => void
    handleRemoveSecondaryKeyword: (keyword: string) => void
    isProcessing: boolean
    hasError: boolean
    processingError: string | null
    markDirty: () => void
}

/**
 * SEO tab props
 */
export type SeoTabProps = {
    title: string
    metaTitle: string
    setMetaTitle: (value: string) => void
    metaDescription: string
    setMetaDescription: (value: string) => void
    metaKeywords: string
    setMetaKeywords: (value: string) => void
    excerpt: string
    setExcerpt: (value: string) => void
    markDirty: () => void
}

/**
 * Media tab props
 */
export type MediaTabProps = {
    featuredImageUrl: string | null
    setFeaturedImageId: (value: string | null) => void
    setFeaturedImageUrl: (value: string | null) => void
    handleSelectGeneratedImage: (imageId: string, imageUrl: string) => void
    galleryRefresh: number
    setFeaturedImageDialogOpen: (value: boolean) => void
    markDirty: () => void
    blogPostId?: string
}

/**
 * Planning tab props
 */
export type PlanningTabProps = {
    planningData: PlanningData
    handlePlanningChange: (field: keyof PlanningData, value: string) => void
    faqs: FaqItem[]
    handleAddFaq: () => void
    handleRemoveFaq: (index: number) => void
    handleUpdateFaq: (
        index: number,
        field: 'question' | 'answer',
        value: string
    ) => void
}
