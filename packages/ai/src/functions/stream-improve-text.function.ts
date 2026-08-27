/**
 * Stream Improve Text Function
 *
 * AI-powered text improvement with streaming support.
 * Provides real-time text generation for various improvement operations.
 *
 * @module @workspace/ai/functions/stream-improve-text
 */
import type { TextOperation } from '@workspace/shared/schemas/text'

import { coreStreamText } from '../core'
import {
    TEXT_IMPROVEMENT_SYSTEM_PROMPT,
    getTextImprovementPrompt,
} from '../prompts/text'

/**
 * Default model for text improvement
 * Uses a capable model for quality text generation
 */
const DEFAULT_TEXT_MODEL_ID = 'gpt-4.1-mini'

/**
 * Options for streaming text improvement
 */
export type StreamImproveTextOptions = {
    /** The text to improve */
    text: string
    /** The type of improvement operation */
    operation: TextOperation
    /** The field name for context (e.g., "title", "description") */
    fieldName: string
    /** Custom instruction (only used for 'custom' operation) */
    customInstruction?: string
    /** Model ID to use (defaults to gpt-4.1-mini) */
    modelId?: string
}

/**
 * Stream improved text using AI
 *
 * Streams the improved text as it's generated, providing
 * real-time feedback to the user.
 *
 * @param options - The improvement options
 * @returns A streaming result that can be converted to a Response
 *
 * @example
 * ```typescript
 * // In an API route
 * const result = streamImproveText({
 *   text: 'Amazing BBL results!',
 *   operation: 'seo-optimize',
 *   fieldName: 'title',
 * })
 *
 * return result.toTextStreamResponse()
 * ```
 */
export function streamImproveText(
    options: StreamImproveTextOptions
): ReturnType<typeof coreStreamText> {
    const {
        text,
        operation,
        fieldName,
        customInstruction,
        modelId = DEFAULT_TEXT_MODEL_ID,
    } = options

    // Validate input
    if (!text?.trim()) {
        throw new Error('Text is required for improvement')
    }

    // Generate the prompt
    const prompt = getTextImprovementPrompt(
        operation,
        fieldName,
        text,
        customInstruction
    )

    // Stream the improved text
    return coreStreamText({
        modelId,
        system: TEXT_IMPROVEMENT_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }],
        smoothStreaming: {
            chunking: 'word',
            delayInMs: 10,
        },
    })
}
