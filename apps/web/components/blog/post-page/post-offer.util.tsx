import type { ReactNode } from 'react'

import { siteConfig } from '@/lib/data/site-config'

import { OFFER_COPY } from './post-page.copy'

type Offer = { title: string; endsAt: Date | null }

/** "September 30" (or "30 de septiembre"), in Miami time. */
function formatEndsOn(endsAt: Date, locale: 'en-US' | 'es-US'): string {
    return new Date(endsAt).toLocaleDateString(locale, {
        month: 'long',
        day: 'numeric',
        timeZone: siteConfig.contact.timezone,
    })
}

/**
 * The live promotion as the thread's first bubble, in both languages: the
 * same markup the specials page uses (`cc-bubble--offer`), so the thread
 * styles it. The thread picks the language it is showing.
 */
export function postOfferIntro(
    offer: Offer | null
): { en: ReactNode; es: ReactNode } | undefined {
    if (!offer) return undefined

    const bubble = (endsLine: string | null) => (
        <li key='offer' className='cc-bubble cc-bubble--them cc-bubble--offer'>
            <p>
                <strong>{offer.title}</strong>
                {endsLine && <small>{endsLine}</small>}
            </p>
        </li>
    )

    return {
        en: bubble(
            offer.endsAt
                ? OFFER_COPY.en(formatEndsOn(offer.endsAt, 'en-US'))
                : null
        ),
        es: bubble(
            offer.endsAt
                ? OFFER_COPY.es(formatEndsOn(offer.endsAt, 'es-US'))
                : null
        ),
    }
}
