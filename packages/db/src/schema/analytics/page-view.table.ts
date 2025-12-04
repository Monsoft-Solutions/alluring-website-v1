import {
    index,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core'

/**
 * Device type enum for analytics
 */
export const deviceTypeEnum = pgEnum('device_type', [
    'desktop',
    'mobile',
    'tablet',
    'unknown',
])

/**
 * Page view tracking table
 *
 * Stores anonymized page view data without cookies.
 * IP addresses are NEVER stored - only derived geo data.
 * Session IDs are generated client-side and stored in sessionStorage.
 */
export const pageView = pgTable(
    'page_view',
    {
        id: uuid('id').primaryKey().defaultRandom(),

        // Page information
        pagePath: varchar('page_path', { length: 500 }).notNull(),
        pageUrl: text('page_url').notNull(),
        pageTitle: varchar('page_title', { length: 500 }),

        // Traffic source
        referrer: text('referrer'),
        utmSource: varchar('utm_source', { length: 255 }),
        utmMedium: varchar('utm_medium', { length: 255 }),
        utmCampaign: varchar('utm_campaign', { length: 255 }),
        utmContent: varchar('utm_content', { length: 255 }),
        utmTerm: varchar('utm_term', { length: 255 }),

        // Device information (parsed from user agent)
        userAgent: text('user_agent'),
        deviceType: deviceTypeEnum('device_type').default('unknown'),
        browser: varchar('browser', { length: 100 }),
        browserVersion: varchar('browser_version', { length: 50 }),
        os: varchar('os', { length: 100 }),
        osVersion: varchar('os_version', { length: 50 }),

        // Geo information (derived from IP, IP is NOT stored)
        countryCode: varchar('country_code', { length: 2 }),
        region: varchar('region', { length: 100 }),
        city: varchar('city', { length: 100 }),

        // Session tracking (sessionStorage-based, not cookie)
        sessionId: varchar('session_id', { length: 64 }),

        // Timestamp
        createdAt: timestamp('created_at').notNull().defaultNow(),
    },
    (table) => [
        {
            // Performance indexes for common queries
            pagePathIdx: index('page_view_page_path_idx').on(table.pagePath),
            createdAtIdx: index('page_view_created_at_idx').on(table.createdAt),
            sessionIdIdx: index('page_view_session_id_idx').on(table.sessionId),

            // Composite indexes for dashboard queries
            pathCreatedAtIdx: index('page_view_path_created_at_idx').on(
                table.pagePath,
                table.createdAt
            ),
            utmSourceIdx: index('page_view_utm_source_idx').on(table.utmSource),
            countryCodeIdx: index('page_view_country_code_idx').on(
                table.countryCode
            ),
            deviceTypeIdx: index('page_view_device_type_idx').on(
                table.deviceType
            ),
            browserIdx: index('page_view_browser_idx').on(table.browser),
        },
    ]
)

export type PageView = typeof pageView.$inferSelect
export type InsertPageView = typeof pageView.$inferInsert
