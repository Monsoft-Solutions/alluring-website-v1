'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@workspace/ui/lib/utils'

import { useActiveHeading } from '@/hooks/use-active-heading.hook'
import type { TOCHeading } from '@/lib/types/blog/toc.type'

type PostTocProps = {
    headings: TOCHeading[]
}

/**
 * The desktop rail's table of contents. Each entry is a real `#id` link, so it
 * works before hydration and from the keyboard; the current section carries a
 * champagne rule and `aria-current`.
 *
 * The list takes the rail's height left over (under a fact card it may be
 * short) and scrolls on its own, keeping the current section in view.
 */
export function PostToc({ headings }: PostTocProps) {
    const activeId = useActiveHeading(headings, '(min-width: 64rem)')
    const listRef = useRef<HTMLOListElement>(null)

    useEffect(() => {
        const list = listRef.current
        if (!list || list.scrollHeight <= list.clientHeight) return
        const current = list.querySelector<HTMLElement>('[aria-current]')
        if (!current) return
        // Scroll the list only: scrollIntoView would move the page too.
        const top = current.offsetTop
        const bottom = top + current.offsetHeight
        if (
            top < list.scrollTop ||
            bottom > list.scrollTop + list.clientHeight
        ) {
            list.scrollTop = top - list.clientHeight / 3
        }
    }, [activeId])

    if (headings.length === 0) return null

    return (
        <nav aria-labelledby='post-toc-title' className='flex min-h-0 flex-col'>
            <p
                id='post-toc-title'
                className='text-[0.6875rem] font-semibold tracking-[0.2em] text-stone-500 uppercase'
            >
                In this article
            </p>
            {/* The entries draw the rule themselves: a list that scrolls
                clips anything drawn outside it, so a champagne rule offset
                over the list's own border would lose half its width. */}
            <ol
                ref={listRef}
                className='relative mt-4 min-h-0 overflow-y-auto [scrollbar-width:thin]'
            >
                {headings.map(({ id, text, level }) => (
                    <li key={id}>
                        <a
                            href={`#${id}`}
                            aria-current={
                                activeId === id ? 'location' : undefined
                            }
                            className={cn(
                                'block border-l-2 py-2 pr-2 pl-4 text-[0.875rem] leading-snug no-underline transition-colors',
                                level === 3 && 'pl-7',
                                activeId === id
                                    ? 'border-gold-400 font-medium text-stone-900'
                                    : 'border-stone-200 text-stone-600 hover:border-stone-400 hover:text-stone-900'
                            )}
                        >
                            {text}
                        </a>
                    </li>
                ))}
            </ol>
        </nav>
    )
}
