/**
 * The prices the web app's code depends on (issue #354), for the admin
 * Pricing page's guard.
 *
 * A save that deactivates a line, or leaves a procedure without a starting
 * line, makes every token naming it print nothing. The admin refuses such a
 * save when a live post or the chat config uses the token; this module
 * adds the code side, which the admin cannot read at runtime:
 *
 * - {@link CODE_DATA_TOKENS} (generated, `code-tokens.generated.ts`): every
 *   price token written in `apps/web` (procedure data, FAQ lists, landing
 *   pages), with its files. `pnpm --filter web claims:code-tokens`
 *   regenerates it, and `code-tokens.test.ts` in the web app fails while it
 *   is stale.
 * - {@link CODE_PRICE_LOOKUPS} (by hand): prices a component prints inside a
 *   sentence by a fixed key, with no token in sight:
 *   `<PriceTag price={findLinePrice(prices, 'mini')} />` in "a mini tummy
 *   tuck is …", or `prices.starting` under the module hero's "Starting
 *   at". A missing price leaves a hole there. The web test checks every
 *   fixed-key lookup in the code is covered by one of the two lists.
 *
 * @module @workspace/shared/claims/code-tokens
 */
import { CODE_DATA_TOKENS } from './code-tokens.generated'

export { CODE_DATA_TOKENS }

/** A claim token the code depends on, and the files that depend on it. */
export interface CodeClaimToken {
    readonly token: string
    readonly files: readonly string[]
}

const PAGES = 'apps/web/components/procedures/pages'

/**
 * Prices components print in a sentence or a labelled slot by a fixed key,
 * written as the token that names the same price: a line
 * (`[[price:tummy-tuck:mini]]`) or a starting price (`[[price:bbl]]`).
 * Lookups that drop their sentence when the price is missing (the home
 * hero, the at-a-glance rails, the price tables) are not listed.
 */
export const CODE_PRICE_LOOKUPS: readonly CodeClaimToken[] = [
    {
        // The module hero's "Starting at", and "A BBL at Alluring starts at".
        token: '[[price:bbl]]',
        files: [
            `${PAGES}/bbl/bbl-page.component.tsx`,
            `${PAGES}/bbl/bbl-cost.component.tsx`,
        ],
    },
    {
        // The module hero's "Starting at", and "Lipo 360 starts at".
        token: '[[price:lipo]]',
        files: [
            `${PAGES}/lipo/lipo-page.component.tsx`,
            `${PAGES}/lipo/lipo-cost.component.tsx`,
        ],
    },
    {
        // The module hero's "Starting at".
        token: '[[price:tummy-tuck]]',
        files: [`${PAGES}/tummy-tuck/tummy-tuck-page.component.tsx`],
    },
    // "A mini tummy tuck is …, a full tummy tuck … and an extended tummy
    // tuck …".
    {
        token: '[[price:tummy-tuck:mini]]',
        files: [`${PAGES}/tummy-tuck/tummy-tuck-cost.component.tsx`],
    },
    {
        token: '[[price:tummy-tuck:full]]',
        files: [`${PAGES}/tummy-tuck/tummy-tuck-cost.component.tsx`],
    },
    {
        token: '[[price:tummy-tuck:extended]]',
        files: [`${PAGES}/tummy-tuck/tummy-tuck-cost.component.tsx`],
    },
]

/**
 * Every code-side token as a guard source, "web code <file>", one per file
 * that depends on it.
 */
export function codeClaimTokenSources(): { source: string; text: string }[] {
    return [...CODE_DATA_TOKENS, ...CODE_PRICE_LOOKUPS].flatMap(
        ({ token, files }) =>
            files.map((file) => ({ source: `web code ${file}`, text: token }))
    )
}
