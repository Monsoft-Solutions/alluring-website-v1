/**
 * Core Generate Object Function
 *
 * Wrapper for AI SDK generateObject with centralized configuration.
 * Provides a single point for telemetry, error handling, and other cross-cutting concerns.
 *
 * @module @workspace/ai/core/generate-object
 */
import { generateObject, NoObjectGeneratedError } from 'ai'
import type { z } from 'zod'

import type { CoreGenerateObjectOptions } from './types.core'
import { DEFAULT_CHAT_MODEL_ID } from '../models/available-models.constant'
import { getModel } from '../models/model-resolver.util'
import { reasoningProviderOptions } from '../models/reasoning.util'
import { telemetryConfig } from '../telemetry'

// Re-export result types for consumers
export type { GenerateObjectResult } from 'ai'
export type { FlexibleSchema, InferSchema } from '@ai-sdk/provider-utils'

/**
 * Generate a structured object using AI
 *
 * Wraps the AI SDK generateObject function with consistent configuration
 * and a centralized extension point for telemetry.
 *
 * Supports both prompt-based and messages-based generation.
 * Messages format enables multimodal content including images for vision capabilities.
 *
 * @param options - Generation options including schema, prompts/messages, and model config
 * @returns The generated object matching the schema type
 *
 * @example
 * ```typescript
 * // Using prompt (text-only)
 * const result = await coreGenerateObject({
 *   schema: myZodSchema,
 *   system: 'You are a helpful assistant',
 *   prompt: 'Extract the user info from: John Doe, 30 years old',
 *   modelId: 'gpt-4.1-mini',
 *   temperature: 0.3,
 * })
 *
 * // Using messages (multimodal with images)
 * const result = await coreGenerateObject({
 *   schema: imageAnalysisSchema,
 *   system: 'Analyze this image',
 *   messages: [
 *     {
 *       role: 'user',
 *       content: [
 *         { type: 'text', text: 'Analyze this image' },
 *         { type: 'image', image: 'https://example.com/image.jpg' }
 *       ]
 *     }
 *   ],
 *   modelId: 'gpt-4.1',
 * })
 * ```
 */
export async function coreGenerateObject<TSchema extends z.ZodType>(
    options: CoreGenerateObjectOptions<TSchema>
) {
    const {
        modelId = DEFAULT_CHAT_MODEL_ID,
        temperature,
        reasoningEffort,
        schema,
        system,
    } = options

    // Check if using prompt or messages format
    const isPromptFormat = 'prompt' in options

    try {
        const result = await generateObject({
            model: getModel(modelId),
            schema,
            instructions: system,
            ...(isPromptFormat
                ? { prompt: options.prompt }
                : { messages: options.messages }),
            ...(temperature !== undefined && { temperature }),
            ...reasoningProviderOptions(reasoningEffort),
            maxOutputTokens: 16000,
            telemetry: telemetryConfig,
        })

        return result
    } catch (error) {
        if (error instanceof NoObjectGeneratedError) {
            console.log('NoObjectGeneratedError')
            console.log('Cause:', error.cause)
            console.log('Text:', error.text)
            console.log('Response:', error.response)
            console.log('Usage:', error.usage)
        }
        throw error
    }
}
