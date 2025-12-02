/**
 * Bug Report Form Type Definitions
 *
 * Zod schemas and types for the quick bug report form.
 * Optimized for fast, low-friction bug reporting during beta testing.
 *
 * @module lib/types/forms/bug-report.type
 */
import { z } from 'zod'

import { emailSchema } from './contact-form.type'

/**
 * Bug severity levels
 */
export const BUG_SEVERITY_OPTIONS = [
    { value: 'low', label: 'Low - Minor issue, not blocking' },
    { value: 'medium', label: 'Medium - Annoying but workaround exists' },
    { value: 'high', label: 'High - Significantly impacts usability' },
    { value: 'critical', label: 'Critical - Site unusable or broken' },
] as const

export type BugSeverity = (typeof BUG_SEVERITY_OPTIONS)[number]['value']

/**
 * Bug report form schema
 */
export const bugReportFormSchema = z.object({
    // Bug details
    pageUrl: z.string().min(1, 'Page URL is required'),
    description: z
        .string()
        .trim()
        .min(10, 'Please provide at least 10 characters describing the bug'),
    stepsToReproduce: z.string().optional(),
    expectedBehavior: z.string().optional(),
    actualBehavior: z.string().optional(),
    severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),

    // Device/browser info (auto-detected but user can override)
    deviceType: z.string().optional(),
    browserType: z.string().optional(),
    browserVersion: z.string().optional(),
    screenSize: z.string().optional(),

    // Reporter info (optional)
    reporterEmail: emailSchema,
    reporterName: z.string().optional(),

    // Technical metadata (auto-filled)
    userAgent: z.string().optional(),

    // Screen & viewport dimensions (structured)
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

/**
 * Input type for bug report form (JSON data only, excludes file)
 */
export type BugReportFormInput = z.input<typeof bugReportFormSchema>

/**
 * Output type from bug report form schema
 */
export type BugReportFormData = z.output<typeof bugReportFormSchema>

/**
 * Extended form input type that includes the optional screenshot file
 * Used by the form component (client-side only)
 */
export type BugReportFormWithScreenshot = BugReportFormInput & {
    screenshot?: File | null
}

/**
 * Default values for bug report form
 * Note: Device/browser info and metadata are populated dynamically
 * via useEffect in the form component using the user-agent detection utilities.
 */
export const bugReportDefaultValues: BugReportFormWithScreenshot = {
    pageUrl: '',
    description: '',
    stepsToReproduce: '',
    expectedBehavior: '',
    actualBehavior: '',
    severity: 'medium',
    deviceType: '',
    browserType: '',
    browserVersion: '',
    screenSize: '',
    reporterEmail: '',
    reporterName: '',
    // Screenshot (optional)
    screenshot: null,
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
 * API response type for bug report submission
 */
export type BugReportResponse = {
    readonly success: boolean
    readonly message: string
    readonly error?: string
    readonly bugId?: string
}

/**
 * Helper to detect device info from user agent
 * @deprecated Use detectUserEnvironment from '@/lib/utils/user-agent.util' instead
 * for more comprehensive detection including User-Agent Client Hints.
 */
export function detectDeviceInfo(): {
    deviceType: string
    browserType: string
    browserVersion: string
    screenSize: string
} {
    if (typeof window === 'undefined') {
        return {
            deviceType: 'unknown',
            browserType: 'unknown',
            browserVersion: 'unknown',
            screenSize: 'unknown',
        }
    }

    const ua = navigator.userAgent.toLowerCase()

    // Detect device type
    // Note: UA-based laptop detection is not reliable as user agents contain OS info
    // (e.g., "Macintosh", "Windows NT") rather than device form factors.
    // Use client-side screen-size heuristics if laptop detection is required.
    let deviceType = 'desktop'
    if (/iphone/.test(ua)) {
        deviceType = 'mobile-iphone'
    } else if (/android/.test(ua) && /mobile/.test(ua)) {
        deviceType = 'mobile-android'
    } else if (/ipad/.test(ua) || (/android/.test(ua) && !/mobile/.test(ua))) {
        deviceType = 'tablet'
    }
    // All other cases (including laptops) default to 'desktop'

    // Detect browser
    let browserType = 'other'
    let browserVersion = ''

    if (/edg\//.test(ua)) {
        browserType = 'edge'
        browserVersion = ua.match(/edg\/(\d+)/)?.[1] || ''
    } else if (/chrome\//.test(ua) && !/edg/.test(ua)) {
        if (/brave/.test(ua)) {
            browserType = 'brave'
        } else {
            browserType = 'chrome'
        }
        browserVersion = ua.match(/chrome\/(\d+)/)?.[1] || ''
    } else if (/safari\//.test(ua) && !/chrome/.test(ua)) {
        browserType = 'safari'
        browserVersion = ua.match(/version\/(\d+)/)?.[1] || ''
    } else if (/firefox\//.test(ua)) {
        browserType = 'firefox'
        browserVersion = ua.match(/firefox\/(\d+)/)?.[1] || ''
    }

    // Get screen size
    const screenSize = `${window.innerWidth}x${window.innerHeight}`

    return {
        deviceType,
        browserType,
        browserVersion,
        screenSize,
    }
}
