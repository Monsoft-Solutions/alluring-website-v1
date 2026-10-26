/**
 * The admin Pricing page's guard knows every price the web code depends on
 * (#354). The admin can't read these sources at runtime, so the tokens are
 * generated into `@workspace/shared/claims/code-tokens.generated`; this
 * fails while that file and the sources disagree.
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import {
    CODE_DATA_TOKENS,
    CODE_PRICE_LOOKUPS,
} from '@workspace/shared/claims/code-tokens'
import { FALLBACK_PRICING } from '@workspace/shared/claims/prices'
import { validateClaimTokens } from '@workspace/shared/claims/tokens'

import {
    REPO_ROOT,
    scanCodeClaimTokens,
    scanFixedLineLookups,
    stripComments,
} from '@/scripts/code-claim-tokens.lib'

describe('CODE_DATA_TOKENS', () => {
    it('lists every price token the web code writes (run `pnpm --filter web claims:code-tokens`)', () => {
        expect(CODE_DATA_TOKENS).toEqual(scanCodeClaimTokens())
    })

    it('lists only tokens the 2026-09-15 sheet resolves', () => {
        const invalid = CODE_DATA_TOKENS.filter(
            ({ token }) =>
                !validateClaimTokens(token, { pricing: FALLBACK_PRICING }).valid
        )
        expect(invalid).toEqual([])
    })
})

describe('CODE_PRICE_LOOKUPS', () => {
    it('names files that still make the lookup', () => {
        const stale = CODE_PRICE_LOOKUPS.flatMap(({ token, files }) => {
            const [, , line] = token.slice(2, -2).split(':')
            const lookup = line
                ? new RegExp(`findLinePrice\\(\\s*prices,\\s*'${line}'\\s*\\)`)
                : /\bprices\.starting\b/
            return files.filter((file) => {
                const full = path.join(REPO_ROOT, file)
                return (
                    !existsSync(full) ||
                    !lookup.test(stripComments(readFileSync(full, 'utf8')))
                )
            })
        })
        expect(stale).toEqual([])
    })

    it('covers every line the code looks up by a fixed key', () => {
        const covered = new Set(
            [...CODE_DATA_TOKENS, ...CODE_PRICE_LOOKUPS].flatMap(({ token }) =>
                token.slice(2, -2).split(':').slice(2)
            )
        )
        const uncovered = scanFixedLineLookups().filter(
            ({ key }) => !covered.has(key)
        )
        // A new fixed-key lookup prints a price the admin could deactivate:
        // add it to CODE_PRICE_LOOKUPS, or drop its sentence when the price
        // is missing.
        expect(uncovered).toEqual([])
    })
})
