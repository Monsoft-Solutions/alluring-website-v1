'use client'

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
 */
export function PostToc({ headings }: PostTocProps) {
    const activeId = useActiveHeading(headings, '(min-width: 64rem)')

    if (headings.length === 0) return null

    return (
        <nav aria-labelledby='post-toc-title'>
            <p
                id='post-toc-title'
                className='text-[0.6875rem] font-semibold tracking-[0.2em] text-stone-500 uppercase'
            >
                In this article
            </p>
            <ol className='mt-4 border-l border-stone-200'>
                {headings.map(({ id, text, level }) => (
                    <li key={id}>
                        <a
                            href={`#${id}`}
                            aria-current={
                                activeId === id ? 'location' : undefined
                            }
                            className={cn(
                                '-ml-px block border-l-2 py-2 pr-2 pl-4 text-[0.875rem] leading-snug no-underline transition-colors',
                                level === 3 && 'pl-7',
                                activeId === id
                                    ? 'border-gold-400 font-medium text-stone-900'
                                    : 'border-transparent text-stone-600 hover:border-stone-300 hover:text-stone-900'
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
