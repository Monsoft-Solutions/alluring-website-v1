'use client'

import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'
import { Phone } from 'lucide-react'
import Link from 'next/link'

import type { MobileCallButtonProps } from '@/lib/types/mobile-call-button/mobile-call-button-props.type'
import { getPhoneLink, siteConfig } from '@/lib/data/site-config'
import { useAnalyticsEvent } from '@/lib/analytics/useAnalyticsEvent.hook'

/**
 * Mobile Call Button Component
 *
 * A minimalistic, mobile-only call button that's always visible at the bottom of the screen.
 * Can appear as a floating button or a full-width banner.
 *
 * @example
 * // Floating button (default)
 * ```tsx
 * <MobileCallButton position="bottom-right" style="icon-only" />
 * ```
 *
 * @example
 * // Banner mode - full width with background
 * ```tsx
 * <MobileCallButton isBanner style="icon-text" />
 * ```
 */
export function MobileCallButton({
    position = 'bottom-center',
    style = 'icon-text',
    isBanner = false,
}: MobileCallButtonProps) {
    const phoneLink = getPhoneLink()
    const phoneDisplay = siteConfig.contact.phoneDisplay
    const { track } = useAnalyticsEvent()

    const handlePhoneClick = () => {
        track('phone_click', {
            element_type: 'mobile_call_button',
            style: style,
            is_banner: isBanner,
            phone_number: phoneDisplay,
        })
    }

    // Banner mode forces center position and ignores left/right positioning
    const effectivePosition = isBanner ? 'bottom-center' : position

    // Position classes mapping (for non-banner mode)
    const positionClasses = {
        'bottom-left': 'left-4 bottom-4',
        'bottom-right': 'right-4 bottom-4',
        'bottom-center': 'left-1/2 -translate-x-1/2 bottom-4',
    }

    // Style-specific rendering
    const renderContent = () => {
        switch (style) {
            case 'icon-only':
                return <Phone className='h-5 w-5' aria-label='Call now' />
            case 'text-only':
                return <span>Call Now</span>
            case 'icon-text':
            default:
                return (
                    <>
                        <Phone className='h-5 w-5' aria-hidden='true' />
                        <span>Call Now</span>
                    </>
                )
        }
    }

    // Banner mode renders differently
    if (isBanner) {
        return (
            <div
                className={cn(
                    // Base styles - fixed positioning at bottom
                    'fixed right-0 bottom-0 left-0 z-50',
                    // Banner background
                    'bg-primary',
                    // Hide on desktop (md breakpoint and above)
                    'md:hidden',
                    // Safe area for mobile devices (iOS notch, Android nav bar)
                    'pb-safe'
                )}
            >
                <Link
                    href={phoneLink}
                    onClick={handlePhoneClick}
                    className={cn(
                        // Full width container
                        'block w-full',
                        // Animation
                        'transition-transform duration-200 ease-out',
                        'active:scale-[0.98]'
                    )}
                    aria-label={`Call us at ${phoneDisplay}`}
                >
                    <div
                        className={cn(
                            // Flexbox for centering content
                            'flex items-center justify-center',
                            // Padding
                            'px-6 py-4',
                            // Spacing between icon and text
                            'gap-3',
                            // Text styling
                            'text-primary-foreground text-base font-semibold',
                            // Smooth transitions
                            'transition-all duration-200'
                        )}
                    >
                        {renderContent()}
                    </div>
                </Link>
            </div>
        )
    }

    // Non-banner mode (floating button)
    return (
        <Link
            href={phoneLink}
            onClick={handlePhoneClick}
            className={cn(
                // Base styles - fixed positioning
                'fixed z-50',
                // Position
                positionClasses[effectivePosition],
                // Hide on desktop (md breakpoint and above)
                'md:hidden',
                // Animation
                'transition-transform duration-200 ease-out',
                'active:scale-95'
            )}
            aria-label={`Call us at ${phoneDisplay}`}
        >
            <Button
                size={style === 'icon-only' ? 'icon' : 'lg'}
                className={cn(
                    // Spacing
                    'gap-2',
                    // Shadow for elevation
                    'shadow-lg',
                    // Smooth transitions
                    'transition-all duration-200',
                    // Hover effect
                    'hover:shadow-xl',
                    // Ensure proper padding for different styles
                    style === 'icon-only' && 'rounded-full',
                    style === 'text-only' && 'px-6',
                    style === 'icon-text' && 'px-6'
                )}
            >
                {renderContent()}
            </Button>
        </Link>
    )
}
