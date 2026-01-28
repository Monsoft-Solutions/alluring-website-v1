/**
 * Email Service
 *
 * Handles email sending via Resend and database logging.
 * Centralizes all email operations for consistency and maintainability.
 *
 * @module lib/services/email.service
 */
import { render } from '@react-email/render'
import { Resend } from 'resend'

import { db } from '@workspace/db/client'
import { emailLog, type InsertEmailLog } from '@workspace/db/schema/emails'

import { env } from '@/env'
import { siteConfig } from '@/lib/data/site-config'
import type { BetaFeedbackFormData } from '@/lib/types/forms/beta-feedback.type'
import type { BugReportFormData } from '@/lib/types/forms/bug-report.type'
import type { ContactFormData } from '@/lib/types/forms/contact-form.type'
import type {
    SendContactEmailsResult,
    SendEmailResult,
} from '@/lib/types/email/email-service.type'

import { BugReportNotificationEmail } from '../email/templates/BugReportNotification.template'
import { ContactConfirmationEmail } from '../email/templates/ContactConfirmation.template'
import { ContactNotificationEmail } from '../email/templates/ContactNotification.template'
import { FeedbackNotificationEmail } from '../email/templates/FeedbackNotification.template'

/**
 * Initialize Resend client with API key
 */
const resend = new Resend(env.RESEND_API_KEY)

/**
 * Log email attempt to database
 *
 * Records email sending attempts (success or failure) for audit trail.
 *
 * @param emailData - Email log data
 * @returns Promise resolving to the created email log ID
 */
async function logEmailToDatabase(
    emailData: InsertEmailLog
): Promise<string | null> {
    try {
        const [result] = await db.insert(emailLog).values(emailData).returning()

        return result?.id || null
    } catch (error) {
        console.error('Failed to log email to database:', error)
        return null
    }
}

/**
 * Send contact notification email to site owner
 *
 * Sends an email to the owner (OWNER_EMAIL) with contact form submission details.
 *
 * @param contactData - Contact form submission data
 * @param submissionId - Database ID of the contact submission
 * @param sentToCrm - Whether the lead was successfully sent to CRM
 * @returns Promise resolving to send result
 */
export async function sendContactNotification(
    contactData: ContactFormData,
    submissionId: string,
    sentToCrm?: boolean
): Promise<SendEmailResult> {
    const subject = contactData.subject
        ? `New Contact: ${contactData.subject}`
        : `New Contact from ${contactData.name}`

    try {
        // Render email template
        const emailHtml = await render(
            ContactNotificationEmail({
                contactData,
                submittedAt: new Date().toISOString(),
                sentToCrm,
            })
        )

        // Send email via Resend
        const { data, error } = await resend.emails.send({
            from: env.RESEND_FROM_EMAIL,
            to: env.OWNER_EMAIL,
            subject,
            html: emailHtml,
        })

        if (error) {
            console.error('Failed to send contact notification:', error)

            // Log failure to database
            await logEmailToDatabase({
                to: env.OWNER_EMAIL,
                from: env.RESEND_FROM_EMAIL,
                subject,
                status: 'failed',
                error: error.message || 'Unknown error',
                contactSubmissionId: submissionId,
            })

            return {
                success: false,
                error: error.message || 'Failed to send email',
            }
        }

        // Log success to database
        await logEmailToDatabase({
            to: env.OWNER_EMAIL,
            from: env.RESEND_FROM_EMAIL,
            subject,
            status: 'sent',
            resendEmailId: data?.id,
            contactSubmissionId: submissionId,
        })

        return {
            success: true,
            emailId: data?.id,
        }
    } catch (error) {
        console.error('Error sending contact notification:', error)

        // Log failure to database
        await logEmailToDatabase({
            to: env.OWNER_EMAIL,
            from: env.RESEND_FROM_EMAIL,
            subject,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            contactSubmissionId: submissionId,
        })

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
}

/**
 * Send confirmation email to contact form submitter
 *
 * Sends a thank you/confirmation email to the person who submitted the form.
 *
 * @param contactData - Contact form submission data
 * @param submissionId - Database ID of the contact submission
 * @returns Promise resolving to send result
 */
export async function sendContactConfirmation(
    contactData: ContactFormData,
    submissionId: string
): Promise<SendEmailResult> {
    // Early return if no email provided
    if (!contactData.email) {
        return {
            success: false,
            error: 'Email address is required for confirmation email',
        }
    }

    const subject = `Thank you for contacting ${siteConfig.business.name}`

    try {
        // Extract firstName: prefer direct firstName field, otherwise extract from name
        // Always provide a fallback to ensure we never have an empty greeting
        const firstName =
            contactData.firstName?.trim() ||
            (contactData.name || '').trim().split(' ')[0] ||
            'there'

        // Render email template
        const emailHtml = await render(
            ContactConfirmationEmail({
                firstName,
                businessName: siteConfig.business.name,
                businessEmail: siteConfig.contact.email,
            })
        )

        // Send email via Resend
        const { data, error } = await resend.emails.send({
            from: env.RESEND_FROM_EMAIL,
            to: contactData.email,
            subject,
            html: emailHtml,
        })

        if (error) {
            console.error('Failed to send contact confirmation:', error)

            // Log failure to database
            await logEmailToDatabase({
                to: contactData.email,
                from: env.RESEND_FROM_EMAIL,
                subject,
                status: 'failed',
                error: error.message || 'Unknown error',
                contactSubmissionId: submissionId,
            })

            return {
                success: false,
                error: error.message || 'Failed to send email',
            }
        }

        // Log success to database
        await logEmailToDatabase({
            to: contactData.email,
            from: env.RESEND_FROM_EMAIL,
            subject,
            status: 'sent',
            resendEmailId: data?.id,
            contactSubmissionId: submissionId,
        })

        return {
            success: true,
            emailId: data?.id,
        }
    } catch (error) {
        console.error('Error sending contact confirmation:', error)

        // Log failure to database
        await logEmailToDatabase({
            to: contactData.email,
            from: env.RESEND_FROM_EMAIL,
            subject,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            contactSubmissionId: submissionId,
        })

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
}

/**
 * Send both contact form emails (notification and confirmation)
 *
 * Sends notification to owner and confirmation to submitter.
 * Does not throw errors - returns status for both emails.
 *
 * @param contactData - Contact form submission data
 * @param submissionId - Database ID of the contact submission
 * @param sentToCrm - Whether the lead was successfully sent to CRM
 * @returns Promise resolving to results for both emails
 */
export async function sendContactEmails(
    contactData: ContactFormData,
    submissionId: string,
    sentToCrm?: boolean
): Promise<SendContactEmailsResult> {
    const errors: string[] = []

    // Send notification to owner
    const notificationResult = await sendContactNotification(
        contactData,
        submissionId,
        sentToCrm
    )
    if (!notificationResult.success && notificationResult.error) {
        errors.push(`Notification: ${notificationResult.error}`)
    }

    // Send confirmation to submitter
    const confirmationResult = await sendContactConfirmation(
        contactData,
        submissionId
    )
    if (!confirmationResult.success && confirmationResult.error) {
        errors.push(`Confirmation: ${confirmationResult.error}`)
    }

    return {
        notificationSent: notificationResult.success,
        confirmationSent: confirmationResult.success,
        errors,
    }
}

/**
 * Send feedback notification email to site owner
 *
 * Sends an email with beta feedback submission details.
 *
 * @param feedbackData - Beta feedback form submission data
 * @param feedbackId - Database ID of the feedback submission
 * @returns Promise resolving to send result
 */
export async function sendFeedbackNotification(
    feedbackData: BetaFeedbackFormData,
    feedbackId: string
): Promise<SendEmailResult> {
    const subject = `Beta Website Feedback - Overall: ${feedbackData.overallSatisfactionRating}/5`

    try {
        // Render email template
        const emailHtml = await render(
            FeedbackNotificationEmail({
                feedbackData,
                submittedAt: new Date().toISOString(),
                feedbackId,
            })
        )

        // Send email via Resend
        const { data, error } = await resend.emails.send({
            from: env.RESEND_FROM_EMAIL,
            to: env.OWNER_EMAIL,
            subject,
            html: emailHtml,
        })

        if (error) {
            console.error('Failed to send feedback notification:', error)
            return {
                success: false,
                error: error.message || 'Failed to send email',
            }
        }

        return {
            success: true,
            emailId: data?.id,
        }
    } catch (error) {
        console.error('Error sending feedback notification:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
}

/**
 * Send bug report notification email to site owner
 *
 * Sends an email with bug report details.
 *
 * @param bugData - Bug report form submission data
 * @param bugId - Database ID of the bug report
 * @returns Promise resolving to send result
 */
export async function sendBugReportNotification(
    bugData: BugReportFormData,
    bugId: string
): Promise<SendEmailResult> {
    const severityEmoji =
        bugData.severity === 'critical'
            ? '🚨'
            : bugData.severity === 'high'
              ? '⚠️'
              : '🐛'
    const subject = `${severityEmoji} Bug Report [${bugData.severity?.toUpperCase()}]: ${bugData.description.slice(0, 50)}...`

    try {
        // Render email template
        const emailHtml = await render(
            BugReportNotificationEmail({
                bugData,
                submittedAt: new Date().toISOString(),
                bugId,
            })
        )

        // Send email via Resend
        const { data, error } = await resend.emails.send({
            from: env.RESEND_FROM_EMAIL,
            to: env.OWNER_EMAIL,
            subject,
            html: emailHtml,
        })

        if (error) {
            console.error('Failed to send bug report notification:', error)
            return {
                success: false,
                error: error.message || 'Failed to send email',
            }
        }

        return {
            success: true,
            emailId: data?.id,
        }
    } catch (error) {
        console.error('Error sending bug report notification:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
}
