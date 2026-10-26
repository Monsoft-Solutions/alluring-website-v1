/**
 * Pricing queries (issue #354)
 *
 * The admin's read of the pricing tables: the rows the Pricing page edits,
 * and the snapshot the MCP validator, the chat test route and the blog
 * pipeline resolve claim tokens against. The web app has its own cached
 * reader (`apps/web/lib/queries/pricing.query.ts`); both build the snapshot
 * with `buildPricingSnapshotFromRows`, so they agree.
 *
 * @module lib/queries/pricing
 */
import { asc, eq } from 'drizzle-orm'

import { db } from '@workspace/db/client'
import {
    priceLine,
    pricingSettings,
    procedurePricing,
} from '@workspace/db/schema/pricing'
import type { PricingSnapshot } from '@workspace/shared/claims/pricing'
import {
    buildPricingSnapshotFromRows,
    FALLBACK_PRICING,
    type PricingRows,
} from '@workspace/shared/claims/prices'

/** Every row of the three pricing tables, uncached. */
export async function getPricingRows(): Promise<
    PricingRows & { notes: Record<string, string | null> }
> {
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
            .from(priceLine)
            .orderBy(asc(priceLine.procedureSlug), asc(priceLine.sortOrder)),
        db
            .select({
                procedureSlug: procedurePricing.procedureSlug,
                startingLineKey: procedurePricing.startingLineKey,
                discountPercent: procedurePricing.discountPercent,
                discountLabel: procedurePricing.discountLabel,
                notes: procedurePricing.notes,
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

    return {
        lines,
        procedures,
        settings: settings[0] ?? null,
        notes: Object.fromEntries(
            procedures.map((row) => [row.procedureSlug, row.notes])
        ),
    }
}

/**
 * The live pricing snapshot, or the 2026-09-15 sheet when the tables are
 * empty or unreachable. Uncached: the admin always reads what it just saved.
 */
export async function getPricingSnapshot(): Promise<PricingSnapshot> {
    try {
        return buildPricingSnapshotFromRows(await getPricingRows())
    } catch (error) {
        console.error(
            '[pricing] Reading the pricing tables failed; using the 2026-09-15 price sheet.',
            error
        )
        return FALLBACK_PRICING
    }
}
