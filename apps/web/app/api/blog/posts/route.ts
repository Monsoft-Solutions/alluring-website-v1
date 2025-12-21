import { type NextRequest, NextResponse } from 'next/server'

import { getPublishedPostCardsPage } from '@/lib/queries/blog/post-list.query'
import type { BlogPostsPaginatedResponse } from '@/lib/types/blog/api-response.type'
import { blogPostsQuerySchema } from '@/lib/types/blog/blog-posts.schema'

/**
 * GET /api/blog/posts
 * Returns paginated blog post cards with cursor-based pagination
 *
 * Query params:
 * - pageSize: number of items to return (default: 12, max: 100)
 * - cursor: base64 encoded cursor {publishedAt, id}
 * - categorySlug: (optional) filter by category
 * - tagSlug: (optional) filter by tag
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl

        // Validate and parse query parameters using Zod schema
        const validationResult = blogPostsQuerySchema.safeParse({
            pageSize: searchParams.get('pageSize'),
            cursor: searchParams.get('cursor'),
            categorySlug: searchParams.get('categorySlug'),
            tagSlug: searchParams.get('tagSlug'),
        })

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: 'Invalid query parameters',
                    details: validationResult.error.issues,
                },
                { status: 400 }
            )
        }

        const { pageSize, cursor, categorySlug, tagSlug } =
            validationResult.data

        // Fetch posts
        const { items, nextCursor } = await getPublishedPostCardsPage({
            limit: pageSize,
            cursor,
            categorySlug,
            tagSlug,
        })

        // Encode next cursor for client
        const encodedNextCursor = nextCursor
            ? Buffer.from(
                  JSON.stringify({
                      publishedAt: nextCursor.publishedAt.toISOString(),
                      id: nextCursor.id,
                  })
              ).toString('base64')
            : undefined

        const response: BlogPostsPaginatedResponse = {
            items,
            nextCursor: encodedNextCursor,
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error('Error fetching blog posts:', error)
        return NextResponse.json(
            { error: 'Failed to fetch blog posts' },
            { status: 500 }
        )
    }
}
