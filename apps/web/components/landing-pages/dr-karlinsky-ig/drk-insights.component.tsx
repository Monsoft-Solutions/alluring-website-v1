'use client'

/**
 * What visitors do on the page, for deciding what to change next. Renders
 * nothing; one island for every listener, each sent once per page view:
 *
 *   drk_view           on load, with the hero arm: the A/B test's denominator
 *   drk_section_view   a `data-drk-section` was 40% on screen, or covered
 *                      40% of the screen ({ section })
 *   drk_scroll         25 / 50 / 75 / 100 % of the page reached ({ percent })
 *   drk_cta            a `data-cta` button or link tapped ({ cta }), which
 *                      repeats the site's `cta_click` with the arm attached
 *   drk_faq_open       a question opened ({ question: its 1-based number })
 *
 * The form's own funnel (`drk_step`, `drk_lead_attempt`, the thank-you
 * page's `drk_lead_submitted`) and the video's events are sent where they
 * happen. `trackDrkEvent` adds the page variant, hero arm and language.
 */

import { useEffect } from 'react'

import { DRK_EVENTS } from './drk-config'
import { trackDrkEvent } from './drk-tracking'

const SCROLL_MARKS = [25, 50, 75, 100] as const

/** 0, 0.05 … 1. */
const SECTION_THRESHOLDS = Array.from({ length: 21 }, (_, i) => i / 20)

/** The share that counts as seen: of the section, or of the screen. */
const SEEN_SHARE = 0.4

/**
 * Seen when 40% of the section is on screen, or, for a section taller than
 * that allows (the arch hero, the reviews on a phone), when it covers 40% of
 * the screen.
 */
export function isSeen(
    entry: Pick<
        IntersectionObserverEntry,
        'intersectionRatio' | 'intersectionRect' | 'rootBounds'
    >
): boolean {
    if (entry.intersectionRatio >= SEEN_SHARE) return true
    const screen = entry.rootBounds?.height ?? window.innerHeight
    return entry.intersectionRect.height >= SEEN_SHARE * screen
}

export function DrkInsights({ lang }: { readonly lang: string }) {
    useEffect(() => {
        trackDrkEvent(DRK_EVENTS.view, lang)
    }, [lang])

    useEffect(() => {
        if (!('IntersectionObserver' in window)) return
        const seen = new Set<string>()
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting || !isSeen(entry)) continue
                    const element = entry.target as HTMLElement
                    const section = element.dataset.drkSection
                    observer.unobserve(element)
                    if (!section || seen.has(section)) continue
                    seen.add(section)
                    trackDrkEvent(DRK_EVENTS.sectionView, lang, { section })
                }
            },
            // Checked every 5%, so a section taller than the screen still
            // reaches the 40%-of-the-screen test (see `isSeen`).
            { threshold: SECTION_THRESHOLDS }
        )
        for (const element of document.querySelectorAll('[data-drk-section]')) {
            observer.observe(element)
        }
        return () => observer.disconnect()
    }, [lang])

    useEffect(() => {
        const reached = new Set<number>()
        let frame = 0
        const measure = () => {
            frame = 0
            const root = document.documentElement
            const scrollable = root.scrollHeight - window.innerHeight
            const percent =
                scrollable <= 0 ? 100 : (window.scrollY / scrollable) * 100
            for (const mark of SCROLL_MARKS) {
                // 98 counts as the bottom: the last pixels rarely scroll.
                if (reached.has(mark) || percent < Math.min(mark, 98)) continue
                reached.add(mark)
                trackDrkEvent(DRK_EVENTS.scroll, lang, { percent: mark })
            }
        }
        const onScroll = () => {
            if (!frame) frame = window.requestAnimationFrame(measure)
        }
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => {
            window.removeEventListener('scroll', onScroll)
            if (frame) window.cancelAnimationFrame(frame)
        }
    }, [lang])

    useEffect(() => {
        const onClick = (event: MouseEvent) => {
            if (!(event.target instanceof Element)) return
            const cta = event.target.closest<HTMLElement>('[data-cta]')
            const name = cta?.dataset.cta
            if (!name) return
            trackDrkEvent(DRK_EVENTS.cta, lang, { cta: name })
        }
        // `toggle` doesn't bubble; capture catches it on the way down.
        const onToggle = (event: Event) => {
            const details = event.target
            if (!(details instanceof HTMLDetailsElement) || !details.open)
                return
            const list = details.closest('[data-drk-section="faq"]')
            if (!list) return
            const index = Array.from(list.querySelectorAll('details')).indexOf(
                details
            )
            trackDrkEvent(DRK_EVENTS.faqOpen, lang, { question: index + 1 })
        }
        document.addEventListener('click', onClick)
        document.addEventListener('toggle', onToggle, true)
        return () => {
            document.removeEventListener('click', onClick)
            document.removeEventListener('toggle', onToggle, true)
        }
    }, [lang])

    return null
}
