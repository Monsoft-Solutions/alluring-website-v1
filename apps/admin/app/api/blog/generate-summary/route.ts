import { db } from '@workspace/db/client'
import { blogPost } from '@workspace/db/schema'
import { summarizeBlogPost } from '@workspace/ai'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { requireAuth, UnauthorizedError } from '@/lib/utils/auth.util'

export const runtime = 'nodejs'
export const maxDuration = 30

/**
 * Request schema for summary generation
 */
const requestSchema = z.object({
    blogPostId: z.string().uuid('Invalid blog post ID'),
})

/**
 * Response type for summary generation
 */
type SummaryResponse =
    | {
          success: true
          summary: string
      }
    | {
          success: false
          error: string
      }

/**
 * POST /api/blog/generate-summary
 * Generate AI summary for a blog post and persist to database
 */
export async function POST(
    request: NextRequest
): Promise<NextResponse<SummaryResponse>> {
    try {
        await requireAuth()

        const body = await request.json()
        const validationResult = requestSchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid request parameters',
                },
                { status: 400 }
            )
        }

        const { blogPostId } = validationResult.data

        // Fetch blog post content
        const [post] = await db
            .select({
                title: blogPost.title,
                content: blogPost.content,
                aiSummary: blogPost.aiSummary,
            })
            .from(blogPost)
            .where(eq(blogPost.id, blogPostId))
            .limit(1)

        if (!post) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Blog post not found',
                },
                { status: 404 }
            )
        }

        // Check if summary already exists
        if (post.aiSummary) {
            return NextResponse.json({
                success: true,
                summary: post.aiSummary,
            })
        }

        // Generate summary using AI
        const result = await summarizeBlogPost({
            title: post.title,
            content: post.content,
        })

        // Persist summary to database
        await db
            .update(blogPost)
            .set({ aiSummary: result.summary })
            .where(eq(blogPost.id, blogPostId))

        return NextResponse.json({
            success: true,
            summary: result.summary,
        })
    } catch (error) {
        console.error('Error generating blog summary:', error)

        if (error instanceof UnauthorizedError) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to generate summary',
            },
            { status: 500 }
        )
    }
}
