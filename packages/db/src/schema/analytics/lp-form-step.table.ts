import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

/**
 * One row per answer given in the ads landing page's form (#292): which
 * procedure chip and which timeline a visitor picked, in which test arm,
 * from which ad group and where on the page.
 *
 * GA4 never gets the answers (#272), and most visitors who answer never send
 * a lead, so this is the only record of what they were considering. It
 * holds nothing that identifies anyone: no IP, no browser details, no GA id,
 * only a random key per browser tab (`tab_key`) so the answers of one visit
 * can be read together.
 *
 * `created_at` is DB `now()`, Miami wall time, like `contact_submission`.
 */
export const lpFormStep = pgTable(
    'lp_form_step',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        // Random per browser tab, from sessionStorage; not a person or device.
        tabKey: text('tab_key').notNull(),
        // 'ads-consultation-v6'
        pageVariant: text('page_variant').notNull(),
        // 'thread' | 'card'
        formVariant: text('form_variant').notNull(),
        // The ad group (`?p=`): 'bbl', 'tummy-tuck', 'default'…
        adVariant: text('ad_variant').notNull(),
        // The sitelink view (`?s=`) the visit opened, or null.
        section: text('section'),
        // 'en' | 'es'
        language: text('language').notNull(),
        // 'procedure' | 'timeline'
        step: text('step').notNull(),
        // The option value: 'bbl', '1-3-months'. Never free text.
        answer: text('answer').notNull(),
        // Where it was answered: 'hero', 'bar', 'closing', 'strip'.
        entryPoint: text('entry_point').notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
    },
    (table) => [index('lp_form_step_created_at_idx').on(table.createdAt)]
)

export type LpFormStep = typeof lpFormStep.$inferSelect
export type InsertLpFormStep = typeof lpFormStep.$inferInsert
