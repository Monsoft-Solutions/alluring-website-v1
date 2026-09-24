'use client'

/**
 * Google reviews: three quoted, then a rail of more.
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

interface LpReviewsProps {
    readonly lang: LpLang
    readonly copy: LpDictionary['reviews']
    readonly rating: string
    /** Null when the live count is unavailable: the published figure shows. */
    readonly reviewCount: number | null
    readonly liveReviews: readonly LpLiveReview[]
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
}: LpReviewsProps) {
    const more = lang === 'en' ? liveReviews : []

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
                <div className='quotes reveal'>
                    {copy.items.map((review) => (
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
