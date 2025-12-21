import { db } from '@workspace/db/client'
import { blogPost } from '@workspace/db/schema'
import { generateImagePrompt, summarizeBlogPost } from '@workspace/ai'
import { eq } from 'drizzle-orm'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

import { requireAuth, UnauthorizedError } from '@/lib/utils/auth.util'

export const runtime = 'nodejs'
export const maxDuration = 30

/**
 * Request schema for prompt generation
 * Supports two modes:
 * 1. With blogPostId - fetches data from DB
 * 2. With summary/title directly
 */
const requestSchema = z.union([
    z.object({
        blogPostId: z.string().uuid('Invalid blog post ID'),
    }),
    z.object({
        summary: z.string().min(1, 'Summary is required'),
        title: z.string().min(1, 'Title is required'),
        keywords: z.string().optional(),
    }),
])

/**
 * Response type for prompt generation
 */
type PromptResponse =
    | {
          success: true
          prompt: string
      }
    | {
          success: false
          error: string
      }

/**
 * POST /api/blog/generate-image-prompt
 * Generate optimized image generation prompt for gpt-image-1
 */
export async function POST(
    request: NextRequest
): Promise<NextResponse<PromptResponse>> {
    try {
        await requireAuth()

        const body = (await request.json()) as unknown
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

        const data = validationResult.data
        let summary: string
        let title: string
        let keywords: string | undefined

        // Mode 1: Fetch from database
        if ('blogPostId' in data) {
            const [post] = await db
                .select({
                    title: blogPost.title,
                    content: blogPost.content,
                    aiSummary: blogPost.aiSummary,
                    metaKeywords: blogPost.metaKeywords,
                })
                .from(blogPost)
                .where(eq(blogPost.id, data.blogPostId))
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

            // Generate summary if not exists
            if (!post.aiSummary) {
                const summaryResult = await summarizeBlogPost({
                    title: post.title,
                    content: post.content,
                })

                summary = summaryResult.summary

                // Persist summary for future use
                await db
                    .update(blogPost)
                    .set({ aiSummary: summary })
                    .where(eq(blogPost.id, data.blogPostId))
            } else {
                summary = post.aiSummary
            }

            title = post.title
            keywords = post.metaKeywords || undefined
        } else {
            // Mode 2: Use provided data
            summary = data.summary
            title = data.title
            keywords = data.keywords
        }

        // Generate image prompt
        const result = await generateImagePrompt({
            summary,
            title,
            keywords,
        })

        return NextResponse.json({
            success: true,
            prompt: result.prompt,
        })
    } catch (error) {
        console.error('Error generating image prompt:', error)

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
                        : 'Failed to generate prompt',
            },
            { status: 500 }
        )
    }
}
