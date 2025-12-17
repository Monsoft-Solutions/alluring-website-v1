'use client'

import { useEffect, useRef, useState } from 'react'
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
    const buttonRef = useRef<HTMLAnchorElement>(null)
    const [hasTrackedImpression, setHasTrackedImpression] = useState(false)
    const [hasTrackedHover, setHasTrackedHover] = useState(false)

    // Track button click
    const handlePhoneClick = () => {
        track('floating_phone_click', {
            element_type: 'mobile_call_button',
            style: style,
            is_banner: isBanner,
            position: position,
            phone_number: phoneDisplay,
        })
    }

    // Track button hover/interaction (only once per session)
    const handleButtonHover = () => {
        if (!hasTrackedHover) {
            track('mobile_call_button_hover', {
                element_type: 'mobile_call_button',
                style: style,
                is_banner: isBanner,
                position: position,
            })
            setHasTrackedHover(true)
        }
    }

    // Track button impression when it becomes visible (only once)
    useEffect(() => {
        if (hasTrackedImpression || !buttonRef.current) return

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasTrackedImpression) {
                        track('mobile_call_button_impression', {
                            element_type: 'mobile_call_button',
                            style: style,
                            is_banner: isBanner,
                            position: position,
                        })
                        setHasTrackedImpression(true)
                    }
                })
            },
            { threshold: 0.5 } // Track when 50% visible
        )

        observer.observe(buttonRef.current)

        return () => observer.disconnect()
    }, [hasTrackedImpression, track, style, isBanner, position])

    // Banner mode forces center position and ignores left/right positioning
    const effectivePosition = isBanner ? 'bottom-center' : position

    // Position classes mapping (for non-banner mode)
    const positionClasses = {
        'bottom-left': 'left-4 bottom-4',
        'bottom-right': 'right-4 bottom-4',
        'bottom-center': 'left-1/2 -translate-x-1/2 bottom-4',
    }

    // Style-specific rendering with glassmorphism-friendly sizing
    const renderContent = () => {
        switch (style) {
            case 'icon-only':
                return (
                    <Phone
                        className='h-6 w-6 text-stone-800'
                        aria-label='Call now'
                    />
                )
            case 'text-only':
                return (
                    <span className='font-semibold text-stone-800'>
                        Call Now
                    </span>
                )
            case 'icon-text':
            default:
                return (
                    <>
                        <Phone
                            className='h-6 w-6 text-stone-800'
                            aria-hidden='true'
                        />
                        <span className='font-semibold text-stone-800'>
                            Call Now
                        </span>
                    </>
                )
        }
    }

    // Banner mode renders differently with glassmorphism
    if (isBanner) {
        return (
            <div
                className={cn(
                    // Base styles - fixed positioning at bottom
                    'fixed right-0 bottom-0 left-0 z-50',
                    // Glassmorphism background
                    'bg-white/80 backdrop-blur-xl',
                    // Subtle top border for definition
                    'border-t border-stone-200/60',
                    // Hide on desktop (md breakpoint and above)
                    'md:hidden',
                    // Safe area for mobile devices (iOS notch, Android nav bar)
                    'pb-safe'
                )}
            >
                <Link
                    ref={buttonRef}
                    href={phoneLink}
                    onClick={handlePhoneClick}
                    onMouseEnter={handleButtonHover}
                    onTouchStart={handleButtonHover}
                    className={cn(
                        // Full width container
                        'block w-full',
                        // Animation
                        'transition-all duration-300 ease-out',
                        'active:scale-[0.98]',
                        // Hover effect
                        'hover:bg-white/10'
                    )}
                    aria-label={`Call us at ${phoneDisplay}`}
                >
                    <div
                        className={cn(
                            // Flexbox for centering content
                            'flex items-center justify-center',
                            // Padding
                            'px-6 py-2',
                            // Spacing between icon and text
                            'gap-3',
                            // Text styling - dark stone for contrast on glass
                            'text-base font-semibold text-stone-800',
                            // Smooth transitions
                            'transition-all duration-300'
                        )}
                    >
                        {renderContent()}
                    </div>
                </Link>
            </div>
        )
    }

    // Non-banner mode (floating button) with glassmorphism
    return (
        <Link
            ref={buttonRef}
            href={phoneLink}
            onClick={handlePhoneClick}
            onMouseEnter={handleButtonHover}
            onTouchStart={handleButtonHover}
            className={cn(
                // Base styles - fixed positioning
                'fixed z-50',
                // Position
                positionClasses[effectivePosition],
                // Hide on desktop (md breakpoint and above)
                'md:hidden'
            )}
            aria-label={`Call us at ${phoneDisplay}`}
        >
            <div
                className={cn(
                    // Glassmorphism effect
                    'bg-white/80 backdrop-blur-xl',
                    // Subtle border for definition
                    'ring-1 ring-stone-200/60',
                    // Premium shadow
                    'shadow-xl shadow-stone-900/10',
                    // Shape and size
                    'flex items-center justify-center',
                    // Gold accent on active/hover
                    'transition-all duration-300',
                    'hover:ring-gold-400/50 hover:bg-white/90 hover:shadow-2xl',
                    'active:scale-95',
                    // Responsive sizing based on style
                    style === 'icon-only' && 'h-14 w-14 rounded-full',
                    style === 'text-only' && 'h-14 gap-2 rounded-full px-6',
                    style === 'icon-text' && 'h-14 gap-2 rounded-full px-6'
                )}
            >
                {renderContent()}
            </div>
        </Link>
    )
}
