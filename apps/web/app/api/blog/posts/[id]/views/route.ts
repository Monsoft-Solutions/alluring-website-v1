/**
 * Blog Post View Tracking API Handler
 *
 * Increments the view count for a specific blog post.
 * Designed for async, non-blocking operation.
 *
 * @module app/api/blog/posts/[id]/views/route
 */
import { type NextRequest, NextResponse } from 'next/server'

import { db } from '@workspace/db/client'
import { blogPost } from '@workspace/db/schema/blog'
import { eq, sql } from 'drizzle-orm'

type RouteParams = {
    params: Promise<{ id: string }>
}

type ViewTrackResponse = {
    success: boolean
    message?: string
}

/**
 * Validate UUID format
 */
function isValidUUID(id: string): boolean {
    const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(id)
}

/**
 * POST handler for blog post view tracking
 *
 * Atomically increments the view count for a blog post.
 * Returns immediately - database operation is fire-and-forget.
 *
 * @param request - Next.js request object
 * @param params - Route params containing post ID
 * @returns JSON response indicating tracking was queued
 */
export async function POST(
    request: NextRequest,
    { params }: RouteParams
): Promise<NextResponse<ViewTrackResponse>> {
    try {
        const { id } = await params

        // Validate post ID format
        if (!id || !isValidUUID(id)) {
            return NextResponse.json(
                { success: false, message: 'Invalid post ID' },
                { status: 400 }
            )
        }

        // Increment views asynchronously - don't await to return quickly
        // Use Promise.resolve().then() pattern for truly async execution
        Promise.resolve().then(async () => {
            try {
                await db
                    .update(blogPost)
                    .set({
                        views: sql`${blogPost.views} + 1`,
                    })
                    .where(eq(blogPost.id, id))
            } catch (error) {
                // Log but don't fail - view tracking should never break the user experience
                console.error('[Blog] Failed to increment post views:', error)
            }
        })

        // Return immediately
        return NextResponse.json({ success: true }, { status: 200 })
    } catch (error) {
        console.error('[Blog] View tracking API error:', error)
        return NextResponse.json(
            { success: false, message: 'Internal error' },
            { status: 500 }
        )
    }
}

/**
 * OPTIONS handler for CORS preflight requests
 */
export async function OPTIONS(): Promise<NextResponse> {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '86400',
        },
    })
}
