/**
 * Tests for coreGenerateObject's retry and repair loop (issue #223).
 *
 * The SDK call is mocked so each scenario scripts what the model "answers";
 * the wrapper's decisions — unwrap, repair once, salvage, back off, give up —
 * are what is under test.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

const { mockedGenerateObject } = vi.hoisted(() => ({
    mockedGenerateObject: vi.fn(),
}))

vi.mock('ai', async (importOriginal) => {
    const actual = await importOriginal<Record<string, unknown>>()
    return { ...actual, generateObject: mockedGenerateObject }
})

vi.mock('@workspace/ai/models/model-resolver.util', () => ({
    getModel: (modelId: string) => ({ modelId }),
}))

import {
    APICallError,
    coreGenerateObject,
    NoObjectGeneratedError,
    TRANSIENT_RETRY_DELAYS_MS,
    TypeValidationError,
} from '@workspace/ai/core'

const schema = z.object({
    score: z.number(),
    excerpt: z.string().max(10),
})

const totalBackoffMs = TRANSIENT_RETRY_DELAYS_MS.reduce(
    (sum: number, ms: number) => sum + ms,
    0
)

function okResult(object: unknown) {
    return {
        object,
        providerMetadata: { openrouter: { usage: { cost: 0.01 } } },
    }
}

function schemaMiss(value: unknown, text = JSON.stringify(value)) {
    const zod = schema.safeParse(value)
    return new NoObjectGeneratedError({
        message: 'No object generated: response did not match schema.',
        cause: new TypeValidationError({
            value,
            cause: zod.success ? new Error('unexpected') : zod.error,
        }),
        text,
        response: { id: 'r', timestamp: new Date(), modelId: 'm' },
        usage: {
            inputTokens: 5,
            outputTokens: 5,
            totalTokens: 10,
        } as unknown as NonNullable<NoObjectGeneratedError['usage']>,
        finishReason: 'stop',
    })
}

function transient(statusCode = 429) {
    return new APICallError({
        message: `HTTP ${statusCode}`,
        url: 'u',
        requestBodyValues: {},
        statusCode,
        isRetryable: true,
    })
}

beforeEach(() => {
    mockedGenerateObject.mockReset()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
})

describe('coreGenerateObject', () => {
    it('returns a clean first answer untouched', async () => {
        mockedGenerateObject.mockResolvedValueOnce(
            okResult({ score: 1, excerpt: 'ok' }) as never
        )
        const result = await coreGenerateObject({
            schema,
            prompt: 'p',
            modelId: 'x-ai/grok-4.6',
        })
        expect(result.object).toEqual({ score: 1, excerpt: 'ok' })
        expect(mockedGenerateObject).toHaveBeenCalledTimes(1)
    })

    it('unwraps a junk-key wrapper without a second call (#191)', async () => {
        const inner = { score: 88, excerpt: 'fine' }
        mockedGenerateObject.mockRejectedValueOnce(
            schemaMiss({ 'parameter name': inner })
        )
        const result = await coreGenerateObject({ schema, prompt: 'p' })
        expect(result.object).toEqual(inner)
        expect(result.providerMetadata).toBeUndefined()
        expect(mockedGenerateObject).toHaveBeenCalledTimes(1)
    })

    it('retries once with the validation issues appended to the prompt', async () => {
        mockedGenerateObject
            .mockRejectedValueOnce(
                schemaMiss({ score: 1, excerpt: 'this is far too long' })
            )
            .mockResolvedValueOnce(
                okResult({ score: 1, excerpt: 'short' }) as never
            )

        const result = await coreGenerateObject({
            schema,
            system: 's',
            prompt: 'Extract the thing.',
        })

        expect(result.object).toEqual({ score: 1, excerpt: 'short' })
        expect(mockedGenerateObject).toHaveBeenCalledTimes(2)
        const repairCall = mockedGenerateObject.mock.calls[1]![0] as {
            prompt: string
        }
        expect(repairCall.prompt.startsWith('Extract the thing.')).toBe(true)
        expect(repairCall.prompt).toContain(
            'excerpt: Too big: expected string to have <=10 characters'
        )
        expect(repairCall.prompt).toContain('this is far too long')
    })

    it('appends the repair as a user message in the messages format', async () => {
        mockedGenerateObject
            .mockRejectedValueOnce(schemaMiss({ score: 'x', excerpt: 'ok' }))
            .mockResolvedValueOnce(
                okResult({ score: 2, excerpt: 'ok' }) as never
            )

        await coreGenerateObject({
            schema,
            messages: [{ role: 'user', content: 'hello' }],
        })

        const repairCall = mockedGenerateObject.mock.calls[1]![0] as {
            messages: Array<{ role: string; content: string }>
        }
        expect(repairCall.messages).toHaveLength(2)
        expect(repairCall.messages[0]).toEqual({
            role: 'user',
            content: 'hello',
        })
        expect(repairCall.messages[1]!.role).toBe('user')
        expect(repairCall.messages[1]!.content).toContain('score:')
    })

    it('hands a second miss to the salvage hook instead of failing', async () => {
        const longAnswer = { score: 3, excerpt: 'still much too long' }
        mockedGenerateObject
            .mockRejectedValueOnce(schemaMiss(longAnswer))
            .mockRejectedValueOnce(schemaMiss(longAnswer))

        const salvage = vi.fn((text: string) => {
            const raw = JSON.parse(text) as typeof longAnswer
            return { ...raw, excerpt: raw.excerpt.slice(0, 10) }
        })

        const result = await coreGenerateObject({
            schema,
            prompt: 'p',
            salvage,
        })
        expect(result.object).toEqual({ score: 3, excerpt: 'still much' })
        expect(mockedGenerateObject).toHaveBeenCalledTimes(2)
        expect(salvage).toHaveBeenCalledTimes(1)
    })

    it('throws the second miss when there is nothing to salvage', async () => {
        mockedGenerateObject
            .mockRejectedValueOnce(schemaMiss({ score: 'x', excerpt: 'ok' }))
            .mockRejectedValueOnce(schemaMiss({ score: 'y', excerpt: 'ok' }))

        await expect(
            coreGenerateObject({ schema, prompt: 'p', salvage: () => null })
        ).rejects.toBeInstanceOf(NoObjectGeneratedError)
        expect(mockedGenerateObject).toHaveBeenCalledTimes(2)
    })

    it('backs off and retries transient errors, then succeeds', async () => {
        vi.useFakeTimers()
        mockedGenerateObject
            .mockRejectedValueOnce(transient(429))
            .mockRejectedValueOnce(transient(503))
            .mockResolvedValueOnce(
                okResult({ score: 1, excerpt: 'ok' }) as never
            )

        const pending = coreGenerateObject({ schema, prompt: 'p' })
        await vi.advanceTimersByTimeAsync(totalBackoffMs + 10)

        const result = await pending
        expect(result.object).toEqual({ score: 1, excerpt: 'ok' })
        expect(mockedGenerateObject).toHaveBeenCalledTimes(3)
    })

    it('gives up on transient errors after the configured retries', async () => {
        vi.useFakeTimers()
        mockedGenerateObject.mockRejectedValue(transient(429))

        const pending = coreGenerateObject({ schema, prompt: 'p' })
        const expectation = expect(pending).rejects.toBeInstanceOf(APICallError)
        await vi.advanceTimersByTimeAsync(totalBackoffMs + 10)
        await expectation
        expect(mockedGenerateObject).toHaveBeenCalledTimes(
            TRANSIENT_RETRY_DELAYS_MS.length + 1
        )
    })

    it('fails fast on a fatal error', async () => {
        mockedGenerateObject.mockRejectedValueOnce(
            new APICallError({
                message: 'HTTP 401',
                url: 'u',
                requestBodyValues: {},
                statusCode: 401,
                isRetryable: false,
            })
        )
        await expect(
            coreGenerateObject({ schema, prompt: 'p' })
        ).rejects.toBeInstanceOf(APICallError)
        expect(mockedGenerateObject).toHaveBeenCalledTimes(1)
    })
})
