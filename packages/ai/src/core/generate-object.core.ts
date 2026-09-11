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
 *   caller's `salvage` hook if it provided one, then — for every schema —
 *   trims whatever length cap the answer overshot (`soft-caps.util`);
 * - fatal errors (credentials, unknown model, rejected request) fail at once.
 *
 * Every model response is priced, rejected ones included, so a call that
 * needed a repair reports what all of its requests cost.
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
import { coerceToSchema } from './soft-caps.util'
import type { CoreGenerateObjectOptions } from './types.core'
import { DEFAULT_CHAT_MODEL_ID } from '../models/available-models.constant'
import { getModel } from '../models/model-resolver.util'
import {
    readOpenRouterUsage,
    sumCosts,
    withOpenRouterCost,
} from '../models/openrouter-usage.util'
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
 * the OpenRouter cost is rebuilt from what the call's requests billed.
 */
function salvagedResult<TObject>(
    error: NoObjectGeneratedError,
    object: TObject,
    costUsd: number | undefined
): GenerateObjectResult<TObject> {
    const result = {
        object,
        reasoning: undefined,
        finishReason: error.finishReason,
        usage: error.usage,
        warnings: undefined,
        request: {},
        response: error.response,
        providerMetadata:
            costUsd === undefined
                ? undefined
                : withOpenRouterCost(undefined, costUsd),
        toJsonResponse: () => Response.json(object),
    }
    return result as unknown as GenerateObjectResult<TObject>
}

/**
 * The SDK's result with its OpenRouter cost raised to what every request of
 * the call billed — the rejected answer before a repair costs money too. A
 * one-request call comes back untouched. The copy keeps the result's own
 * prototype so methods like `toJsonResponse` still work.
 */
function withTotalCost<TObject>(
    result: GenerateObjectResult<TObject>,
    billedCosts: ReadonlyArray<number | undefined>
): GenerateObjectResult<TObject> {
    if (billedCosts.length < 2) return result
    const total = sumCosts(billedCosts)
    if (total === undefined) return result

    const copy = Object.create(
        Object.getPrototypeOf(result) as object | null
    ) as GenerateObjectResult<TObject>
    return Object.assign(copy, result, {
        providerMetadata: withOpenRouterCost(result.providerMetadata, total),
    })
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

    // One entry per model response, rejected ones included: the SDK fires
    // onStepEnd before it validates. A request that fails at the HTTP layer
    // never produces a step, and never bills one; a response with no text at
    // all is thrown before its step fires, so it goes unpriced.
    const billedCosts: Array<number | undefined> = []

    const baseRequest = {
        model: getModel(modelId),
        schema,
        instructions: system,
        ...(temperature !== undefined && { temperature }),
        ...reasoningProviderOptions(reasoningEffort),
        maxOutputTokens: 16000,
        telemetry: telemetryConfig,
        onStepEnd: (step: { providerMetadata?: unknown }) => {
            billedCosts.push(
                readOpenRouterUsage(step.providerMetadata)?.costUsd
            )
        },
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
    let firstRejection: NoObjectGeneratedError | undefined

    // Last-resort recovery once the repair retry has been spent: the caller's
    // salvage first (it knows its own schema), then the generic trim — length
    // caps are preferences, so an overshoot is cut rather than failing the
    // call. Anything structural (a missing field, a wrong type) survives
    // neither and the error propagates.
    const recover = (
        rejection: NoObjectGeneratedError,
        texts: Array<string | undefined>,
        reason: string
    ): GenerateObjectResult<z.infer<TSchema>> | null => {
        if (salvage) {
            for (const text of texts) {
                if (!text) continue
                const salvaged = salvage(text)
                if (salvaged !== null) {
                    console.warn(
                        `${LOG_PREFIX} ${modelId} ${reason} — salvaged by the caller`
                    )
                    return salvagedResult(
                        rejection,
                        salvaged,
                        sumCosts(billedCosts)
                    )
                }
            }
        }

        for (const text of texts) {
            const coerced = coerceToSchema(text, schema)
            if (coerced !== null) {
                console.warn(
                    `${LOG_PREFIX} ${modelId} ${reason} — trimmed to fit (${coerced.coercions.join('; ')})`
                )
                return salvagedResult(
                    rejection,
                    coerced.object,
                    sumCosts(billedCosts)
                )
            }
        }

        return null
    }

    for (;;) {
        try {
            const result = await generateObject(requestWith(repairInstruction))
            return withTotalCost(
                result as GenerateObjectResult<z.infer<TSchema>>,
                billedCosts
            )
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
                    return salvagedResult(
                        error,
                        unwrapped,
                        sumCosts(billedCosts)
                    )
                }

                if (firstRejection === undefined) {
                    const issues = describeValidationFailure(error)
                    firstRejection = error
                    repairInstruction = buildRepairInstruction(
                        issues,
                        error.text
                    )
                    console.warn(
                        `${LOG_PREFIX} ${modelId} answer failed validation (${issues.join('; ')}) — one repair retry`
                    )
                    continue
                }

                const recovered = recover(
                    error,
                    [error.text, firstRejection.text],
                    'answer failed validation twice'
                )
                if (recovered) return recovered
            } else if (firstRejection !== undefined) {
                // The repair request itself failed at the provider (a 429 past
                // the slow retries, a 400). The first answer is still in hand;
                // trimmed, it beats throwing it away with the provider error.
                const recovered = recover(
                    firstRejection,
                    [firstRejection.text],
                    `repair request failed (${errorSummary(error)})`
                )
                if (recovered) return recovered
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
