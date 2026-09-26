'use client'

/**
 * Google reviews: the rating and one quote chosen for the ad (#292) — the
 * reviewer who had that procedure, or the aftercare quote. A visitor who
 * opened the reviews sitelink (`?s=reviews`) asked to read them, so she gets
 * all three and the rail.
 *
 * The three quotes are pasted rather than read from the reviews table on
 * purpose: they were picked for what they answer (aftercare, travelling in,
 * day-one recovery) and a live query would rotate that argument away. The
 * Spanish set is a different three, in the reviewers' own words.
 *
 * The rail under them is live (`lp-proof.ts`): recent five-star reviews, so
 * a visitor who wants more reads them here instead of leaving for /reviews.
 * They are in the reviewer's own language, so the Spanish page keeps to its
 * three.
 */

import { fill } from '@/components/shared/consult-chat/consult-chat.util'

import type { LpDictionary, LpLang } from './lp-copy'
import { GoogleMark, Rich, Stars } from './lp-primitives.component'
import type { LpLiveReview } from './lp-proof'
import type { AdVariant } from './lp-variants'

/**
 * Which of the deck's three quotes each ad group gets. English: Erika
 * (aftercare), Alannah (flew in for a mommy makeover), Marycelis (tummy tuck
 * and lipo). Spanish: Marycelis, Lisandra, Raynellys.
 */
const QUOTE_FOR: Readonly<
    Record<
        LpLang,
        {
            readonly byAd: Partial<Record<AdVariant, number>>
            readonly otherwise: number
        }
    >
> = {
    en: {
        byAd: {
            'tummy-tuck': 2,
            liposuction: 2,
            'mommy-makeover': 1,
            'skin-removal': 1,
        },
        otherwise: 0,
    },
    es: {
        byAd: {
            'tummy-tuck': 0,
            liposuction: 0,
            'mommy-makeover': 1,
            'skin-removal': 1,
        },
        otherwise: 2,
    },
}

/** The quote an ad group's visitors read. */
export function lpQuoteIndex(lang: LpLang, adVariant: AdVariant): number {
    const pick = QUOTE_FOR[lang]
    return pick.byAd[adVariant] ?? pick.otherwise
}

interface LpReviewsProps {
    readonly lang: LpLang
    readonly copy: LpDictionary['reviews']
    readonly rating: string
    /** Null when the live count is unavailable: the published figure shows. */
    readonly reviewCount: number | null
    readonly liveReviews: readonly LpLiveReview[]
    readonly adVariant: AdVariant
    /** All three quotes and the live rail: the reviews sitelink's view. */
    readonly full: boolean
}

/** "May 2026". UTC on both sides, so the server and the browser agree. */
function monthYear(iso: string, lang: LpLang): string {
    return new Intl.DateTimeFormat(lang === 'es' ? 'es-US' : 'en-US', {
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(new Date(iso))
}

export function LpReviews({
    lang,
    copy,
    rating,
    reviewCount,
    liveReviews,
    adVariant,
    full,
}: LpReviewsProps) {
    const more = full && lang === 'en' ? liveReviews : []
    const chosen = copy.items[lpQuoteIndex(lang, adVariant)]
    const quotes = full ? copy.items : chosen ? [chosen] : copy.items

    return (
        <section className='band reviews' id='reviews'>
            <div className='wrap'>
                <div className='sec-head reveal'>
                    <p className='eyebrow'>{copy.eyebrow}</p>
                    <h2 className='h2'>
                        <Rich parts={copy.heading} />
                    </h2>
                </div>
                <p className='rating reveal'>
                    <GoogleMark />
                    <span className='score'>{rating}</span>
                    <Stars />
                    <span className='src'>
                        {reviewCount
                            ? fill(copy.sourceLive, {
                                  count: String(reviewCount),
                              })
                            : copy.source}
                    </span>
                </p>
                <div
                    className={`quotes reveal${quotes.length === 1 ? ' quotes--one' : ''}`}
                >
                    {quotes.map((review) => (
                        <article className='quote' key={review.by}>
                            <span className='mark' aria-hidden='true'>
                                “
                            </span>
                            <p>{review.quote}</p>
                            <footer>{review.by}</footer>
                        </article>
                    ))}
                </div>
            </div>

            {more.length > 0 && (
                <>
                    <div className='wrap'>
                        <h3 className='rail-title'>{copy.moreLabel}</h3>
                    </div>
                    <ul className='rail rv-rail' aria-label={copy.moreLabel}>
                        {more.map((review) => (
                            <li key={review.id}>
                                <article className='rv'>
                                    <Stars />
                                    <p>{review.text}</p>
                                    <footer>
                                        {review.name} ·{' '}
                                        {monthYear(review.date, lang)}
                                    </footer>
                                </article>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </section>
    )
}
