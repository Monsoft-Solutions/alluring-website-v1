// @vitest-environment node
/**
 * The checked-in catalog fallback (epic #194).
 *
 * This snapshot is what the settings picker renders when the live OpenRouter
 * fetch fails. Its job is narrow but real: never leave the picker empty, and
 * always contain the ids the pipeline is actually configured with — otherwise
 * a fetch failure makes every phase look mis-configured.
 */
import { describe, expect, it } from 'vitest'

import { OPENROUTER_CATALOG_FALLBACK } from '@workspace/ai/data/openrouter-catalog-fallback.data'
import { LEGACY_OPENROUTER_IDS } from '@workspace/ai/models'

import { DEFAULT_BLOG_AI_CONFIG } from '@/lib/queries/blog-ai-config.query'

const fallbackIds = new Set(
    OPENROUTER_CATALOG_FALLBACK.map((model) => model.id)
)

describe('the fallback catalog', () => {
    it('is not empty', () => {
        expect(OPENROUTER_CATALOG_FALLBACK.length).toBeGreaterThan(0)
    })

    it('covers every id the legacy map resolves to', () => {
        // A bare id stored before #195 resolves through LEGACY_ID_MAP. If the
        // fallback omits the target, an offline settings page flags a
        // perfectly valid configuration as "not in the catalog".
        const missing = LEGACY_OPENROUTER_IDS.filter(
            (id) => !fallbackIds.has(id)
        )
        expect(missing).toEqual([])
    })

    it('covers the models a fresh install defaults to', () => {
        const defaults = [
            DEFAULT_BLOG_AI_CONFIG.ideationModelId,
            DEFAULT_BLOG_AI_CONFIG.contentModelId,
            DEFAULT_BLOG_AI_CONFIG.reviewModelId,
            DEFAULT_BLOG_AI_CONFIG.extractionModelId,
        ]

        expect(defaults.filter((id) => !fallbackIds.has(id))).toEqual([])
    })

    it('is small enough that judging a configured id against it is wrong', () => {
        // The off-catalog warning in `model-combobox` is suppressed while the
        // catalog is stale precisely because this is a slice, not the catalog:
        // OpenRouter serves 350+ models, so most valid configured ids are
        // legitimately absent here and flagging them would be a false alarm.
        expect(OPENROUTER_CATALOG_FALLBACK.length).toBeLessThan(60)
    })

    it('holds only OpenRouter-shaped ids, and no :batch variants', () => {
        for (const model of OPENROUTER_CATALOG_FALLBACK) {
            expect(model.id).toContain('/')
            expect(model.id.endsWith(':batch')).toBe(false)
            expect(model.vendor).toBe(model.id.slice(0, model.id.indexOf('/')))
        }
    })
})
