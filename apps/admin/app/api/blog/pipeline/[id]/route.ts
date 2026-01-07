import { NextRequest, NextResponse } from 'next/server'
import { db } from '@workspace/db/client'
import { blogPost } from '@workspace/db/schema/blog'
import { eq } from 'drizzle-orm'

import { requireAuth } from '@/lib/utils/auth.util'

export const runtime = 'nodejs'

/**
 * GET /api/blog/pipeline/[id]
 * Fetch full pipeline post details including content for editing
 */
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAuth()

        const { id } = await params

        const [post] = await db
            .select({
                id: blogPost.id,
                title: blogPost.title,
                slug: blogPost.slug,
                content: blogPost.content,
                status: blogPost.status,
                priority: blogPost.priority,
                primaryKeyword: blogPost.primaryKeyword,
                planningData: blogPost.planningData,
                pipelineProcessingStatus: blogPost.pipelineProcessingStatus,
                processingError: blogPost.processingError,
                updatedAt: blogPost.updatedAt,
            })
            .from(blogPost)
            .where(eq(blogPost.id, id))
            .limit(1)

        if (!post) {
            return NextResponse.json(
                { success: false, error: 'Post not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(post)
    } catch (error) {
        console.error('Error fetching pipeline post:', error)

        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        return NextResponse.json(
            { success: false, error: 'Failed to fetch post' },
            { status: 500 }
        )
    }
}
