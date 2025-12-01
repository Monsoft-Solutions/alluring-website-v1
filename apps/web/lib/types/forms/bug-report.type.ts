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
})

/**
 * Input type for bug report form
 */
export type BugReportFormInput = z.input<typeof bugReportFormSchema>

/**
 * Output type from bug report form schema
 */
export type BugReportFormData = z.output<typeof bugReportFormSchema>

/**
 * Default values for bug report form
 */
export const bugReportDefaultValues: Partial<BugReportFormInput> = {
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
    let deviceType = 'desktop'
    if (/iphone/.test(ua)) {
        deviceType = 'mobile-iphone'
    } else if (/android/.test(ua) && /mobile/.test(ua)) {
        deviceType = 'mobile-android'
    } else if (/ipad/.test(ua) || (/android/.test(ua) && !/mobile/.test(ua))) {
        deviceType = 'tablet'
    } else if (/macbook|laptop/.test(ua)) {
        deviceType = 'laptop'
    }

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
