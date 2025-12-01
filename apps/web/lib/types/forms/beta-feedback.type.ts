/**
 * Beta Feedback Form Type Definitions
 *
 * Zod schemas and types for the multi-step beta feedback form.
 * Used for internal website review before launch.
 *
 * @module lib/types/forms/beta-feedback.type
 */
import { z } from 'zod'

import { emailSchema } from './contact-form.type'

/**
 * Device type options for feedback form
 */
export const DEVICE_TYPE_OPTIONS = [
    { value: 'desktop', label: 'Desktop' },
    { value: 'laptop', label: 'Laptop' },
    { value: 'tablet', label: 'Tablet' },
    { value: 'mobile-iphone', label: 'Mobile (iPhone)' },
    { value: 'mobile-android', label: 'Mobile (Android)' },
    { value: 'other', label: 'Other' },
] as const

export type DeviceType = (typeof DEVICE_TYPE_OPTIONS)[number]['value']

/**
 * Browser type options for feedback form
 */
export const BROWSER_TYPE_OPTIONS = [
    { value: 'chrome', label: 'Chrome' },
    { value: 'safari', label: 'Safari' },
    { value: 'firefox', label: 'Firefox' },
    { value: 'edge', label: 'Edge' },
    { value: 'brave', label: 'Brave' },
    { value: 'other', label: 'Other' },
] as const

export type BrowserType = (typeof BROWSER_TYPE_OPTIONS)[number]['value']

/**
 * Navigation ease options
 */
export const NAVIGATION_EASE_OPTIONS = [
    { value: 'very-easy', label: 'Yes, very easy' },
    { value: 'mostly-easy', label: 'Mostly easy' },
    { value: 'neutral', label: 'Neutral' },
    { value: 'bit-confusing', label: 'A bit confusing' },
    { value: 'very-confusing', label: 'Very confusing' },
] as const

export type NavigationEase = (typeof NAVIGATION_EASE_OPTIONS)[number]['value']

/**
 * Rating labels for 1-5 scale
 */
export const RATING_LABELS = {
    1: 'Needs major improvement',
    2: 'Below expectations',
    3: 'Meets expectations',
    4: 'Good',
    5: 'Excellent',
} as const

/**
 * Total number of steps in the feedback form
 */
export const FEEDBACK_FORM_STEPS = 7

/**
 * Step information for the feedback form
 */
export const FEEDBACK_STEP_INFO = [
    { number: 1, title: 'Introduction', icon: '📋' },
    { number: 2, title: 'Basic Information', icon: '💻' },
    { number: 3, title: 'Design & Aesthetics', icon: '🎨' },
    { number: 4, title: 'Navigation & Usability', icon: '🧭' },
    { number: 5, title: 'Content & Wording', icon: '📝' },
    { number: 6, title: 'Technical Issues', icon: '🔧' },
    { number: 7, title: 'Overall Impression', icon: '⭐' },
] as const

/**
 * Rating validation schema (1-5 integer)
 */
const ratingSchema = z
    .number()
    .int()
    .min(1, 'Please select a rating')
    .max(5, 'Rating must be between 1 and 5')

/**
 * Beta feedback form schema
 * Validates all fields across all 7 steps
 */
export const betaFeedbackFormSchema = z
    .object({
        // Section 2: Basic Information
        deviceType: z.string().min(1, 'Please select your device type'),
        deviceTypeOther: z.string().optional(),
        browserType: z.string().min(1, 'Please select your browser'),
        browserTypeOther: z.string().optional(),

        // Section 3: Design & Aesthetic Feedback
        overallDesignRating: ratingSchema,
        visualAestheticsRating: ratingSchema,
        designLikes: z.string().optional(),
        designDislikes: z.string().optional(),

        // Section 4: Navigation & Usability
        navigationEase: z.string().min(1, 'Please select an option'),
        hasBrokenLinks: z.boolean().default(false),
        brokenLinksDescription: z.string().optional(),

        // Section 5: Content & Wording Quality
        wordingClarityRating: ratingSchema,
        hasTypos: z.boolean().default(false),
        typosDescription: z.string().optional(),

        // Section 6: Performance & Technical Issues
        hasTechnicalIssues: z.boolean().default(false),
        technicalIssuesDescription: z.string().optional(),

        // Section 7: Overall Impression
        overallSatisfactionRating: ratingSchema,
        recommendations: z.string().optional(),
        wantsUxTesting: z.boolean().default(false),
        email: emailSchema,

        // Metadata (auto-filled)
        userAgent: z.string().optional(),
        pageUrl: z.string().optional(),

        // Screen & viewport dimensions
        screenWidth: z.number().int().nonnegative().optional(),
        screenHeight: z.number().int().nonnegative().optional(),
        viewportWidth: z.number().int().nonnegative().optional(),
        viewportHeight: z.number().int().nonnegative().optional(),
        devicePixelRatio: z.number().positive().optional(),

        // Environment metadata
        timezone: z.string().optional(),
        language: z.string().optional(),
        referrer: z.string().optional(),
        connectionType: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        // Validate "Other" device type requires description
        if (data.deviceType === 'other' && !data.deviceTypeOther?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Please specify your device type',
                path: ['deviceTypeOther'],
            })
        }

        // Validate "Other" browser type requires description
        if (data.browserType === 'other' && !data.browserTypeOther?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Please specify your browser',
                path: ['browserTypeOther'],
            })
        }

        // Validate broken links description when issues are reported
        if (data.hasBrokenLinks && !data.brokenLinksDescription?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Please describe the navigation issues you found',
                path: ['brokenLinksDescription'],
            })
        }

        // Validate typos description when issues are reported
        if (data.hasTypos && !data.typosDescription?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message:
                    'Please describe where you found typos or grammar issues',
                path: ['typosDescription'],
            })
        }

        // Validate technical issues description when issues are reported
        if (
            data.hasTechnicalIssues &&
            !data.technicalIssuesDescription?.trim()
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Please describe the technical issue you found',
                path: ['technicalIssuesDescription'],
            })
        }

        // Validate email is required when user wants UX testing
        if (data.wantsUxTesting && !data.email?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message:
                    'Please provide your email to participate in UX testing',
                path: ['email'],
            })
        }
    })

/**
 * Input type for beta feedback form
 */
export type BetaFeedbackFormInput = z.input<typeof betaFeedbackFormSchema>

/**
 * Output type from beta feedback form schema
 */
export type BetaFeedbackFormData = z.output<typeof betaFeedbackFormSchema>

/**
 * Default values for beta feedback form
 * Note: deviceType, browserType, and metadata fields are populated dynamically
 * via useEffect in the form component using the user-agent detection utilities.
 */
export const betaFeedbackDefaultValues: Partial<BetaFeedbackFormInput> = {
    deviceType: '',
    deviceTypeOther: '',
    browserType: '',
    browserTypeOther: '',
    overallDesignRating: 0,
    visualAestheticsRating: 0,
    designLikes: '',
    designDislikes: '',
    navigationEase: '',
    hasBrokenLinks: false,
    brokenLinksDescription: '',
    wordingClarityRating: 0,
    hasTypos: false,
    typosDescription: '',
    hasTechnicalIssues: false,
    technicalIssuesDescription: '',
    overallSatisfactionRating: 0,
    recommendations: '',
    wantsUxTesting: false,
    email: '',
    // Metadata fields (auto-populated on client)
    screenWidth: undefined,
    screenHeight: undefined,
    viewportWidth: undefined,
    viewportHeight: undefined,
    devicePixelRatio: undefined,
    timezone: undefined,
    language: undefined,
    referrer: undefined,
    connectionType: undefined,
}

/**
 * API response type for beta feedback submission
 */
export type BetaFeedbackResponse = {
    readonly success: boolean
    readonly message: string
    readonly error?: string
}
