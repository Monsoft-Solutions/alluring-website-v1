/**
 * Core Stream Object Function
 *
 * Wrapper for AI SDK streamObject with centralized configuration.
 * Provides a single point for telemetry, error handling, and other cross-cutting concerns.
 *
 * @module @workspace/ai/core/stream-object
 */
import { streamObject } from 'ai'
import type { z } from 'zod'

import type { CoreStreamObjectOptions } from './types.core'
import { DEFAULT_CHAT_MODEL_ID } from '../models/available-models.constant'
import { getModel } from '../models/model-resolver.util'
import { telemetryConfig } from '../telemetry'

// Re-export result types for consumers
export type { StreamObjectResult, DeepPartial } from 'ai'
export type { FlexibleSchema, InferSchema } from '@ai-sdk/provider-utils'

/**
 * Stream a structured object using AI
 *
 * Wraps the AI SDK streamObject function with consistent configuration
 * and a centralized extension point for telemetry.
 *
 * @param options - Streaming options including schema, prompts, and model config
 * @returns The streaming result with partial objects as they're generated
 *
 * @example
 * ```typescript
 * const { partialObjectStream } = await coreStreamObject({
 *   schema: myZodSchema,
 *   system: 'You are a helpful assistant',
 *   prompt: 'Generate a user profile',
 *   modelId: 'gpt-4.1-mini',
 * })
 *
 * for await (const partialObject of partialObjectStream) {
 *   console.log(partialObject) // Partial object as it's generated
 * }
 * ```
 */
export function coreStreamObject<TSchema extends z.ZodType>(
    options: CoreStreamObjectOptions<TSchema>
) {
    const {
        modelId = DEFAULT_CHAT_MODEL_ID,
        temperature,
        schema,
        system,
        prompt,
    } = options

    const result = streamObject({
        model: getModel(modelId),
        schema,
        instructions: system,
        prompt,
        ...(temperature !== undefined && { temperature }),
        maxOutputTokens: 16000,
        telemetry: telemetryConfig,
    })

    return result
}
