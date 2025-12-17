/**
 * TrackedButton Component
 *
 * A wrapper around shadcn/ui Button component that automatically tracks clicks to GA4.
 * Captures button text and custom event parameters.
 *
 * @module components/analytics/tracked-button
 */
'use client'

import { Button } from '@workspace/ui/components/button'
import type { ComponentProps } from 'react'

import { useAnalyticsEvent } from '@/lib/analytics/useAnalyticsEvent.hook'
import type { EventParams } from '@/lib/analytics/analytics.types'

export type TrackedButtonProps = ComponentProps<typeof Button> & {
    /**
     * Custom event name (defaults to 'button_click')
     */
    eventName?: string
    /**
     * Additional event parameters to send to GA4
     */
    eventParams?: EventParams
    /**
     * Disable tracking for this button
     * @default false
     */
    disableTracking?: boolean
}

/**
 * TrackedButton - Button component with automatic GA4 event tracking
 *
 * Wraps shadcn/ui Button and tracks click events with button text and parameters.
 *
 * @example
 * ```tsx
 * <TrackedButton
 *   eventName="cta_click"
 *   eventParams={{
 *     cta_name: 'hero_primary',
 *     page_section: 'hero'
 *   }}
 * >
 *   Schedule Consultation
 * </TrackedButton>
 * ```
 */
export function TrackedButton({
    eventName = 'button_click',
    eventParams,
    disableTracking = false,
    children,
    onClick,
    ...props
}: TrackedButtonProps) {
    const { track } = useAnalyticsEvent()

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        // Track the event if tracking is enabled
        if (!disableTracking) {
            track(eventName, {
                button_text:
                    typeof children === 'string'
                        ? children
                        : eventParams?.button_text,
                ...eventParams,
            })
        }

        // Call original onClick if provided
        onClick?.(e)
    }

    return (
        <Button onClick={handleClick} {...props}>
            {children}
        </Button>
    )
}
