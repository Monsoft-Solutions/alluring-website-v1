'use client'

/**
 * Google reviews, three of them, verbatim.
 *
 * These are pasted rather than read from the reviews table on purpose: the
 * three shown here were picked for what they answer (aftercare, travelling in,
 * day-one recovery) and a live query would rotate that argument away. The
 * Spanish set is a different three, in the reviewers' own words.
 */

import type { LpDictionary } from './lp-copy'
import { LP_LINKS } from './lp-copy'
import { GoogleMark, Rich, Stars } from './lp-primitives.component'

interface LpReviewsProps {
    readonly copy: LpDictionary['reviews']
}

export function LpReviews({ copy }: LpReviewsProps) {
    return (
        <section className='band' id='reviews'>
            <div className='wrap'>
                <div className='sec-head reveal'>
                    <p className='eyebrow'>{copy.eyebrow}</p>
                    <h2 className='h2'>
                        <Rich parts={copy.heading} />
                    </h2>
                </div>
                <p className='rating reveal'>
                    <GoogleMark />
                    <span className='score'>4.7</span>
                    <Stars />
                    <span className='src'>{copy.source}</span>
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
                <div className='cta-row'>
                    <a
                        className='link'
                        href={LP_LINKS.reviews}
                        target='_blank'
                        rel='noopener noreferrer'
                    >
                        {copy.link}
                    </a>
                </div>
            </div>
        </section>
    )
}
