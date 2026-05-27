/**
 * ProcedureLandingStickyMobileCTA
 *
 * Mobile-only fixed bottom bar that keeps the booking action one
 * thumb-tap away anywhere on the page. Hides while the hero form is
 * on-screen (so it doesn't double up) and reveals after the visitor
 * scrolls past it.
 */
'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export type ProcedureLandingStickyMobileCTAProps = {
    readonly formAnchor?: string
    readonly heroFormId?: string
    readonly label?: string
}

export function ProcedureLandingStickyMobileCTA({
    formAnchor = '#hero-form',
    heroFormId = 'hero-form',
    label = 'Get My Free Quote',
}: ProcedureLandingStickyMobileCTAProps) {
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
                    {label}
                </Link>
            </div>
        </div>
    )
}
