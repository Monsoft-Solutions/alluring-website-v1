/**
 * Tests for rewriting OpenRouter's reported cost (issue #223).
 *
 * A structured call that needed a repair retry spent two requests; its
 * result must report both, or the per-phase costs from epic #194 quietly
 * under-count exactly the runs that went wrong.
 */
import { describe, expect, it } from 'vitest'

import { readOpenRouterCost, withOpenRouterCost } from '@workspace/ai/models'

describe('withOpenRouterCost', () => {
    it('overwrites the cost and keeps every other key', () => {
        const metadata = {
            openrouter: {
                provider: 'xAI',
                usage: {
                    cost: 0.01,
                    promptTokens: 1200,
                    completionTokensDetails: { reasoningTokens: 40 },
                },
            },
            other: { flag: true },
        }

        const result = withOpenRouterCost(metadata, 0.03)

        expect(result).toEqual({
            openrouter: {
                provider: 'xAI',
                usage: {
                    cost: 0.03,
                    promptTokens: 1200,
                    completionTokensDetails: { reasoningTokens: 40 },
                },
            },
            other: { flag: true },
        })
        expect(readOpenRouterCost(result)).toEqual({ costUsd: 0.03 })
    })

    it('does not mutate its input', () => {
        const metadata = { openrouter: { usage: { cost: 0.01 } } }
        withOpenRouterCost(metadata, 0.05)
        expect(metadata.openrouter.usage.cost).toBe(0.01)
    })

    it('builds the path when there is no metadata', () => {
        expect(readOpenRouterCost(withOpenRouterCost(undefined, 0.02))).toEqual(
            { costUsd: 0.02 }
        )
    })

    it('replaces a usage value that is not an object', () => {
        expect(
            withOpenRouterCost({ openrouter: { usage: 'n/a' } }, 0.01)
        ).toEqual({ openrouter: { usage: { cost: 0.01 } } })
    })
})
