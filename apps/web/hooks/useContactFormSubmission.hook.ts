'use client'

/**
 * Contact Form Submission Hook
 *
 * Unified hook for handling contact form submissions across the application.
 * Encapsulates API interaction, state management, UTM tracking, and optional analytics.
 *
 * @module hooks/useContactFormSubmission
 */
import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'

import { useAnalyticsEvent } from '@/lib/analytics/useAnalyticsEvent.hook'
import { useUTMTracking } from '@/lib/analytics/utm-tracking.context'
import {
    type ContactFormResponse,
    type ContactSource,
} from '@/lib/types/forms/contact-form.type'

/**
 * Submission state for the form
 */
export type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error'

/**
 * Submission state with message
 */
export type SubmissionState = {
    readonly status: SubmissionStatus
    readonly message: string
}

/**
 * Options for the useContactFormSubmission hook
 */
export type UseContactFormSubmissionOptions = {
    /** The source identifier for this form (used for backend routing) */
    readonly source: ContactSource
    /** Callback fired on successful submission */
    readonly onSuccess?: () => void
    /** Callback fired on submission error */
    readonly onError?: (error: string) => void
    /** Enable analytics tracking for form events */
    readonly enableAnalytics?: boolean
    /** Custom form name for analytics (defaults to source) */
    readonly analyticsFormName?: string
    /** Optional path to redirect to on successful submission (e.g., '/thank-you') */
    readonly redirectOnSuccess?: string
}

/**
 * Return type for the useContactFormSubmission hook
 */
export type UseContactFormSubmissionReturn = {
    /** Submit form data to the API */
    readonly submit: <T extends Record<string, unknown>>(
        data: T
    ) => Promise<boolean>
    /** Current submission state */
    readonly state: SubmissionState
    /** Whether the form is currently submitting */
    readonly isSubmitting: boolean
    /** Whether submission was successful */
    readonly isSuccess: boolean
    /** Whether there was an error */
    readonly isError: boolean
    /** Reset state back to idle */
    readonly reset: () => void
}

const INITIAL_STATE: SubmissionState = {
    status: 'idle',
    message: '',
}

/**
 * Hook for handling contact form submissions
 *
 * Provides unified submission logic, state management, and analytics tracking
 * for all contact forms in the application.
 *
 * @param options - Configuration options
 * @returns Submission utilities and state
 *
 * @example
 * ```tsx
 * const { submit, state, isSubmitting } = useContactFormSubmission({
 *   source: CONTACT_SOURCES.LEAD_FORM,
 *   enableAnalytics: true,
 *   onSuccess: () => form.reset(),
 * })
 *
 * const onSubmit = async (data: FormData) => {
 *   await submit(data)
 * }
 * ```
 */
export function useContactFormSubmission(
    options: UseContactFormSubmissionOptions
): UseContactFormSubmissionReturn {
    const {
        source,
        onSuccess,
        onError,
        enableAnalytics = false,
        analyticsFormName,
        redirectOnSuccess,
    } = options

    const [state, setState] = useState<SubmissionState>(INITIAL_STATE)
    const { track, trackFormSubmit } = useAnalyticsEvent()
    const { utmData } = useUTMTracking()
    const router = useRouter()

    const formName = analyticsFormName ?? source

    const reset = useCallback(() => {
        setState(INITIAL_STATE)
    }, [])

    const submit = useCallback(
        async <T extends Record<string, unknown>>(
            data: T
        ): Promise<boolean> => {
            // Set submitting state
            setState({ status: 'submitting', message: '' })

            // Track form start if analytics enabled
            if (enableAnalytics) {
                track('form_start', {
                    form_name: formName,
                })
            }

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...data,
                        source,
                        // Include UTM tracking data for attribution
                        ...(utmData ?? {}),
                    }),
                })

                // Handle non-OK responses before attempting JSON parse
                if (!response.ok) {
                    let errorBody: string | undefined
                    try {
                        errorBody = await response.text()
                    } catch {
                        // Ignore if we can't read the body
                    }

                    const httpError = new Error(
                        `HTTP error ${response.status}: ${response.statusText}`
                    ) as Error & {
                        status: number
                        body?: string
                        isHttpError: true
                    }
                    httpError.status = response.status
                    httpError.body = errorBody
                    httpError.isHttpError = true
                    throw httpError
                }

                // Parse JSON with explicit error handling
                let result: ContactFormResponse
                const responseText = await response.text()

                try {
                    result = JSON.parse(responseText) as ContactFormResponse
                } catch {
                    const parseError = new Error(
                        `Invalid JSON response (status ${response.status}): ${responseText.slice(0, 200)}`
                    ) as Error & { isJsonParseError: true; rawBody: string }
                    parseError.isJsonParseError = true
                    parseError.rawBody = responseText
                    throw parseError
                }

                if (result.success) {
                    setState({
                        status: 'success',
                        message: result.message,
                    })

                    // Track successful submission
                    if (enableAnalytics) {
                        trackFormSubmit(formName, { status: 'success' })
                    }

                    // Call success callback first
                    onSuccess?.()

                    // Redirect if specified
                    if (redirectOnSuccess) {
                        router.push(redirectOnSuccess)
                    }

                    return true
                }

                // API returned an error in the response body
                const errorMessage =
                    result.error ??
                    result.message ??
                    'Something went wrong. Please try again.'
                setState({
                    status: 'error',
                    message: errorMessage,
                })

                // Track form error
                if (enableAnalytics) {
                    track('form_error', {
                        form_name: formName,
                        error_type: 'api_error',
                        error_message: errorMessage,
                    })
                }

                onError?.(errorMessage)
                return false
            } catch (error) {
                // Determine error type and message
                const typedError = error as Error & {
                    isHttpError?: boolean
                    isJsonParseError?: boolean
                    status?: number
                    body?: string
                }

                let errorMessage: string
                let errorType:
                    | 'http_error'
                    | 'json_parse_error'
                    | 'network_error'

                if (typedError.isHttpError) {
                    errorType = 'http_error'
                    errorMessage =
                        'Server error. Please try again later or contact support.'
                    console.error(
                        `Contact form HTTP error (${typedError.status}):`,
                        typedError.body?.slice(0, 500)
                    )
                } else if (typedError.isJsonParseError) {
                    errorType = 'json_parse_error'
                    errorMessage =
                        'Unexpected server response. Please try again later.'
                    console.error(
                        'Contact form JSON parse error:',
                        typedError.message
                    )
                } else {
                    errorType = 'network_error'
                    errorMessage =
                        'Network error. Please check your connection and try again.'
                    console.error('Contact form network error:', error)
                }

                setState({
                    status: 'error',
                    message: errorMessage,
                })

                // Track error with specific type
                if (enableAnalytics) {
                    track('form_error', {
                        form_name: formName,
                        error_type: errorType,
                        ...(typedError.status && {
                            http_status: typedError.status,
                        }),
                    })
                }

                onError?.(errorMessage)
                return false
            }
        },
        [
            source,
            formName,
            enableAnalytics,
            track,
            trackFormSubmit,
            onSuccess,
            onError,
            utmData,
            redirectOnSuccess,
            router,
        ]
    )

    return {
        submit,
        state,
        isSubmitting: state.status === 'submitting',
        isSuccess: state.status === 'success',
        isError: state.status === 'error',
        reset,
    }
}
