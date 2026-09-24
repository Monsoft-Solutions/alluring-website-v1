'use client'

/**
 * Section View Tracker
 *
 * Sends `section_view` once per page view for every `main section[id]` the
 * visitor actually sees, so a page's sections can be compared by how many
 * visitors reach them — and, joined through `ga_client_id`, which ones the
 * visitors who became leads saw. Issue #272.
 *
 * A section counts as seen when half of it is on screen, or when it crosses
 * the middle of the screen — the second rule is what catches sections taller
 * than the viewport, which can never be half visible.
 *
 * Mount it once on the page, anywhere; it renders nothing.
 *
 * @module components/analytics/section-view-tracker
 */
import { useEffect } from 'react'

import { trackEvent } from '@/lib/analytics/analytics.client'

const SECTION_SELECTOR = 'main section[id]'
const HALF_VISIBLE = 0.5
/** Shrinks the viewport to its middle line. */
const MIDDLE_LINE_MARGIN = '-50% 0px -50% 0px'

export function SectionViewTracker() {
    useEffect(() => {
        if (!('IntersectionObserver' in window)) return

        const sections = Array.from(
            document.querySelectorAll<HTMLElement>(SECTION_SELECTOR)
        )
        if (sections.length === 0) return

        const indexOf = new Map(sections.map((el, index) => [el, index + 1]))
        const seen = new Set<Element>()

        const onEntries = (entries: IntersectionObserverEntry[]) => {
            for (const entry of entries) {
                if (!entry.isIntersecting || seen.has(entry.target)) continue
                seen.add(entry.target)
                const section = entry.target as HTMLElement
                trackEvent('section_view', {
                    section: section.id,
                    section_index: indexOf.get(section) ?? 0,
                })
                halfVisible.unobserve(section)
                middleLine.unobserve(section)
            }
        }

        const halfVisible = new IntersectionObserver(onEntries, {
            threshold: HALF_VISIBLE,
        })
        const middleLine = new IntersectionObserver(onEntries, {
            rootMargin: MIDDLE_LINE_MARGIN,
        })

        for (const section of sections) {
            halfVisible.observe(section)
            middleLine.observe(section)
        }
        return () => {
            halfVisible.disconnect()
            middleLine.disconnect()
        }
    }, [])

    return null
}
