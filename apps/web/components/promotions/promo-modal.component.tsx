/**
 * PromoModal Component
 *
 * Trigger shim for the timed promotion modal. Owns *when* the modal opens —
 * a per-promotion delay plus sessionStorage dismissal tracking — while the
 * modal itself lives in `promo-modal-dialog.component.tsx` and is fetched
 * only once the delay elapses.
 *
 * Features:
 * - Configurable delay per promotion (modalDelaySeconds)
 * - SessionStorage tracking (per promotion ID)
 * - Suppressed when any form elsewhere in the app has been submitted
 *
 * This file is mounted from the root layout, so everything it imports lands
 * in the shared chunk of every route. It is deliberately kept to React and
 * the form-event bus — no form stack, no animation library. Rendering the
 * dialog through `next/dynamic` only after `isVisible` flips is what takes
 * react-hook-form, zod, @hookform/resolvers and Radix Form off the critical
 * path of every page (issue #199).
 */
'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useRef, useState } from 'react'

import { LazyBoundary } from '@/components/shared/lazy-boundary.component'
import {
    FORM_SUBMITTED_KEY,
    useFormSubmittedListener,
} from '@/lib/events/form-events'

import type { PromoModalData } from './promo-modal.type'

/** Fetched on first render of the dialog — i.e. when the delay elapses. */
const PromoModalDialog = dynamic(
    () =>
        import('./promo-modal-dialog.component').then(
            (m) => m.PromoModalDialog
        ),
    { ssr: false }
)

type PromoModalProps = {
    promotion: PromoModalData
}

const STORAGE_KEY_PREFIX = 'promo_modal_seen_'
const DEFAULT_DELAY_SECONDS = 60

export function PromoModal({ promotion }: PromoModalProps) {
    const [isVisible, setIsVisible] = useState(false)

    const storageKey = `${STORAGE_KEY_PREFIX}${promotion.id}`

    // Initialize hasTriggered by checking sessionStorage
    // This prevents showing modal if user has seen it or submitted any form
    const [hasTriggered, setHasTriggered] = useState(() => {
        if (typeof window === 'undefined') return false
        const hasSeen = sessionStorage.getItem(storageKey)
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
    // This handles the case where user submits a form elsewhere (e.g., ExitIntentPopup)
    // and we need to prevent this modal from showing on the thank-you page
    useFormSubmittedListener(
        useCallback(() => {
            setHasTriggered(true)
            hasTriggeredRef.current = true
            setIsVisible(false) // Close if currently open
        }, [])
    )

    const handleClose = useCallback(() => {
        setIsVisible(false)
        if (typeof window !== 'undefined') {
            sessionStorage.setItem(storageKey, 'true')
        }
    }, [storageKey])

    useEffect(() => {
        // Don't set timer if already triggered
        if (hasTriggered) return

        // Set timer based on promotion's modalDelaySeconds
        const delayMs =
            (promotion.modalDelaySeconds ?? DEFAULT_DELAY_SECONDS) * 1000

        // Use ref instead of state to avoid stale closure issue
        const timer = setTimeout(() => {
            if (!hasTriggeredRef.current) {
                setIsVisible(true)
                setHasTriggered(true)
                hasTriggeredRef.current = true
            }
        }, delayMs)

        return () => clearTimeout(timer)
    }, [hasTriggered, promotion.modalDelaySeconds])

    if (!isVisible) return null

    return (
        <LazyBoundary label='PromoModalDialog'>
            <PromoModalDialog promotion={promotion} onClose={handleClose} />
        </LazyBoundary>
    )
}
