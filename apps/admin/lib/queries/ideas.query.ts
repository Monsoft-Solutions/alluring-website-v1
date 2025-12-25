import { db } from '@workspace/db/client'
import {
    author,
    blogIdea,
    blogPost,
    type BlogIdea,
    type BlogIdeaOutlineSection,
} from '@workspace/db/schema/blog'
import { count, desc, eq, asc, and, ilike, or } from 'drizzle-orm'
import { cache } from 'react'

/**
 * Blog idea list item for pipeline view
 */
export type BlogIdeaListItem = {
    id: string
    title: string
    topic: string | null
    primaryKeyword: string | null
    contentType: BlogIdea['contentType']
    stage: BlogIdea['stage']
    priority: BlogIdea['priority']
    aiGeneratedScore: number | null
    assignedAuthorId: string | null
    assignedAuthorName: string | null
    blogPostId: string | null
    createdAt: Date
    updatedAt: Date
}

/**
 * Sort options for ideas
 */
export type IdeaSortBy = 'createdAt' | 'priority' | 'aiGeneratedScore'
export type IdeaSortOrder = 'asc' | 'desc'

/**
 * Filter options for ideas list
 */
export type GetIdeasOptions = {
    page?: number
    pageSize?: number
    sortBy?: IdeaSortBy
    sortOrder?: IdeaSortOrder
    stage?: BlogIdea['stage']
    priority?: BlogIdea['priority']
    contentType?: BlogIdea['contentType']
    search?: string
}

/**
 * Get paginated list of blog ideas with filtering and sorting
 */
export const getBlogIdeas = cache(
    async (
        options: GetIdeasOptions = {}
    ): Promise<{ ideas: BlogIdeaListItem[]; total: number }> => {
        const {
            page = 1,
            pageSize = 50,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            stage,
            priority,
            contentType,
            search,
        } = options
        const offset = (page - 1) * pageSize

        // Build filter conditions
        const conditions = []

        if (stage) {
            conditions.push(eq(blogIdea.stage, stage))
        }
        if (priority) {
            conditions.push(eq(blogIdea.priority, priority))
        }
        if (contentType) {
            conditions.push(eq(blogIdea.contentType, contentType))
        }
        if (search) {
            conditions.push(
                or(
                    ilike(blogIdea.title, `%${search}%`),
                    ilike(blogIdea.topic, `%${search}%`),
                    ilike(blogIdea.primaryKeyword, `%${search}%`)
                )
            )
        }

        // Determine sort column and direction
        const sortColumn =
            sortBy === 'priority'
                ? blogIdea.priority
                : sortBy === 'aiGeneratedScore'
                  ? blogIdea.aiGeneratedScore
                  : blogIdea.createdAt

        const orderDirection = sortOrder === 'asc' ? asc : desc

        const whereClause =
            conditions.length > 0 ? and(...conditions) : undefined

        const [ideas, totalResult] = await Promise.all([
            db
                .select({
                    id: blogIdea.id,
                    title: blogIdea.title,
                    topic: blogIdea.topic,
                    primaryKeyword: blogIdea.primaryKeyword,
                    contentType: blogIdea.contentType,
                    stage: blogIdea.stage,
                    priority: blogIdea.priority,
                    aiGeneratedScore: blogIdea.aiGeneratedScore,
                    assignedAuthorId: blogIdea.assignedAuthorId,
                    assignedAuthorName: author.name,
                    blogPostId: blogIdea.blogPostId,
                    createdAt: blogIdea.createdAt,
                    updatedAt: blogIdea.updatedAt,
                })
                .from(blogIdea)
                .leftJoin(author, eq(blogIdea.assignedAuthorId, author.id))
                .where(whereClause)
                .orderBy(orderDirection(sortColumn))
                .limit(pageSize)
                .offset(offset),
            db.select({ count: count() }).from(blogIdea).where(whereClause),
        ])

        return {
            ideas,
            total: totalResult[0]?.count ?? 0,
        }
    }
)

/**
 * Get ideas grouped by stage for Kanban view
 */
export type IdeasByStage = {
    backlog: BlogIdeaListItem[]
    researching: BlogIdeaListItem[]
    approved: BlogIdeaListItem[]
    in_progress: BlogIdeaListItem[]
    published: BlogIdeaListItem[]
}

export const getIdeasByStage = cache(async (): Promise<IdeasByStage> => {
    const ideas = await db
        .select({
            id: blogIdea.id,
            title: blogIdea.title,
            topic: blogIdea.topic,
            primaryKeyword: blogIdea.primaryKeyword,
            contentType: blogIdea.contentType,
            stage: blogIdea.stage,
            priority: blogIdea.priority,
            aiGeneratedScore: blogIdea.aiGeneratedScore,
            assignedAuthorId: blogIdea.assignedAuthorId,
            assignedAuthorName: author.name,
            blogPostId: blogIdea.blogPostId,
            createdAt: blogIdea.createdAt,
            updatedAt: blogIdea.updatedAt,
        })
        .from(blogIdea)
        .leftJoin(author, eq(blogIdea.assignedAuthorId, author.id))
        .orderBy(desc(blogIdea.priority), desc(blogIdea.createdAt))

    // Group by stage
    const grouped: IdeasByStage = {
        backlog: [],
        researching: [],
        approved: [],
        in_progress: [],
        published: [],
    }

    for (const idea of ideas) {
        const stage = idea.stage as keyof IdeasByStage
        grouped[stage].push(idea)
    }

    return grouped
})

/**
 * Detailed blog idea with all fields
 */
export type BlogIdeaDetail = {
    id: string
    title: string
    topic: string | null
    uniqueAngle: string | null
    primaryKeyword: string | null
    secondaryKeywords: string[] | null
    targetAudience: string | null
    painPoints: string[] | null
    contentType: BlogIdea['contentType']
    estimatedWordCount: number | null
    outline: BlogIdeaOutlineSection[] | null
    researchNotes: string | null
    competitorUrls: string[] | null
    stage: BlogIdea['stage']
    priority: BlogIdea['priority']
    aiGeneratedScore: number | null
    aiSuggestions: string | null
    assignedAuthorId: string | null
    assignedAuthorName: string | null
    blogPostId: string | null
    blogPostTitle: string | null
    blogPostSlug: string | null
    createdAt: Date
    updatedAt: Date
}

/**
 * Get a single blog idea by ID with full details
 */
export const getBlogIdeaById = cache(
    async (id: string): Promise<BlogIdeaDetail | null> => {
        const result = await db
            .select({
                id: blogIdea.id,
                title: blogIdea.title,
                topic: blogIdea.topic,
                uniqueAngle: blogIdea.uniqueAngle,
                primaryKeyword: blogIdea.primaryKeyword,
                secondaryKeywords: blogIdea.secondaryKeywords,
                targetAudience: blogIdea.targetAudience,
                painPoints: blogIdea.painPoints,
                contentType: blogIdea.contentType,
                estimatedWordCount: blogIdea.estimatedWordCount,
                outline: blogIdea.outline,
                researchNotes: blogIdea.researchNotes,
                competitorUrls: blogIdea.competitorUrls,
                stage: blogIdea.stage,
                priority: blogIdea.priority,
                aiGeneratedScore: blogIdea.aiGeneratedScore,
                aiSuggestions: blogIdea.aiSuggestions,
                assignedAuthorId: blogIdea.assignedAuthorId,
                assignedAuthorName: author.name,
                blogPostId: blogIdea.blogPostId,
                blogPostTitle: blogPost.title,
                blogPostSlug: blogPost.slug,
                createdAt: blogIdea.createdAt,
                updatedAt: blogIdea.updatedAt,
            })
            .from(blogIdea)
            .leftJoin(author, eq(blogIdea.assignedAuthorId, author.id))
            .leftJoin(blogPost, eq(blogIdea.blogPostId, blogPost.id))
            .where(eq(blogIdea.id, id))
            .limit(1)

        return result[0] ?? null
    }
)

/**
 * Get count of ideas by stage for dashboard stats
 */
export type IdeaStageStats = {
    backlog: number
    researching: number
    approved: number
    in_progress: number
    published: number
    total: number
}

export const getIdeaStageStats = cache(async (): Promise<IdeaStageStats> => {
    const result = await db
        .select({
            stage: blogIdea.stage,
            count: count(),
        })
        .from(blogIdea)
        .groupBy(blogIdea.stage)

    const stats: IdeaStageStats = {
        backlog: 0,
        researching: 0,
        approved: 0,
        in_progress: 0,
        published: 0,
        total: 0,
    }

    for (const row of result) {
        const stage = row.stage
        stats[stage] = row.count
        stats.total += row.count
    }

    return stats
})
