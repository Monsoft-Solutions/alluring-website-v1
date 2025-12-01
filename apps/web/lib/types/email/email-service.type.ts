/**
 * Email Service Types
 *
 * Type definitions for email service functions and templates.
 *
 * @module lib/types/email/email-service.type
 */
import type { ContactFormData } from '../forms/contact-form.type'

/**
 * Result from sending an email
 */
export type SendEmailResult = {
    success: boolean
    emailId?: string
    error?: string
}

/**
 * Result from sending both contact form emails
 */
export type SendContactEmailsResult = {
    notificationSent: boolean
    confirmationSent: boolean
    errors: string[]
}

/**
 * Props for contact notification email template
 */
export type ContactNotificationProps = {
    contactData: ContactFormData
    submittedAt: string
}

/**
 * Props for contact confirmation email template
 */
export type ContactConfirmationProps = {
    firstName: string
    businessName: string
    businessEmail: string
    businessPhone: string
}

/**
 * Email template base props
 */
export type EmailTemplateProps = {
    preview?: string
}
