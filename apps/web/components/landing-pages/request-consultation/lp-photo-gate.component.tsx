'use client'

/**
 * The tap-to-view card under the results: a notice and one button. The
 * photos behind it are not in the page: the card knows only the view, and
 * on a tap it asks the `photos` route for that view's list, then shows them
 * on a rail like the ones above.
 *
 * Every visitor gets the same card. The choice is remembered for the visit
 * (sessionStorage), so a reload in the same tab opens the photos again
 * without asking.
 */

import { useCallback, useEffect, useId, useRef, useState } from 'react'

import { LpBaFigure } from './lp-ba-figure.component'
import type { LpDictionary, LpLang } from './lp-copy'
import type { LpPhoto } from './lp-proof'

/** The route that returns a view's photos behind the card. */
export const LP_PHOTOS_ROUTE = '/lp/request-consultation/photos'

/** Set once the visitor has tapped "Show photos" in this tab. */
export const LP_PHOTOS_STORAGE_KEY = 'aps_lp_photos_shown'

export type LpPhotoGateEvent = 'lp_results_gate_view' | 'lp_results_gate_open'

type Status = 'closed' | 'loading' | 'open' | 'error'

interface LpPhotoGateProps {
    /** The ad view (`?p=`), which picks the photos. */
    readonly view: string
    readonly lang: LpLang
    readonly copy: LpDictionary['results']
    /** True when the card is the only thing in the results section. */
    readonly solo: boolean
    readonly onEvent: (event: LpPhotoGateEvent) => void
}

function rememberShown(): void {
    try {
        window.sessionStorage.setItem(LP_PHOTOS_STORAGE_KEY, '1')
    } catch {
        // Storage blocked: the card simply shows again after a reload.
    }
}

function wasShown(): boolean {
    try {
        return window.sessionStorage.getItem(LP_PHOTOS_STORAGE_KEY) === '1'
    } catch {
        return false
    }
}

export function LpPhotoGate({
    view,
    lang,
    copy,
    solo,
    onEvent,
}: LpPhotoGateProps) {
    const [status, setStatus] = useState<Status>('closed')
    const [photos, setPhotos] = useState<readonly LpPhoto[]>([])
    const cardRef = useRef<HTMLDivElement>(null)
    const regionRef = useRef<HTMLDivElement>(null)
    const focusOnOpen = useRef(false)
    const langRef = useRef(lang)
    const onEventRef = useRef(onEvent)
    const noticeId = useId()

    useEffect(() => {
        langRef.current = lang
        onEventRef.current = onEvent
    })

    const load = useCallback(
        async (fromTap: boolean) => {
            setStatus('loading')
            try {
                const query = new URLSearchParams({
                    p: view,
                    hl: langRef.current,
                })
                const response = await fetch(`${LP_PHOTOS_ROUTE}?${query}`)
                if (!response.ok) throw new Error(String(response.status))
                const data = (await response.json()) as {
                    photos?: readonly LpPhoto[]
                }
                setPhotos(data.photos ?? [])
                focusOnOpen.current = fromTap
                setStatus('open')
                rememberShown()
            } catch {
                setStatus('error')
            }
        },
        [view]
    )

    /** Opened earlier in this tab: show the photos again without asking. */
    useEffect(() => {
        if (wasShown()) void load(false)
    }, [load])

    /** `lp_results_gate_view`, the first time half the card is on screen. */
    useEffect(() => {
        const card = cardRef.current
        if (!card || wasShown() || !('IntersectionObserver' in window)) return
        const observer = new IntersectionObserver(
            (entries) => {
                if (!entries.some((entry) => entry.isIntersecting)) return
                observer.disconnect()
                onEventRef.current('lp_results_gate_view')
            },
            { threshold: 0.5 }
        )
        observer.observe(card)
        return () => observer.disconnect()
    }, [])

    /** After a tap, focus moves to the photos it revealed. */
    useEffect(() => {
        if (status !== 'open' || !focusOnOpen.current) return
        focusOnOpen.current = false
        regionRef.current?.focus()
    }, [status])

    if (status === 'open') {
        if (photos.length === 0) return null
        return (
            <div
                ref={regionRef}
                className='ba-gate-open'
                role='region'
                aria-label={copy.gate.revealedLabel}
                tabIndex={-1}
            >
                <ul
                    className='rail ba-rail'
                    aria-label={copy.gate.revealedLabel}
                >
                    {photos.map((photo) => (
                        <li key={photo.id}>
                            <LpBaFigure photo={photo} copy={copy} />
                        </li>
                    ))}
                </ul>
            </div>
        )
    }

    return (
        <div className='wrap'>
            <div
                ref={cardRef}
                className={solo ? 'ba-gate ba-gate-solo' : 'ba-gate'}
            >
                <p className='ba-gate-notice' id={noticeId}>
                    {copy.gate.notice}
                </p>
                <button
                    type='button'
                    className='btn ba-gate-btn'
                    aria-describedby={noticeId}
                    aria-busy={status === 'loading'}
                    disabled={status === 'loading'}
                    onClick={() => {
                        onEventRef.current('lp_results_gate_open')
                        void load(true)
                    }}
                >
                    {copy.gate.button}
                </button>
                {status === 'error' && (
                    <p className='ba-gate-retry' role='alert'>
                        {copy.gate.retry}
                    </p>
                )}
            </div>
        </div>
    )
}
