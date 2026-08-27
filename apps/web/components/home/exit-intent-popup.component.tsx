/**
 * ExitIntentPopup Component
 *
 * Trigger shim for the exit-intent lead capture popup. Owns *when* the popup
 * opens; the panel itself lives in `exit-intent-dialog.component.tsx` and is
 * fetched only once a trigger fires.
 *
 * Features:
 * - Triggers when mouse leaves top of viewport (exit intent)
 * - Triggers automatically after 60 seconds
 * - Session-based dismissal tracking
 *
 * This file is rendered from the root layout, so everything it imports is in
 * the shared chunk of every route. It is deliberately kept to React, the
 * analytics hook and the form-event bus — no form stack, no animation
 * library. Moving the dialog behind `next/dynamic` and rendering it only once a
 * trigger fires took react-hook-form, zod, @hookform/resolvers and Radix Form
 * off the critical path of every page on the site (issue #199).
 */
'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useRef, useState } from 'react'

import { LazyBoundary } from '@/components/shared/lazy-boundary.component'
import { useAnalyticsEvent } from '@/lib/analytics/useAnalyticsEvent.hook'
import {
    FORM_SUBMITTED_KEY,
    useFormSubmittedListener,
} from '@/lib/events/form-events'

/** Fetched on first render of the dialog — i.e. when a trigger fires. */
const ExitIntentDialog = dynamic(
    () =>
        import('./exit-intent-dialog.component').then(
            (m) => m.ExitIntentDialog
        ),
    { ssr: false }
)

const POPUP_SEEN_KEY = 'alluring_popup_seen'
const TIMER_TRIGGER_MS = 60_000

type TriggerType = 'exit_intent' | 'timer_60s'

export const ExitIntentPopup = () => {
    const [trigger, setTrigger] = useState<TriggerType | null>(null)

    // Initialize hasTriggered by checking sessionStorage
    // This prevents showing popup if user has seen it or submitted any form
    const [hasTriggered, setHasTriggered] = useState(() => {
        if (typeof window === 'undefined') return false
        const hasSeen = sessionStorage.getItem(POPUP_SEEN_KEY)
        const hasSubmittedForm = sessionStorage.getItem(FORM_SUBMITTED_KEY)
        return Boolean(hasSeen || hasSubmittedForm)
    })

    // Ref to track current hasTriggered value, avoiding stale closure in timer callback
    const hasTriggeredRef = useRef(hasTriggered)

    // Keep ref in sync with state
    useEffect(() => {
        hasTriggeredRef.current = hasTriggered
    }, [hasTriggered])

    // Listen for form submissions from ANY form in the app
    // This handles the case where user submits a form elsewhere (e.g., PromoModal)
    // and we need to prevent this popup from showing on the thank-you page
    useFormSubmittedListener(
        useCallback(() => {
            setHasTriggered(true)
            hasTriggeredRef.current = true
            setTrigger(null) // Close if currently open
        }, [])
    )

    const { track } = useAnalyticsEvent()

    const handleClose = useCallback(() => {
        track('exit_intent_dismissed', {
            method: 'close_button',
        })
        setTrigger(null)
        if (typeof window !== 'undefined') {
            sessionStorage.setItem(POPUP_SEEN_KEY, 'true')
        }
    }, [track])

    useEffect(() => {
        // Don't attach listeners if already triggered
        if (hasTriggered) return

        const open = (triggerType: TriggerType) => {
            setTrigger(triggerType)
            setHasTriggered(true)
            hasTriggeredRef.current = true
        }

        const handleExitIntent = (e: MouseEvent) => {
            // Trigger when mouse leaves top of viewport (exit intent)
            // Use ref to get current value and avoid stale closure
            if (e.clientY <= 0 && !hasTriggeredRef.current) {
                open('exit_intent')
            }
        }

        // Timer-based trigger: Show after 60 seconds
        // Use ref instead of state to avoid stale closure issue
        const timer = setTimeout(() => {
            if (!hasTriggeredRef.current) {
                open('timer_60s')
            }
        }, TIMER_TRIGGER_MS)

        document.addEventListener('mouseleave', handleExitIntent)

        return () => {
            document.removeEventListener('mouseleave', handleExitIntent)
            clearTimeout(timer)
        }
    }, [hasTriggered])

    if (!trigger) return null

    return (
        <LazyBoundary label='ExitIntentDialog'>
            <ExitIntentDialog triggerType={trigger} onClose={handleClose} />
        </LazyBoundary>
    )
}
