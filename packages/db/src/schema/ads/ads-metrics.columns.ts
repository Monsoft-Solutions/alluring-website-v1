/**
 * Delivery metric columns shared by every `ads_*_daily` snapshot table.
 *
 * A function, not a shared object: drizzle column builders are mutable, so
 * each table needs its own instances.
 *
 * Money is `numeric(12,2)` in account currency (USD), converted from the
 * API's micros at pull time — the snapshot must equal the live API to the
 * cent, which a float column cannot promise.
 *
 * @module packages/db/src/schema/ads/ads-metrics.columns
 */
import { integer, numeric, timestamp } from 'drizzle-orm/pg-core'

export function adsDeliveryColumns() {
    return {
        impressions: integer('impressions').notNull().default(0),
        clicks: integer('clicks').notNull().default(0),
        cost: numeric('cost', { precision: 12, scale: 2, mode: 'number' })
            .notNull()
            .default(0),
        /** Google's "Conversions" column: primary actions, by click date. */
        conversions: numeric('conversions', {
            precision: 12,
            scale: 2,
            mode: 'number',
        })
            .notNull()
            .default(0),
        /** "All conversions": primary and secondary actions. */
        allConversions: numeric('all_conversions', {
            precision: 12,
            scale: 2,
            mode: 'number',
        })
            .notNull()
            .default(0),
        /** When the snapshot last wrote this row. */
        syncedAt: timestamp('synced_at').notNull().defaultNow(),
    }
}
