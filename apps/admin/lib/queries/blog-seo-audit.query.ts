/**
 * Blog SEO Audit Query Functions
 *
 * Fetches blog posts with their latest SEO analysis scores
 * for the SEO dashboard audit view.
 *
 * @module @/lib/queries/blog-seo-audit
 */
import { db } from '@workspace/db/client'
import { blogPost, blogPostAnalysis } from '@workspace/db/schema'
import { desc, eq, sql } from 'drizzle-orm'
import { cache } from 'react'

/**
 * Blog post with SEO analysis data
 */
export type BlogPostWithAnalysis = {
    id: string
    slug: string
    title: string
    status: 'draft' | 'readyToPublish' | 'published' | null
    publishedAt: Date | null
    updatedAt: Date | null
    analysis: {
        id: string
        overallScore: number
        grade: string
        analyzedAt: Date
        isOutdated: boolean
    } | null
}

/**
 * Summary stats for blog SEO audit
 */
export type BlogAuditSummary = {
    totalPosts: number
    analyzedPosts: number
    averageScore: number
    gradeDistribution: {
        A: number
        B: number
        C: number
        D: number
        F: number
    }
}

/**
 * Get all published blog posts with their latest analysis
 */
export const getBlogPostsWithAnalysis = cache(
    async (): Promise<BlogPostWithAnalysis[]> => {
        // Use a subquery to get the latest analysis for each post
        const latestAnalysisSubquery = db
            .select({
                blogPostId: blogPostAnalysis.blogPostId,
                maxAnalyzedAt:
                    sql<Date>`MAX(${blogPostAnalysis.analyzedAt})`.as(
                        'max_analyzed_at'
                    ),
            })
            .from(blogPostAnalysis)
            .groupBy(blogPostAnalysis.blogPostId)
            .as('latest')

        const results = await db
            .select({
                id: blogPost.id,
                slug: blogPost.slug,
                title: blogPost.title,
                status: blogPost.status,
                publishedAt: blogPost.publishedAt,
                updatedAt: blogPost.updatedAt,
                analysisId: blogPostAnalysis.id,
                overallScore: blogPostAnalysis.overallScore,
                grade: blogPostAnalysis.grade,
                analyzedAt: blogPostAnalysis.analyzedAt,
            })
            .from(blogPost)
            .leftJoin(
                latestAnalysisSubquery,
                eq(blogPost.id, latestAnalysisSubquery.blogPostId)
            )
            .leftJoin(
                blogPostAnalysis,
                sql`${blogPostAnalysis.blogPostId} = ${blogPost.id} 
                    AND ${blogPostAnalysis.analyzedAt} = ${latestAnalysisSubquery.maxAnalyzedAt}`
            )
            .orderBy(desc(blogPost.publishedAt))

        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        return results.map((row) => ({
            id: row.id,
            slug: row.slug,
            title: row.title,
            status: row.status,
            publishedAt: row.publishedAt,
            updatedAt: row.updatedAt,
            analysis: row.analysisId
                ? {
                      id: row.analysisId,
                      overallScore: row.overallScore!,
                      grade: row.grade!,
                      analyzedAt: row.analyzedAt!,
                      isOutdated: row.analyzedAt! < thirtyDaysAgo,
                  }
                : null,
        }))
    }
)

/**
 * Get summary statistics for blog SEO audit
 */
export const getBlogAuditSummary = cache(
    async (): Promise<BlogAuditSummary> => {
        // Get all posts with their latest analysis
        const posts = await getBlogPostsWithAnalysis()

        const analyzedPosts = posts.filter((p) => p.analysis !== null)
        const scores = analyzedPosts.map((p) => p.analysis!.overallScore)

        const gradeDistribution = {
            A: analyzedPosts.filter((p) => p.analysis!.grade === 'A').length,
            B: analyzedPosts.filter((p) => p.analysis!.grade === 'B').length,
            C: analyzedPosts.filter((p) => p.analysis!.grade === 'C').length,
            D: analyzedPosts.filter((p) => p.analysis!.grade === 'D').length,
            F: analyzedPosts.filter((p) => p.analysis!.grade === 'F').length,
        }

        return {
            totalPosts: posts.length,
            analyzedPosts: analyzedPosts.length,
            averageScore:
                scores.length > 0
                    ? Math.round(
                          scores.reduce((a, b) => a + b, 0) / scores.length
                      )
                    : 0,
            gradeDistribution,
        }
    }
)
