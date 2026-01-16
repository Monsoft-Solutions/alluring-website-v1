'use client'

import Link from 'next/link'
import { Calendar, Phone } from 'lucide-react'

import { siteConfig, getPhoneLink } from '@/lib/data/site-config'
import { useAnalyticsEvent } from '@/lib/analytics/useAnalyticsEvent.hook'

/**
 * LinksPrimaryCTA Component
 *
 * Primary action buttons: Book Consultation (gold) and Call Now (outline)
 * These are the most important conversion points on the page
 * Tracks clicks to Google Analytics
 */
export function LinksPrimaryCTA() {
    const { track } = useAnalyticsEvent()
    const phoneLink = getPhoneLink()
    const phoneDisplay = siteConfig.contact.phoneDisplay

    const handleBookClick = () => {
        track('links_page_click', {
            link_name: 'links-cta-book',
            link_href: '/contact-us',
            link_title: 'Book Free Consultation',
            event_category: 'links_page',
            cta_type: 'primary',
        })
    }

    const handleCallClick = () => {
        track('links_page_click', {
            link_name: 'links-cta-call',
            link_href: phoneLink,
            link_title: 'Call Now',
            event_category: 'links_page',
            cta_type: 'phone',
        })
    }

    return (
        <div className='flex w-full flex-col gap-3'>
            {/* Book Consultation - Primary Gold Button */}
            <Link
                href='/contact-us'
                className='group bg-gold-500 shadow-gold-500/25 hover:bg-gold-600 hover:shadow-gold-500/30 relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl px-6 py-4 text-center font-sans text-sm font-bold tracking-widest text-white uppercase shadow-lg transition-all duration-300 hover:shadow-xl active:scale-[0.98]'
                onClick={handleBookClick}
                data-analytics='links-cta-book'
            >
                {/* Shimmer effect */}
                <span className='absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full' />

                <Calendar className='relative z-10 h-5 w-5' />
                <span className='relative z-10'>Book Free Consultation</span>
            </Link>

            {/* Call Now - Outline Button */}
            <a
                href={phoneLink}
                className='group hover:border-gold-500/50 flex w-full items-center justify-center gap-3 rounded-xl border border-white/20 bg-white/5 px-6 py-4 text-center font-sans text-sm font-bold tracking-widest text-white uppercase backdrop-blur-sm transition-all duration-300 hover:bg-white/10 active:scale-[0.98]'
                onClick={handleCallClick}
                data-analytics='links-cta-call'
            >
                <Phone className='h-5 w-5 transition-transform duration-300 group-hover:rotate-12' />
                <span>Call {phoneDisplay}</span>
            </a>
        </div>
    )
}
