/**
 * Cookie Consent Banner Component
 *
 * Displays a minimalist, Notion-inspired cookie consent banner for users to
 * accept or reject analytics cookies. Uses shadcn/ui components and design system tokens.
 * Only shows when user hasn't made a consent choice yet.
 *
 * @module components
 */

'use client'

import { Button } from '@workspace/ui/components/button'
import { Info } from 'lucide-react'

import { useConsent } from '@/lib/analytics/consent.context'
import { env } from '@/env'

/**
 * Cookie Consent Banner
 *
 * Minimalist banner following Notion-inspired design principles.
 * Features:
 * - Uses shadcn/ui Button components
 * - Design system color tokens (bg-card, border, etc.)
 * - Smooth slide-in animation
 * - Responsive design with proper spacing
 * - Accessible with keyboard navigation
 * - Client-only rendering to prevent hydration mismatch
 */
export function CookieBanner() {
    const {
        consentState,
        hasConsented,
        isInitialized,
        acceptAll,
        acceptEssential,
    } = useConsent()

    // Don't render during SSR, while initializing, or if user has already made a choice
    if (!isInitialized || hasConsented) {
        return null
    }

    return (
        <div
            className='animate-slide-in-from-bottom fixed inset-x-0 bottom-0 z-50'
            role='region'
            aria-label='Cookie consent banner'
        >
            {/* Backdrop with subtle blur effect */}
            <div className='from-background/80 pointer-events-none absolute inset-0 bg-gradient-to-t to-transparent backdrop-blur-sm' />

            {/* Content */}
            <div className='border-border bg-card/95 relative border-t shadow-lg backdrop-blur-md'>
                <div className='mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8'>
                    <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                        {/* Message */}
                        <div className='flex min-w-0 flex-1 items-start gap-3'>
                            <Info
                                className='text-muted-foreground mt-0.5 size-5 shrink-0'
                                aria-hidden='true'
                            />
                            <div className='min-w-0 flex-1'>
                                <p className='text-foreground text-sm leading-relaxed'>
                                    We use cookies to enhance your browsing
                                    experience and analyze our traffic.
                                </p>
                                <p className='text-muted-foreground mt-1 text-xs'>
                                    You can choose to accept all cookies or only
                                    essential ones.
                                </p>
                                {/* Dev mode: Show current state */}
                                {env.NODE_ENV === 'development' &&
                                    consentState && (
                                        <p className='text-muted-foreground/60 mt-1 text-xs'>
                                            Dev: Current state = {consentState}
                                        </p>
                                    )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className='flex shrink-0 items-center gap-3'>
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={acceptEssential}
                                className='whitespace-nowrap'
                            >
                                Essential Only
                            </Button>
                            <Button
                                size='sm'
                                onClick={acceptAll}
                                className='whitespace-nowrap'
                            >
                                Accept All
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
