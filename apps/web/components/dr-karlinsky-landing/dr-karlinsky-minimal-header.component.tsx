/**
 * DrKarlinskyMinimalHeader
 *
 * Stripped-down header for the ad landing page. Contains only:
 *   - Alluring logo (NOT a link to home — keeps visitors on the LP)
 *   - Phone number (tap-to-call)
 *   - "Book Consult" CTA scrolling to the hero form
 *
 * No nav. No exits. Sticky to the top so the CTA is always one click away.
 */
import { Button } from '@workspace/ui/components/button'
import { Phone } from 'lucide-react'
import Image from 'next/image'

import { getPhoneLink, siteConfig } from '@/lib/data/site-config'

export type DrKarlinskyMinimalHeaderProps = {
    readonly formAnchor?: string
}

export function DrKarlinskyMinimalHeader({
    formAnchor = '#hero-form',
}: DrKarlinskyMinimalHeaderProps) {
    const phoneHref = getPhoneLink()

    return (
        <header className='sticky top-0 z-40 w-full border-b border-stone-200/60 bg-white/85 backdrop-blur-xl'>
            <div className='mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:h-[72px] md:px-8'>
                {/* Logo (intentionally not linked anywhere) */}
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

                {/* Right cluster: phone + book button */}
                <div className='flex items-center gap-2 sm:gap-4'>
                    {/* Phone — visible everywhere; collapses to icon on small screens */}
                    <a
                        href={phoneHref}
                        className='hover:bg-gold-50 hover:text-gold-700 inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-stone-700 transition-colors'
                        aria-label={`Call ${siteConfig.contact.phoneDisplay}`}
                    >
                        <Phone className='text-gold-600 h-4 w-4 shrink-0' />
                        <span className='hidden sm:inline'>
                            {siteConfig.contact.phoneDisplay}
                        </span>
                    </a>

                    <Button
                        asChild
                        size='sm'
                        className='bg-gold-500 hover:bg-gold-600 px-4 text-xs font-bold tracking-wide text-white uppercase shadow-md shadow-amber-500/20 transition-shadow hover:shadow-lg hover:shadow-amber-500/30 sm:px-6 sm:text-sm'
                    >
                        <a href={formAnchor}>
                            <span className='hidden sm:inline'>
                                Book Consult
                            </span>
                            <span className='sm:hidden'>Book</span>
                        </a>
                    </Button>
                </div>
            </div>
        </header>
    )
}
