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
