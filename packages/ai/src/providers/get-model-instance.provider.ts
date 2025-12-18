/**
 * Provider Factory - Routes Model IDs to Correct AI SDK Provider
 *
 * This factory determines which AI provider to use based on the model ID.
 * Supports OpenAI, Anthropic, and Google AI providers.
 *
 * @module @workspace/ai/providers/get-model-instance
 */
import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { google } from '@ai-sdk/google'

/**
 * Get the appropriate model instance for a given model ID
 *
 * Routes to the correct AI SDK provider based on model ID prefix:
 * - claude-* → Anthropic
 * - gemini-* → Google
 * - gpt-* → OpenAI (default)
 *
 * @param modelId - The model identifier (e.g., 'claude-sonnet-4-5', 'gemini-3-flash-preview', 'gpt-4.1')
 * @returns Configured model instance from the appropriate provider
 *
 * @example
 * ```typescript
 * const model = getModelInstance('claude-sonnet-4-5')
 * const result = await generateText({ model, prompt: 'Hello' })
 * ```
 */
export function getModelInstance(
    modelId: string
):
    | ReturnType<typeof openai>
    | ReturnType<typeof anthropic>
    | ReturnType<typeof google> {
    // Route to Anthropic for Claude models
    if (modelId.startsWith('claude-')) {
        return anthropic(modelId)
    }

    // Route to Google for Gemini models
    if (modelId.startsWith('gemini-')) {
        return google(modelId)
    }

    // Default to OpenAI for GPT models
    return openai(modelId)
}
