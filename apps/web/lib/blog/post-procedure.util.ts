/**
 * The procedure behind a blog post (epic #293, S3).
 *
 * Read from the post's title, not its category: categories are unreliable
 * (four breast-reduction posts are filed under Breast Augmentation, and "What
 * Age Can You Get a BBL?" under Recovery), while every title but six names its
 * procedure. The v2 template uses it for the procedure strip, the highlighted
 * answer in the consultation thread, the results rail and the fact card.
 *
 * Imports the nine procedure data modules directly rather than the
 * `procedures.data` barrel, which validates the whole environment on import.
 *
 * @module lib/blog/post-procedure
 */
import {
    formatLineName,
    getDiscountStatement,
    getPriceDisplay,
    getTypicalRange,
    type PriceDisplay,
    type PricingSnapshot,
    type TypicalRange,
} from '@workspace/shared/claims/pricing'
import { FALLBACK_PRICING } from '@workspace/shared/claims/prices'

import { blepharoplastyMiami } from '@/lib/data/procedures/blepharoplasty-miami.data'
import { brazilianButtLiftBblMiami } from '@/lib/data/procedures/brazilian-butt-lift-bbl-miami.data'
import { breastAugmentationMiami } from '@/lib/data/procedures/breast-augmentation-miami.data'
import { breastLiftMiami } from '@/lib/data/procedures/breast-lift-miami.data'
import { breastReductionMiami } from '@/lib/data/procedures/breast-reduction-miami.data'
import { faceliftMiami } from '@/lib/data/procedures/facelift-miami.data'
import { liposuctionMiami } from '@/lib/data/procedures/liposuction-miami.data'
import { mommyMakeoverMiami } from '@/lib/data/procedures/mommy-makeover-miami.data'
import { tummyTuckMiami } from '@/lib/data/procedures/tummy-tuck-miami.data'
import type { Procedure } from '@/lib/types/procedure.type'
import { getProcedureFormValue } from '@/lib/types/forms/contact-form.type'

export type PostProcedure = {
    /** The procedure page's slug, e.g. 'brazilian-butt-lift-bbl-miami'. */
    slug: string
    /** The consultation thread's value for it, e.g. 'bbl'. */
    chatValue: string
    /** How copy names it mid-sentence: 'BBL', 'lipo', 'tummy tuck'. */
    shortName: string
    /** `quickStats.recovery` in sentence case: '10-14 days off work'. */
    recovery: string
    /**
     * The starting price from the pricing resolver (#354), for BBL and Lipo
     * 360 only: the two procedures whose page publishes a price the strip
     * and the rail can point at.
     */
    price: {
        /** The name the price is quoted for: 'BBL', 'Lipo 360'. */
        label: string
        /** The resolved price; struck through while a discount is on. */
        display: PriceDisplay
        /** BBL's "most patients pay" range, or null. */
        range: TypicalRange | null
        /** The line under the price when there is no range. */
        note: string
        /** The 456.062 statement while this price is discounted, else null. */
        statement: string | null
    } | null
}

type ProcedureRule = {
    procedure: Procedure
    pattern: RegExp
    shortName: string
    /**
     * Which price the post shows: a claim procedure's starting price, or one
     * named line (`line`), whose own label then names it, so the name always
     * matches the figure. `label` and `note` are for the starting price.
     */
    price?:
        | { claim: string; label: string; note: string; line?: undefined }
        | { claim: string; line: string }
}

/**
 * One rule per procedure, matched against the lowercased title. The order only
 * breaks ties between two matches at the same position.
 */
const RULES: readonly ProcedureRule[] = [
    {
        procedure: mommyMakeoverMiami,
        pattern: /mommy makeover/,
        shortName: 'mommy makeover',
    },
    {
        procedure: brazilianButtLiftBblMiami,
        pattern: /\bbbls?\b|brazilian butt/,
        shortName: 'BBL',
        price: { claim: 'bbl', label: 'BBL', note: 'Set for each patient' },
    },
    {
        procedure: tummyTuckMiami,
        pattern: /tummy tuck|abdominoplasty/,
        shortName: 'tummy tuck',
    },
    {
        procedure: breastReductionMiami,
        pattern: /breast reduction|reduction mammaplasty/,
        shortName: 'breast reduction',
    },
    {
        procedure: breastLiftMiami,
        pattern: /breast lift|mastopexy/,
        shortName: 'breast lift',
    },
    {
        procedure: breastAugmentationMiami,
        // A bare "augmentation" or "implants" is the breast kind on this
        // blog, unless another body part names it ("butt implants", "lip
        // augmentation").
        pattern:
            /breast aug|(?<!(?:butt|buttock|gluteal|lip|chin|cheek|calf|pec) )(?:augmentation|\bimplants?\b)/,
        shortName: 'breast augmentation',
    },
    {
        procedure: liposuctionMiami,
        pattern: /\blipo\b|lipo ?360|liposuction|lipo foam/,
        shortName: 'lipo',
        // The Lipo 360 line by name, whatever liposuction's starting line is.
        price: { claim: 'lipo', line: 'lipo360' },
    },
    {
        procedure: faceliftMiami,
        pattern: /face ?lift|neck lift/,
        shortName: 'facelift',
    },
    {
        procedure: blepharoplastyMiami,
        pattern: /blepharoplasty|eyelid/,
        shortName: 'eyelid surgery',
    },
]

/** "10-14 Days Off Work" → "10-14 days off work". */
function toSentenceCase(text: string): string {
    return text.charAt(0) + text.slice(1).toLowerCase()
}

/** A rule's price, resolved against the pricing snapshot. */
function resolvePrice(
    price: ProcedureRule['price'],
    pricing: PricingSnapshot
): PostProcedure['price'] {
    if (!price) return null
    const display = getPriceDisplay(pricing, price.claim, price.line)
    if (!display) return null
    const name = formatLineName(display.label, {
        short: true,
        capitalized: true,
    })
    const statement = display.discounted ? getDiscountStatement(pricing) : null
    if (price.line === undefined) {
        return {
            label: price.label,
            display,
            range: getTypicalRange(pricing, price.claim),
            note: price.note,
            statement,
        }
    }
    // A named line has no range; the range belongs to the starting price.
    return {
        label: name,
        display,
        range: null,
        note: `${name}, set for each patient after an exam`,
        statement,
    }
}

/**
 * The procedure a post is about: the rule whose match starts earliest in the
 * title, so a comparison ("What Is More Painful BBL or Tummy Tuck?") maps to
 * the procedure it names first.
 *
 * @param title - The post's title
 * @param pricing - The live pricing snapshot (`getPricing()`); the
 *   2026-09-15 sheet when omitted
 * @returns The procedure, or null for the general posts (choosing a surgeon,
 * costs and financing), which get the template's general variant
 */
export function getPostProcedure(
    title: string,
    pricing: PricingSnapshot = FALLBACK_PRICING
): PostProcedure | null {
    const lowered = title.toLowerCase()
    let best: { rule: ProcedureRule; index: number } | null = null

    for (const rule of RULES) {
        const index = lowered.search(rule.pattern)
        if (index === -1) continue
        if (!best || index < best.index) best = { rule, index }
    }

    if (!best) return null

    const { procedure, shortName, price } = best.rule
    return {
        slug: procedure.slug,
        chatValue: getProcedureFormValue(procedure.slug),
        shortName,
        recovery: toSentenceCase(procedure.quickStats?.recovery ?? ''),
        price: resolvePrice(price, pricing),
    }
}
