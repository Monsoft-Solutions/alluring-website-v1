/**
 * Contact Form Type Definitions
 *
 * Type definitions and validation schema for contact form.
 * Supports multiple form types via 'source' field:
 * - contact-page: Full contact form (email required)
 * - blog-lead: Minimal lead capture (phone required, no email)
 * - general: Default behavior
 */
import { parsePhoneNumberWithError } from 'libphonenumber-js'
import { z } from 'zod'

/**
 * Contact form sources - identifies which form submitted the data
 */
export const CONTACT_SOURCES = {
    CONTACT_PAGE: 'contact-page',
    BLOG_LEAD: 'blog-lead',
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
 * Phone validation and transformation schema
 */
const phoneSchema = z
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
 * Base contact form schema - all fields optional initially
 * Conditional requirements are applied in the API route based on source
 */
export const contactFormSchema = z.object({
    name: z.string().trim().min(2, {
        message: 'Name must be at least 2 characters.',
    }),
    email: z
        .string()
        .trim()
        .optional()
        .superRefine((val, ctx) => {
            // Email is validated only if provided
            if (!val) {
                return
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(val)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Please enter a valid email address.',
                })
            }
        }),
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
