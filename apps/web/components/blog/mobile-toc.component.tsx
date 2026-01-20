'use client'

/**
 * MobileTOC Component
 *
 * Collapsible table of contents for mobile devices.
 * Features:
 * - Sticky bar at top of content
 * - Expandable dropdown with headings
 * - Smooth scroll on heading click
 * - Active heading tracking
 *
 * Only visible on mobile/tablet (hidden on desktop where sidebar TOC is used).
 */
import { ChevronDown, List } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'

import { cn } from '@workspace/ui/lib/utils'

import type { TOCHeading } from '@/lib/types/blog/toc.type'

type MobileTOCProps = {
    headings: TOCHeading[]
}

export function MobileTOC({ headings }: MobileTOCProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [activeId, setActiveId] = useState<string>('')

    // Scroll spy: track which heading is currently visible
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id)
                    }
                })
            },
            {
                rootMargin: '-100px 0px -66%',
                threshold: 1.0,
            }
        )

        // Observe all headings
        headings.forEach(({ id }) => {
            const element = document.getElementById(id)
            if (element) observer.observe(element)
        })

        return () => observer.disconnect()
    }, [headings])

    const handleClick = useCallback((id: string) => {
        document.getElementById(id)?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        })
        setIsOpen(false)
    }, [])

    // Don't render if no headings
    if (headings.length === 0) {
        return null
    }

    // Find active heading for display
    const activeHeading = headings.find((h) => h.id === activeId)
    const displayText = activeHeading?.text ?? 'Table of Contents'

    return (
        <div className='sticky top-0 z-30 lg:hidden'>
            <div className='border-b border-stone-200 bg-white/95 backdrop-blur-sm'>
                {/* Toggle button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className='flex w-full items-center justify-between px-5 py-3.5'
                    aria-expanded={isOpen}
                    aria-controls='mobile-toc-content'
                >
                    <div className='flex items-center gap-2.5'>
                        <div className='bg-gold-500/10 flex h-8 w-8 items-center justify-center rounded-lg'>
                            <List className='text-gold-600 h-4 w-4' />
                        </div>
                        <div className='text-left'>
                            <span className='block text-xs font-medium text-stone-400'>
                                In this article
                            </span>
                            <span className='line-clamp-1 block text-sm font-medium text-stone-700'>
                                {displayText}
                            </span>
                        </div>
                    </div>
                    <ChevronDown
                        className={cn(
                            'h-5 w-5 text-stone-400 transition-transform duration-200',
                            isOpen && 'rotate-180'
                        )}
                    />
                </button>

                {/* Dropdown content */}
                <div
                    id='mobile-toc-content'
                    className={cn(
                        'overflow-hidden transition-all duration-300 ease-in-out',
                        isOpen ? 'max-h-[60vh]' : 'max-h-0'
                    )}
                >
                    <nav
                        aria-label='Table of contents'
                        className='border-t border-stone-100 bg-stone-50'
                    >
                        <ul className='max-h-[50vh] overflow-y-auto py-2'>
                            {headings.map(({ id, text, level }) => (
                                <li key={id}>
                                    <button
                                        onClick={() => handleClick(id)}
                                        className={cn(
                                            'flex w-full items-start gap-3 px-5 py-3 text-left text-sm transition-colors',
                                            level === 3 && 'pl-10', // Indent h3
                                            activeId === id
                                                ? 'bg-gold-500/10 text-gold-700 font-medium'
                                                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                                        )}
                                    >
                                        {/* Bullet indicator */}
                                        <span
                                            className={cn(
                                                'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full',
                                                activeId === id
                                                    ? 'bg-gold-500'
                                                    : 'bg-stone-300'
                                            )}
                                        />
                                        <span className='line-clamp-2'>
                                            {text}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    )
}
