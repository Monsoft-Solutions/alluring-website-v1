/**
 * Call and visit details for the lead pages, read from `siteConfig`. Some
 * visitors reach /contact-us for the phone number or the address, so both
 * sit next to the consultation thread rather than at the bottom of the page.
 */

import { Clock, MapPin, Phone } from 'lucide-react'

import {
    getFullAddress,
    getPhoneLink,
    siteConfig,
} from '@/lib/data/site-config'

const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${siteConfig.business.name}, ${getFullAddress()}`
)}`

const openHours = (siteConfig.contact.businessHours ?? []).filter(
    (entry) => entry.open !== 'Closed'
)

const phoneDisplay = siteConfig.contact.phoneDisplay ?? siteConfig.contact.phone

export function ReachUsCard({
    className = '',
}: {
    readonly className?: string
}) {
    const { contact } = siteConfig

    return (
        <div className={`grid gap-3 ${className}`}>
            <a
                href={getPhoneLink()}
                className='group hover:border-gold-500/50 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-colors'
            >
                <span className='bg-gold-500/15 text-gold-400 grid h-11 w-11 flex-none place-items-center rounded-full'>
                    <Phone className='h-5 w-5' aria-hidden='true' />
                </span>
                <span className='min-w-0'>
                    <span className='text-gold-400 block text-[10.5px] font-bold tracking-[0.16em] uppercase'>
                        Call us
                    </span>
                    <span className='block font-serif text-xl text-stone-50'>
                        {phoneDisplay}
                    </span>
                </span>
            </a>

            <div className='rounded-2xl border border-white/10 bg-white/[0.04] p-4'>
                <div className='flex items-start gap-4'>
                    <span className='bg-gold-500/15 text-gold-400 grid h-11 w-11 flex-none place-items-center rounded-full'>
                        <MapPin className='h-5 w-5' aria-hidden='true' />
                    </span>
                    <div className='min-w-0'>
                        <p className='text-gold-400 text-[10.5px] font-bold tracking-[0.16em] uppercase'>
                            Visit us
                        </p>
                        <address className='font-serif text-lg leading-snug text-stone-50 not-italic'>
                            {contact.address}
                            <span className='block text-sm text-stone-400'>
                                {contact.city}, {contact.state}{' '}
                                {contact.postalCode}
                            </span>
                        </address>
                        <a
                            href={directionsUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-gold-400 mt-2 inline-block text-sm font-semibold underline underline-offset-2'
                        >
                            Get directions
                        </a>
                    </div>
                </div>
                <div className='mt-4 flex items-start gap-4 border-t border-white/10 pt-4'>
                    <span className='bg-gold-500/15 text-gold-400 grid h-11 w-11 flex-none place-items-center rounded-full'>
                        <Clock className='h-5 w-5' aria-hidden='true' />
                    </span>
                    <dl className='grid gap-1 text-sm text-stone-300'>
                        {openHours.map((entry) => (
                            <div key={entry.days} className='flex gap-3'>
                                <dt className='w-32 text-stone-400'>
                                    {entry.days}
                                </dt>
                                <dd className='text-stone-100'>
                                    {entry.open} – {entry.close}
                                </dd>
                            </div>
                        ))}
                        <div className='flex gap-3'>
                            <dt className='w-32 text-stone-400'>Languages</dt>
                            <dd className='text-stone-100'>English, Español</dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    )
}

/** Call and directions, one tap each, under the thread on phones. */
export function QuickReachRow({
    className = '',
}: {
    readonly className?: string
}) {
    return (
        <div className={`grid grid-cols-2 gap-2 ${className}`}>
            <a
                href={getPhoneLink()}
                className='flex min-h-14 flex-col items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-2 text-center'
            >
                <span className='text-sm font-semibold text-stone-50'>
                    Call
                </span>
                <span className='text-xs text-stone-400'>
                    {phoneDisplay.replace('+1 ', '')}
                </span>
            </a>
            <a
                href={directionsUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='flex min-h-14 flex-col items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-2 text-center'
            >
                <span className='text-sm font-semibold text-stone-50'>
                    Directions
                </span>
                <span className='text-xs text-stone-400'>
                    {siteConfig.contact.address}
                </span>
            </a>
        </div>
    )
}
