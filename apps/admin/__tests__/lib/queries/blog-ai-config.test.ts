// @vitest-environment node
/**
 * Blog AI config defaults and narrowing (epic #194).
 *
 * The query layer is the last line between a stored value and a model call.
 * Two behaviours matter enough to pin: a garbage effort must read as `none`
 * (never crash a run, never silently raise cost), and the orchestrator must
 * inherit the review model when its column is null — the behaviour the
 * pipeline had before the column existed.
 */
import { describe, expect, it } from 'vitest'

import {
    REASONING_EFFORTS,
    isReasoningEffort,
    DEFAULT_REASONING_EFFORT,
} from '@workspace/ai/models'

import { DEFAULT_BLOG_AI_CONFIG } from '@/lib/queries/blog-ai-config.query'

/**
 * The narrowing the query applies to every effort column. Mirrors
 * `resolveEffort`, which is module-private.
 */
const resolveEffort = (value: string) =>
    isReasoningEffort(value) ? value : DEFAULT_REASONING_EFFORT

describe('DEFAULT_BLOG_AI_CONFIG', () => {
    it('ships every phase at none, so a fresh install behaves as before', () => {
        expect(DEFAULT_BLOG_AI_CONFIG.ideationEffort).toBe('none')
        expect(DEFAULT_BLOG_AI_CONFIG.contentEffort).toBe('none')
        expect(DEFAULT_BLOG_AI_CONFIG.reviewEffort).toBe('none')
        expect(DEFAULT_BLOG_AI_CONFIG.orchestratorEffort).toBe('none')
        expect(DEFAULT_BLOG_AI_CONFIG.extractionEffort).toBe('none')
        expect(DEFAULT_BLOG_AI_CONFIG.imagePromptEffort).toBe('none')
    })

    it('leaves the optional model slots unset', () => {
        // null means "inherit" for the orchestrator and "use the function's
        // own default" for the image helpers.
        expect(DEFAULT_BLOG_AI_CONFIG.orchestratorModelIdOverride).toBeNull()
        expect(DEFAULT_BLOG_AI_CONFIG.imagePromptModelId).toBeNull()
        expect(DEFAULT_BLOG_AI_CONFIG.imageAltModelId).toBeNull()
    })

    it('resolves the orchestrator to the review model by default', () => {
        expect(DEFAULT_BLOG_AI_CONFIG.orchestratorModelId).toBe(
            DEFAULT_BLOG_AI_CONFIG.reviewModelId
        )
    })

    it('defaults every model to an OpenRouter-shaped id', () => {
        // A bare id here would route through LEGACY_ID_MAP at call time but
        // read as "not in the catalog" in the settings picker.
        for (const id of [
            DEFAULT_BLOG_AI_CONFIG.ideationModelId,
            DEFAULT_BLOG_AI_CONFIG.contentModelId,
            DEFAULT_BLOG_AI_CONFIG.reviewModelId,
            DEFAULT_BLOG_AI_CONFIG.extractionModelId,
        ]) {
            expect(id).toContain('/')
        }
    })
})

describe('effort narrowing', () => {
    it('passes every valid effort through unchanged', () => {
        for (const effort of REASONING_EFFORTS) {
            expect(resolveEffort(effort)).toBe(effort)
        }
    })

    it('falls back to none on a value the deployed code does not know', () => {
        // The column is a pg enum, so this only fires if the enum gains a
        // value ahead of a deploy — `none` is the safe read either way.
        expect(resolveEffort('ultra')).toBe('none')
        expect(resolveEffort('')).toBe('none')
        expect(resolveEffort('HIGH')).toBe('none')
    })
})
