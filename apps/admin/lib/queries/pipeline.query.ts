/**
 * Pipeline Queries
 *
 * Database queries for the blog content pipeline Kanban board.
 */
import { cache } from 'react'
import { db } from '@workspace/db/client'
import { blogPost, author, images } from '@workspace/db/schema/blog'
import type { PlanningData, PipelineState } from '@workspace/db/types'
import { eq, desc, sql } from 'drizzle-orm'

import type {
    PipelineStatus,
    ProcessingStatus,
    BlogPostPriority,
} from '@/lib/types/blog/blog-action.type'

// Re-export types for consumers
export type { PipelineStatus, ProcessingStatus }

/**
 * Priority values (alias for BlogPostPriority)
 */
export type Priority = BlogPostPriority

/**
 * Blog post item for the Kanban board
 */
export type PipelinePostItem = {
    id: string
    title: string
    slug: string | null
    status: PipelineStatus
    priority: Priority
    pipelineProcessingStatus: ProcessingStatus
    processingError: string | null
    primaryKeyword: string | null
    authorName: string | null
    featuredImageUrl: string | null
    planningData: PlanningData | null
    pipelineState: PipelineState | null
    createdAt: Date | null
    updatedAt: Date | null
}

/**
 * Posts grouped by pipeline status for Kanban view
 */
export type PostsByStatus = {
    ideation: PipelinePostItem[]
    generate: PipelinePostItem[]
    ai_review: PipelinePostItem[]
    generate_metadata: PipelinePostItem[]
    draft: PipelinePostItem[]
    ready_to_publish: PipelinePostItem[]
    scheduled: PipelinePostItem[]
    published: PipelinePostItem[]
}

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
        .orderBy(desc(blogPost.updatedAt))

    // Initialize empty arrays for each status
    const byStatus: PostsByStatus = {
        ideation: [],
        generate: [],
        ai_review: [],
        generate_metadata: [],
        draft: [],
        ready_to_publish: [],
        scheduled: [],
        published: [],
    }

    // Group posts by status
    for (const post of posts) {
        const status = post.status as PipelineStatus
        if (status && status in byStatus) {
            byStatus[status].push(post as PipelinePostItem)
        }
    }

    return byStatus
})

/**
 * Stats for each pipeline status
 */
export type PipelineStats = {
    ideation: number
    generate: number
    ai_review: number
    generate_metadata: number
    draft: number
    ready_to_publish: number
    scheduled: number
    published: number
    processing: number
    error: number
}

/**
 * Get pipeline stats (counts per status)
 */
export const getPipelineStats = cache(async (): Promise<PipelineStats> => {
    const result = await db.execute<{
        status: string
        processing_status: string
        count: string
    }>(sql`
        SELECT 
            status,
            processing_status,
            COUNT(*)::int as count
        FROM blog_post
        GROUP BY status, processing_status
    `)

    const stats: PipelineStats = {
        ideation: 0,
        generate: 0,
        ai_review: 0,
        generate_metadata: 0,
        draft: 0,
        ready_to_publish: 0,
        scheduled: 0,
        published: 0,
        processing: 0,
        error: 0,
    }

    for (const row of result) {
        const status = row.status as PipelineStatus
        const countValue = parseInt(row.count, 10)

        if (status in stats) {
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
