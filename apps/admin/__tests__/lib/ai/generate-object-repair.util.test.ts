/**
 * Tests for the pure repair helpers behind coreGenerateObject (issue #223).
 *
 * These pin the retry policy's decisions: which errors are worth retrying,
 * how a validation miss is described to the model, and which raw texts can
 * be salvaged without another call.
 */
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import {
    APICallError,
    buildRepairInstruction,
    classifyObjectGenerationError,
    describeValidationFailure,
    JSONParseError,
    NoObjectGeneratedError,
    RetryError,
    TypeValidationError,
    unwrapSingleKeyObject,
} from '@workspace/ai/core'

/** Mirrors REPAIR_TEXT_MAX_CHARS in the repair util. */
const REPAIR_TEXT_MAX_CHARS = 4000

const schema = z.object({
    score: z.number(),
    excerpt: z.string().max(10),
})

function apiError(statusCode: number, isRetryable = false): APICallError {
    return new APICallError({
        message: `HTTP ${statusCode}`,
        url: 'https://openrouter.ai/api/v1/chat/completions',
        requestBodyValues: {},
        statusCode,
        isRetryable,
    })
}

function noObjectError(text: string | undefined, value: unknown) {
    const zod = schema.safeParse(value)
    const cause = zod.success
        ? new Error('unexpected: value validates')
        : new TypeValidationError({ value, cause: zod.error })
    return new NoObjectGeneratedError({
        message: 'No object generated: response did not match schema.',
        cause,
        text,
        response: { id: 'r1', timestamp: new Date(), modelId: 'x-ai/grok-4.6' },
        usage: {
            inputTokens: 1,
            outputTokens: 1,
            totalTokens: 2,
        } as unknown as NonNullable<NoObjectGeneratedError['usage']>,
        finishReason: 'stop',
    })
}

describe('classifyObjectGenerationError', () => {
    it('treats rate limits and 5xx as transient', () => {
        expect(classifyObjectGenerationError(apiError(429))).toBe('transient')
        expect(classifyObjectGenerationError(apiError(503))).toBe('transient')
        expect(classifyObjectGenerationError(apiError(418, true))).toBe(
            'transient'
        )
    })

    it('treats credentials, unknown models and rejected requests as fatal', () => {
        expect(classifyObjectGenerationError(apiError(401))).toBe('fatal')
        expect(classifyObjectGenerationError(apiError(404))).toBe('fatal')
        expect(classifyObjectGenerationError(apiError(400))).toBe('fatal')
    })

    it('judges an SDK RetryError by the last error it saw', () => {
        const wrapped = new RetryError({
            message: 'Failed after 3 attempts',
            reason: 'maxRetriesExceeded',
            errors: [apiError(429), apiError(429), apiError(503)],
        })
        expect(classifyObjectGenerationError(wrapped)).toBe('transient')
    })

    it('treats a schema miss as validation', () => {
        expect(classifyObjectGenerationError(noObjectError('{}', {}))).toBe(
            'validation'
        )
    })

    it('recognises network failures that arrive as plain errors', () => {
        expect(classifyObjectGenerationError(new Error('fetch failed'))).toBe(
            'transient'
        )
        expect(
            classifyObjectGenerationError(
                new Error('request failed', {
                    cause: new Error('read ECONNRESET'),
                })
            )
        ).toBe('transient')
    })

    it('is fatal for anything it cannot name', () => {
        expect(classifyObjectGenerationError(new Error('boom'))).toBe('fatal')
        expect(classifyObjectGenerationError('nope')).toBe('fatal')
        expect(classifyObjectGenerationError(undefined)).toBe('fatal')
    })
})

describe('describeValidationFailure', () => {
    it("names each Zod issue by path, in the model's terms", () => {
        const lines = describeValidationFailure(
            noObjectError('{"excerpt":"way too long text"}', {
                excerpt: 'way too long text',
            })
        )
        // Zod reports issues in schema key order.
        expect(lines).toEqual([
            'score: Invalid input: expected number, received undefined',
            'excerpt: Too big: expected string to have <=10 characters',
        ])
    })

    it('flags a truncated answer before the field issues', () => {
        const error = noObjectError('{"excerpt":"x"}', { excerpt: 'x' })
        Object.assign(error, { finishReason: 'length' })
        const lines = describeValidationFailure(error)
        expect(lines[0]).toMatch(/cut off/)
        expect(lines).toHaveLength(2)
    })

    it('describes unparsable JSON', () => {
        const error = new NoObjectGeneratedError({
            message: 'No object generated: could not parse the response.',
            cause: new JSONParseError({
                text: '{not json',
                cause: new SyntaxError('Unexpected token'),
            }),
            text: '{not json',
            response: {
                id: 'r',
                timestamp: new Date(),
                modelId: 'm',
            },
            usage: {} as unknown as NonNullable<
                NoObjectGeneratedError['usage']
            >,
            finishReason: 'stop',
        })
        expect(describeValidationFailure(error)[0]).toMatch(/not valid JSON/)
    })

    it('falls back to the message for anything else', () => {
        expect(describeValidationFailure(new Error('odd'))).toEqual(['odd'])
        expect(describeValidationFailure(42)).toEqual([])
    })
})

describe('buildRepairInstruction', () => {
    it('lists the problems, echoes the rejected answer and asks for a fix', () => {
        const text = buildRepairInstruction(
            ['excerpt: Too big: expected string to have <=300 characters'],
            '{"excerpt":"..."}'
        )
        expect(text).toContain('did not match the required schema')
        expect(text).toContain('- excerpt: Too big')
        expect(text).toContain('{"excerpt":"..."}')
        expect(text).toMatch(/Return the corrected object only/)
    })

    it('caps the echoed answer', () => {
        const text = buildRepairInstruction(
            [],
            'x'.repeat(REPAIR_TEXT_MAX_CHARS * 2)
        )
        expect(text.length).toBeLessThan(REPAIR_TEXT_MAX_CHARS + 500)
        expect(text).toContain('did not match the required schema.')
    })
})

describe('unwrapSingleKeyObject', () => {
    it('recovers a payload nested under one junk key (#191)', () => {
        const inner = { score: 88, excerpt: 'short' }
        expect(
            unwrapSingleKeyObject(
                JSON.stringify({ 'parameter name': inner }),
                schema
            )
        ).toEqual(inner)
        expect(
            unwrapSingleKeyObject(JSON.stringify({ config: inner }), schema)
        ).toEqual(inner)
    })

    it('refuses anything that is not exactly one wrapping key', () => {
        const inner = { score: 88, excerpt: 'short' }
        expect(
            unwrapSingleKeyObject(
                JSON.stringify({ a: inner, b: inner }),
                schema
            )
        ).toBeNull()
        expect(unwrapSingleKeyObject(JSON.stringify(inner), schema)).toBeNull()
        expect(
            unwrapSingleKeyObject(JSON.stringify([inner]), schema)
        ).toBeNull()
        expect(unwrapSingleKeyObject('{"k": 1}', schema)).toBeNull()
    })

    it('refuses an inner value that still fails the schema', () => {
        expect(
            unwrapSingleKeyObject(
                JSON.stringify({
                    wrapper: { score: 'high', excerpt: 'short' },
                }),
                schema
            )
        ).toBeNull()
    })

    it('handles missing or invalid text', () => {
        expect(unwrapSingleKeyObject(undefined, schema)).toBeNull()
        expect(unwrapSingleKeyObject('', schema)).toBeNull()
        expect(unwrapSingleKeyObject('{not json', schema)).toBeNull()
    })
})
