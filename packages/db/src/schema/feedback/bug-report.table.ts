/**
 * Bug Report Table
 *
 * Stores quick bug reports submitted during beta testing.
 * Optimized for fast, low-friction bug reporting.
 *
 * @module packages/db/src/schema/feedback/bug-report.table
 */
import {
    integer,
    pgTable,
    real,
    text,
    timestamp,
    uuid,
} from 'drizzle-orm/pg-core'

/**
 * Bug severity levels
 */
export const BUG_SEVERITY_LEVELS = [
    'low',
    'medium',
    'high',
    'critical',
] as const

export type BugSeverity = (typeof BUG_SEVERITY_LEVELS)[number]

/**
 * Bug status for tracking
 */
export const BUG_STATUS_OPTIONS = [
    'new',
    'acknowledged',
    'in-progress',
    'resolved',
    'wont-fix',
] as const

export type BugStatus = (typeof BUG_STATUS_OPTIONS)[number]

/**
 * Bug report table for storing quick bug submissions
 */
export const bugReport = pgTable('bug_report', {
    id: uuid('id').primaryKey().defaultRandom(),

    // Bug details
    pageUrl: text('page_url').notNull(),
    description: text('description').notNull(),
    stepsToReproduce: text('steps_to_reproduce'),
    expectedBehavior: text('expected_behavior'),
    actualBehavior: text('actual_behavior'),
    screenshotUrl: text('screenshot_url'),

    // Device/browser info (auto-detected)
    deviceType: text('device_type'),
    browserType: text('browser_type'),
    browserVersion: text('browser_version'),
    screenSize: text('screen_size'),

    // Status tracking
    severity: text('severity').default('medium'),
    status: text('status').default('new'),

    // Reporter info (optional)
    reporterEmail: text('reporter_email'),
    reporterName: text('reporter_name'),

    // Technical metadata
    userAgent: text('user_agent'),
    ipAddress: text('ip_address'),

    // Screen & viewport dimensions (structured)
    screenWidth: integer('screen_width'),
    screenHeight: integer('screen_height'),
    viewportWidth: integer('viewport_width'),
    viewportHeight: integer('viewport_height'),
    devicePixelRatio: real('device_pixel_ratio'),

    // Environment metadata
    timezone: text('timezone'),
    language: text('language'),
    referrer: text('referrer'),
    connectionType: text('connection_type'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
})

export type BugReport = typeof bugReport.$inferSelect
export type InsertBugReport = typeof bugReport.$inferInsert
