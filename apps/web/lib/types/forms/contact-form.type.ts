/**
 * Contact Form Type Definitions
 *
 * Type definitions and validation schema for contact form.
 * Supports multiple form types via 'source' field:
 * - contact-page: Full contact form (email required)
 * - contact-hero: Hero section contact form (email required)
 * - blog-lead: Minimal lead capture (phone required, no email)
 * - exit-intent: Exit intent popup (phone required)
 * - lead-form: Home page lead form (phone required)
 * - footer: Footer contact form
 * - general: Default behavior
 */
import { parsePhoneNumberWithError } from 'libphonenumber-js'
import { z } from 'zod'

/**
 * Contact form sources - identifies which form submitted the data
 */
export const CONTACT_SOURCES = {
    CONTACT_PAGE: 'contact-page',
    CONTACT_HERO: 'contact-hero',
    BLOG_LEAD: 'blog-lead',
    EXIT_INTENT: 'exit-intent',
    LEAD_FORM: 'lead-form',
    FOOTER: 'footer',
    GENERAL: 'general',
} as const

export type ContactSource =
    (typeof CONTACT_SOURCES)[keyof typeof CONTACT_SOURCES]

/**
 * Helper for optional trimmed strings with minimum length
 */
const optionalTrimmedString = (minLength: number, message: string) =>
    z
        .string()
        .trim()
        .optional()
        .superRefine((val, ctx) => {
            if (!val) {
                return
            }

            if (val.length < minLength) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message,
                })
            }
        })

/**
 * Email validation schema
 * Enhanced validation with proper domain structure checking
 * Exported for reuse in client components
 */
export const emailSchema = z
    .string()
    .trim()
    .optional()
    .superRefine((val, ctx) => {
        if (!val) {
            return
        }

        // RFC 5322 simplified email regex with domain validation
        const emailRegex =
            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/
        if (!emailRegex.test(val)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Please enter a valid email address.',
            })
            return
        }

        // Ensure TLD is at least 2 characters
        const parts = val.split('@')
        const domain = parts[1]
        if (domain) {
            const tld = domain.split('.').pop()
            if (!tld || tld.length < 2) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Please enter a valid email address.',
                })
            }
        }
    })

/**
 * Required email validation schema
 * For forms where email is mandatory
 */
export const requiredEmailSchema = z
    .string()
    .trim()
    .min(1, 'Email is required.')
    .superRefine((val, ctx) => {
        const emailRegex =
            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/
        if (!emailRegex.test(val)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Please enter a valid email address.',
            })
            return
        }

        const parts = val.split('@')
        const domain = parts[1]
        if (domain) {
            const tld = domain.split('.').pop()
            if (!tld || tld.length < 2) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Please enter a valid email address.',
                })
            }
        }
    })

/**
 * Phone validation and transformation schema
 * Validates US phone numbers and transforms to E.164 format (+1XXXXXXXXXX)
 * Exported for reuse in client components
 */
export const phoneSchema = z
    .string()
    .trim()
    .optional()
    .superRefine((val, ctx) => {
        if (!val) {
            return
        }

        const allowedCharactersPattern = /^[0-9()+\-\s.]*$/
        if (!allowedCharactersPattern.test(val)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message:
                    'Phone number can only include digits, spaces, parentheses, periods, plus and hyphen symbols.',
            })
            return
        }

        const plusIndex = val.indexOf('+')
        if (
            plusIndex > 0 ||
            (plusIndex === 0 && !val.trim().startsWith('+1'))
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message:
                    'Please enter a US phone number without international dialing codes.',
            })
            return
        }

        const digitsOnly = val.replace(/\D/g, '')
        if (!/^(1)?\d{10}$/.test(digitsOnly)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Please enter a valid US phone number with 10 digits.',
            })
            return
        }

        const normalizedDigits =
            digitsOnly.length === 11 && digitsOnly.startsWith('1')
                ? digitsOnly.slice(1)
                : digitsOnly

        try {
            const parsedNumber = parsePhoneNumberWithError(
                normalizedDigits,
                'US'
            )

            if (!parsedNumber.isValid() || parsedNumber.country !== 'US') {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Please enter a valid US phone number.',
                })
            }
        } catch {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Please enter a valid US phone number.',
            })
        }
    })
    .transform((val) => {
        if (!val) {
            return undefined
        }

        const digitsOnly = val.replace(/\D/g, '')
        const normalizedDigits =
            digitsOnly.length === 11 && digitsOnly.startsWith('1')
                ? digitsOnly.slice(1)
                : digitsOnly

        return normalizedDigits.length === 10
            ? `+1${normalizedDigits}`
            : undefined
    })

/**
 * Required phone validation schema
 * For forms where phone is mandatory (lead capture forms)
 */
export const requiredPhoneSchema = z
    .string()
    .trim()
    .min(1, 'Phone number is required.')
    .superRefine((val, ctx) => {
        const allowedCharactersPattern = /^[0-9()+\-\s.]*$/
        if (!allowedCharactersPattern.test(val)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message:
                    'Phone number can only include digits, spaces, parentheses, periods, plus and hyphen symbols.',
            })
            return
        }

        const plusIndex = val.indexOf('+')
        if (
            plusIndex > 0 ||
            (plusIndex === 0 && !val.trim().startsWith('+1'))
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message:
                    'Please enter a US phone number without international dialing codes.',
            })
            return
        }

        const digitsOnly = val.replace(/\D/g, '')
        if (!/^(1)?\d{10}$/.test(digitsOnly)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Please enter a valid US phone number with 10 digits.',
            })
            return
        }

        const normalizedDigits =
            digitsOnly.length === 11 && digitsOnly.startsWith('1')
                ? digitsOnly.slice(1)
                : digitsOnly

        try {
            const parsedNumber = parsePhoneNumberWithError(
                normalizedDigits,
                'US'
            )

            if (!parsedNumber.isValid() || parsedNumber.country !== 'US') {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Please enter a valid US phone number.',
                })
            }
        } catch {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Please enter a valid US phone number.',
            })
        }
    })
    .transform((val) => {
        const digitsOnly = val.replace(/\D/g, '')
        const normalizedDigits =
            digitsOnly.length === 11 && digitsOnly.startsWith('1')
                ? digitsOnly.slice(1)
                : digitsOnly

        return normalizedDigits.length === 10 ? `+1${normalizedDigits}` : val
    })

/**
 * Name validation schema
 * Exported for reuse in client components
 */
export const nameSchema = z.string().trim().min(2, {
    message: 'Name must be at least 2 characters.',
})

/**
 * Base contact form schema - all fields optional initially
 * Conditional requirements are applied in the API route based on source
 */
export const contactFormSchema = z.object({
    name: nameSchema,
    email: emailSchema,
    phone: phoneSchema,
    subject: optionalTrimmedString(3, 'Subject must be at least 3 characters.'),
    message: optionalTrimmedString(
        10,
        'Message must be at least 10 characters.'
    ),
    source: z.string().optional(),
})

/**
 * Input type for contact form (what the form fields accept)
 * Used by react-hook-form for form state management
 */
export type ContactFormInput = z.input<typeof contactFormSchema>

/**
 * Output type from contact form schema (after transforms/validation)
 * This is what you get after parsing with contactFormSchema.parse()
 */
export type ContactFormData = z.output<typeof contactFormSchema>

/**
 * API response type for contact form submission
 */
export interface ContactFormResponse {
    readonly success: boolean
    readonly message: string
    readonly error?: string
}

/**
 * Lead capture schema - minimal fields for conversion-focused forms
 * Used by: BlogCTA footer, ExitIntentPopup, LeadForm
 */
export const leadCaptureSchema = z.object({
    name: nameSchema,
    phone: requiredPhoneSchema,
})

export type LeadCaptureInput = z.input<typeof leadCaptureSchema>
export type LeadCaptureData = z.output<typeof leadCaptureSchema>
