/**
 * Form Events - Custom event system for cross-component communication
 *
 * This module provides a way to notify all floating modals (ExitIntentPopup, PromoModal)
 * when a form is submitted from ANY location in the app, preventing them from showing
 * on the thank-you page after form submission.
 *
 * @module lib/events/form-events
 */

import { useEffect } from 'react'

/**
 * Custom event name for form submission notification
 */
export const FORM_SUBMITTED_EVENT = 'alluring:form-submitted'

/**
 * SessionStorage key to track if user has submitted any form.
 * Used to prevent showing additional lead capture popups/modals.
 *
 * It lives here rather than beside the submission hook so that the popup
 * trigger shims can read it without importing the hook — which would pull
 * `contact-form.type`, and with it zod, back into the root layout's bundle
 * (issue #199).
 */
export const FORM_SUBMITTED_KEY = 'alluring_form_submitted'

/**
 * Dispatches a custom event to notify all listeners that a form has been submitted.
 * Call this after setting sessionStorage to ensure all modals are notified immediately.
 */
export function dispatchFormSubmitted(): void {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(FORM_SUBMITTED_EVENT))
    }
}

/**
 * Hook to listen for form submission events.
 * The callback will be memoized, so pass a stable callback (wrapped in useCallback).
 *
 * @param callback - Function to call when a form is submitted
 *
 * @example
 * ```tsx
 * useFormSubmittedListener(useCallback(() => {
 *   setHasTriggered(true)
 *   setIsVisible(false)
 * }, []))
 * ```
 */
export function useFormSubmittedListener(callback: () => void): void {
    useEffect(() => {
        window.addEventListener(FORM_SUBMITTED_EVENT, callback)
        return () => window.removeEventListener(FORM_SUBMITTED_EVENT, callback)
    }, [callback])
}
