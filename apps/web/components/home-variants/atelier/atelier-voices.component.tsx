/**
 * Atelier Voices
 *
 * Real Google reviews as warm quote cards. No star graphics beside each
 * quote — the aggregate is stated once as a fact, which reads more
 * credible than five gold stars repeated six times.
 *
 * Reviews are passed down from the page so the query runs once and is
 * shared with anything else that needs the aggregate.
 *
 * Server-rendered.
 */
import Link from 'next/link'

import type { GoogleReviewPublic } from '@/lib/queries/reviews/google-reviews.query'

export type AtelierVoicesProps = {
    readonly reviews: readonly GoogleReviewPublic[]
    readonly averageRating: number | null
    readonly totalCount: number
}

/** Trims to a quotable length without cutting mid-word. */
function toQuote(comment: string, maxLength = 240): string {
    const clean = comment.trim()

    if (clean.length <= maxLength) {
        return clean
    }

    const truncated = clean.slice(0, maxLength)
    const lastBreak = truncated.lastIndexOf(' ')

    return `${truncated.slice(0, lastBreak > 0 ? lastBreak : maxLength).replace(/[,.;:]$/, '')}…`
}

export function AtelierVoices({
    reviews,
    averageRating,
    totalCount,
}: AtelierVoicesProps) {
    const quotable = reviews.filter(
        (review) => review.comment && review.comment.trim().length > 60
    )

    if (quotable.length === 0) {
        return null
    }

    return (
        <section
            className='scroll-mt-24 bg-[#2A1D17] px-6 py-20 md:px-10 md:py-28'
            aria-labelledby='atelier-voices-heading'
            id='voices'
        >
            <div className='mx-auto max-w-7xl'>
                <div className='mb-14 max-w-2xl'>
                    <span className='text-xs tracking-[0.3em] text-[#E5B9A6] uppercase'>
                        In their words
                    </span>
                    <h2
                        id='atelier-voices-heading'
                        className='mt-5 font-[family-name:var(--font-fraunces)] text-4xl leading-[1.05] text-[#F6EDE4] md:text-5xl'
                    >
                        We cannot edit
                        <span className='text-[#E5B9A6] italic'> these.</span>
                    </h2>
                    {averageRating !== null && totalCount > 0 && (
                        <p className='mt-6 text-lg leading-[1.75] text-[#F6EDE4]/65'>
                            {averageRating.toFixed(1)} average across{' '}
                            {totalCount.toLocaleString()} Google reviews — which
                            is exactly why they are worth reading.
                        </p>
                    )}
                </div>

                <ul className='grid gap-5 md:grid-cols-2 lg:grid-cols-3'>
                    {quotable.slice(0, 6).map((review) => (
                        <li
                            key={review.id}
                            className='flex flex-col rounded-[1.75rem] bg-[#3D2B23] p-7'
                        >
                            <blockquote className='flex-1'>
                                <p className='font-[family-name:var(--font-fraunces)] text-lg leading-[1.6] text-[#F6EDE4]'>
                                    &ldquo;{toQuote(review.comment ?? '')}
                                    &rdquo;
                                </p>
                            </blockquote>
                            <p className='mt-6 border-t border-[#F6EDE4]/15 pt-5 text-xs tracking-[0.15em] text-[#E5B9A6] uppercase'>
                                {review.reviewerName} ·{' '}
                                {new Date(review.reviewCreatedAt).getFullYear()}
                            </p>
                        </li>
                    ))}
                </ul>

                <Link
                    href='/reviews'
                    className='mt-10 inline-block border-b border-[#E5B9A6]/40 pb-1 text-sm text-[#E5B9A6] transition-colors hover:border-[#E5B9A6] hover:text-[#F6EDE4]'
                >
                    Read all reviews, including the critical ones
                </Link>
            </div>
        </section>
    )
}
