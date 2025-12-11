/**
 * Social Media Settings Table
 *
 * Stores configuration for social media platform integrations
 * including API credentials and sync state.
 *
 * @module packages/db/src/schema/social-media/social-media-settings.table
 */
import {
    boolean,
    index,
    integer,
    jsonb,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core'

/**
 * Supported social media platforms
 */
export const socialMediaPlatform = pgEnum('social_media_platform', [
    'instagram',
    'facebook',
    'tiktok',
])

/**
 * Social media settings table for storing platform configurations
 * One row per platform
 */
export const socialMediaSettings = pgTable(
    'social_media_settings',
    {
        id: uuid('id').primaryKey().defaultRandom(),

        /**
         * Social media platform identifier
         */
        platform: socialMediaPlatform('platform').notNull().unique(),

        /**
         * Username/handle for the platform (without @)
         */
        handle: varchar('handle', { length: 100 }),

        /**
         * API key for the scraping service
         */
        apiKey: text('api_key'),

        /**
         * Timestamp of last successful sync
         */
        lastSyncAt: timestamp('last_sync_at'),

        /**
         * Cursor/pagination token for fetching more posts
         */
        lastSyncCursor: varchar('last_sync_cursor', { length: 255 }),

        /**
         * Whether this platform integration is enabled
         */
        isEnabled: boolean('is_enabled').default(true).notNull(),

        // ====================================================================
        // Profile Metadata (Instagram-specific, null for other platforms)
        // ====================================================================

        /**
         * Display name from profile
         */
        fullName: varchar('full_name', { length: 255 }),

        /**
         * Profile biography/description
         */
        biography: text('biography'),

        /**
         * Profile picture URL (uploaded to Vercel Blob)
         */
        profilePictureUrl: text('profile_picture_url'),

        /**
         * External link from profile
         */
        externalUrl: text('external_url'),

        /**
         * Number of followers
         */
        followersCount: integer('followers_count'),

        /**
         * Number of accounts following
         */
        followingCount: integer('following_count'),

        /**
         * Total number of posts on the profile
         */
        postsCount: integer('posts_count'),

        /**
         * Whether this is a business account
         */
        isBusinessAccount: boolean('is_business_account'),

        /**
         * Whether this is a professional account
         */
        isProfessionalAccount: boolean('is_professional_account'),

        /**
         * Whether the profile is private
         */
        isPrivate: boolean('is_private'),

        /**
         * Whether the profile is verified
         */
        isVerified: boolean('is_verified'),

        /**
         * Business category name
         */
        categoryName: varchar('category_name', { length: 100 }),

        /**
         * Business address data (city, street, zipCode, latitude, longitude)
         */
        businessAddress: jsonb('business_address').$type<{
            cityName?: string
            streetAddress?: string
            zipCode?: string
            latitude?: number
            longitude?: number
        }>(),

        /**
         * When profile metadata was last fetched from the API
         */
        profileLastFetchedAt: timestamp('profile_last_fetched_at'),

        // ====================================================================
        // System Fields
        // ====================================================================

        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at')
            .defaultNow()
            .notNull()
            .$onUpdate(() => new Date()),
    },
    (table) => [index('social_media_settings_platform_idx').on(table.platform)]
)

export type SocialMediaSettings = typeof socialMediaSettings.$inferSelect
export type InsertSocialMediaSettings = typeof socialMediaSettings.$inferInsert
