import type { BlogPostCard } from './post-card.type'
import type {
    BlogAuthorItem,
    BlogCategoryItem,
    BlogTagItem,
} from './taxonomy.type'

/**
 * Response type for paginated blog posts API
 */
export type BlogPostsPaginatedResponse = {
    items: BlogPostCard[]
    nextCursor?: string
}

/**
 * Response type for blog categories API
 */
export type BlogCategoriesResponse = BlogCategoryItem[]

/**
 * Response type for blog tags API
 */
export type BlogTagsResponse = BlogTagItem[]

/**
 * Response type for blog authors API
 */
export type BlogAuthorsResponse = BlogAuthorItem[]
