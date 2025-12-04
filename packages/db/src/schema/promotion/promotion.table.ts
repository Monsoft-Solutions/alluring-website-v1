import {
    boolean,
    index,
    integer,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core'

/**
 * Promotion status enum
 * - draft: Not ready to be displayed
 * - scheduled: Ready but waiting for start date
 * - active: Currently being displayed
 * - paused: Temporarily hidden
 * - expired: Past end date
 */
export const promotionStatus = pgEnum('promotion_status', [
    'draft',
    'scheduled',
    'active',
    'paused',
    'expired',
])

/**
 * Promotion type enum for categorization
 * - discount: Percentage or fixed amount off
 * - seasonal: Seasonal campaigns (Summer, Holiday, etc.)
 * - bundle: Package deals combining multiple procedures
 * - financing: Special financing offers
 */
export const promotionType = pgEnum('promotion_type', [
    'discount',
    'seasonal',
    'bundle',
    'financing',
])

/**
 * Discount type enum
 * - percentage: e.g., 20% off
 * - fixed_amount: e.g., $500 off
 */
export const discountType = pgEnum('discount_type', [
    'percentage',
    'fixed_amount',
])

/**
 * Link type enum for CTA destination
 * - procedure: Links to a procedure page on the site
 * - custom_url: Links to an external or custom URL
 * - contact: Links to contact/consultation form
 */
export const promotionLinkType = pgEnum('promotion_link_type', [
    'procedure',
    'custom_url',
    'contact',
])

/**
 * Promotion table
 * Stores marketing campaigns and promotional offers
 */
export const promotion = pgTable(
    'promotion',
    {
        // Core fields
        id: uuid('id').primaryKey().defaultRandom(),
        slug: varchar('slug', { length: 255 }).notNull().unique(),
        title: varchar('title', { length: 255 }).notNull(),
        description: text('description').notNull(),
        excerpt: text('excerpt'), // Short summary for cards/listings

        // Status
        status: promotionStatus('status').default('draft').notNull(),

        // Type categorization
        type: promotionType('type').notNull(),
        discountValue: integer('discount_value'), // Percentage or amount
        discountTypeValue: discountType('discount_type_value'),

        // Scheduling
        startsAt: timestamp('starts_at'),
        endsAt: timestamp('ends_at'),
        isAutoActivate: boolean('is_auto_activate').default(true).notNull(),
        isAutoExpire: boolean('is_auto_expire').default(true).notNull(),

        // Media (Vercel Blob URLs)
        imageUrl: text('image_url'),
        imageAlt: varchar('image_alt', { length: 255 }),
        videoUrl: text('video_url'),
        thumbnailUrl: text('thumbnail_url'),

        // Linking
        linkType: promotionLinkType('link_type').default('contact').notNull(),
        procedureSlug: varchar('procedure_slug', { length: 255 }),
        customUrl: text('custom_url'),
        ctaText: varchar('cta_text', { length: 100 })
            .default('Learn More')
            .notNull(),

        // Metadata
        priority: integer('priority').default(0).notNull(), // Higher = more prominent
        views: integer('views').default(0).notNull(),
        clicks: integer('clicks').default(0).notNull(),

        // Timestamps
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at')
            .defaultNow()
            .notNull()
            .$onUpdate(() => new Date()),
    },
    (table) => [
        {
            // Performance Indexes
            statusIdx: index('promotion_status_idx').on(table.status),
            typeIdx: index('promotion_type_idx').on(table.type),
            startsAtIdx: index('promotion_starts_at_idx').on(table.startsAt),
            endsAtIdx: index('promotion_ends_at_idx').on(table.endsAt),
            priorityIdx: index('promotion_priority_idx').on(table.priority),
            statusStartsAtIdx: index('promotion_status_starts_at_idx').on(
                table.status,
                table.startsAt
            ),
            statusPriorityIdx: index('promotion_status_priority_idx').on(
                table.status,
                table.priority
            ),
        },
    ]
)

export type Promotion = typeof promotion.$inferSelect
export type InsertPromotion = typeof promotion.$inferInsert
