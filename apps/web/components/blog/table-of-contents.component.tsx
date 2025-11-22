'use client'

import { useEffect, useState } from 'react'
import { cn } from '@workspace/ui/lib/utils'

import type { TOCHeading } from '@/lib/types/blog/toc.type'

type TableOfContentsProps = {
    headings: TOCHeading[]
    className?: string
}

export function TableOfContents({ headings, className }: TableOfContentsProps) {
    const [activeId, setActiveId] = useState<string>('')

    useEffect(() => {
        // Scroll spy: track which heading is currently visible
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

    const handleClick = (id: string) => {
        document.getElementById(id)?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        })
    }

    if (headings.length === 0) return null

    return (
        <nav
            className={cn(
                'border-border bg-card rounded-lg border p-4',
                className
            )}
            aria-label='Table of contents'
        >
            <p className='text-foreground mb-3 text-sm font-semibold tracking-wide uppercase'>
                Table of Contents
            </p>
            <div className='no-scrollbar max-h-[400px] overflow-y-auto'>
                <ul className='space-y-1 text-sm'>
                    {headings.map(({ id, text, level }) => (
                        <li
                            key={id}
                            className={cn(
                                'border-border/50 hover:bg-muted cursor-pointer rounded-sm border-b px-3 py-2 transition-all duration-200 last:border-b-0',
                                level === 3 && 'pl-6', // Indent h3
                                activeId === id
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground'
                            )}
                            onClick={() => handleClick(id)}
                        >
                            {text}
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    )
}
