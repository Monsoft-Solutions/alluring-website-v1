/**
 * Email Log Table Schema
 *
 * Tracks all email sending attempts for audit purposes.
 * Records both successful sends and failures with detailed error information.
 *
 * @module packages/db/src/schema/email-log.table
 */
import {
    index,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
} from 'drizzle-orm/pg-core'
import { contactSubmission } from '../contact'

/**
 * Email status enum
 * - sent: Email was successfully sent via Resend
 * - failed: Email sending failed (see error field for details)
 * - pending: Email is queued for sending (future use)
 */
export const emailStatusEnum = pgEnum('email_status', [
    'sent',
    'failed',
    'pending',
])

/**
 * Email log table
 *
 * Tracks all email sending attempts with full audit trail.
 * Foreign key to contact_submission for linking emails to form submissions.
 */
export const emailLog = pgTable(
    'email_log',
    {
        /**
         * Unique identifier for the email log entry
         */
        id: uuid('id').defaultRandom().primaryKey(),

        /**
         * Recipient email address
         */
        to: text('to').notNull(),

        /**
         * Sender email address
         */
        from: text('from').notNull(),

        /**
         * Email subject line
         */
        subject: text('subject').notNull(),

        /**
         * Email sending status
         */
        status: emailStatusEnum('status').notNull().default('pending'),

        /**
         * Resend email ID (returned from Resend API on successful send)
         */
        resendEmailId: text('resend_email_id'),

        /**
         * Foreign key to contact submission (optional, for contact form emails)
         */
        contactSubmissionId: uuid('contact_submission_id').references(
            () => contactSubmission.id,
            {
                onDelete: 'set null',
            }
        ),

        /**
         * Error message if email failed to send
         */
        error: text('error'),

        /**
         * Timestamp when email was sent or attempted
         */
        sentAt: timestamp('sent_at', { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => [
        // Performance Indexes
        index('email_log_status_idx').on(table.status),
        index('email_log_sent_at_idx').on(table.sentAt),
    ]
)

/**
 * Type for inserting new email log records
 */
export type InsertEmailLog = typeof emailLog.$inferInsert

/**
 * Type for selecting email log records
 */
export type SelectEmailLog = typeof emailLog.$inferSelect
