// @vitest-environment node
/**
 * OpenRouter legacy id map (issue #195).
 *
 * Every model call now goes through OpenRouter, and the bare ids still stored
 * in `blog_ai_config` / `chat_config` are translated by `toOpenRouterId`. The
 * mapping is a lookup table rather than a prefix rule because Anthropic's point
 * releases are dashed here and dotted on OpenRouter — `claude-haiku-4-5` →
 * `anthropic/claude-haiku-4.5`. A naive `` `anthropic/${id}` `` 404s on exactly
 * the legacy ids we have in production.
 *
 * Two layers:
 *  - offline, always runs — assert against a checked-in catalog snapshot
 *  - live, opt-in via OPENROUTER_LIVE=1 — assert against the real catalog
 *
 * The live layer is opt-in on purpose: a network assertion in CI is a flake
 * generator, and a model OpenRouter retires should fail a deliberate check,
 * not a routine PR.
 */
import { describe, expect, it } from 'vitest'

import {
    LEGACY_MODEL_IDS,
    LEGACY_OPENROUTER_IDS,
    toOpenRouterId,
} from '@workspace/ai/models'
import { AVAILABLE_MODELS } from '@workspace/ai/models'
import { CHAT_MODELS } from '@workspace/chat/types'

import catalogSnapshot from '../../fixtures/openrouter-catalog-ids.json'

const snapshotIds = new Set<string>(catalogSnapshot.ids)

describe('LEGACY_ID_MAP against the catalog snapshot', () => {
    it('resolves every mapped id to a model that exists on OpenRouter', () => {
        const missing = LEGACY_OPENROUTER_IDS.filter(
            (id) => !snapshotIds.has(id)
        )
        expect(missing).toEqual([])
    })

    it('maps Anthropic point releases from dashes to dots', () => {
        expect(toOpenRouterId('claude-haiku-4-5')).toBe(
            'anthropic/claude-haiku-4.5'
        )
        expect(toOpenRouterId('claude-opus-4-5')).toBe(
            'anthropic/claude-opus-4.5'
        )
        expect(toOpenRouterId('claude-sonnet-4-5')).toBe(
            'anthropic/claude-sonnet-4.5'
        )
    })

    it('passes OpenRouter-style ids through untouched', () => {
        expect(toOpenRouterId('google/gemini-3.6-flash')).toBe(
            'google/gemini-3.6-flash'
        )
        expect(toOpenRouterId('anthropic/claude-opus-5')).toBe(
            'anthropic/claude-opus-5'
        )
    })

    it('never emits a bare id for a mapped model', () => {
        for (const bareId of LEGACY_MODEL_IDS) {
            expect(toOpenRouterId(bareId)).toContain('/')
        }
    })
})

describe('every bare id in flight has a mapping', () => {
    it('covers the curated AVAILABLE_MODELS list', () => {
        const unmapped = AVAILABLE_MODELS.map((model) => model.id)
            .filter((id) => !id.includes('/'))
            .filter((id) => !LEGACY_MODEL_IDS.includes(id))
        expect(unmapped).toEqual([])
    })

    it('covers the chat_config model enum', () => {
        const unmapped = CHAT_MODELS.filter(
            (id) => !id.includes('/') && !LEGACY_MODEL_IDS.includes(id)
        )
        expect(unmapped).toEqual([])
    })
})

// eslint-disable-next-line no-restricted-properties -- test-only opt-in flag; the env modules are app runtime config
const isLiveRun = Boolean(process.env.OPENROUTER_LIVE)

describe.skipIf(!isLiveRun)(
    'LEGACY_ID_MAP against the live OpenRouter catalog',
    () => {
        it('resolves every mapped id to a model OpenRouter still serves', async () => {
            const response = await fetch(
                'https://openrouter.ai/api/v1/models',
                { signal: AbortSignal.timeout(30_000) }
            )
            expect(response.ok).toBe(true)

            const body = (await response.json()) as {
                data: Array<{ id: string }>
            }
            const liveIds = new Set(body.data.map((model) => model.id))

            const missing = LEGACY_OPENROUTER_IDS.filter(
                (id) => !liveIds.has(id)
            )
            expect(missing).toEqual([])
        }, 40_000)

        // Guards the deletion of `supportsTemperature` / NO_SAMPLING_PARAMS_PREFIXES.
        // Those existed because the direct Anthropic API 400s on `temperature` for the
        // Claude 5 family. OpenRouter drops params a model does not support instead of
        // forwarding them, which is what makes the deletion safe — but it is a provider
        // behaviour we do not control, so assert it rather than assume it.
        it.each([
            'anthropic/claude-opus-5',
            'anthropic/claude-sonnet-5',
            'openai/gpt-5.2',
        ])(
            'accepts temperature on %s without erroring',
            async (model) => {
                const response = await fetch(
                    'https://openrouter.ai/api/v1/chat/completions',
                    {
                        method: 'POST',
                        headers: {
                            // eslint-disable-next-line no-restricted-properties -- test-only opt-in flag; the env modules are app runtime config
                            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY ?? ''}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            model,
                            temperature: 0.7,
                            max_tokens: 16,
                            messages: [{ role: 'user', content: 'Say OK' }],
                        }),
                        signal: AbortSignal.timeout(60_000),
                    }
                )
                const body = (await response.json()) as {
                    error?: { message?: string }
                }
                expect(body.error?.message).toBeUndefined()
                expect(response.status).toBe(200)
            },
            70_000
        )
    }
)
