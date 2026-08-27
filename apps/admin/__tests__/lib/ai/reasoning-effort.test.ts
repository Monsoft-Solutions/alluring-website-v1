// @vitest-environment node
/**
 * Reasoning effort provider options (epic #194).
 *
 * The whole epic ships inert on one promise: with every phase at `none`, no
 * model's thinking behaviour changes. That only holds if
 * `reasoningProviderOptions` emits **no `providerOptions` key at all** rather
 * than an explicit `none` — OpenRouter accepts `none`, but sending it
 * *disables* reasoning on models that think by default.
 *
 * The promise is about the reasoning option, not the whole request body:
 * `getModel` separately enables usage accounting, which adds a `usage` key.
 *
 * Acceptance criteria 6 and 7 of #194 are the two `describe` blocks below.
 */
import { describe, expect, it } from 'vitest'

import {
    REASONING_EFFORTS,
    DEFAULT_REASONING_EFFORT,
    isReasoningEffort,
    reasoningProviderOptions,
    type ReasoningEffort,
} from '@workspace/ai/models'

describe('the effort vocabulary', () => {
    it('is OpenRouter’s own scale, ordered least to most', () => {
        expect(REASONING_EFFORTS).toEqual([
            'none',
            'minimal',
            'low',
            'medium',
            'high',
            'xhigh',
        ])
    })

    it('defaults to none, so a fresh config changes nothing', () => {
        expect(DEFAULT_REASONING_EFFORT).toBe('none')
    })

    it('narrows database and form values', () => {
        for (const effort of REASONING_EFFORTS) {
            expect(isReasoningEffort(effort)).toBe(true)
        }
        for (const notAnEffort of ['NONE', 'max', '', null, undefined, 3, {}]) {
            expect(isReasoningEffort(notAnEffort)).toBe(false)
        }
    })
})

describe('none emits no reasoning option (acceptance criterion 7)', () => {
    it('returns a bare object for none', () => {
        expect(reasoningProviderOptions('none')).toEqual({})
    })

    it('returns a bare object for undefined', () => {
        expect(reasoningProviderOptions(undefined)).toEqual({})
    })

    it('carries no providerOptions key at all, not even undefined', () => {
        // `{ providerOptions: undefined }` would still serialize the key into
        // the AI SDK call, which is exactly what this must not do.
        expect(Object.keys(reasoningProviderOptions('none'))).toEqual([])
        expect('providerOptions' in reasoningProviderOptions(undefined)).toBe(
            false
        )
    })

    it('survives being spread into a request without leaving a trace', () => {
        const request = { model: 'anthropic/claude-opus-5', prompt: 'hi' }
        expect({ ...request, ...reasoningProviderOptions('none') }).toEqual(
            request
        )
    })
})

describe('effort >= minimal emits reasoning.effort (acceptance criterion 8)', () => {
    const raised = REASONING_EFFORTS.filter(
        (effort): effort is Exclude<ReasoningEffort, 'none'> =>
            effort !== 'none'
    )

    it.each(raised)('emits the OpenRouter shape for %s', (effort) => {
        expect(reasoningProviderOptions(effort)).toEqual({
            providerOptions: { openrouter: { reasoning: { effort } } },
        })
    })

    it('nests under the openrouter namespace the provider reads', () => {
        const options = reasoningProviderOptions('high')
        expect(options.providerOptions?.openrouter.reasoning.effort).toBe(
            'high'
        )
    })
})
