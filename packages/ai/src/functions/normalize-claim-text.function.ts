/**
 * Claim tokens and typed prices in the short fields an extraction step
 * writes (issue #354): the meta title and description, the excerpt, the
 * quick answer and the FAQs.
 *
 * The extraction prompts copy tokens verbatim (`CLAIM_TOKEN_RULE`), but a
 * model can still type a price or invent a token, and nothing else checks
 * these fields before they are saved. This does what `validateGeneratedMdx`
 * does for the body:
 *
 * - a token with only case or spacing wrong is rewritten to its canonical
 *   form;
 * - a typed Alluring price that fits one price line becomes its token;
 * - a sentence-length token in a title or meta description (the caveat, the
 *   credentials, the 456.062 statement, the BBL range, the combination
 *   discount) is dropped, because it can never fit there;
 * - anything else that cannot be resolved is reported, never deleted.
 *
 * It also measures the field resolved against a worst-case discount, so a
 * meta description that only fits while no discount is on is reported.
 *
 * @module @workspace/ai/functions/normalize-claim-text
 */
import { FALLBACK_PRICING } from '@workspace/shared/claims/prices'
import type { PricingSnapshot } from '@workspace/shared/claims/pricing'
import {
    parseClaimTokens,
    resolveClaimTokensDetailed,
    validateClaimTokens,
} from '@workspace/shared/claims/tokens'
import { convertTypedPrices } from '@workspace/shared/claims/typed-prices'

/** Which short field a text is, for its length limit and token rules. */
export type ClaimTextField =
    | 'metaTitle'
    | 'metaDescription'
    | 'excerpt'
    | 'quickAnswer'
    | 'faq'

/** The longest each field may be once its tokens are resolved. */
const RESOLVED_MAX: Partial<Record<ClaimTextField, number>> = {
    metaTitle: 70,
    metaDescription: 170,
    excerpt: 300,
}

/** Tokens that render a whole sentence or more: never in a title or meta. */
const SENTENCE_TOKENS = new Set([
    'price-caveat',
    'price-range',
    'combo-discount',
    'discount-statement',
    'financing',
    'surgeon',
])

/** The `surgeon` forms that are a name, which a meta description may use. */
const SURGEON_NAMES = new Set(['name', 'short'])

export interface NormalizedClaimText {
    text: string
    /** What was changed or is still wrong, one line each. */
    notes: string[]
}

/** The pricing with every procedure at a 20% discount, for length checks. */
function worstCaseDiscount(pricing: PricingSnapshot): PricingSnapshot {
    return {
        ...pricing,
        defaultDiscountPercent: 20,
        procedures: Object.fromEntries(
            Object.entries(pricing.procedures).map(([key, settings]) => [
                key,
                { ...settings, discountPercent: 20 },
            ])
        ),
    }
}

/**
 * Normalizes one extracted field. Pass the live pricing where the caller
 * has it; the 2026-09-15 sheet is the fallback.
 */
export function normalizeClaimText(
    raw: string,
    field: ClaimTextField,
    pricing: PricingSnapshot = FALLBACK_PRICING
): NormalizedClaimText {
    const notes: string[] = []
    let text = raw

    // 1. Canonical forms of sloppy tokens.
    for (const error of [
        ...validateClaimTokens(text, { pricing }).errors,
    ].reverse()) {
        if (
            error.suggestion &&
            validateClaimTokens(error.suggestion, { pricing }).valid
        ) {
            text =
                text.slice(0, error.index) +
                error.suggestion +
                text.slice(error.index + error.raw.length)
            notes.push(`${field}: rewrote ${error.raw} as ${error.suggestion}`)
        }
    }

    // 2. Typed prices become tokens.
    const typed = convertTypedPrices(text, { pricing })
    text = typed.text
    for (const c of typed.converted) {
        notes.push(`${field}: typed price ${c.raw} written as ${c.token}`)
    }
    for (const r of typed.remaining) notes.push(`${field}: ${r.reason}`)

    // 3. Sentence-length tokens can't fit a title or meta description.
    //    Every span is cut against the offsets of the one parse, from the
    //    end, before any whitespace is touched: collapsing spaces between
    //    cuts would shift the offsets of the tokens still to go.
    if (field === 'metaTitle' || field === 'metaDescription') {
        const dropped = parseClaimTokens(text).tokens.filter(
            (token) =>
                SENTENCE_TOKENS.has(token.name) &&
                !(
                    token.name === 'surgeon' &&
                    SURGEON_NAMES.has(token.args[0] ?? '')
                )
        )
        for (const token of [...dropped].reverse()) {
            text =
                text.slice(0, token.index) +
                text.slice(token.index + token.raw.length)
        }
        if (dropped.length > 0) {
            text = text.replace(/\s{2,}/g, ' ').trim()
        }
        for (const token of dropped) {
            notes.push(
                `${field}: dropped ${token.raw}, too long for this field`
            )
        }
    }

    // 4. Anything still unresolvable is reported, not deleted.
    for (const error of validateClaimTokens(text, { pricing }).errors) {
        notes.push(
            `${field}: claim token ${error.raw} renders as nothing: ${error.reason}`
        )
    }

    // 5. The length a reader sees, with every price discounted.
    const max = RESOLVED_MAX[field]
    if (max) {
        const resolved = resolveClaimTokensDetailed(text, {
            mode: 'text',
            pricing: worstCaseDiscount(pricing),
        }).text
        if (resolved.length > max) {
            notes.push(
                `${field}: ${resolved.length} characters once a discount shows (limit ${max}); the page clamps it`
            )
        }
    }

    return { text, notes }
}
