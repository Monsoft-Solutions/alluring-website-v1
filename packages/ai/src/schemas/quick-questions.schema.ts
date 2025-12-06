/**
 * Quick Questions Schema
 *
 * Zod schema for validating AI-generated quick question responses.
 * Used with AI SDK's generateObject() for type-safe structured output.
 *
 * @module @workspace/ai/schemas/quick-questions
 */
import { z } from 'zod'

/**
 * Maximum character length for a quick question
 * Kept short for UI pill buttons
 */
export const MAX_QUESTION_LENGTH = 60

/**
 * Zod schema for quick questions result
 *
 * This schema is used with AI SDK's generateObject() to ensure
 * type-safe structured output from the LLM.
 */
export const quickQuestionsSchema = z.object({
    questions: z
        .array(
            z
                .string()
                .max(MAX_QUESTION_LENGTH)
                .describe('A short, conversational follow-up question')
        )
        .min(2)
        .max(3)
        .describe('Array of 2-3 contextual follow-up questions'),
})

/**
 * TypeScript type inferred from the schema
 */
export type QuickQuestions = z.infer<typeof quickQuestionsSchema>

/**
 * Message format for quick questions generation input
 */
export type QuickQuestionsMessage = {
    role: 'user' | 'assistant'
    content: string
}

/**
 * Parameters for generating quick questions
 */
export type GenerateQuickQuestionsParams = {
    /** Recent conversation messages for context */
    messages: QuickQuestionsMessage[]
    /** The last assistant response to base questions on */
    lastResponse: string
    /** Procedures detected in the conversation (optional) */
    detectedProcedures?: string[]
}
