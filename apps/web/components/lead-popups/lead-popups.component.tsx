/**
 * LeadPopups
 *
 * The one lead-capture popup on the site, and the rules for when it opens.
 * It replaces two popups — the exit-intent panel and the timed promotion
 * modal — that ran independently: with both timers at 60 s they opened
 * together on a phone, and the consultation pages mounted exit-intent a
 * second time on top, so a visitor could face three stacked dialogs.
 *
 * The rules:
 * - Never for a visitor who has sent a lead, in any form, in this visit or an
 *   earlier one (`hasLeadConverted`). A lead sent from another open tab
 *   closes it; one sent from the popup itself takes the visitor on to the
 *   thank-you page.
 * - At most one popup per session. Closing it is final for the session.
 * - With a promotion live the popup is the offer; otherwise it is the
 *   text-consultation request.
 * - It opens on the first of: the pointer leaving through the top of the
 *   window (desktop); a quick flick back up after reading (touch screens,
 *   see `SCROLL_UP_RULES`); or time on the site (the promotion's delay, else
 *   60 s).
 * - Not over a form the visitor has started on the page: once they tap into
 *   one, only the pointer actually leaving the window (desktop) can still
 *   open it. Never while they are typing: the timed trigger waits for them,
 *   the others let that moment pass.
 *
 * This file is rendered from the root layout, so everything it imports is in
 * the shared chunk of every route. It is deliberately kept to React, the
 * form-event bus and the trigger rules — no form stack, no animation library.
 * The dialog is fetched through `next/dynamic` only once a trigger fires
 * (issue #199).
 */
'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useRef, useState } from 'react'

import { LazyBoundary } from '@/components/shared/lazy-boundary.component'
import { publicEnv } from '@/lib/env/public-env'
import {
    FORM_STARTED_EVENT,
    hasLeadConverted,
    useFormSubmittedListener,
} from '@/lib/events/form-events'

import type {
    LeadPopupKind,
    LeadPopupPromotion,
    LeadPopupTrigger,
} from './lead-popup.types'
import {
    createFlickDetector,
    DEFAULT_DELAY_SECONDS,
    isTextEntry,
    SCROLL_UP_RULES,
} from './lead-popup.triggers'

/** Fetched on first render of the dialog — i.e. when a trigger fires. */
const LeadPopupDialog = dynamic(
    () =>
        import('./lead-popup-dialog.component').then((m) => m.LeadPopupDialog),
    { ssr: false }
)

/** `sessionStorage`: the popup already shown in this session, by name. */
const SHOWN_KEY = 'alluring_popup_shown'
/** How long a timed trigger that found the visitor busy waits to retry. */
const RETRY_MS = 5_000

function shownThisSession(): boolean {
    try {
        return Boolean(window.sessionStorage.getItem(SHOWN_KEY))
    } catch {
        return false
    }
}

function rememberShown(kind: LeadPopupKind): void {
    try {
        window.sessionStorage.setItem(SHOWN_KEY, kind)
    } catch {
        // Without storage the popup can show again on the next page load.
    }
}

export type LeadPopupsProps = {
    /** The live promotion with its modal switched on, if there is one. */
    promotion: LeadPopupPromotion | null
}

export function LeadPopups({ promotion }: LeadPopupsProps) {
    const kind: LeadPopupKind = promotion ? 'promo_modal' : 'exit_intent'
    const delayMs = (promotion?.delaySeconds ?? DEFAULT_DELAY_SECONDS) * 1000

    const [trigger, setTrigger] = useState<LeadPopupTrigger | null>(null)
    /** Development only: the popup `?lead-popup=` asked to review. */
    const [preview, setPreview] = useState<LeadPopupKind | null>(null)
    /** Opened, converted or otherwise finished for this page's lifetime. */
    const done = useRef(false)

    useFormSubmittedListener(
        useCallback((event: Event) => {
            done.current = true
            // The popup is modal, so a lead sent from this tab while it is
            // open came from the popup itself, which is on its way to the
            // thank-you page: closing it first would flash the page behind.
            // A lead sent from another tab closes it.
            if (event.type === 'storage') setTrigger(null)
        }, [])
    )

    const close = useCallback(() => setTrigger(null), [])

    useEffect(() => {
        if (done.current) return

        // Development only (inert in production): `?lead-popup=promo` or
        // `?lead-popup=exit` opens that popup at once, whatever this browser
        // has done before, so either one can be reviewed without waiting for
        // a trigger. `promo` needs a live promotion with its modal on.
        if (publicEnv.NODE_ENV === 'development') {
            const asked = new URLSearchParams(window.location.search).get(
                'lead-popup'
            )
            if (
                asked === 'exit' ||
                (asked === 'promo' && kind === 'promo_modal')
            ) {
                done.current = true
                const timer = window.setTimeout(() => {
                    setPreview(asked === 'exit' ? 'exit_intent' : 'promo_modal')
                    setTrigger('timer')
                }, 0)
                return () => window.clearTimeout(timer)
            }
        }

        if (hasLeadConverted() || shownThisSession()) {
            done.current = true
            return
        }

        const controller = new AbortController()
        const listen = { passive: true, signal: controller.signal }
        const startedAt = performance.now()
        let formStarted = false
        let lastUserJump = -Infinity
        let deepest = window.scrollY
        let timer: number | undefined

        const stop = () => {
            controller.abort()
            window.clearTimeout(timer)
        }

        /** Opens the popup unless the visitor is mid-sentence. */
        const open = (next: LeadPopupTrigger): boolean => {
            if (done.current) return true
            if (hasLeadConverted()) {
                done.current = true
                stop()
                return true
            }
            if (isTextEntry(document.activeElement)) return false
            done.current = true
            stop()
            rememberShown(kind)
            setTrigger(next)
            return true
        }

        window.addEventListener(
            FORM_STARTED_EVENT,
            () => {
                formStarted = true
            },
            listen
        )

        // Desktop: the pointer leaves through the top of the window.
        document.addEventListener(
            'mouseleave',
            (event) => {
                if (event.clientY <= 0) open('exit_intent')
            },
            listen
        )

        // Touch screens: a quick flick back up after reading.
        if (window.matchMedia('(pointer: coarse)').matches) {
            const flicked = createFlickDetector(SCROLL_UP_RULES.windowMs)
            const markJump = () => {
                lastUserJump = performance.now()
            }
            for (const type of ['click', 'keydown', 'hashchange'] as const) {
                window.addEventListener(type, markJump, listen)
            }
            window.addEventListener(
                'scroll',
                () => {
                    const y = window.scrollY
                    const now = performance.now()
                    const screen = window.innerHeight
                    deepest = Math.max(deepest, y)
                    const isFlick = flicked(
                        y,
                        now,
                        screen * SCROLL_UP_RULES.minDistanceScreens
                    )
                    if (
                        isFlick &&
                        !formStarted &&
                        now - startedAt >= SCROLL_UP_RULES.minEngagedMs &&
                        now - lastUserJump >= SCROLL_UP_RULES.userJumpGraceMs &&
                        deepest >= screen * SCROLL_UP_RULES.minDepthScreens
                    ) {
                        open('scroll_up')
                    }
                },
                listen
            )
        }

        // Everyone: time on the site. It waits while the tab is hidden, the
        // visitor is typing, or a form on the page has been started.
        const tick = () => {
            if (done.current) return
            if (formStarted) return
            if (document.hidden || !open('timer')) {
                timer = window.setTimeout(tick, RETRY_MS)
            }
        }
        timer = window.setTimeout(tick, delayMs)

        return stop
    }, [delayMs, kind])

    if (!trigger) return null

    return (
        <LazyBoundary label='LeadPopupDialog'>
            <LeadPopupDialog
                kind={preview ?? kind}
                promotion={promotion}
                trigger={trigger}
                onClose={close}
            />
        </LazyBoundary>
    )
}
