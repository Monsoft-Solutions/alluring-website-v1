'use client'

/**
 * Contact Form Submission Hook
 *
 * Unified hook for handling contact form submissions across the application.
 * Encapsulates API interaction, state management, and optional analytics tracking.
 *
 * @module hooks/useContactFormSubmission
 */
import { useCallback, useState } from 'react'

import { useAnalyticsEvent } from '@/lib/analytics/useAnalyticsEvent.hook'
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
    } = options

    const [state, setState] = useState<SubmissionState>(INITIAL_STATE)
    const { track, trackFormSubmit } = useAnalyticsEvent()

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
                    }),
                })

                const result: ContactFormResponse = await response.json()

                if (response.ok && result.success) {
                    setState({
                        status: 'success',
                        message: result.message,
                    })

                    // Track successful submission
                    if (enableAnalytics) {
                        trackFormSubmit(formName, { status: 'success' })
                    }

                    onSuccess?.()
                    return true
                }

                // API returned an error
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
                const errorMessage =
                    'Network error. Please check your connection and try again.'

                console.error('Contact form submission error:', error)

                setState({
                    status: 'error',
                    message: errorMessage,
                })

                // Track network error
                if (enableAnalytics) {
                    track('form_error', {
                        form_name: formName,
                        error_type: 'network_error',
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
