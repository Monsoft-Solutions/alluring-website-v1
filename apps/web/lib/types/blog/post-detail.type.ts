import type { BlogPostCard } from './post-card.type'

/**
 * FAQ item for structured FAQ data
 */
export type FaqItem = {
    question: string
    answer: string
}

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
}
