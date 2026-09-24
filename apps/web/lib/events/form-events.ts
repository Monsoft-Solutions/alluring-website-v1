/**
 * Form Events - Custom event system for cross-component communication
 *
 * Lets the lead popups (`components/lead-popups`) react to what the visitor
 * does in ANY form in the app: a successful submission closes them for good,
 * and starting a form keeps the timed popup from opening over it.
 *
 * @module lib/events/form-events
 */

import { useEffect } from 'react'

/**
 * Custom event name for form submission notification
 */
export const FORM_SUBMITTED_EVENT = 'alluring:form-submitted'

/** Fired the first time the visitor interacts with a lead form on the page. */
export const FORM_STARTED_EVENT = 'alluring:form-started'

/**
 * `localStorage` key marking a visitor who has sent a lead. Once set, the
 * lead popups never open again in this browser: a converted lead is in the
 * CRM and gets a text, not another form. The value is the ISO time of the
 * first conversion.
 *
 * It lives here rather than beside the submission hook so that the popup
 * trigger shim can read it without importing the hook — which would pull
 * `contact-form.type`, and with it zod, back into the root layout's bundle
 * (issue #199).
 */
export const LEAD_CONVERTED_KEY = 'alluring_lead_converted'

/**
 * The per-tab marker this module used before conversions were remembered
 * across visits. Still read, so a tab that converted before the switch stays
 * quiet.
 */
const LEGACY_FORM_SUBMITTED_KEY = 'alluring_form_submitted'

/**
 * Remembers that this browser has sent a lead and tells every open popup.
 * Other open tabs hear it through the `storage` event.
 */
export function markLeadConverted(): void {
    if (typeof window === 'undefined') return
    try {
        if (!window.localStorage.getItem(LEAD_CONVERTED_KEY)) {
            window.localStorage.setItem(
                LEAD_CONVERTED_KEY,
                new Date().toISOString()
            )
        }
    } catch {
        // Storage blocked (private mode, full quota): the event below still
        // closes the popups for this page view.
    }
    window.dispatchEvent(new CustomEvent(FORM_SUBMITTED_EVENT))
}

/** Whether this browser has sent a lead, in this visit or any earlier one. */
export function hasLeadConverted(): boolean {
    if (typeof window === 'undefined') return false
    try {
        return Boolean(
            window.localStorage.getItem(LEAD_CONVERTED_KEY) ||
                window.sessionStorage.getItem(LEGACY_FORM_SUBMITTED_KEY)
        )
    } catch {
        return false
    }
}

/** Tells the lead popups the visitor has started filling in a form. */
export function dispatchFormStarted(): void {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(FORM_STARTED_EVENT))
    }
}

/**
 * Hook to listen for form submission events, in this tab or another one.
 * The callback will be memoized, so pass a stable callback (wrapped in useCallback).
 *
 * @param callback - Function to call when a form is submitted. It receives
 * the event: a `StorageEvent` when the lead was sent from another tab.
 *
 * @example
 * ```tsx
 * useFormSubmittedListener(useCallback(() => {
 *   setHasTriggered(true)
 *   setIsVisible(false)
 * }, []))
 * ```
 */
export function useFormSubmittedListener(
    callback: (event: Event) => void
): void {
    useEffect(() => {
        const onStorage = (event: StorageEvent) => {
            if (event.key === LEAD_CONVERTED_KEY && event.newValue) {
                callback(event)
            }
        }
        window.addEventListener(FORM_SUBMITTED_EVENT, callback)
        window.addEventListener('storage', onStorage)
        return () => {
            window.removeEventListener(FORM_SUBMITTED_EVENT, callback)
            window.removeEventListener('storage', onStorage)
        }
    }, [callback])
}
