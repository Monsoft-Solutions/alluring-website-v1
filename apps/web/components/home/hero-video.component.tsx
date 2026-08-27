'use client'

/**
 * Hero Video
 *
 * The homepage hero's background film — one element, one source, mounted after
 * the page has painted.
 *
 * Why this is a client component in an SSR-first codebase: the hero previously
 * shipped BOTH cuts of the film and hid one with `display:none`. That does not
 * stop a `<video>` from loading. Measured on production against a clean Chrome
 * profile, the hidden element reached `readyState 4` with 7.6s buffered — the
 * whole file — so every visitor downloaded both cuts and both posters, ~1.5 MB
 * of waste racing the critical path (issue #200).
 *
 * Choosing between two cuts by viewport is a decision only the browser can make,
 * and it must be made once. So this renders nothing on the server and nothing on
 * first paint: the poster underneath it (a plain `<img>` in `Hero`, chosen by
 * `<picture>`) is what paints the hero, and it does so with zero JavaScript.
 * Only once the page is loaded and idle does the video attach and fade in.
 *
 * There is deliberately no `poster` attribute here — the `<img>` already covers
 * that, and adding one back would restore the second poster request this exists
 * to remove. `preload` is likewise absent: it is moot next to `autoPlay muted`,
 * since a browser loads regardless in order to autoplay. Deferring the element
 * itself is what actually keeps the video off the critical path.
 */

import { useEffect, useState } from 'react'

/**
 * The `md` breakpoint the two cuts are graded for, and the same one the hero's
 * scrims and height cap switch on.
 *
 * In rem, not px, because that is what Tailwind v4 emits — `md:` compiles to
 * `@media (width >= 48rem)`. A visitor whose browser default font size is 20px
 * gets `md:` at 960px, so a `768px` query here would hand them the landscape cut
 * under the mobile layout: full-bleed scrim, `h-screen` cap, framing from the
 * other grade. Cut and layout have to flip on the same line.
 */
const DESKTOP_QUERY = '(width >= 48rem)'
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

type HeroVideoProps = {
    /** Landscape cut — subject framed right of centre. */
    desktopSrc: string
    /** Vertical cut. */
    mobileSrc: string
    /** Announced label; the film is the same in both cuts. */
    label: string
}

/**
 * Runs `callback` once the page has painted and the main thread is free.
 * Returns a teardown that cancels whichever stage is still pending.
 */
const afterPaint = (callback: () => void): (() => void) => {
    let idleHandle: number | undefined
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined

    const scheduleIdle = () => {
        // Safari has no requestIdleCallback; a short timer is close enough,
        // because `load` has already fired by the time we get here.
        if (typeof window.requestIdleCallback === 'function') {
            idleHandle = window.requestIdleCallback(callback, { timeout: 1500 })
        } else {
            timeoutHandle = setTimeout(callback, 200)
        }
    }

    if (document.readyState === 'complete') {
        scheduleIdle()
        return () => {
            if (idleHandle !== undefined)
                window.cancelIdleCallback?.(idleHandle)
            if (timeoutHandle !== undefined) clearTimeout(timeoutHandle)
        }
    }

    window.addEventListener('load', scheduleIdle, { once: true })
    return () => {
        window.removeEventListener('load', scheduleIdle)
        if (idleHandle !== undefined) window.cancelIdleCallback?.(idleHandle)
        if (timeoutHandle !== undefined) clearTimeout(timeoutHandle)
    }
}

export const HeroVideo = ({ desktopSrc, mobileSrc, label }: HeroVideoProps) => {
    /** null until we have both painted and decided which cut to load. */
    const [src, setSrc] = useState<string | null>(null)
    /**
     * The cut that has decoded its first frame. Tracking the source rather than
     * a boolean means a swap at the breakpoint drops back to the poster on its
     * own — there is no second flag to keep in sync.
     */
    const [readySrc, setReadySrc] = useState<string | null>(null)
    const visible = readySrc !== null && readySrc === src

    useEffect(() => {
        // Someone who has asked for reduced motion gets the still poster and no
        // download at all. An autoplaying, looping background film is exactly
        // what that preference is about.
        if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return

        const desktop = window.matchMedia(DESKTOP_QUERY)
        const pick = () => setSrc(desktop.matches ? desktopSrc : mobileSrc)

        const cancel = afterPaint(pick)

        // Keep the mounted cut correct across a resize past the breakpoint —
        // only ever swapping the source, never running two elements at once.
        // Does nothing before the first pick, so a resize cannot pull the video
        // in ahead of paint.
        const onChange = () =>
            setSrc((current) =>
                current ? (desktop.matches ? desktopSrc : mobileSrc) : current
            )
        desktop.addEventListener('change', onChange)

        return () => {
            cancel()
            desktop.removeEventListener('change', onChange)
        }
    }, [desktopSrc, mobileSrc])

    if (!src) return null

    return (
        <video
            key={src}
            src={src}
            className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                visible ? 'opacity-100' : 'opacity-0'
            }`}
            autoPlay
            muted
            loop
            playsInline
            // Reveal on the first decoded frame, not on `playing`. Each poster
            // IS its clip's first frame, so the crossfade has nothing to hide —
            // and `loadeddata` fires whether or not autoplay is permitted. Tying
            // it to `playing` meant that a refusal (iOS Low Power Mode declines
            // even muted inline autoplay) left the element invisible forever
            // while it went on downloading the whole clip.
            onLoadedData={() => setReadySrc(src)}
            // A source that errors has nothing to show and nothing to wait for.
            // Drop it: the poster is already the hero, and this stops a dead or
            // stalled request from spending the bytes this component exists to
            // save. `pick` does not run again, so it does not retry in a loop.
            onError={() => setSrc(null)}
            aria-label={label}
        />
    )
}
