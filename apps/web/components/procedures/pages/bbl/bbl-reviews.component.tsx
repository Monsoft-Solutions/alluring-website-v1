import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'

import { AnswerBlock } from '@/components/procedures/sections/answer-block.component'
import type { GoogleReviewPublic } from '@/lib/queries/reviews/google-reviews.query'

import { BblStars } from './bbl-stars.component'
import { bblContainer, bblLink } from './bbl-ui.constant'

const MENTIONS_BBL = /\bbbl\b|brazilian butt/i

/**
 * Up to `limit` reviews: those that mention a BBL first, then the rest in the
 * query's own order (featured, display order, newest). This is the order the
 * section's answer describes, so keep the two in step.
 */
export function selectBblReviews(
    reviews: GoogleReviewPublic[],
    limit = 3
): GoogleReviewPublic[] {
    const withText = reviews.filter((review) => review.comment?.trim())
    const bbl = withText.filter((review) =>
        MENTIONS_BBL.test(review.comment ?? '')
    )
    const rest = withText.filter((review) => !bbl.includes(review))

    return [...bbl, ...rest].slice(0, limit)
}

/**
 * "What Alluring patients say on Google." Reviews from the practice's public
 * Google Business Profile, as synced into the database.
 *
 * The heading does not say "BBL patients": none of the synced reviews
 * mentions a BBL yet, and a heading its reviews don't back reads as bait. Put
 * the BBL wording back once #258 brings BBL reviews in; `selectBblReviews`
 * already lists them first. No Review
 * JSON-LD: reviews a business publishes about itself are not eligible for
 * review rich results, and the markup would only add weight.
 *
 * Review text is the reviewer's, not ours, so it is marked
 * `data-copy-check="data"` and the copy sweep leaves its figures alone.
 */
export function BblReviews({ reviews }: { reviews: GoogleReviewPublic[] }) {
    if (reviews.length === 0) return null

    return (
        <div className='bbl-defer bg-stone-50'>
            <AnswerBlock
                id='reviews'
                question='What Alluring patients say on Google'
                className={cn(bblContainer, 'py-12 md:py-24')}
                answer="These reviews come from Alluring's public Google Business Profile. Reviews that mention a BBL appear first, followed by recent featured reviews from patients who had other procedures with us. You can read every review, and see the overall rating, on Google at any time."
            >
                <ul
                    data-copy-check='data'
                    className='mt-10 grid gap-x-10 gap-y-9 md:mt-12 lg:grid-cols-3'
                >
                    {reviews.map((review) => (
                        <li key={review.id}>
                            <figure className='flex h-full flex-col border-t border-stone-300 pt-5'>
                                <BblStars
                                    rating={review.rating}
                                    className='text-base'
                                />
                                <blockquote className='mt-4 flex-1'>
                                    <p className='line-clamp-[9] font-serif text-lg leading-[1.55] text-stone-900'>
                                        {review.comment}
                                    </p>
                                </blockquote>
                                <figcaption className='mt-4 text-[0.9375rem] leading-normal text-stone-600'>
                                    <span className='font-bold text-stone-900'>
                                        {review.reviewerName}
                                    </span>
                                    , Google review,{' '}
                                    {new Date(
                                        review.reviewCreatedAt
                                    ).toLocaleDateString('en-US', {
                                        month: 'long',
                                        year: 'numeric',
                                        timeZone: 'UTC',
                                    })}
                                </figcaption>
                            </figure>
                        </li>
                    ))}
                </ul>
                <p className='mt-9'>
                    <Link
                        href='/reviews'
                        className={cn(bblLink, 'text-base font-bold')}
                    >
                        Read every review
                    </Link>
                </p>
            </AnswerBlock>
        </div>
    )
}
