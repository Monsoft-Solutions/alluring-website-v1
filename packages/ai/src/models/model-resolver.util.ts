/**
 * Model Resolver Utility
 *
 * Automatically selects the correct AI provider based on the model ID prefix.
 *
 * @module @workspace/ai/models/model-resolver
 */
import { anthropic } from '@ai-sdk/anthropic'
import { openai } from '@ai-sdk/openai'
import type { LanguageModel } from 'ai'

/**
 * Get the appropriate model provider instance for a given model ID
 *
 * @param modelId - The model identifier (e.g., 'gpt-4o', 'claude-3-opus')
 * @returns The provider-specific model instance
 *
 * @example
 * ```typescript
 * const model = getModel('claude-opus-4-5') // Returns Anthropic model
 * const model = getModel('gpt-4.1')        // Returns OpenAI model
 * ```
 */
export function getModel(modelId: string): LanguageModel {
    if (modelId.startsWith('claude-')) {
        return anthropic(modelId) as LanguageModel
    }

    if (modelId.startsWith('gpt-')) {
        return openai(modelId) as LanguageModel
    }

    // Default to OpenAI for backward compatibility with existing model IDs in the codebase
    // that might not start with gpt- but are OpenAI models
    return openai(modelId) as LanguageModel
}
