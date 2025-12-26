import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { generateBlogTopics } from '@workspace/ai/functions'

import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'

export const runtime = 'nodejs'
export const maxDuration = 60 // Allow up to 60 seconds for AI generation

const requestSchema = z.object({
    procedureFocus: z.string().optional(),
    contentType: z.string().optional(),
    targetAudience: z.string().optional(),
    existingTopics: z.array(z.string()).optional(),
    additionalContext: z.string().optional(),
    // GSC keyword integration
    selectedKeywords: z
        .object({
            primary: z.string().nullable(),
            secondary: z.array(z.string()),
        })
        .optional(),
})

/**
 * POST /api/blog/generate-topics
 * Generate blog topic ideas using AI
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

        const result = await generateBlogTopics(validationResult.data)

        return NextResponse.json({
            success: true,
            ...result,
        })
    } catch (error) {
        return handleApiError(
            error,
            'Failed to generate topics',
            'Error generating blog topics:'
        )
    }
}
