import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { generateBlogPostContent } from '@workspace/ai/functions'

import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'

export const runtime = 'nodejs'
export const maxDuration = 120 // Allow up to 2 minutes for full content generation

const outlineSectionSchema = z.object({
    title: z.string(),
    description: z.string(),
    keyPoints: z.array(z.string()).optional(),
    subsections: z
        .array(
            z.object({
                title: z.string(),
                description: z.string().optional(),
            })
        )
        .optional(),
})

const requestSchema = z.object({
    title: z.string().min(1),
    topic: z.string().min(1),
    primaryKeyword: z.string().min(1),
    secondaryKeywords: z.array(z.string()).optional(),
    targetAudience: z.string().optional(),
    uniqueAngle: z.string().optional(),
    outline: z.object({
        tldr: z.array(z.string()),
        introduction: z.object({
            hook: z.string(),
            preview: z.string(),
        }),
        sections: z.array(outlineSectionSchema),
        conclusion: z.object({
            summaryPoints: z.array(z.string()),
            nextSteps: z.string(),
        }),
    }),
    estimatedWordCount: z.number().optional(),
})

/**
 * POST /api/blog/generate-post-content
 * Generate full blog post content from an outline using AI
 */
export async function POST(request: NextRequest) {
    try {
        await requireAuth()

        const body: unknown = await request.json()
        const validationResult = requestSchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid request body',
                    details: validationResult.error.format(),
                },
                { status: 400 }
            )
        }

        const result = await generateBlogPostContent(validationResult.data)

        return NextResponse.json({
            success: true,
            ...result,
        })
    } catch (error) {
        return handleApiError(
            error,
            'Failed to generate content',
            'Error generating blog post content:'
        )
    }
}
