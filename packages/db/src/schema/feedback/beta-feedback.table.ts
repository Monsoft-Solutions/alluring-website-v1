/**
 * Beta Feedback Table
 *
 * Stores comprehensive feedback submissions from the multi-step beta feedback form.
 * Used for internal website review before launch.
 *
 * @module packages/db/src/schema/feedback/beta-feedback.table
 */
import {
    boolean,
    integer,
    pgTable,
    text,
    timestamp,
    uuid,
} from 'drizzle-orm/pg-core'

/**
 * Device type options for feedback form
 */
export const DEVICE_TYPES = [
    'desktop',
    'laptop',
    'tablet',
    'mobile-iphone',
    'mobile-android',
    'other',
] as const

export type DeviceType = (typeof DEVICE_TYPES)[number]

/**
 * Browser options for feedback form
 */
export const BROWSER_TYPES = [
    'chrome',
    'safari',
    'firefox',
    'edge',
    'brave',
    'other',
] as const

export type BrowserType = (typeof BROWSER_TYPES)[number]

/**
 * Navigation ease options
 */
export const NAVIGATION_EASE_OPTIONS = [
    'very-easy',
    'mostly-easy',
    'neutral',
    'bit-confusing',
    'very-confusing',
] as const

export type NavigationEase = (typeof NAVIGATION_EASE_OPTIONS)[number]

/**
 * Beta feedback table for storing multi-step feedback form submissions
 */
export const betaFeedback = pgTable('beta_feedback', {
    id: uuid('id').primaryKey().defaultRandom(),

    // Section 2: Basic Information
    deviceType: text('device_type').notNull(),
    deviceTypeOther: text('device_type_other'),
    browserType: text('browser_type').notNull(),
    browserTypeOther: text('browser_type_other'),

    // Section 3: Design & Aesthetic Feedback
    overallDesignRating: integer('overall_design_rating').notNull(),
    visualAestheticsRating: integer('visual_aesthetics_rating').notNull(),
    designLikes: text('design_likes'),
    designDislikes: text('design_dislikes'),

    // Section 4: Navigation & Usability
    navigationEase: text('navigation_ease').notNull(),
    hasBrokenLinks: boolean('has_broken_links').default(false),
    brokenLinksDescription: text('broken_links_description'),

    // Section 5: Content & Wording Quality
    wordingClarityRating: integer('wording_clarity_rating').notNull(),
    hasTypos: boolean('has_typos').default(false),
    typosDescription: text('typos_description'),

    // Section 6: Performance & Technical Issues
    hasTechnicalIssues: boolean('has_technical_issues').default(false),
    technicalIssuesDescription: text('technical_issues_description'),

    // Section 7: Overall Impression
    overallSatisfactionRating: integer('overall_satisfaction_rating').notNull(),
    recommendations: text('recommendations'),
    wantsUxTesting: boolean('wants_ux_testing').default(false),
    email: text('email'),

    // Metadata
    userAgent: text('user_agent'),
    ipAddress: text('ip_address'),
    pageUrl: text('page_url'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
})

export type BetaFeedback = typeof betaFeedback.$inferSelect
export type InsertBetaFeedback = typeof betaFeedback.$inferInsert
