'use client'

/**
 * MobileTOC Component
 *
 * The post's table of contents on phones and tablets (hidden from `lg`, where
 * the rail carries it). A bar that sticks just under the fixed site header,
 * names the section the reader is in, and opens into the list of sections.
 *
 * Every entry is a real `#id` link, so it works before hydration, from the
 * keyboard, and in the served HTML. Tapping one jumps to the section and
 * closes the list.
 */
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@workspace/ui/lib/utils'

import { useActiveHeading } from '@/hooks/use-active-heading.hook'
import type { TOCHeading } from '@/lib/types/blog/toc.type'

type MobileTOCProps = {
    headings: TOCHeading[]
    className?: string
}

export function MobileTOC({ headings, className }: MobileTOCProps) {
    const [isOpen, setIsOpen] = useState(false)
    const activeId = useActiveHeading(headings, '(max-width: 63.999rem)')

    if (headings.length === 0) return null

    const activeHeading = headings.find((h) => h.id === activeId)
    const sectionCount = `${headings.length} ${headings.length === 1 ? 'section' : 'sections'}`

    return (
        <div
            className={cn(
                // Under the fixed header once it has shrunk on scroll: 4.5rem
                // on phones (40 px logo), 5rem from `md` (48 px logo).
                'sticky top-[calc(var(--announcement-bar-height,0px)+4.5rem)] z-30 md:top-[calc(var(--announcement-bar-height,0px)+5rem)] lg:hidden',
                className
            )}
        >
            <div className='relative border-y border-stone-200 bg-stone-50/95 backdrop-blur-md'>
                <button
                    type='button'
                    onClick={() => setIsOpen(!isOpen)}
                    className='flex min-h-13 w-full items-center justify-between gap-4 px-5 py-2.5 text-left md:px-8'
                    aria-expanded={isOpen}
                    aria-controls='mobile-toc-content'
                >
                    <span className='min-w-0'>
                        <span className='block text-[0.6875rem] font-semibold tracking-[0.18em] text-stone-500 uppercase'>
                            In this article · {sectionCount}
                        </span>
                        <span className='block truncate text-[0.9375rem] font-medium text-stone-900'>
                            {activeHeading?.text ?? 'Jump to a section'}
                        </span>
                    </span>
                    <ChevronDown
                        aria-hidden='true'
                        className={cn(
                            'size-5 shrink-0 text-stone-500 transition-transform duration-200',
                            isOpen && 'rotate-180'
                        )}
                    />
                </button>

                {/* An overlay, not part of the flow: if opening the list
                    pushed the article down, closing it after a tap would pull
                    the article up under a jump already in progress, and the
                    reader would land far past the section. */}
                <div
                    id='mobile-toc-content'
                    inert={!isOpen}
                    className={cn(
                        'absolute inset-x-0 top-full overflow-hidden bg-stone-50 transition-[max-height] duration-300 ease-out',
                        isOpen
                            ? 'max-h-[60vh] shadow-[0_24px_40px_-24px_rgba(19,12,9,0.35)]'
                            : 'max-h-0'
                    )}
                >
                    <nav
                        aria-label='In this article'
                        className='border-y border-stone-200'
                    >
                        <ol className='max-h-[55vh] overflow-y-auto py-2'>
                            {headings.map(({ id, text, level }) => (
                                <li key={id}>
                                    <a
                                        href={`#${id}`}
                                        onClick={() => setIsOpen(false)}
                                        aria-current={
                                            activeId === id
                                                ? 'location'
                                                : undefined
                                        }
                                        className={cn(
                                            'flex gap-3 px-5 py-3 text-[0.9375rem] leading-snug no-underline transition-colors md:px-8',
                                            level === 3 && 'pl-10 md:pl-13',
                                            activeId === id
                                                ? 'bg-stone-100 font-medium text-stone-900'
                                                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                                        )}
                                    >
                                        <span
                                            aria-hidden='true'
                                            className={cn(
                                                'mt-[0.45rem] size-1.5 shrink-0 rounded-full',
                                                activeId === id
                                                    ? 'bg-gold-500'
                                                    : 'bg-stone-300'
                                            )}
                                        />
                                        <span className='line-clamp-2'>
                                            {text}
                                        </span>
                                    </a>
                                </li>
                            ))}
                        </ol>
                    </nav>
                </div>
            </div>
        </div>
    )
}
