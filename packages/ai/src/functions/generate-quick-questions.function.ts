/**
 * Generate Quick Questions Function
 *
 * AI-powered generation of contextual follow-up questions for chat.
 * Uses AI SDK generateObject() for type-safe structured output.
 *
 * @module @workspace/ai/functions/generate-quick-questions
 */
import {
    quickQuestionsSchema,
    type GenerateQuickQuestionsParams,
} from '../schemas/quick-questions.schema'
import {
    QUICK_QUESTIONS_SYSTEM_PROMPT,
    getQuickQuestionsPrompt,
} from '../prompts/chat/quick-questions.prompt'
import { DEFAULT_QUICK_QUESTIONS_MODEL_ID } from '../models/available-models.constant'
import { coreGenerateObject } from '../core'

/**
 * Options for quick questions generation
 */
export type GenerateQuickQuestionsOptions = {
    /** Model ID to use (defaults to gpt-4.1-mini for speed) */
    modelId?: string
    /** Temperature for generation (defaults to 0.7 for variety) */
    temperature?: number
}

/**
 * Default empty result for errors or insufficient context
 */
const DEFAULT_QUESTIONS: string[] = []

/**
 * Generate contextual quick questions using AI SDK
 *
 * Uses generateObject() with a Zod schema for type-safe
 * structured output from the LLM.
 *
 * @param params - Parameters for generation
 * @param options - Optional configuration
 * @returns Array of 2-3 contextual follow-up questions
 *
 * @example
 * ```typescript
 * const questions = await generateQuickQuestions({
 *   messages: [
 *     { role: 'user', content: 'How much does a BBL cost?' },
 *     { role: 'assistant', content: 'BBL pricing starts at...' },
 *   ],
 *   lastResponse: 'BBL pricing starts at...',
 *   detectedProcedures: ['bbl'],
 * })
 * console.log(questions) // ['Do you offer financing?', 'What's the recovery time?', 'Can I see results?']
 * ```
 */
export async function generateQuickQuestions(
    params: GenerateQuickQuestionsParams,
    options: GenerateQuickQuestionsOptions = {}
): Promise<string[]> {
    const { modelId = DEFAULT_QUICK_QUESTIONS_MODEL_ID, temperature = 0.7 } =
        options

    // Need at least 1 message to generate meaningful questions
    if (params.messages.length < 1 || !params.lastResponse) {
        console.log(
            '[AI:QuickQuestions] Skipping - insufficient context:',
            `messages=${params.messages.length}, hasResponse=${!!params.lastResponse}`
        )
        return DEFAULT_QUESTIONS
    }

    try {
        console.log(
            `[AI:QuickQuestions] Calling OpenAI with model ${modelId}...`
        )

        const result = await coreGenerateObject({
            modelId,
            schema: quickQuestionsSchema,
            system: QUICK_QUESTIONS_SYSTEM_PROMPT,
            prompt: getQuickQuestionsPrompt(params),
            temperature,
        })

        console.log('[AI:QuickQuestions] Success:', result.object.questions)
        return result.object.questions
    } catch (error) {
        console.error('[AI:QuickQuestions] Error:', error)
        return DEFAULT_QUESTIONS
    }
}
