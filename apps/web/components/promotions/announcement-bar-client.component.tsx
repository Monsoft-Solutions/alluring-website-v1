'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { X, Sparkles, ArrowRight } from 'lucide-react'

import { useIsLandingRoute } from '@/hooks/use-is-landing-route.hook'
import { useAnalyticsEvent } from '@/lib/analytics/useAnalyticsEvent.hook'

const LANDING_HERO_FORM_ANCHOR = '#hero-form'

type AnnouncementBarClientProps = {
    promotionId: string
    title: string
    discount: string | null
    ctaText: string
    link: string
}

const STORAGE_KEY_PREFIX = 'dismissed_promo_'
const ANNOUNCEMENT_BAR_HEIGHT = 40

/** Single source for the collapse duration: the CSS transition below and the
 *  delay before unmounting are both derived from it. */
const COLLAPSE_MS = 300

/**
 * AnnouncementBarClient Component
 *
 * Client-side component that handles dismissal state and animations
 * for the announcement bar. Stores dismissal in localStorage.
 *
 * The open/close animation is a plain CSS height transition rather than
 * Framer's AnimatePresence: this component sits in the root layout, so its
 * imports are in the shared chunk of every route on the site, and
 * `framer-motion` was riding along for one collapse (issue #199). Height
 * alone is animated — never opacity — so the promotion text is never an
 * invisible server-rendered string, per CLAUDE.md.
 */
export function AnnouncementBarClient({
    promotionId,
    title,
    discount,
    ctaText,
    link,
}: AnnouncementBarClientProps) {
    // Initialize with consistent state for server and client to avoid hydration errors
    const storageKey = `${STORAGE_KEY_PREFIX}${promotionId}`
    const [isDismissed, setIsDismissed] = useState(false)
    // Drives the height transition. Starts closed on both server and client —
    // as it did under Framer, whose `initial` was also height 0 — and opens on
    // the frame after mount, once localStorage has had its say.
    const [isOpen, setIsOpen] = useState(false)
    const collapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Analytics hook
    const { trackCTA } = useAnalyticsEvent()

    // On /landing/* routes the convert-or-exit directive overrides the
    // default destination — redirect the banner to the hero form instead
    // of routing the visitor away to /miami-plastic-surgery-specials.
    const isLandingRoute = useIsLandingRoute()
    const effectiveLink = isLandingRoute ? LANDING_HERO_FORM_ANCHOR : link

    // Check localStorage after mount to determine if promotion was previously dismissed
    useEffect(() => {
        if (localStorage.getItem(storageKey) === 'true') {
            // Use setTimeout to avoid calling setState synchronously within an effect
            setTimeout(() => {
                setIsDismissed(true)
            }, 0)
            return
        }

        // Open on the next frame so the browser has a 0-height box to
        // transition *from*; setting state in the same frame as mount would
        // collapse the two styles into one paint and skip the animation.
        const frame = requestAnimationFrame(() => setIsOpen(true))
        return () => cancelAnimationFrame(frame)
    }, [storageKey])

    // Drop the pending collapse if we unmount mid-animation, so it cannot land
    // on a remounted instance.
    useEffect(
        () => () => {
            if (collapseTimer.current) clearTimeout(collapseTimer.current)
        },
        []
    )

    // Set CSS variable and cleanup (no state updates, only DOM manipulation)
    useEffect(() => {
        if (!isDismissed) {
            document.documentElement.style.setProperty(
                '--announcement-bar-height',
                `${ANNOUNCEMENT_BAR_HEIGHT}px`
            )
        }

        return () => {
            document.documentElement.style.setProperty(
                '--announcement-bar-height',
                '0px'
            )
        }
    }, [isDismissed])

    const handleDismiss = () => {
        localStorage.setItem(storageKey, 'true')
        // Collapse first, then unmount once the transition has run — the
        // equivalent of Framer's `exit`.
        setIsOpen(false)
        collapseTimer.current = setTimeout(
            () => setIsDismissed(true),
            COLLAPSE_MS
        )
        document.documentElement.style.setProperty(
            '--announcement-bar-height',
            '0px'
        )
    }

    if (isDismissed) {
        return null
    }

    return (
        <div
            style={{
                height: isOpen ? ANNOUNCEMENT_BAR_HEIGHT : 0,
                transition: `height ${COLLAPSE_MS}ms cubic-bezier(0.16, 1, 0.3, 1) 50ms`,
            }}
            className='fixed top-0 right-0 left-0 z-[60] overflow-hidden bg-stone-900 motion-reduce:transition-none'
            role='banner'
            aria-label='Special offer announcement'
        >
            {/* Subtle gold accent line at bottom */}
            <div className='bg-gold-500/40 absolute right-0 bottom-0 left-0 h-px' />

            {/* Full-width clickable link area */}
            <Link
                href={effectiveLink}
                onClick={() => {
                    trackCTA('promotion_banner', {
                        promotion_id: promotionId,
                        promotion_title: title,
                        promotion_discount: discount ?? undefined,
                        promotion_link: effectiveLink,
                        cta_position: isLandingRoute
                            ? 'landing_announcement_bar'
                            : 'site_announcement_bar',
                        ...(isLandingRoute && {
                            lp_template_version: 'v2',
                        }),
                    })
                }}
                className='group absolute inset-0 flex items-center justify-center pr-12'
            >
                <div className='flex items-center gap-2 md:gap-3'>
                    <Sparkles className='text-gold-400 hidden h-3.5 w-3.5 sm:block' />

                    <span className='flex items-center gap-1.5 text-xs font-medium tracking-wide text-stone-300 uppercase md:gap-2 md:text-sm'>
                        <span className='hidden sm:inline'>Limited Time:</span>
                        {discount && (
                            <span className='text-gold-400 font-bold'>
                                {discount}
                            </span>
                        )}
                        <span className='max-w-[150px] truncate sm:max-w-none'>
                            {title}
                        </span>
                    </span>

                    <span className='text-gold-400 ml-1 flex items-center gap-1 text-xs font-bold tracking-wide uppercase transition-colors group-hover:text-white md:ml-2'>
                        <span className='hidden sm:inline'>{ctaText}</span>
                        <ArrowRight className='h-3 w-3 transition-transform group-hover:translate-x-0.5' />
                    </span>
                </div>
            </Link>

            {/* Dismiss button - positioned above link */}
            <button
                onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleDismiss()
                }}
                className='absolute top-1/2 right-4 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-800 hover:text-white md:right-6'
                aria-label='Dismiss promotion'
            >
                <X className='h-3.5 w-3.5' />
            </button>
        </div>
    )
}
