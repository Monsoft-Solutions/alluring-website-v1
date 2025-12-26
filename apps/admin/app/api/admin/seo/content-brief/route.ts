/**
 * Content Brief Generation API Route
 *
 * Generates AI-powered content briefs for high-opportunity search queries.
 */
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { generateContentBrief } from '@workspace/ai'
import type { ContentBrief } from '@workspace/shared/schemas/seo'

import { requireAuth, UnauthorizedError } from '@/lib/utils/auth.util'

export const runtime = 'nodejs'
export const maxDuration = 60 // Content brief generation can take time

const requestSchema = z.object({
    query: z.string().min(1, 'Query is required'),
    currentPosition: z.number().optional(),
    impressions: z.number().optional(),
})

type ContentBriefResponse =
    | {
          success: true
          data: ContentBrief
      }
    | {
          success: false
          error: string
      }

/**
 * POST /api/admin/seo/content-brief
 * Generate a content brief for a search query
 */
export async function POST(
    request: NextRequest
): Promise<NextResponse<ContentBriefResponse>> {
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

        const { query, currentPosition, impressions } = validationResult.data

        const result = await generateContentBrief({
            query,
            currentPosition,
            impressions,
        })

        return NextResponse.json({
            success: true,
            data: result,
        })
    } catch (error) {
        console.error('Error generating content brief:', error)

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
                        : 'Failed to generate content brief',
            },
            { status: 500 }
        )
    }
}
