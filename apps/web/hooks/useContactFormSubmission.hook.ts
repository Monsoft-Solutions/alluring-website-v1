'use client'

/**
 * Contact Form Submission Hook
 *
 * Unified hook for handling contact form submissions across the application.
 * Encapsulates API interaction, state management, UTM tracking, and optional analytics.
 *
 * @module hooks/useContactFormSubmission
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import {
    LEAD_FORM_EVENTS,
    readGaClientId,
    trackLeadFormEvent,
} from '@/lib/analytics/lead-form-tracking'
import { useAnalyticsEvent } from '@/lib/analytics/useAnalyticsEvent.hook'
import { useUTMTracking } from '@/lib/analytics/utm-tracking.context'
import {
    dispatchFormSubmitted,
    FORM_SUBMITTED_KEY,
} from '@/lib/events/form-events'
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
    /**
     * Enable the legacy `form_submit` event (a GA4 key event). The
     * `lead_*` funnel events are always sent.
     */
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
    /**
     * Attach to the `<form>` element (or, for a chat-style form whose
     * answers sit outside it, the element that wraps the whole thread):
     * reports `lead_form_view` when it is half in view and
     * `lead_form_start` on the first interaction.
     */
    readonly formRef: (element: HTMLElement | null) => void
    /**
     * Report a failed validation pass as `lead_submit_error`. Pass the
     * field names that failed (React Hook Form's `onInvalid` errors object
     * works as-is) — names only, never values.
     */
    readonly trackValidationErrors: (
        fields: readonly string[] | Record<string, unknown>
    ) => void
}

const isFieldList = (
    fields: readonly string[] | Record<string, unknown>
): fields is readonly string[] => Array.isArray(fields)

/** Fraction of the form that must be on screen to count as seen. */
const FORM_VIEW_THRESHOLD = 0.5
const FORM_START_EVENTS = ['focusin', 'pointerdown', 'input'] as const

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
    const { trackFormSubmit } = useAnalyticsEvent()
    const { utmData } = useUTMTracking()
    const router = useRouter()
    const formLoadedAt = useRef(Date.now())

    const formName = analyticsFormName ?? source

    const reset = useCallback(() => {
        setState(INITIAL_STATE)
    }, [])

    // Funnel milestones fire once per mounted form.
    const hasViewed = useRef(false)
    const hasStarted = useRef(false)
    const detachFormListeners = useRef<(() => void) | null>(null)

    const formRef = useCallback(
        (element: HTMLElement | null) => {
            detachFormListeners.current?.()
            detachFormListeners.current = null
            if (!element) return

            const cleanups: Array<() => void> = []

            if (!hasViewed.current && 'IntersectionObserver' in window) {
                const observer = new IntersectionObserver(
                    (entries) => {
                        if (entries.some((entry) => entry.isIntersecting)) {
                            hasViewed.current = true
                            trackLeadFormEvent(LEAD_FORM_EVENTS.VIEW, formName)
                            observer.disconnect()
                        }
                    },
                    { threshold: FORM_VIEW_THRESHOLD }
                )
                observer.observe(element)
                cleanups.push(() => observer.disconnect())
            }

            if (!hasStarted.current) {
                const onStart = () => {
                    if (hasStarted.current) return
                    hasStarted.current = true
                    trackLeadFormEvent(LEAD_FORM_EVENTS.START, formName)
                    removeStartListeners()
                }
                const removeStartListeners = () => {
                    for (const type of FORM_START_EVENTS) {
                        element.removeEventListener(type, onStart)
                    }
                }
                for (const type of FORM_START_EVENTS) {
                    element.addEventListener(type, onStart, { passive: true })
                }
                cleanups.push(removeStartListeners)
            }

            detachFormListeners.current = () => {
                for (const cleanup of cleanups) cleanup()
            }
        },
        [formName]
    )

    useEffect(() => () => detachFormListeners.current?.(), [])

    const trackValidationErrors = useCallback(
        (fields: readonly string[] | Record<string, unknown>) => {
            // `Array.isArray` narrows a readonly array to `any[]`.
            const names: readonly string[] = isFieldList(fields)
                ? fields
                : Object.keys(fields)
            if (names.length === 0) return
            trackLeadFormEvent(LEAD_FORM_EVENTS.SUBMIT_ERROR, formName, {
                error_type: 'validation',
                field: [...names].sort().join(','),
            })
        },
        [formName]
    )

    const submit = useCallback(
        async <T extends Record<string, unknown>>(
            data: T
        ): Promise<boolean> => {
            // Set submitting state
            setState({ status: 'submitting', message: '' })

            trackLeadFormEvent(LEAD_FORM_EVENTS.SUBMIT_ATTEMPT, formName)

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        // Anti-spam: default honeypot value (overridden by form's registered field)
                        _website: '',
                        ...data,
                        source,
                        _formLoadedAt: formLoadedAt.current,
                        submittedFromPath: window.location.pathname,
                        gaClientId: readGaClientId(),
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

                    // Mark that user has submitted a form this session
                    // This prevents additional lead capture popups/modals from showing
                    if (typeof window !== 'undefined') {
                        sessionStorage.setItem(FORM_SUBMITTED_KEY, 'true')
                        // Dispatch custom event to immediately notify all floating modals
                        // This prevents stale closure issues where modals check sessionStorage only on mount
                        dispatchFormSubmitted()
                    }

                    trackLeadFormEvent(
                        LEAD_FORM_EVENTS.SUBMIT_SUCCESS,
                        formName
                    )
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

                trackLeadFormEvent(LEAD_FORM_EVENTS.SUBMIT_ERROR, formName, {
                    error_type: 'api_error',
                })

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

                trackLeadFormEvent(LEAD_FORM_EVENTS.SUBMIT_ERROR, formName, {
                    error_type: errorType,
                })

                onError?.(errorMessage)
                return false
            }
        },
        [
            source,
            formName,
            enableAnalytics,
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
        formRef,
        trackValidationErrors,
    }
}
