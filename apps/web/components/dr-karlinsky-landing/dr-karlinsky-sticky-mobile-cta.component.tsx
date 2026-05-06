/**
 * DrKarlinskyStickyMobileCTA
 *
 * Mobile-only fixed bottom bar that keeps the booking action one thumb-tap
 * away anywhere on the page. Hides while the hero form is in the viewport
 * (so it doesn't double up) and reveals once the visitor scrolls past it.
 *
 * Companion to the warm-traffic Instagram landing page — the visitor
 * expects this kind of always-visible action chip from native social
 * apps, and it consistently lifts mobile conversion by removing the
 * "scroll back up to book" friction.
 */
'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export type DrKarlinskyStickyMobileCTAProps = {
    /** Anchor for the primary "Book" action (defaults to #hero-form) */
    readonly formAnchor?: string
    /** ID of the hero form to observe — bar hides while this is on screen */
    readonly heroFormId?: string
}

export function DrKarlinskyStickyMobileCTA({
    formAnchor = '#hero-form',
    heroFormId = 'hero-form',
}: DrKarlinskyStickyMobileCTAProps) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const heroForm = document.getElementById(heroFormId)

        let scrolledPastThreshold = false
        let heroFormOnScreen = true

        const updateVisibility = () => {
            setIsVisible(scrolledPastThreshold && !heroFormOnScreen)
        }

        const handleScroll = () => {
            scrolledPastThreshold = window.scrollY > 600
            updateVisibility()
        }

        handleScroll()
        window.addEventListener('scroll', handleScroll, { passive: true })

        let observer: IntersectionObserver | null = null
        if (heroForm) {
            observer = new IntersectionObserver(
                ([entry]) => {
                    heroFormOnScreen = entry?.isIntersecting ?? false
                    updateVisibility()
                },
                { threshold: 0.15 }
            )
            observer.observe(heroForm)
        } else {
            heroFormOnScreen = false
            updateVisibility()
        }

        return () => {
            window.removeEventListener('scroll', handleScroll)
            observer?.disconnect()
        }
    }, [heroFormId])

    return (
        <div
            aria-hidden={!isVisible}
            className={`pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-stone-950/90 backdrop-blur-xl transition-all duration-300 lg:hidden ${
                isVisible
                    ? 'translate-y-0 opacity-100'
                    : 'pointer-events-none translate-y-full opacity-0'
            }`}
        >
            <div className='px-4 py-3'>
                <Link
                    href={formAnchor}
                    className='from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 flex w-full items-center justify-center rounded-full bg-gradient-to-r px-5 py-3 text-sm font-bold tracking-wide text-stone-950 shadow-lg shadow-stone-950/40 transition-all active:scale-[0.98]'
                >
                    Book My Consult
                </Link>
            </div>
        </div>
    )
}
