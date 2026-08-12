import type { FaqItem } from '@workspace/shared/schemas/blog'

import type { BlogPostCard } from './post-card.type'

export type BlogPostDetail = BlogPostCard & {
    content: string
    updatedAt: string | null
    categories: Array<{
        id: string
        name: string
        slug: string
    }>
    tags: Array<{
        id: string
        name: string
        slug: string
    }>
    faqs?: FaqItem[] | null
    /**
     * Serialized Quick Answer (`question\n\nanswer`), rendered above the article
     * body and pointed at by the Speakable schema. Null on posts written before
     * the pipeline produced one, and on posts where extraction failed.
     */
    quickAnswer?: string | null
}
