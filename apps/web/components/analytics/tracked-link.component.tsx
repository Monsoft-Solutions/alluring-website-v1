/**
 * TrackedLink Component
 *
 * A wrapper around Next.js Link component that automatically tracks clicks to GA4.
 * Captures link text, URL, and custom event parameters.
 *
 * @module components/analytics/tracked-link
 */
'use client'

import Link from 'next/link'
import type { ComponentProps } from 'react'

import { useAnalyticsEvent } from '@/lib/analytics/useAnalyticsEvent.hook'
import type { EventParams } from '@/lib/analytics/analytics.types'

export type TrackedLinkProps = ComponentProps<typeof Link> & {
    /**
     * Custom event name (defaults to 'link_click')
     */
    eventName?: string
    /**
     * Additional event parameters to send to GA4
     */
    eventParams?: EventParams
    /**
     * Disable tracking for this link
     * @default false
     */
    disableTracking?: boolean
}

/**
 * TrackedLink - Link component with automatic GA4 event tracking
 *
 * Wraps Next.js Link and tracks click events with link text and URL.
 *
 * @example
 * ```tsx
 * <TrackedLink
 *   href="/procedures"
 *   eventName="nav_click"
 *   eventParams={{ nav_type: 'desktop', link_category: 'procedures' }}
 * >
 *   View Procedures
 * </TrackedLink>
 * ```
 */
export function TrackedLink({
    href,
    eventName = 'link_click',
    eventParams,
    disableTracking = false,
    children,
    onClick,
    ...props
}: TrackedLinkProps) {
    const { track } = useAnalyticsEvent()

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        // Track the event if tracking is enabled
        if (!disableTracking) {
            const linkUrl =
                typeof href === 'string'
                    ? href
                    : typeof href === 'object' &&
                        href !== null &&
                        'toString' in href
                      ? (href as { toString(): string }).toString()
                      : ''
            track(eventName, {
                link_url: linkUrl,
                link_text: typeof children === 'string' ? children : undefined,
                ...eventParams,
            })
        }

        // Call original onClick if provided
        onClick?.(e)
    }

    return (
        <Link href={href} onClick={handleClick} {...props}>
            {children}
        </Link>
    )
}
