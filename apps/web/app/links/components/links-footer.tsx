import { MapPin, Clock } from 'lucide-react'

import { siteConfig } from '@/lib/data/site-config'

/**
 * LinksFooter Component
 *
 * Displays location and business hours at the bottom of the links page
 */
export function LinksFooter() {
    const { contact } = siteConfig

    // Get simplified hours display
    const weekdayHours = contact.businessHours?.find((h) =>
        h.days.toLowerCase().includes('monday')
    )
    const saturdayHours = contact.businessHours?.find((h) =>
        h.days.toLowerCase().includes('saturday')
    )

    return (
        <footer className='flex flex-col items-center gap-3 text-center'>
            {/* Location */}
            <div className='flex items-center gap-2 text-xs text-stone-500'>
                <MapPin className='h-3.5 w-3.5' />
                <span>
                    {contact.city}, {contact.state}
                </span>
            </div>

            {/* Hours */}
            <div className='flex items-center gap-2 text-xs text-stone-500'>
                <Clock className='h-3.5 w-3.5' />
                <span>
                    Mon-Fri {weekdayHours?.open}-{weekdayHours?.close}
                    {saturdayHours &&
                        ` • Sat ${saturdayHours.open}-${saturdayHours.close}`}
                </span>
            </div>

            {/* Copyright */}
            <p className='mt-2 text-[10px] text-stone-600'>
                &copy; {new Date().getFullYear()} {siteConfig.business.name}
            </p>
        </footer>
    )
}
