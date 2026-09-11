/**
 * Generate Object Repair Helpers
 *
 * The pure logic behind `coreGenerateObject`'s retry policy (issue #223):
 * classify what went wrong, describe a validation miss in words the model can
 * act on, and salvage the "payload wrapped under a junk key" shape (#191)
 * without spending another call. No SDK calls live here, so every branch runs
 * as a unit test.
 *
 * Error classes:
 * - `transient`: rate limits, 5xx, timeouts, dropped connections. Worth a slow
 *   retry on top of the SDK's own fast ones.
 * - `validation`: the model answered, but the answer did not fit the schema.
 *   Worth exactly one repair retry that names the problem.
 * - `fatal`: bad credentials, unknown model, a rejected request. Retrying
 *   cannot help; fail at once.
 *
 * @module @workspace/ai/core/generate-object-repair.util
 */
import {
    APICallError,
    JSONParseError,
    NoObjectGeneratedError,
    RetryError,
    TypeValidationError,
} from 'ai'
import type { z } from 'zod'

// ============================================
// Constants
// ============================================

export type ObjectGenerationErrorClass = 'transient' | 'validation' | 'fatal'

/**
 * Backoff for the wrapper's own transient retries. The SDK already retries
 * fast (seconds); these are the slow ones a rate-limit burst needs.
 */
export const TRANSIENT_RETRY_DELAYS_MS: readonly number[] = [2000, 6000]

/** The rejected answer is echoed back to the model, capped at this length. */
export const REPAIR_TEXT_MAX_CHARS = 4000

/** HTTP statuses a later attempt has a real chance of clearing. */
const TRANSIENT_STATUS_CODES = new Set([408, 409, 425, 429, 500, 502, 503, 504])

/** Message shapes of network-level failures that reach us as plain Errors. */
const TRANSIENT_MESSAGE_PATTERNS: RegExp[] = [
    /rate.?limit/i,
    /too many requests/i,
    /timed?.?out/i,
    /ETIMEDOUT/,
    /ECONNRESET/,
    /ECONNREFUSED/,
    /EAI_AGAIN/,
    /socket hang up/i,
    /fetch failed/i,
    /network error/i,
    /overloaded/i,
    /bad gateway/i,
    /service unavailable/i,
    /gateway time.?out/i,
]

const MAX_CAUSE_DEPTH = 5

// ============================================
// Classification
// ============================================

function messagesOf(error: unknown): string[] {
    const messages: string[] = []
    let current: unknown = error
    for (let depth = 0; depth < MAX_CAUSE_DEPTH; depth++) {
        if (typeof current === 'string') {
            messages.push(current)
            break
        }
        if (!(current instanceof Error)) break
        messages.push(current.message)
        current = current.cause
    }
    return messages
}

/**
 * Decide whether an error from `generateObject` is worth a retry, and which
 * kind. Unknown errors are fatal on purpose: looping on something we cannot
 * name is how a broken pipeline burns a day of runs.
 */
export function classifyObjectGenerationError(
    error: unknown
): ObjectGenerationErrorClass {
    if (NoObjectGeneratedError.isInstance(error)) return 'validation'

    // The SDK already spent its own short retries; judge by what it last saw.
    if (RetryError.isInstance(error)) {
        return classifyObjectGenerationError(error.lastError)
    }

    if (APICallError.isInstance(error)) {
        if (
            error.statusCode !== undefined &&
            TRANSIENT_STATUS_CODES.has(error.statusCode)
        ) {
            return 'transient'
        }
        return error.isRetryable ? 'transient' : 'fatal'
    }

    const transient = messagesOf(error).some((message) =>
        TRANSIENT_MESSAGE_PATTERNS.some((pattern) => pattern.test(message))
    )
    return transient ? 'transient' : 'fatal'
}

// ============================================
// Describing a validation miss
// ============================================

type ZodLikeIssue = { path?: unknown[]; message?: string }

function isZodLikeError(value: unknown): value is { issues: ZodLikeIssue[] } {
    return (
        typeof value === 'object' &&
        value !== null &&
        Array.isArray((value as { issues?: unknown }).issues)
    )
}

/**
 * The problems with a rejected answer, one line each, in the model's terms:
 * `excerpt: Too big: expected string to have <=300 characters`.
 */
export function describeValidationFailure(error: unknown): string[] {
    const lines: string[] = []

    if (NoObjectGeneratedError.isInstance(error)) {
        if (error.finishReason === 'length') {
            lines.push(
                'The answer was cut off by the output length limit — be more concise.'
            )
        }
        lines.push(...describeValidationFailure(error.cause))
        if (lines.length === 0) lines.push(error.message)
        return lines
    }

    if (JSONParseError.isInstance(error)) {
        return [`The answer was not valid JSON: ${error.message}`]
    }

    if (TypeValidationError.isInstance(error)) {
        return describeValidationFailure(error.cause)
    }

    if (isZodLikeError(error)) {
        return error.issues.map((issue) => {
            const path =
                Array.isArray(issue.path) && issue.path.length > 0
                    ? issue.path.map(String).join('.')
                    : '(root)'
            return `${path}: ${issue.message ?? 'invalid'}`
        })
    }

    if (error instanceof Error) return [error.message]
    return []
}

/**
 * The extra instruction appended to the original prompt for the repair
 * retry: what was wrong, what the model said, and what to do about it.
 */
export function buildRepairInstruction(
    issues: string[],
    rejectedText?: string
): string {
    const problems =
        issues.length > 0
            ? issues.map((issue) => `- ${issue}`).join('\n')
            : '- The answer did not match the required schema.'

    const echoed = rejectedText?.trim()
        ? `\n\nYour previous answer, for reference:\n${rejectedText.trim().slice(0, REPAIR_TEXT_MAX_CHARS)}`
        : ''

    return `Your previous answer did not match the required schema.

Problems:
${problems}${echoed}

Return the corrected object only. Fix exactly the problems listed and keep everything else the same.`
}

// ============================================
// Salvage without another call
// ============================================

/**
 * Some models return the complete, correct payload nested under one junk
 * top-level key (`{"parameter name": {...}}`, `{"config": {...}}` — #191).
 * If the raw text has that shape and the inner value validates, use it.
 *
 * @returns The validated inner object, or null when the text is anything else
 */
export function unwrapSingleKeyObject<TSchema extends z.ZodType>(
    text: string | undefined,
    schema: TSchema
): z.infer<TSchema> | null {
    if (!text) return null

    let parsed: unknown
    try {
        parsed = JSON.parse(text)
    } catch {
        return null
    }

    if (
        typeof parsed !== 'object' ||
        parsed === null ||
        Array.isArray(parsed)
    ) {
        return null
    }

    const keys = Object.keys(parsed)
    if (keys.length !== 1) return null

    const inner = (parsed as Record<string, unknown>)[keys[0]!]
    if (typeof inner !== 'object' || inner === null || Array.isArray(inner)) {
        return null
    }

    const result = schema.safeParse(inner)
    return result.success ? (result.data as z.infer<TSchema>) : null
}
