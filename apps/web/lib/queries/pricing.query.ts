/**
 * Pricing resolver (issue #354)
 *
 * The one place the web app reads Alluring's prices. Every page, structured
 * data block, `llms*.txt` route, post and the chat prompt asks here; nothing
 * types a figure. The admin Pricing page writes the `price_line`,
 * `procedure_pricing` and `pricing_settings` tables and revalidates
 * `CACHE_TAGS.PRICING`.
 *
 * Falls back to the 2026-09-15 sheet in `@workspace/shared/claims/prices`
 * when the tables are empty (the snapshot builder does that) or the query
 * fails. A failure is caught *outside* `unstable_cache`, so a transient
 * database error is never cached for the TTL.
 *
 * Server-only. Client components receive resolved values (`PriceDisplay`,
 * plain strings) as props and format with `@workspace/shared/claims/pricing`.
 *
 * @module lib/queries/pricing
 */
import 'server-only'

import { unstable_cache } from 'next/cache'

import { db } from '@workspace/db/client'
import {
    priceLine,
    pricingSettings,
    procedurePricing,
} from '@workspace/db/schema/pricing'
import { CACHE_TAGS } from '@workspace/shared/cache'
import {
    FALLBACK_PRICING,
    buildPricingSnapshotFromRows,
    toClaimProcedureKey,
} from '@workspace/shared/claims/prices'
import {
    getDiscountStatement,
    getPriceDisplay,
    type PriceDisplay,
    type PricingSnapshot,
} from '@workspace/shared/claims/pricing'
import { eq } from 'drizzle-orm'

import {
    buildProcedurePrices,
    type ProcedurePrices,
} from '@/lib/claims/procedure-prices.util'

/**
 * A day. Price edits revalidate the tag on save, so the TTL is only a safety
 * net, matching the promotion queries.
 */
const CACHE_TTL = 86400

async function fetchPricing(): Promise<PricingSnapshot> {
    const [lines, procedures, settings] = await Promise.all([
        db
            .select({
                procedureSlug: priceLine.procedureSlug,
                lineKey: priceLine.lineKey,
                label: priceLine.label,
                usd: priceLine.usd,
                unit: priceLine.unit,
                isAddOn: priceLine.isAddOn,
                sortOrder: priceLine.sortOrder,
                isActive: priceLine.isActive,
                updatedAt: priceLine.updatedAt,
            })
            .from(priceLine),
        db
            .select({
                procedureSlug: procedurePricing.procedureSlug,
                startingLineKey: procedurePricing.startingLineKey,
                discountPercent: procedurePricing.discountPercent,
                discountLabel: procedurePricing.discountLabel,
                typicalMaxUsd: procedurePricing.typicalMaxUsd,
                updatedAt: procedurePricing.updatedAt,
            })
            .from(procedurePricing),
        db
            .select({
                defaultDiscountPercent: pricingSettings.defaultDiscountPercent,
                discountStatement: pricingSettings.discountStatement,
                comboDiscountTwoUsd: pricingSettings.comboDiscountTwoUsd,
                comboDiscountThreeUsd: pricingSettings.comboDiscountThreeUsd,
                updatedAt: pricingSettings.updatedAt,
            })
            .from(pricingSettings)
            .where(eq(pricingSettings.id, 1))
            .limit(1),
    ])

    return buildPricingSnapshotFromRows({
        lines,
        procedures,
        settings: settings[0] ?? null,
    })
}

const getCachedPricing = unstable_cache(fetchPricing, ['pricing-snapshot'], {
    tags: [CACHE_TAGS.PRICING],
    revalidate: CACHE_TTL,
})

/**
 * The live pricing snapshot, or the 2026-09-15 sheet when the database has
 * none or cannot be reached. Plain data: safe to pass to a client component.
 */
export async function getPricing(): Promise<PricingSnapshot> {
    try {
        return await getCachedPricing()
    } catch (error) {
        console.error(
            '[pricing] Reading the pricing tables failed; using the 2026-09-15 price sheet.',
            error
        )
        return FALLBACK_PRICING
    }
}

/** A claim key (`bbl`) or a page slug (`brazilian-butt-lift-bbl-miami`). */
function claimKey(procedure: string): string {
    return toClaimProcedureKey(procedure) ?? procedure
}

/**
 * A procedure's "starting at" price, discount applied. `null` when it
 * publishes none (mommy makeover) or its starting line is inactive.
 *
 * @param procedure - Claim key or web page slug
 */
export async function getStartingPrice(
    procedure: string
): Promise<PriceDisplay | null> {
    return getPriceDisplay(await getPricing(), claimKey(procedure))
}

/**
 * One sheet line's price, discount applied. `null` when the line is unknown
 * or inactive.
 *
 * @param procedure - Claim key or web page slug
 * @param lineKey - The line's key, e.g. `mini`
 */
export async function getLinePrice(
    procedure: string,
    lineKey: string
): Promise<PriceDisplay | null> {
    return getPriceDisplay(await getPricing(), claimKey(procedure), lineKey)
}

export type { ProcedurePrices }

/**
 * Everything a procedure page needs to print its prices: the starting line,
 * every line for the price table, the BBL range and the statement.
 *
 * @param procedure - Claim key or web page slug
 */
export async function getProcedurePrices(
    procedure: string
): Promise<ProcedurePrices> {
    return buildProcedurePrices(await getPricing(), procedure)
}

/** The 456.062 statement while any discount is on, else `null`. */
export async function getDiscountStatementText(): Promise<string | null> {
    return getDiscountStatement(await getPricing())
}
