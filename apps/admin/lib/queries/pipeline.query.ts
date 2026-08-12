/**
 * Pipeline Queries
 *
 * Database queries for the blog content pipeline Kanban board.
 */
import { cache } from 'react'
import { db } from '@workspace/db/client'
import { blogPost, author, images } from '@workspace/db/schema/blog'
import { eq, ne, desc, isNull, or, sql } from 'drizzle-orm'

import { isPipelineStatus } from '@/lib/types/pipeline.type'
import type {
    PipelinePostItem,
    PostsByStatus,
    PipelineStats,
} from '@/lib/types/pipeline.type'

/**
 * Get all posts grouped by pipeline status for Kanban view
 */
export const getPostsByStatus = cache(async (): Promise<PostsByStatus> => {
    const posts = await db
        .select({
            id: blogPost.id,
            title: blogPost.title,
            slug: blogPost.slug,
            status: blogPost.status,
            priority: blogPost.priority,
            pipelineProcessingStatus: blogPost.pipelineProcessingStatus,
            processingError: blogPost.processingError,
            primaryKeyword: blogPost.primaryKeyword,
            ideaApproval: blogPost.ideaApproval,
            refreshOfPostId: blogPost.refreshOfPostId,
            authorName: author.name,
            featuredImageUrl: images.url,
            planningData: blogPost.planningData,
            pipelineState: blogPost.pipelineState,
            createdAt: blogPost.createdAt,
            updatedAt: blogPost.updatedAt,
        })
        .from(blogPost)
        .leftJoin(author, eq(blogPost.authorId, author.id))
        .leftJoin(images, eq(blogPost.featuredImageId, images.id))
        // Rejected ideas stay in the DB (ideation dedupe reads them) but
        // leave the board
        .where(
            or(
                isNull(blogPost.ideaApproval),
                ne(blogPost.ideaApproval, 'rejected')
            )
        )
        .orderBy(desc(blogPost.updatedAt))

    // Initialize empty arrays for each status
    const byStatus: PostsByStatus = {
        ideation: [],
        generate: [],
        ai_review: [],
        generate_metadata: [],
        generate_image: [],
        draft: [],
        ready_to_publish: [],
        scheduled: [],
        published: [],
    }

    // Group posts by status
    for (const post of posts) {
        if (isPipelineStatus(post.status)) {
            byStatus[post.status].push(post as PipelinePostItem)
        }
    }

    return byStatus
})

/**
 * Stats for each pipeline status
 */

/**
 * Get pipeline stats (counts per status)
 */
export const getPipelineStats = cache(async (): Promise<PipelineStats> => {
    // Refresh working copies (epic #144) are excluded — they'd double-count
    // their original's topic and inflate the draft column.
    const result = await db.execute<{
        status: string
        processing_status: string
        count: number
    }>(sql`
        SELECT
            status,
            processing_status,
            COUNT(*)::int as count
        FROM blog_post
        WHERE refresh_of_post_id IS NULL
        GROUP BY status, processing_status
    `)

    const stats: PipelineStats = {
        ideation: 0,
        generate: 0,
        ai_review: 0,
        generate_metadata: 0,
        generate_image: 0,
        draft: 0,
        ready_to_publish: 0,
        scheduled: 0,
        published: 0,
        processing: 0,
        error: 0,
    }

    for (const row of result) {
        const status = row.status
        const countValue = Number(row.count)

        if (isPipelineStatus(status)) {
            stats[status] = (stats[status] || 0) + countValue
        }

        if (row.processing_status === 'processing') {
            stats.processing += countValue
        }
        if (row.processing_status === 'error') {
            stats.error += countValue
        }
    }

    return stats
})

/**
 * Get a single pipeline post by ID
 */
export const getPipelinePostById = cache(
    async (id: string): Promise<PipelinePostItem | null> => {
        const [post] = await db
            .select({
                id: blogPost.id,
                title: blogPost.title,
                slug: blogPost.slug,
                status: blogPost.status,
                priority: blogPost.priority,
                pipelineProcessingStatus: blogPost.pipelineProcessingStatus,
                processingError: blogPost.processingError,
                primaryKeyword: blogPost.primaryKeyword,
                refreshOfPostId: blogPost.refreshOfPostId,
                authorName: author.name,
                featuredImageUrl: images.url,
                planningData: blogPost.planningData,
                pipelineState: blogPost.pipelineState,
                createdAt: blogPost.createdAt,
                updatedAt: blogPost.updatedAt,
            })
            .from(blogPost)
            .leftJoin(author, eq(blogPost.authorId, author.id))
            .leftJoin(images, eq(blogPost.featuredImageId, images.id))
            .where(eq(blogPost.id, id))
            .limit(1)

        return (post as PipelinePostItem) ?? null
    }
)

/**
 * Get posts that are currently processing
 */
export const getProcessingPosts = cache(
    async (): Promise<PipelinePostItem[]> => {
        const posts = await db
            .select({
                id: blogPost.id,
                title: blogPost.title,
                slug: blogPost.slug,
                status: blogPost.status,
                priority: blogPost.priority,
                pipelineProcessingStatus: blogPost.pipelineProcessingStatus,
                processingError: blogPost.processingError,
                primaryKeyword: blogPost.primaryKeyword,
                authorName: author.name,
                featuredImageUrl: images.url,
                planningData: blogPost.planningData,
                pipelineState: blogPost.pipelineState,
                createdAt: blogPost.createdAt,
                updatedAt: blogPost.updatedAt,
            })
            .from(blogPost)
            .leftJoin(author, eq(blogPost.authorId, author.id))
            .leftJoin(images, eq(blogPost.featuredImageId, images.id))
            .where(eq(blogPost.pipelineProcessingStatus, 'processing'))

        return posts as PipelinePostItem[]
    }
)
