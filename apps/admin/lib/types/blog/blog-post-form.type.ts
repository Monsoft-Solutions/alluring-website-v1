/**
 * Blog Post Form Types
 *
 * Types for blog post creation and editing forms.
 *
 * @module @/lib/types/blog/blog-post-form
 */

/**
 * Form data for creating/updating a blog post
 */
export type BlogPostFormData = {
    title: string
    slug: string
    content: string
    metaDescription: string
    metaTitle?: string | null
    metaKeywords?: string | null
    primaryKeyword?: string | null
    secondaryKeywords?: string[] | null
    excerpt?: string | null
    authorId?: string | null
    status: 'draft' | 'ready_to_publish' | 'published'
    aiSummary?: string | null
    featuredImageUrl?: string | null
    featuredImageId?: string | null
    readingTime?: number | null
    faqs?: Array<{ question: string; answer: string }> | null
}
