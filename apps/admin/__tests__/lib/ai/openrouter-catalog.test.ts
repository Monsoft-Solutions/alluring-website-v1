// @vitest-environment node
/**
 * OpenRouter catalog normalization (epic #194).
 *
 * The settings picker is driven by whatever OpenRouter currently serves, so
 * the normalizer is the one place a change upstream can quietly break the UI:
 * a renamed pricing field turns every badge into `$NaN`, a missing
 * `supported_parameters` silently disables every effort select.
 *
 * Driven off hand-built payloads rather than a live pull — the live catalog is
 * asserted separately (and opt-in) by `openrouter-id-map.test.ts`.
 */
import { describe, expect, it } from 'vitest'

import { normalizeOpenRouterCatalog } from '@workspace/ai/models/openrouter-catalog'

/** A realistic record, shaped exactly as the live endpoint returns one. */
function rawModel(overrides: Record<string, unknown> = {}) {
    return {
        id: 'anthropic/claude-opus-5',
        name: 'Claude Opus 5',
        context_length: 1_000_000,
        pricing: { prompt: '0.000005', completion: '0.000025' },
        supported_parameters: [
            'reasoning',
            'response_format',
            'structured_outputs',
            'tools',
            'temperature',
        ],
        ...overrides,
    }
}

const wrap = (models: unknown[]) => ({ data: models })

describe('normalizeOpenRouterCatalog', () => {
    it('maps a live record onto the picker’s shape', () => {
        const [model] = normalizeOpenRouterCatalog(wrap([rawModel()]))

        expect(model).toEqual({
            id: 'anthropic/claude-opus-5',
            vendor: 'anthropic',
            name: 'Claude Opus 5',
            contextLength: 1_000_000,
            promptPricePerM: 5,
            completionPricePerM: 25,
            supportsReasoning: true,
            supportsTools: true,
            supportsStructuredOutputs: true,
            isFreeVariant: false,
        })
    })

    it('converts per-token decimal strings to dollars per 1M tokens', () => {
        const [model] = normalizeOpenRouterCatalog(
            wrap([
                rawModel({
                    pricing: { prompt: '0.0000001', completion: '0.0000004' },
                }),
            ])
        )

        expect(model?.promptPricePerM).toBeCloseTo(0.1, 10)
        expect(model?.completionPricePerM).toBeCloseTo(0.4, 10)
    })

    it('reports a missing or sentinel price as null rather than $0.00', () => {
        // OpenRouter uses '0' for free endpoints and '-1' for "not applicable".
        // Both must read as "no price to show", never as a genuine zero.
        const [zero, sentinel, absent] = normalizeOpenRouterCatalog(
            wrap([
                rawModel({ id: 'a/zero', pricing: { prompt: '0' } }),
                rawModel({ id: 'b/sentinel', pricing: { prompt: '-1' } }),
                rawModel({ id: 'c/absent', pricing: undefined }),
            ])
        )

        expect(zero?.promptPricePerM).toBeNull()
        expect(sentinel?.promptPricePerM).toBeNull()
        expect(absent?.promptPricePerM).toBeNull()
    })

    it('drops :batch variants — their async semantics do not fit the pipeline', () => {
        const models = normalizeOpenRouterCatalog(
            wrap([
                rawModel({ id: 'openai/gpt-5.2' }),
                rawModel({ id: 'openai/gpt-5.2:batch' }),
            ])
        )

        expect(models.map((model) => model.id)).toEqual(['openai/gpt-5.2'])
    })

    it('keeps :free variants but flags them', () => {
        const [model] = normalizeOpenRouterCatalog(
            wrap([rawModel({ id: 'google/gemini-2.0-flash-001:free' })])
        )

        expect(model?.id).toBe('google/gemini-2.0-flash-001:free')
        expect(model?.isFreeVariant).toBe(true)
    })

    it('reads capabilities off supported_parameters', () => {
        const [none] = normalizeOpenRouterCatalog(
            wrap([rawModel({ supported_parameters: ['temperature'] })])
        )

        expect(none?.supportsReasoning).toBe(false)
        expect(none?.supportsTools).toBe(false)
        expect(none?.supportsStructuredOutputs).toBe(false)
    })

    it('strips OpenRouter’s floating-alias prefix when deriving the vendor', () => {
        // `~anthropic/claude-opus-latest` is an Anthropic model. Left as-is the
        // vendor reads `~anthropic`, which sorts every alias into a group of
        // its own at the end of the picker, away from the pinned releases.
        const [model] = normalizeOpenRouterCatalog(
            wrap([rawModel({ id: '~anthropic/claude-opus-latest' })])
        )

        expect(model?.vendor).toBe('anthropic')
        // The id itself is untouched — it is what gets sent to OpenRouter.
        expect(model?.id).toBe('~anthropic/claude-opus-latest')
    })

    it('sorts by vendor, then name', () => {
        const models = normalizeOpenRouterCatalog(
            wrap([
                rawModel({ id: 'openai/gpt-5.2', name: 'GPT-5.2' }),
                rawModel({ id: 'anthropic/b', name: 'Bravo' }),
                rawModel({ id: 'anthropic/a', name: 'Alpha' }),
            ])
        )

        expect(models.map((model) => model.id)).toEqual([
            'anthropic/a',
            'anthropic/b',
            'openai/gpt-5.2',
        ])
    })

    it('sorts an alias beside its vendor’s pinned releases', () => {
        const models = normalizeOpenRouterCatalog(
            wrap([
                rawModel({ id: 'openai/gpt-5.2', name: 'GPT-5.2' }),
                rawModel({
                    id: '~anthropic/claude-opus-latest',
                    name: 'Opus latest',
                }),
                rawModel({
                    id: 'anthropic/claude-opus-5',
                    name: 'Claude Opus 5',
                }),
            ])
        )

        expect(models.map((model) => model.vendor)).toEqual([
            'anthropic',
            'anthropic',
            'openai',
        ])
    })

    it('survives a malformed payload instead of throwing into the picker', () => {
        expect(normalizeOpenRouterCatalog(null)).toEqual([])
        expect(normalizeOpenRouterCatalog({})).toEqual([])
        expect(normalizeOpenRouterCatalog({ data: 'nope' })).toEqual([])
        expect(
            normalizeOpenRouterCatalog(wrap([null, 42, {}, { id: 'bare-id' }]))
        ).toEqual([])
    })

    it('falls back to the id when a record has no name', () => {
        const [model] = normalizeOpenRouterCatalog(
            wrap([rawModel({ name: undefined })])
        )

        expect(model?.name).toBe('anthropic/claude-opus-5')
    })
})
