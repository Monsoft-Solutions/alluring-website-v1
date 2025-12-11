/**
 * AI Text Improvement API Route
 *
 * Streaming API endpoint for AI-powered text improvement.
 * Supports 12 operations: 7 general + 5 industry-specific.
 *
 * @module app/api/ai/improve-text/route
 */
import { type NextRequest, NextResponse } from 'next/server'
import { streamImproveText } from '@workspace/ai'
import {
    type TextOperation,
    TEXT_OPERATIONS,
} from '@workspace/shared/schemas/text'

import { env } from '@/env'

/**
 * Request body schema for text improvement
 */
type ImproveTextRequest = {
    text: string
    operation: TextOperation
    fieldName: string
    customInstruction?: string
}

/**
 * POST /api/ai/improve-text
 *
 * Streams improved text based on the selected operation.
 */
export async function POST(request: NextRequest) {
    try {
        // Check for OpenAI API key
        if (!env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: 'OpenAI API key not configured' },
                { status: 503 }
            )
        }

        // Parse request body
        const body = (await request.json()) as ImproveTextRequest
        const { text, operation, fieldName, customInstruction } = body

        // Validate required fields
        if (!text?.trim()) {
            return NextResponse.json(
                { error: 'Text is required' },
                { status: 400 }
            )
        }

        if (!operation || !TEXT_OPERATIONS.includes(operation)) {
            return NextResponse.json(
                {
                    error: `Invalid operation. Must be one of: ${TEXT_OPERATIONS.join(', ')}`,
                },
                { status: 400 }
            )
        }

        if (!fieldName?.trim()) {
            return NextResponse.json(
                { error: 'Field name is required' },
                { status: 400 }
            )
        }

        // For custom operation, require instruction
        if (operation === 'custom' && !customInstruction?.trim()) {
            return NextResponse.json(
                {
                    error: 'Custom instruction is required for custom operation',
                },
                { status: 400 }
            )
        }

        // Stream the improved text
        const result = streamImproveText({
            text,
            operation,
            fieldName,
            customInstruction,
        })

        return result.toTextStreamResponse()
    } catch (error) {
        console.error('AI improve text error:', error)
        return NextResponse.json(
            { error: 'An error occurred while improving text' },
            { status: 500 }
        )
    }
}
