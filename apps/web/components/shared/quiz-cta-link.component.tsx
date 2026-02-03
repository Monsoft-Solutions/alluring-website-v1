'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { useAnalyticsEvent } from '@/lib/analytics/useAnalyticsEvent.hook'

interface QuizCTALinkProps {
    readonly href: string
    readonly trackingRef?: string
    readonly variant: 'inline' | 'banner'
    readonly className?: string
    readonly children: ReactNode
}

export function QuizCTALink({
    href,
    trackingRef,
    variant,
    className,
    children,
}: QuizCTALinkProps) {
    const { track } = useAnalyticsEvent()

    const handleClick = () => {
        track('quiz_cta_clicked', {
            quiz_name: 'procedure-finder',
            tracking_ref: trackingRef ?? 'none',
            variant,
        })
    }

    return (
        <Link href={href} className={className} onClick={handleClick}>
            {children}
        </Link>
    )
}
