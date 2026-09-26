'use client'

import { useEffect, useState } from 'react'

import type { TOCHeading } from '@/lib/types/blog/toc.type'

/**
 * Where a heading counts as reached: 30% down the viewport, and never above
 * 220 px, so a section a table-of-contents jump just landed (its top about
 * 200 px down, under the header and the contents bar) is the current one.
 */
function getReadingLine(): number {
    return Math.max(220, window.innerHeight * 0.3)
}

/**
 * Scroll spy for a post's table of contents: the id of the last heading above
 * the reading line, or '' before the first.
 *
 * It measures positions on scroll rather than watching headings cross a band
 * with an IntersectionObserver, which misses a heading that a jump or a fast
 * flick carries past the band in one frame and leaves the old section marked.
 *
 * A post renders two tables of contents, the phone bar and the desktop rail,
 * and only one is ever visible. Each passes the media query it shows at, and
 * the hidden one listens to nothing.
 *
 * @param headings - The headings the table of contents lists, in page order
 * @param media - The media query the table of contents is visible at
 * @returns The current heading's id
 */
export function useActiveHeading(
    headings: TOCHeading[],
    media: string
): string {
    const [activeId, setActiveId] = useState('')

    useEffect(() => {
        const query = window.matchMedia(media)
        const elements = headings
            .map(({ id }) => document.getElementById(id))
            .filter((element): element is HTMLElement => element !== null)
        let frame = 0

        const update = () => {
            frame = 0
            const line = getReadingLine()
            let current = ''
            for (const element of elements) {
                if (element.getBoundingClientRect().top > line) break
                current = element.id
            }
            setActiveId(current)
        }

        const schedule = () => {
            if (!frame) frame = window.requestAnimationFrame(update)
        }

        const stop = () => {
            window.cancelAnimationFrame(frame)
            frame = 0
            window.removeEventListener('scroll', schedule)
            window.removeEventListener('resize', schedule)
        }

        const sync = () => {
            stop()
            if (!query.matches) return
            update()
            window.addEventListener('scroll', schedule, { passive: true })
            window.addEventListener('resize', schedule, { passive: true })
        }

        sync()
        query.addEventListener('change', sync)

        return () => {
            query.removeEventListener('change', sync)
            stop()
        }
    }, [headings, media])

    return activeId
}
