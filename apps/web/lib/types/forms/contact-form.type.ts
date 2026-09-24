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
 * - specials-page: Specials landing page consultation form
 * - landing-page: Lead generation landing page consultation form
 * - home-page: Home page consultation thread (phone required)
 */
import { parsePhoneNumberWithError } from 'libphonenumber-js'
import { z } from 'zod'

import {
    LEAD_CONSULT_TYPES,
    LEAD_FINANCING_INTEREST,
    LEAD_HEARD_FROM,
    LEAD_LANGUAGES,
    LEAD_TEXT_TIMES,
} from '@/lib/constants/lead-fields'

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
    PROMO_MODAL: 'promo-modal',
    SPECIALS_PAGE: 'specials-page',
    HOME_PAGE: 'home-page',
    BMI_CALCULATOR: 'bmi-calculator',
    LANDING_PAGE: 'landing-page',
    PROCEDURE_PAGE: 'procedure-page',
    QUIZ: 'quiz',
    DR_KARLINSKY_LANDING: 'dr-karlinsky-landing',
    MELISSA_JUVIER_LANDING: 'melissa-juvier-landing',
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
 * First name validation schema
 */
export const firstNameSchema = z.string().trim().min(1, {
    message: 'First name is required.',
})

/**
 * Last name validation schema
 */
export const lastNameSchema = z.string().trim().min(1, {
    message: 'Last name is required.',
})

/**
 * Preferred contact time options
 */
export const PREFERRED_CONTACT_TIME_OPTIONS = [
    { value: '', label: 'Select preferred time' },
    { value: 'morning', label: '9am - 12pm' },
    { value: 'afternoon', label: '12pm - 5pm' },
    { value: 'evening', label: '5pm - 7pm' },
] as const

export type PreferredContactTime = 'morning' | 'afternoon' | 'evening' | ''

/**
 * Preferred contact time validation schema
 */
export const preferredContactTimeSchema = z
    .enum(['', 'morning', 'afternoon', 'evening'])
    .optional()

/**
 * Consent validation schema
 * Requires explicit consent (must be true)
 */
export const consentSchema = z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms to continue.',
})

/** Optional context that is stored when well formed and dropped otherwise. */
const leadContext = <T extends z.ZodType>(schema: T) =>
    schema.optional().catch(undefined)

/**
 * Base contact form schema - all fields optional initially
 * Conditional requirements are applied in the API route based on source
 */
export const contactFormSchema = z.object({
    name: nameSchema,
    firstName: firstNameSchema.optional(),
    lastName: lastNameSchema.optional(),
    email: emailSchema,
    phone: phoneSchema,
    subject: optionalTrimmedString(3, 'Subject must be at least 3 characters.'),
    message: optionalTrimmedString(
        10,
        'Message must be at least 10 characters.'
    ),
    procedure: z.string().optional(),
    preferredContactTime: preferredContactTimeSchema,
    consentGiven: z.boolean().optional(),
    source: z.string().optional(),

    // UTM tracking fields (automatically populated by UTMTrackingProvider)
    utmSource: z.string().optional(),
    utmMedium: z.string().optional(),
    utmCampaign: z.string().optional(),
    utmContent: z.string().optional(),
    utmTerm: z.string().optional(),

    // Ad platform click IDs
    gclid: z.string().optional(),
    gbraid: z.string().max(512).optional(),
    wbraid: z.string().max(512).optional(),
    gadCampaignId: z.string().max(64).optional(),
    fbclid: z.string().optional(),
    ttclid: z.string().optional(),
    // Meta pixel cookies (`_fbp`, `_fbc`)
    fbp: z.string().max(256).optional(),
    fbc: z.string().max(512).optional(),

    // Session context
    referrer: z.string().optional(),
    landingPage: z.string().optional(),
    submittedFromPath: z.string().max(512).optional(),
    gaClientId: z.string().max(64).optional(),

    // Consultation thread context (#274). A malformed value is dropped
    // rather than rejected: none of these is worth losing a lead over.
    timeline: leadContext(z.string().trim().min(1).max(40)),
    language: leadContext(z.enum(LEAD_LANGUAGES)),
    offer: leadContext(z.string().trim().min(1).max(200)),
    timeZone: leadContext(
        z
            .string()
            .max(64)
            .regex(/^[A-Za-z][A-Za-z0-9_+\-/]*$/)
    ),

    // Anti-spam honeypot
    _website: z.string().optional(),
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
    /**
     * The saved lead and a short-lived token that lets the thank-you page
     * add optional answers to it (#274). Absent when updates are disabled.
     */
    readonly lead?: {
        readonly id: string
        readonly token: string
    }
}

/**
 * Optional answers the thank-you page adds to a lead it just created (#274).
 * Each request carries one or more answers; the token proves the visitor
 * is the one who sent the lead.
 */
export const leadUpdateSchema = z
    .object({
        id: z.uuid(),
        token: z.string().min(1).max(200),
        email: emailSchema,
        consultType: z.enum(LEAD_CONSULT_TYPES).optional(),
        financingInterest: z.enum(LEAD_FINANCING_INTEREST).optional(),
        preferredContactTime: z.enum(LEAD_TEXT_TIMES).optional(),
        heardFrom: z.enum(LEAD_HEARD_FROM).optional(),
    })
    .refine(
        ({
            email,
            consultType,
            financingInterest,
            preferredContactTime,
            heardFrom,
        }) =>
            Boolean(
                email ||
                    consultType ||
                    financingInterest ||
                    preferredContactTime ||
                    heardFrom
            ),
        { message: 'Nothing to update.' }
    )

export type LeadUpdateInput = z.input<typeof leadUpdateSchema>
export type LeadUpdateData = z.output<typeof leadUpdateSchema>

/**
 * Procedure options for consultation forms
 */
export const PROCEDURE_OPTIONS = [
    { value: '', label: 'Select a procedure of interest' },
    { value: 'bbl', label: 'Brazilian Butt Lift (BBL)' },
    { value: 'mommy-makeover', label: 'Mommy Makeover' },
    { value: 'breast-augmentation', label: 'Breast Augmentation' },
    { value: 'breast-lift', label: 'Breast Lift' },
    { value: 'breast-reduction', label: 'Breast Reduction' },
    { value: 'tummy-tuck', label: 'Tummy Tuck' },
    { value: 'liposuction', label: 'Liposuction / Lipo 360' },
    { value: 'facelift', label: 'Facelift' },
    { value: 'blepharoplasty', label: 'Eyelid Surgery (Blepharoplasty)' },
    { value: 'multiple', label: 'Multiple Procedures' },
    { value: 'other', label: 'Other / Not Sure Yet' },
] as const

/**
 * Maps procedure page slugs to form procedure values
 * Used to pre-populate the procedure dropdown on procedure pages
 */
export const PROCEDURE_SLUG_TO_FORM_VALUE: Record<string, string> = {
    'breast-augmentation-miami': 'breast-augmentation',
    'breast-lift-miami': 'breast-lift',
    'breast-reduction-miami': 'breast-reduction',
    'liposuction-miami': 'liposuction',
    'brazilian-butt-lift-bbl-miami': 'bbl',
    'tummy-tuck-miami': 'tummy-tuck',
    'mommy-makeover-miami': 'mommy-makeover',
    'facelift-miami': 'facelift',
    'blepharoplasty-miami': 'blepharoplasty',
}

/**
 * Gets the form procedure value for a given procedure slug
 * Returns empty string if no mapping exists
 */
export function getProcedureFormValue(slug: string): string {
    return PROCEDURE_SLUG_TO_FORM_VALUE[slug] ?? ''
}

/**
 * Consultation form schema
 * Used by the shared ConsultationForm component
 * Requires: firstName, lastName, email, phone, consent
 * Optional: procedure, preferredContactTime
 */
export const consultationFormSchema = z.object({
    firstName: firstNameSchema,
    lastName: lastNameSchema,
    email: requiredEmailSchema,
    phone: requiredPhoneSchema,
    procedure: z.string().optional(),
    preferredContactTime: preferredContactTimeSchema,
    consentGiven: consentSchema,
    _website: z.string().optional(),
})

export type ConsultationFormInput = z.input<typeof consultationFormSchema>
export type ConsultationFormData = z.output<typeof consultationFormSchema>

/**
 * Compact consultation form schema
 * Mobile-first variant for warm-traffic landing pages where every
 * field cut compounds into a higher submit rate. Only firstName,
 * phone, and consent are required. lastName/email are dropped from
 * the UI entirely (callback will capture what we need).
 */
export const consultationFormCompactSchema = z.object({
    firstName: firstNameSchema,
    lastName: lastNameSchema.optional(),
    email: emailSchema,
    phone: requiredPhoneSchema,
    procedure: z.string().optional(),
    preferredContactTime: preferredContactTimeSchema,
    consentGiven: consentSchema,
    _website: z.string().optional(),
})

/**
 * Lead capture schema - minimal fields for conversion-focused forms
 * Used by: BlogCTA footer and the landing pages' mini captures
 * Name is optional to minimize friction in lead capture forms
 */
export const leadCaptureSchema = z.object({
    name: nameSchema.optional(),
    phone: requiredPhoneSchema,
    _website: z.string().optional(),
})

export type LeadCaptureInput = z.input<typeof leadCaptureSchema>
export type LeadCaptureData = z.output<typeof leadCaptureSchema>
