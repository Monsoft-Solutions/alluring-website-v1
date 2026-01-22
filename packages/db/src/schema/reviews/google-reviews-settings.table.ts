/**
 * Google Reviews Settings Table
 *
 * Stores OAuth credentials and sync state for Google Business Profile integration.
 * Supports one business location per configuration.
 *
 * @module packages/db/src/schema/reviews/google-reviews-settings.table
 */
import {
    boolean,
    decimal,
    integer,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core'

/**
 * Google reviews settings table for OAuth and sync configuration
 */
export const googleReviewsSettings = pgTable('google_reviews_settings', {
    id: uuid('id').primaryKey().defaultRandom(),

    // ====================================================================
    // Google Business Profile Location
    // ====================================================================

    /**
     * Google My Business account ID
     */
    accountId: varchar('account_id', { length: 255 }),

    /**
     * Google My Business location ID
     */
    locationId: varchar('location_id', { length: 255 }),

    /**
     * Human-readable location name for display
     */
    locationName: varchar('location_name', { length: 255 }),

    // ====================================================================
    // OAuth 2.0 Credentials
    // ====================================================================

    /**
     * OAuth access token for Google APIs
     */
    accessToken: text('access_token'),

    /**
     * OAuth refresh token for getting new access tokens
     */
    refreshToken: text('refresh_token'),

    /**
     * When the access token expires
     */
    tokenExpiresAt: timestamp('token_expires_at'),

    // ====================================================================
    // Sync State
    // ====================================================================

    /**
     * Whether Google reviews integration is enabled
     */
    isEnabled: boolean('is_enabled').default(false).notNull(),

    /**
     * Timestamp of last successful sync
     */
    lastSyncAt: timestamp('last_sync_at'),

    /**
     * Total number of reviews from Google
     */
    totalReviewsCount: integer('total_reviews_count'),

    /**
     * Average rating from all reviews
     */
    averageRating: decimal('average_rating', { precision: 2, scale: 1 }),

    // ====================================================================
    // System Fields
    // ====================================================================

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
})

export type GoogleReviewsSettings = typeof googleReviewsSettings.$inferSelect
export type InsertGoogleReviewsSettings =
    typeof googleReviewsSettings.$inferInsert
