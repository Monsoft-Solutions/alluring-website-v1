'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@workspace/ui/lib/utils'

const button =
    'inline-flex size-11 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-900 transition-colors hover:border-stone-900 disabled:cursor-default disabled:opacity-40 disabled:hover:border-stone-300'

/**
 * Previous and next for a scroll-snap rail, for mouse users from `lg`. Phones
 * swipe the rail itself. The rail and its photos are server-rendered; this is
 * only the two buttons.
 */
export function ModuleRailButtons({
    railId,
    className,
}: {
    railId: string
    className?: string
}) {
    const [edges, setEdges] = useState({ start: true, end: false })

    useEffect(() => {
        const rail = document.getElementById(railId)
        if (!rail) return

        const update = () =>
            setEdges({
                start: rail.scrollLeft <= 1,
                end: rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 1,
            })
        update()
        rail.addEventListener('scroll', update, { passive: true })
        window.addEventListener('resize', update)
        return () => {
            rail.removeEventListener('scroll', update)
            window.removeEventListener('resize', update)
        }
    }, [railId])

    const scroll = (direction: 1 | -1) => {
        const rail = document.getElementById(railId)
        if (!rail) return
        const reduce = window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        ).matches
        rail.scrollBy({
            left: direction * rail.clientWidth * 0.8,
            behavior: reduce ? 'auto' : 'smooth',
        })
    }

    return (
        <div className={cn('gap-2', className)}>
            <button
                type='button'
                aria-controls={railId}
                aria-label='Previous photos'
                disabled={edges.start}
                onClick={() => scroll(-1)}
                className={button}
            >
                <ChevronLeft aria-hidden='true' className='size-5' />
            </button>
            <button
                type='button'
                aria-controls={railId}
                aria-label='Next photos'
                disabled={edges.end}
                onClick={() => scroll(1)}
                className={button}
            >
                <ChevronRight aria-hidden='true' className='size-5' />
            </button>
        </div>
    )
}
