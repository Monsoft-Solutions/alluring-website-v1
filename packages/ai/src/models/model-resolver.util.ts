/**
 * Model Resolver Utility
 *
 * Automatically selects the correct AI provider based on the model ID prefix.
 *
 * @module @workspace/ai/models/model-resolver
 */
import { anthropic } from '@ai-sdk/anthropic'
import { createOpenAI, openai } from '@ai-sdk/openai'
import type { LanguageModel } from 'ai'

/**
 * OpenRouter provider — an OpenAI-compatible gateway to 400+ models.
 * Model ids follow the `vendor/model` convention
 * (e.g. `google/gemini-3.6-flash`, `x-ai/grok-4.5`).
 * Requires the OPENROUTER_API_KEY environment variable.
 */
const openrouter = createOpenAI({
    name: 'openrouter',
    baseURL: 'https://openrouter.ai/api/v1',
    // eslint-disable-next-line no-restricted-properties -- packages/ai has no env module; provider SDKs read process.env the same way
    apiKey: process.env.OPENROUTER_API_KEY ?? '',
})

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
    // OpenRouter ids follow the `vendor/model` convention — any model on
    // https://openrouter.ai/models works here (needs OPENROUTER_API_KEY)
    if (modelId.includes('/')) {
        return openrouter.chat(modelId) as LanguageModel
    }

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

/**
 * Model families that reject sampling parameters (`temperature`, `top_p`,
 * `top_k`) with a 400 error: Claude Opus 4.7+ and the Claude 5 family.
 */
const NO_SAMPLING_PARAMS_PREFIXES = [
    'claude-opus-5',
    'claude-opus-4-7',
    'claude-opus-4-8',
    'claude-sonnet-5',
    'claude-fable',
    'claude-mythos',
]

/**
 * Whether a model accepts the `temperature` sampling parameter.
 * For OpenRouter ids (`vendor/model`) the vendor segment is stripped so
 * `anthropic/claude-opus-5` is treated like `claude-opus-5`.
 */
export function supportsTemperature(modelId: string): boolean {
    const bareModelId = modelId.split('/').pop() ?? modelId
    return !NO_SAMPLING_PARAMS_PREFIXES.some((prefix) =>
        bareModelId.startsWith(prefix)
    )
}

/**
 * Spreadable `temperature` param, included only for models that accept it
 *
 * @example
 * ```typescript
 * generateText({ model, ...temperatureParam(modelId, 0.7) })
 * ```
 */
export function temperatureParam(
    modelId: string,
    temperature: number | undefined
): { temperature?: number } {
    return supportsTemperature(modelId) && temperature !== undefined
        ? { temperature }
        : {}
}
