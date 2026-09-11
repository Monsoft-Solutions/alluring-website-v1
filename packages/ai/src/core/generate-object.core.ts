/**
 * Core Generate Object Function
 *
 * Wrapper for AI SDK generateObject with centralized configuration and the
 * retry policy every structured call gets (issue #223):
 *
 * - transient provider errors (rate limits, 5xx, dropped connections) are
 *   retried with a slow backoff on top of the SDK's own fast retries;
 * - a validation miss first tries the #191 single-junk-key unwrap, then ONE
 *   repair retry that tells the model exactly what was wrong, then the
 *   caller's `salvage` hook if it provided one;
 * - fatal errors (credentials, unknown model, rejected request) fail at once.
 *
 * Before this, one field a few characters over its cap threw the same error
 * as a network outage, and a twelve-minute pipeline run died on it.
 *
 * @module @workspace/ai/core/generate-object
 */
import { generateObject, NoObjectGeneratedError } from 'ai'
import type { GenerateObjectResult } from 'ai'
import type { z } from 'zod'

import {
    buildRepairInstruction,
    classifyObjectGenerationError,
    describeValidationFailure,
    TRANSIENT_RETRY_DELAYS_MS,
    unwrapSingleKeyObject,
} from './generate-object-repair.util'
import type { CoreGenerateObjectOptions } from './types.core'
import { DEFAULT_CHAT_MODEL_ID } from '../models/available-models.constant'
import { getModel } from '../models/model-resolver.util'
import { reasoningProviderOptions } from '../models/reasoning.util'
import { telemetryConfig } from '../telemetry'

// Re-export result types for consumers
export type { GenerateObjectResult } from 'ai'
export type { FlexibleSchema, InferSchema } from '@ai-sdk/provider-utils'

const LOG_PREFIX = '[coreGenerateObject]'

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

function errorSummary(error: unknown): string {
    return error instanceof Error ? error.message : String(error)
}

/**
 * A result assembled from a failed call whose text was salvaged. The SDK's
 * error carries usage and response metadata but not provider metadata, so
 * OpenRouter cost is not reported for a salvaged call.
 */
function salvagedResult<TObject>(
    error: NoObjectGeneratedError,
    object: TObject
): GenerateObjectResult<TObject> {
    const result = {
        object,
        reasoning: undefined,
        finishReason: error.finishReason,
        usage: error.usage,
        warnings: undefined,
        request: {},
        response: error.response,
        providerMetadata: undefined,
        toJsonResponse: () => Response.json(object),
    }
    return result as unknown as GenerateObjectResult<TObject>
}

/**
 * Generate a structured object using AI
 *
 * Wraps the AI SDK generateObject function with consistent configuration,
 * telemetry, and the retry/repair policy described in the module header.
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
): Promise<GenerateObjectResult<z.infer<TSchema>>> {
    const {
        modelId = DEFAULT_CHAT_MODEL_ID,
        temperature,
        reasoningEffort,
        schema,
        system,
        salvage,
    } = options

    // Check if using prompt or messages format
    const isPromptFormat = 'prompt' in options

    const baseRequest = {
        model: getModel(modelId),
        schema,
        instructions: system,
        ...(temperature !== undefined && { temperature }),
        ...reasoningProviderOptions(reasoningEffort),
        maxOutputTokens: 16000,
        telemetry: telemetryConfig,
    }

    // The repair retry re-sends the original request plus one instruction
    // naming the problems, in whichever format the caller used.
    const requestWith = (repairInstruction?: string) =>
        isPromptFormat
            ? {
                  ...baseRequest,
                  prompt: repairInstruction
                      ? `${options.prompt}\n\n${repairInstruction}`
                      : options.prompt,
              }
            : {
                  ...baseRequest,
                  messages: repairInstruction
                      ? [
                            ...options.messages,
                            {
                                role: 'user' as const,
                                content: repairInstruction,
                            },
                        ]
                      : options.messages,
              }

    let transientRetries = 0
    let repairInstruction: string | undefined
    let firstRejectedText: string | undefined

    for (;;) {
        try {
            const result = await generateObject(requestWith(repairInstruction))
            return result as GenerateObjectResult<z.infer<TSchema>>
        } catch (error) {
            const kind = classifyObjectGenerationError(error)

            if (
                kind === 'transient' &&
                transientRetries < TRANSIENT_RETRY_DELAYS_MS.length
            ) {
                const delay = TRANSIENT_RETRY_DELAYS_MS[transientRetries]!
                transientRetries++
                console.warn(
                    `${LOG_PREFIX} transient error on ${modelId} (${errorSummary(error)}) — retry ${transientRetries}/${TRANSIENT_RETRY_DELAYS_MS.length} in ${delay}ms`
                )
                await sleep(delay)
                continue
            }

            if (
                kind === 'validation' &&
                NoObjectGeneratedError.isInstance(error)
            ) {
                const unwrapped = unwrapSingleKeyObject(error.text, schema)
                if (unwrapped !== null) {
                    console.warn(
                        `${LOG_PREFIX} ${modelId} wrapped the payload under a junk key — unwrapped without another call`
                    )
                    return salvagedResult(error, unwrapped)
                }

                if (repairInstruction === undefined) {
                    const issues = describeValidationFailure(error)
                    firstRejectedText = error.text
                    repairInstruction = buildRepairInstruction(
                        issues,
                        error.text
                    )
                    console.warn(
                        `${LOG_PREFIX} ${modelId} answer failed validation (${issues.join('; ')}) — one repair retry`
                    )
                    continue
                }

                if (salvage) {
                    for (const text of [error.text, firstRejectedText]) {
                        if (!text) continue
                        const salvaged = salvage(text)
                        if (salvaged !== null) {
                            console.warn(
                                `${LOG_PREFIX} ${modelId} answer failed validation twice — salvaged by the caller`
                            )
                            return salvagedResult(error, salvaged)
                        }
                    }
                }
            }

            if (NoObjectGeneratedError.isInstance(error)) {
                console.error(
                    `${LOG_PREFIX} ${modelId} produced no valid object: ${describeValidationFailure(error).join('; ')}`
                )
            }
            throw error
        }
    }
}
