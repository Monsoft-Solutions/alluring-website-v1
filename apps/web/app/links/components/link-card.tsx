'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@workspace/ui/lib/utils'

import { useAnalyticsEvent } from '@/lib/analytics/useAnalyticsEvent.hook'

export interface LinkCardProps {
    href: string
    title: string
    description?: string
    icon?: ReactNode
    badge?: string
    variant?: 'default' | 'featured'
    external?: boolean
    className?: string
    analyticsId?: string
}

/**
 * LinkCard Component
 *
 * Glassmorphic card for individual links with hover effects
 * Supports featured variant for full-width cards
 * Tracks clicks to Google Analytics
 */
export function LinkCard({
    href,
    title,
    description,
    icon,
    badge,
    variant = 'default',
    external = false,
    className,
    analyticsId,
}: LinkCardProps) {
    const { track } = useAnalyticsEvent()
    const isFeatured = variant === 'featured'

    const handleClick = () => {
        track('links_page_click', {
            link_name: analyticsId ?? title,
            link_href: href,
            link_title: title,
            event_category: 'links_page',
        })
    }

    const content = (
        <>
            {/* Icon */}
            {icon && (
                <div className='text-gold-400 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10'>
                    {icon}
                </div>
            )}

            {/* Text Content */}
            <div className={cn('min-w-0 flex-1', !icon && 'text-center')}>
                <div className='flex items-center justify-between gap-2'>
                    <h3 className='truncate font-sans text-sm font-semibold tracking-wider text-white uppercase'>
                        {title}
                    </h3>
                    {badge && (
                        <span className='bg-gold-500/20 text-gold-400 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase'>
                            {badge}
                        </span>
                    )}
                </div>
                {description && (
                    <p className='mt-1 truncate text-xs text-stone-400'>
                        {description}
                    </p>
                )}
            </div>

            {/* Arrow */}
            <ChevronRight className='group-hover:text-gold-400 h-5 w-5 shrink-0 text-stone-500 transition-transform duration-300 group-hover:translate-x-1' />
        </>
    )

    const cardClasses = cn(
        'group flex w-full items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-sm transition-all duration-300',
        'hover:border-gold-500/30 hover:bg-white/10',
        'active:scale-[0.98]',
        isFeatured && 'py-5',
        className
    )

    if (external) {
        return (
            <a
                href={href}
                target='_blank'
                rel='noopener noreferrer'
                className={cardClasses}
                onClick={handleClick}
                data-analytics={analyticsId}
            >
                {content}
            </a>
        )
    }

    return (
        <Link
            href={href}
            className={cardClasses}
            onClick={handleClick}
            data-analytics={analyticsId}
        >
            {content}
        </Link>
    )
}
