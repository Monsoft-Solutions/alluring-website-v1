/**
 * Intent Classification Function
 *
 * AI-powered intent classification for chat conversations.
 * Uses AI SDK generateObject() for type-safe structured output.
 *
 * @module @workspace/ai/functions/classify-intent
 */
import {
    intentClassificationSchema,
    type IntentClassification,
    type ClassificationMessage,
} from '../schemas/intent-classification.schema'
import {
    INTENT_CLASSIFICATION_SYSTEM_PROMPT,
    getIntentClassificationPrompt,
} from '../prompts/chat/intent-classification.prompt'
import { DEFAULT_CLASSIFICATION_MODEL_ID } from '../models/available-models.constant'
import { coreGenerateObject } from '../core'

/**
 * Options for intent classification
 */
export type ClassifyIntentOptions = {
    /** Model ID to use (defaults to gpt-4o-mini) */
    modelId?: string
    /** Temperature for generation (defaults to 0.3 for consistent results) */
    temperature?: number
}

/**
 * Default classification result for errors or empty conversations
 */
const DEFAULT_CLASSIFICATION: IntentClassification = {
    primaryIntent: 'unknown',
    intentConfidence: 0,
    detectedProcedures: [],
    tags: [],
}

/**
 * Classify conversation intent using AI SDK
 *
 * Uses generateObject() with a Zod schema for type-safe
 * structured output from the LLM.
 *
 * @param messages - The conversation messages to analyze
 * @param options - Optional configuration
 * @returns Intent classification result
 *
 * @example
 * ```typescript
 * const result = await classifyIntent([
 *   { role: 'user', content: 'How much does a BBL cost?' },
 *   { role: 'assistant', content: 'BBL pricing varies...' },
 * ])
 * console.log(result.primaryIntent) // 'pricing_inquiry'
 * console.log(result.detectedProcedures) // ['bbl']
 * ```
 */
export async function classifyIntent(
    messages: ClassificationMessage[],
    options: ClassifyIntentOptions = {}
): Promise<IntentClassification> {
    const { modelId = DEFAULT_CLASSIFICATION_MODEL_ID, temperature = 0.3 } =
        options

    // Need at least 2 messages to classify meaningfully
    if (messages.length < 2) {
        return DEFAULT_CLASSIFICATION
    }

    try {
        const result = await coreGenerateObject({
            modelId,
            schema: intentClassificationSchema,
            system: INTENT_CLASSIFICATION_SYSTEM_PROMPT,
            prompt: getIntentClassificationPrompt(messages),
            temperature,
        })

        return result.object
    } catch (error) {
        console.error('Intent classification error:', error)
        return DEFAULT_CLASSIFICATION
    }
}
