'use client'

/**
 * Pause control for the home page's moving parts: the hero film and the two
 * marquees. Motion that starts on its own and runs longer than five seconds
 * needs a way to stop it (WCAG 2.2.2). Every toggle on the page shares one
 * state, kept on `<html data-hp-motion>`, which `home-page.css` reads to
 * pause the marquees; the film is paused directly.
 *
 * Hidden under `prefers-reduced-motion: reduce`, where nothing moves.
 */

import { useEffect, useSyncExternalStore } from 'react'
import { cn } from '@workspace/ui/lib/utils'

const HERO_VIDEO = '.hp-hero-media video'
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
        listeners.delete(listener)
    }
}

const isPaused = () => document.documentElement.dataset.hpMotion === 'paused'

function setPaused(paused: boolean) {
    document.documentElement.dataset.hpMotion = paused ? 'paused' : 'playing'
    for (const video of document.querySelectorAll<HTMLVideoElement>(
        HERO_VIDEO
    )) {
        if (paused) video.pause()
        else void video.play().catch(() => {})
    }
    for (const listener of listeners) listener()
}

type HomeMotionToggleProps = {
    tone?: 'light' | 'dark'
    className?: string
}

export function HomeMotionToggle({
    tone = 'light',
    className,
}: HomeMotionToggleProps) {
    const paused = useSyncExternalStore(subscribe, isPaused, () => false)

    // The film attaches after the page is idle, so it can start playing
    // after the visitor has already paused. Catch that at the document.
    useEffect(() => {
        const onPlay = (event: Event) => {
            const target = event.target
            if (
                isPaused() &&
                target instanceof HTMLVideoElement &&
                target.matches(HERO_VIDEO)
            ) {
                target.pause()
            }
        }
        document.addEventListener('play', onPlay, true)
        return () => document.removeEventListener('play', onPlay, true)
    }, [])

    return (
        <button
            type='button'
            aria-pressed={paused}
            onClick={() => setPaused(!paused)}
            className={cn(
                'hp-motion-toggle inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 text-[0.6875rem] font-semibold tracking-[0.1em] uppercase backdrop-blur-md transition-colors',
                tone === 'light'
                    ? 'border border-[rgba(23,18,16,0.12)] bg-white/60 text-[#3f3531] hover:bg-white'
                    : 'border border-white/15 bg-white/5 text-[#dccdbf] hover:bg-white/10',
                className
            )}
        >
            <svg
                viewBox='0 0 12 12'
                aria-hidden='true'
                className='size-2.5'
                fill='currentColor'
            >
                {paused ? (
                    <path d='M3 1.5v9l7-4.5z' />
                ) : (
                    <>
                        <rect x='2' y='1.5' width='2.6' height='9' rx='0.6' />
                        <rect x='7.4' y='1.5' width='2.6' height='9' rx='0.6' />
                    </>
                )}
            </svg>
            Pause motion
        </button>
    )
}
