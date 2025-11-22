/**
 * Email Log Types
 *
 * Type definitions for email logging and tracking.
 *
 * @module lib/types/email/email-log.type
 */
import type {
    InsertEmailLog,
    SelectEmailLog,
} from '@workspace/db/schema/emails'

/**
 * Email log record from database
 */
export type EmailLog = SelectEmailLog

/**
 * Data for creating a new email log entry
 */
export type NewEmailLog = InsertEmailLog

/**
 * Email status enum values
 */
export type EmailStatus = 'sent' | 'failed' | 'pending'

/**
 * Email log creation result
 */
export type EmailLogResult = {
    success: boolean
    emailLogId?: string
    error?: string
}
