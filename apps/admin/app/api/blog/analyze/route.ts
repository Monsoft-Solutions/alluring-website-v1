import { db } from '@workspace/db/client'
import { blogPost, blogPostAnalysis } from '@workspace/db/schema'
import { analyzeBlogPost } from '@workspace/ai'
import { eq, desc } from 'drizzle-orm'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

import { requireAuth, UnauthorizedError } from '@/lib/utils/auth.util'

export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * Request schema for blog post analysis
 */
const requestSchema = z.object({
    blogPostId: z.string().uuid('Invalid blog post ID'),
    modelId: z.string().optional(),
})

/**
 * Response type for blog post analysis
 */
type AnalysisResponse =
    | {
          success: true
          analysis: {
              id: string
              overallScore: number
              grade: string
              categories: {
                  title: number
                  metaDescription: number
                  contentLength: number
                  readability: number
                  headingStructure: number
                  keywords: number
                  linking: number
                  visualContent: number
                  structure: number
              }
              analysisDetails: unknown
              analyzedAt: Date
          }
      }
    | {
          success: false
          error: string
      }

/**
 * Calculate letter grade from overall score
 */
function calculateGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A'
    if (score >= 75) return 'B'
    if (score >= 60) return 'C'
    if (score >= 40) return 'D'
    return 'F'
}

/**
 * Calculate overall weighted score from category scores
 */
function calculateOverallScore(categories: {
    title: { score: number }
    metaDescription: { score: number }
    contentLength: { score: number }
    readability: { score: number }
    headingStructure: { score: number }
    keywords: { score: number }
    linking: { score: number }
    visualContent: { score: number }
    structure: { score: number }
}): number {
    const weights = {
        title: 0.1,
        metaDescription: 0.1,
        contentLength: 0.1,
        readability: 0.15,
        headingStructure: 0.1,
        keywords: 0.15,
        linking: 0.1,
        visualContent: 0.1,
        structure: 0.1,
    }

    const weightedScore =
        categories.title.score * weights.title +
        categories.metaDescription.score * weights.metaDescription +
        categories.contentLength.score * weights.contentLength +
        categories.readability.score * weights.readability +
        categories.headingStructure.score * weights.headingStructure +
        categories.keywords.score * weights.keywords +
        categories.linking.score * weights.linking +
        categories.visualContent.score * weights.visualContent +
        categories.structure.score * weights.structure

    return Math.round(weightedScore)
}

/**
 * POST /api/blog/analyze
 * Analyze a blog post for quality and SEO optimization
 */
export async function POST(
    request: NextRequest
): Promise<NextResponse<AnalysisResponse>> {
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

        const { blogPostId, modelId: requestedModelId } = validationResult.data

        // Fetch blog post content
        const [blogPostData] = await db
            .select({
                title: blogPost.title,
                content: blogPost.content,
                metaDescription: blogPost.metaDescription,
                metaKeywords: blogPost.metaKeywords,
                excerpt: blogPost.excerpt,
                featuredImageId: blogPost.featuredImageId,
            })
            .from(blogPost)
            .where(eq(blogPost.id, blogPostId))
            .limit(1)

        if (!blogPostData) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Blog post not found',
                },
                { status: 404 }
            )
        }

        // Ensure post has content and meta description before analyzing
        if (!blogPostData.content || !blogPostData.metaDescription) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Blog post must have content and meta description to be analyzed',
                },
                { status: 400 }
            )
        }

        // Run AI analysis
        const analysisResult = await analyzeBlogPost({
            title: blogPostData.title,
            content: blogPostData.content,
            metaDescription: blogPostData.metaDescription,
            metaKeywords: blogPostData.metaKeywords ?? undefined,
            excerpt: blogPostData.excerpt ?? undefined,
            hasFeaturedImage: !!blogPostData.featuredImageId,
            modelId: requestedModelId,
        })

        // Calculate overall score and grade
        const overallScore = calculateOverallScore(analysisResult.categories)
        const grade = calculateGrade(overallScore)

        // Store analysis in database
        const savedAnalyses = await db
            .insert(blogPostAnalysis)
            .values({
                blogPostId,
                overallScore,
                grade,
                titleScore: analysisResult.categories.title.score,
                metaDescriptionScore:
                    analysisResult.categories.metaDescription.score,
                contentLengthScore:
                    analysisResult.categories.contentLength.score,
                readabilityScore: analysisResult.categories.readability.score,
                headingStructureScore:
                    analysisResult.categories.headingStructure.score,
                keywordScore: analysisResult.categories.keywords.score,
                linkingScore: analysisResult.categories.linking.score,
                visualContentScore:
                    analysisResult.categories.visualContent.score,
                structureScore: analysisResult.categories.structure.score,
                analysisDetails: {
                    categories: analysisResult.categories,
                    topSuggestions: analysisResult.topSuggestions,
                    summary: analysisResult.summary,
                },
                modelUsed: requestedModelId ?? 'gpt-5.2',
            })
            .returning()

        const savedAnalysis = savedAnalyses[0]

        if (!savedAnalysis) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Failed to save analysis',
                },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            analysis: {
                id: savedAnalysis.id,
                overallScore: savedAnalysis.overallScore,
                grade: savedAnalysis.grade,
                categories: {
                    title: savedAnalysis.titleScore,
                    metaDescription: savedAnalysis.metaDescriptionScore,
                    contentLength: savedAnalysis.contentLengthScore,
                    readability: savedAnalysis.readabilityScore,
                    headingStructure: savedAnalysis.headingStructureScore,
                    keywords: savedAnalysis.keywordScore,
                    linking: savedAnalysis.linkingScore,
                    visualContent: savedAnalysis.visualContentScore,
                    structure: savedAnalysis.structureScore,
                },
                analysisDetails: savedAnalysis.analysisDetails,
                analyzedAt: savedAnalysis.analyzedAt,
            },
        })
    } catch (error) {
        console.error('Error analyzing blog post:', error)

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
                        : 'Failed to analyze blog post',
            },
            { status: 500 }
        )
    }
}

/**
 * GET /api/blog/analyze?blogPostId=xxx
 * Get the latest analysis for a blog post
 */
export async function GET(
    request: NextRequest
): Promise<NextResponse<AnalysisResponse>> {
    try {
        await requireAuth()

        const searchParams = request.nextUrl.searchParams
        const blogPostId = searchParams.get('blogPostId')

        if (!blogPostId || !z.string().uuid().safeParse(blogPostId).success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid blog post ID',
                },
                { status: 400 }
            )
        }

        // Fetch latest analysis
        const [latestAnalysis] = await db
            .select()
            .from(blogPostAnalysis)
            .where(eq(blogPostAnalysis.blogPostId, blogPostId))
            .orderBy(desc(blogPostAnalysis.analyzedAt))
            .limit(1)

        if (!latestAnalysis) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'No analysis found for this blog post',
                },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            analysis: {
                id: latestAnalysis.id,
                overallScore: latestAnalysis.overallScore,
                grade: latestAnalysis.grade,
                categories: {
                    title: latestAnalysis.titleScore,
                    metaDescription: latestAnalysis.metaDescriptionScore,
                    contentLength: latestAnalysis.contentLengthScore,
                    readability: latestAnalysis.readabilityScore,
                    headingStructure: latestAnalysis.headingStructureScore,
                    keywords: latestAnalysis.keywordScore,
                    linking: latestAnalysis.linkingScore,
                    visualContent: latestAnalysis.visualContentScore,
                    structure: latestAnalysis.structureScore,
                },
                analysisDetails: latestAnalysis.analysisDetails,
                analyzedAt: latestAnalysis.analyzedAt,
            },
        })
    } catch (error) {
        console.error('Error fetching blog analysis:', error)

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
                        : 'Failed to fetch analysis',
            },
            { status: 500 }
        )
    }
}
