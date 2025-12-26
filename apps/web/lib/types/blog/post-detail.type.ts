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
}
