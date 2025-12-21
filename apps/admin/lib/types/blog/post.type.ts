import type {
    BlogPostSortBy,
    BlogPostSortOrder,
} from '@/lib/queries/blog.query'

export type SearchParams = Promise<{
    page?: string
    sortBy?: string
    sortOrder?: string
}>

export type SortIconProps = {
    column: BlogPostSortBy
    sortBy: BlogPostSortBy
    sortOrder: BlogPostSortOrder
}
