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

        // Extract FAQs using AI
        const result = await extractFaqs({
            content,
            primaryKeyword,
            maxFaqs: 10,
        })

        return NextResponse.json({
            success: true,
            faqs: result.faqs,
            hasFaqSection: result.hasFaqSection,
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
