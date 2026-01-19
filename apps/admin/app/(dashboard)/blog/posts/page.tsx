import {
    getBlogPosts,
    type BlogPostSortBy,
    type BlogPostSortOrder,
} from '@/lib/queries/blog.query'
import type { SearchParams } from '@/lib/types/blog/post.type'
import { BlogPostsListClient } from './blog-posts-list-client.component'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export const metadata = {
    title: 'Blog Posts | Admin',
    description: 'Manage blog posts, view analytics, and publish content',
}

const VALID_SORT_BY: BlogPostSortBy[] = ['createdAt', 'views', 'publishedAt']
const VALID_SORT_ORDER: BlogPostSortOrder[] = ['asc', 'desc']

function isValidSortBy(value: string | undefined): value is BlogPostSortBy {
    return VALID_SORT_BY.includes(value as BlogPostSortBy)
}

function isValidSortOrder(
    value: string | undefined
): value is BlogPostSortOrder {
    return VALID_SORT_ORDER.includes(value as BlogPostSortOrder)
}

export default async function BlogPostsPage({
    searchParams,
}: {
    searchParams: SearchParams
}) {
    const params = await searchParams
    const pageSize = 10

    let requestedPage = Number(params.page)
    if (!Number.isFinite(requestedPage) || requestedPage < 1) {
        requestedPage = 1
    }
    requestedPage = Math.floor(requestedPage)

    const sortBy: BlogPostSortBy = isValidSortBy(params.sortBy)
        ? params.sortBy
        : 'createdAt'
    const sortOrder: BlogPostSortOrder = isValidSortOrder(params.sortOrder)
        ? params.sortOrder
        : 'desc'

    // First fetch to get total count
    const { posts: initialPosts, total } = await getBlogPosts({
        page: requestedPage,
        pageSize,
        sortBy,
        sortOrder,
    })

    const totalPages = Math.ceil(total / pageSize)

    // Clamp page to valid range
    const page = Math.min(requestedPage, Math.max(1, totalPages))

    // Re-fetch if page was clamped and we got empty results
    let posts = initialPosts
    if (page !== requestedPage && posts.length === 0 && totalPages > 0) {
        const refetch = await getBlogPosts({
            page,
            pageSize,
            sortBy,
            sortOrder,
        })
        posts = refetch.posts
    }

    return (
        <BlogPostsListClient
            posts={posts}
            total={total}
            page={page}
            totalPages={totalPages}
            sortBy={sortBy}
            sortOrder={sortOrder}
        />
    )
}
