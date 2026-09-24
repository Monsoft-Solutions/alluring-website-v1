import type { CSSProperties, ReactNode } from 'react'

import { FINANCING_PARTNERS } from '@/lib/data/site-config'
import type { GoogleReviewPublic } from '@/lib/queries/reviews/google-reviews.query'
import { readGoogleReviewText } from '@/lib/utils/google-review-text.util'

import { HOME_SECTION_IDS } from './home-page.constant'

const MAX_QUOTE_LENGTH = 96

/**
 * A review's opening sentence, if it is short enough to read in passing.
 * Only reviews written in English: a ticker has no room to say "Translated
 * by Google", and the page must say it wherever a translation shows.
 */
function shortQuote(review: GoogleReviewPublic): string | null {
    const { text, translatedByGoogle } = readGoogleReviewText(
        review.comment ?? ''
    )
    if (translatedByGoogle || !text) return null
    const first = text.split(/(?<=[.!?])\s+/)[0]?.trim() ?? ''
    if (first.length < 24 || first.length > MAX_QUOTE_LENGTH) return null
    return first
}

function firstName(name: string): string {
    return name.trim().split(/\s+/)[0] ?? name
}

type HomeProofTickerProps = {
    rating: number | null
    reviewCount: number
    reviews: GoogleReviewPublic[]
}

/**
 * The page's pulse, straight under the hero: a slow ribbon of what a
 * visitor checking the practice out wants to confirm first. The ribbon
 * carries the Google rating, a few patients' own first lines, who operates,
 * the BBL safety rule, prices in writing, video consultations, Spanish and
 * the financing partners.
 *
 * Server-rendered. The ribbon is one list; a second copy, hidden from
 * assistive technology, only renders when motion is welcome, to make the
 * loop seamless (`home-page.css`). Without motion it is a row you can swipe.
 */
export function HomeProofTicker({
    rating,
    reviewCount,
    reviews,
}: HomeProofTickerProps) {
    const quotes = reviews
        .map((review) => ({ review, quote: shortQuote(review) }))
        .filter(
            (entry): entry is { review: GoogleReviewPublic; quote: string } =>
                entry.quote !== null
        )
        .slice(0, 4)

    const items: ReactNode[] = [
        rating !== null && reviewCount > 0 ? (
            <span key='rating'>
                <span className='text-[var(--hp-champagne)]'>
                    ★ {rating.toFixed(1)}
                </span>{' '}
                on Google · {reviewCount} reviews
            </span>
        ) : null,
        <span key='surgeon'>
            Every surgery by Victoria Karlinsky, MD, FACS
        </span>,
        ...quotes.slice(0, 2).map(({ review, quote }) => (
            <span
                key={review.id}
                className='hp-display text-[1.125rem] tracking-normal text-[var(--hp-porcelain)] normal-case italic'
                data-copy-check='data'
            >
                “{quote}”{' '}
                <span className='font-sans text-[0.8125rem] text-[#b5a597] not-italic'>
                    — {firstName(review.reviewerName)}
                </span>
            </span>
        )),
        <span key='bbl'>Ultrasound-guided BBL, as Florida law requires</span>,
        <span key='price'>Your price in writing, before you book</span>,
        ...quotes.slice(2).map(({ review, quote }) => (
            <span
                key={review.id}
                className='hp-display text-[1.125rem] tracking-normal text-[var(--hp-porcelain)] normal-case italic'
                data-copy-check='data'
            >
                “{quote}”{' '}
                <span className='font-sans text-[0.8125rem] text-[#b5a597] not-italic'>
                    — {firstName(review.reviewerName)}
                </span>
            </span>
        )),
        <span key='video'>Video consultations from anywhere in the U.S.</span>,
        <span key='spanish'>Hablamos español</span>,
        <span key='financing'>
            Financing with {FINANCING_PARTNERS.join(' · ')}
        </span>,
    ].filter(Boolean)

    const track = (hidden: boolean) => (
        <ul
            className='hp-marquee__track items-center'
            aria-hidden={hidden || undefined}
        >
            {items.map((item, index) => (
                <li
                    key={index}
                    className='flex shrink-0 items-center gap-[var(--hp-marquee-gap)] text-[0.75rem] font-semibold tracking-[0.18em] whitespace-nowrap text-[#dccdbf] uppercase'
                >
                    {item}
                    <span
                        aria-hidden='true'
                        className='text-[var(--hp-champagne-2)]'
                    >
                        ✦
                    </span>
                </li>
            ))}
        </ul>
    )

    return (
        <section
            id={HOME_SECTION_IDS.proof}
            aria-label='Why patients choose Alluring'
            className='hp-grain border-y border-[var(--hp-line-dark)] bg-[var(--hp-espresso)] py-5 md:py-6'
        >
            <div
                className='hp-marquee'
                style={
                    {
                        '--hp-marquee-gap': '2.25rem',
                        '--hp-marquee-duration': '70s',
                    } as CSSProperties
                }
            >
                {track(false)}
                {track(true)}
            </div>
        </section>
    )
}
