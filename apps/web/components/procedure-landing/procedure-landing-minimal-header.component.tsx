/**
 * ProcedureLandingMinimalHeader
 *
 * Stripped-down header for procedure landing pages. Logo (intentionally
 * unlinked — visitors stay on the LP), a click-to-call link, and a
 * single book CTA that anchors to the hero form. Sticky so both actions
 * are always one tap away.
 */
'use client'

import { Button } from '@workspace/ui/components/button'
import { Phone } from 'lucide-react'
import Image from 'next/image'

import { useAnalyticsEvent } from '@/lib/analytics/useAnalyticsEvent.hook'
import { getPhoneLink, siteConfig } from '@/lib/data/site-config'

export type ProcedureLandingMinimalHeaderProps = {
    readonly formAnchor?: string
}

export function ProcedureLandingMinimalHeader({
    formAnchor = '#hero-form',
}: ProcedureLandingMinimalHeaderProps) {
    const { trackCTA } = useAnalyticsEvent()
    const phoneHref = getPhoneLink()
    const phoneDisplay = siteConfig.contact.phoneDisplay

    return (
        <header className='sticky top-0 z-40 w-full border-b border-stone-200/60 bg-white/85 backdrop-blur-xl'>
            <div className='mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:h-[72px] md:px-8'>
                <div className='flex items-center'>
                    <Image
                        src='/logo.png'
                        alt='Alluring Plastic Surgery'
                        width={140}
                        height={40}
                        priority
                        className='h-9 w-auto md:h-10'
                    />
                </div>

                <div className='flex items-center gap-2 sm:gap-3'>
                    <a
                        href={phoneHref}
                        onClick={() =>
                            trackCTA('landing_phone_click', {
                                cta_position: 'landing_header',
                                lp_template_version: 'v2',
                            })
                        }
                        className='hover:border-gold-400 hover:text-gold-700 inline-flex items-center gap-1.5 rounded-full border border-stone-300 px-3 py-2 text-xs font-semibold tracking-wide text-stone-700 transition-colors sm:py-2 md:px-4 md:text-sm'
                        aria-label={`Call us at ${phoneDisplay}`}
                    >
                        <Phone className='h-3.5 w-3.5' aria-hidden='true' />
                        <span className='hidden md:inline'>{phoneDisplay}</span>
                        <span className='sr-only md:not-sr-only md:hidden'>
                            Call
                        </span>
                    </a>

                    <Button
                        asChild
                        size='sm'
                        className='bg-gold-500 hover:bg-gold-600 px-3 text-xs font-bold tracking-wide text-white uppercase shadow-md shadow-amber-500/20 transition-shadow hover:shadow-lg hover:shadow-amber-500/30 sm:px-6 sm:text-sm'
                    >
                        <a
                            href={formAnchor}
                            onClick={() =>
                                trackCTA('landing_cta_header', {
                                    cta_position: 'landing_header',
                                    lp_template_version: 'v2',
                                })
                            }
                        >
                            <span className='hidden sm:inline'>
                                Get My Free Quote
                            </span>
                            <span className='sm:hidden'>Free Quote</span>
                        </a>
                    </Button>
                </div>
            </div>
        </header>
    )
}
