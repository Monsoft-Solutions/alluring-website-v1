import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { extractFaqs } from '@workspace/ai/functions'

import { requireAuth } from '@/lib/utils/auth.util'

export const runtime = 'nodejs'
export const maxDuration = 60

const requestSchema = z.object({
    content: z.string().min(1, 'Content is required'),
    primaryKeyword: z.string().optional(),
})

/**
 * Extracts or generates FAQs for a blog post using AI based on the provided content.
 *
 * - If the content has an existing FAQ section, it extracts the Q&A pairs
 * - If no FAQ section exists, it analyzes the content and generates relevant FAQs
 *
 * @param {NextRequest} request - The incoming Next.js request containing a JSON body with `content` (string) and optional `primaryKeyword` (string).
 * @returns {Promise<NextResponse>} A JSON response with `success: true` and `faqs`, or `success: false` with an error message and appropriate status code (400, 401, or 500).
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
                    error: 'Invalid request data',
                    details: validationResult.error.format(),
                },
                { status: 400 }
            )
        }

        const { content, primaryKeyword } = validationResult.data

        // Extract or generate FAQs using AI
        const result = await extractFaqs({
            content,
            primaryKeyword,
            maxFaqs: 10,
            generateIfMissing: true,
        })

        return NextResponse.json({
            success: true,
            faqs: result.faqs,
        })
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        console.error('Error generating FAQs:', error)
        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to generate FAQs',
            },
            { status: 500 }
        )
    }
}
