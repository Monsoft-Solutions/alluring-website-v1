import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { db } from '@workspace/db/client'
import { blogPost, author, images } from '@workspace/db/schema/blog'
import { eq } from 'drizzle-orm'

import { requireAuth } from '@/lib/utils/auth.util'
import { buildLangfuseTraceUrl } from '@/lib/utils/langfuse.util'

export const runtime = 'nodejs'

/**
 * GET /api/blog/pipeline/[id]
 * Fetch full pipeline post details including content, SEO, media, and FAQs for editing
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
                // Keywords
                primaryKeyword: blogPost.primaryKeyword,
                secondaryKeywords: blogPost.secondaryKeywords,
                // SEO fields
                metaTitle: blogPost.metaTitle,
                metaDescription: blogPost.metaDescription,
                metaKeywords: blogPost.metaKeywords,
                excerpt: blogPost.excerpt,
                quickAnswer: blogPost.quickAnswer,
                // Author
                authorId: blogPost.authorId,
                authorName: author.name,
                // Media
                featuredImageId: blogPost.featuredImageId,
                featuredImageUrl: images.url,
                aiSummary: blogPost.aiSummary,
                // Planning & FAQs
                planningData: blogPost.planningData,
                faqs: blogPost.faqs,
                // Processing status
                pipelineProcessingStatus: blogPost.pipelineProcessingStatus,
                processingError: blogPost.processingError,
                pipelineState: blogPost.pipelineState,
                // Timestamps
                createdAt: blogPost.createdAt,
                updatedAt: blogPost.updatedAt,
                publishedAt: blogPost.publishedAt,
                // Reading time
                readingTime: blogPost.readingTime,
            })
            .from(blogPost)
            .leftJoin(author, eq(blogPost.authorId, author.id))
            .leftJoin(images, eq(blogPost.featuredImageId, images.id))
            .where(eq(blogPost.id, id))
            .limit(1)

        if (!post) {
            return NextResponse.json(
                { success: false, error: 'Post not found' },
                { status: 404 }
            )
        }

        // Trace links are computed here because the Langfuse base URL and
        // project id are server-only env vars.
        const state = post.pipelineState
        const phaseTraceUrls = {
            generation: buildLangfuseTraceUrl(state?.generationPhase?.traceId),
            review: buildLangfuseTraceUrl(state?.reviewPhase?.traceId),
            extraction: buildLangfuseTraceUrl(state?.extractionPhase?.traceId),
            imageGeneration: buildLangfuseTraceUrl(
                state?.imageGenerationPhase?.traceId
            ),
        }

        return NextResponse.json({ ...post, phaseTraceUrls })
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
