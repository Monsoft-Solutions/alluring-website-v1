import Image from 'next/image'
import { Shield } from 'lucide-react'

import { siteConfig } from '@/lib/data/site-config'

/**
 * LinksProfile Component
 *
 * Displays the business logo, name, tagline, and trust badge
 * at the top of the links page with glassmorphic styling
 */
export function LinksProfile() {
    const { business, brand, trustStats } = siteConfig

    return (
        <div className='flex flex-col items-center text-center'>
            {/* Logo Container with glow effect */}
            <div className='relative mb-5'>
                <div className='bg-gold-400/20 absolute inset-0 rounded-full blur-xl' />
                <div className='relative h-24 w-24 overflow-hidden rounded-full border-2 border-white/20 bg-white p-2 backdrop-blur-sm'>
                    <Image
                        src={brand.logo}
                        alt={brand.logoAlt}
                        fill
                        className='object-contain p-2'
                        priority
                    />
                </div>
            </div>

            {/* Business Name */}
            <h1 className='mb-2 font-serif text-2xl font-bold tracking-wide text-white'>
                {business.name}
            </h1>

            {/* Tagline */}
            <p className='mb-4 text-sm font-light tracking-wide text-stone-400'>
                {business.tagline}
            </p>

            {/* Trust Badge */}
            {trustStats?.accreditation && (
                <div className='border-gold-500/30 bg-gold-500/10 inline-flex items-center gap-2 rounded-full border px-4 py-2'>
                    <Shield className='text-gold-400 h-4 w-4' />
                    <span className='text-gold-400 text-xs font-medium tracking-wide'>
                        {trustStats.accreditation}
                    </span>
                </div>
            )}
        </div>
    )
}
