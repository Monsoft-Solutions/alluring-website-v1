/**
 * Blog SEO Audit API Route
 *
 * Returns all blog posts with their latest SEO analysis scores
 * for the SEO dashboard audit view.
 */
import { NextResponse } from 'next/server'

import {
    getBlogPostsWithAnalysis,
    getBlogAuditSummary,
    type BlogPostWithAnalysis,
    type BlogAuditSummary,
} from '@/lib/queries/blog-seo-audit.query'
import { requireAuth, UnauthorizedError } from '@/lib/utils/auth.util'

export const runtime = 'nodejs'

type BlogAuditResponse =
    | {
          success: true
          data: {
              posts: BlogPostWithAnalysis[]
              summary: BlogAuditSummary
          }
      }
    | {
          success: false
          error: string
      }

/**
 * GET /api/admin/seo/blog-audit
 * Get all blog posts with their SEO analysis status
 */
export async function GET(): Promise<NextResponse<BlogAuditResponse>> {
    try {
        await requireAuth()

        const [posts, summary] = await Promise.all([
            getBlogPostsWithAnalysis(),
            getBlogAuditSummary(),
        ])

        return NextResponse.json({
            success: true,
            data: {
                posts,
                summary,
            },
        })
    } catch (error) {
        console.error('Error fetching blog audit data:', error)

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
                        : 'Failed to fetch blog audit data',
            },
            { status: 500 }
        )
    }
}
