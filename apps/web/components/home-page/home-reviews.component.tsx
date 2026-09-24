import type { CSSProperties } from 'react'
import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'

import { ModuleStars } from '@/components/procedures/module-kit/module-stars.component'
import type { GoogleReviewPublic } from '@/lib/queries/reviews/google-reviews.query'
import { readGoogleReviewText } from '@/lib/utils/google-review-text.util'

import { HomeMotionToggle } from './home-motion-toggle.component'

import { HomeEyebrow } from './home-eyebrow.component'
import {
    HOME_SECTION_IDS,
    HOME_SECTION_INDEX,
    homeContainer,
    homeHeading,
    homeLead,
    homeLink,
} from './home-page.constant'

type HomeReviewsProps = {
    reviews: GoogleReviewPublic[]
    rating: number | null
    reviewCount: number
}

function ReviewCard({ review }: { review: GoogleReviewPublic }) {
    const { text, translatedByGoogle } = readGoogleReviewText(
        review.comment ?? ''
    )
    return (
        <figure className='hp-card flex h-full w-[19rem] flex-col p-6 md:w-[23rem] md:p-7'>
            <ModuleStars
                rating={review.rating}
                className='text-[0.85rem] text-[var(--hp-star)]'
            />
            <blockquote className='mt-4 flex-1'>
                <p className='line-clamp-6 text-[0.975rem] leading-[1.6] text-[var(--hp-ink-2)]'>
                    {text}
                </p>
            </blockquote>
            <figcaption className='mt-5 border-t border-[var(--hp-line)] pt-4 text-sm text-[var(--hp-mute)]'>
                <span className='font-semibold text-[var(--hp-ink)]'>
                    {review.reviewerName}
                </span>
                {' · '}
                {new Date(review.reviewCreatedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                    timeZone: 'UTC',
                })}
                {translatedByGoogle && (
                    <span className='block text-[var(--hp-mute)]'>
                        Translated by Google
                    </span>
                )}
            </figcaption>
        </figure>
    )
}

/**
 * Patients in their own words: two rows of Google reviews drifting in
 * opposite directions, from the practice's Google Business Profile as synced
 * into the database. Only the first row's cards are in the reading order;
 * the loop's duplicates are hidden from assistive technology. No Review
 * JSON-LD: reviews a business shows about itself aren't eligible for review
 * rich results. Review text is the reviewer's, marked `data-copy-check`.
 */
export function HomeReviews({
    reviews,
    rating,
    reviewCount,
}: HomeReviewsProps) {
    const withText = reviews.filter((review) => review.comment?.trim())
    if (withText.length === 0) return null

    const half = Math.ceil(withText.length / 2)
    const rows = [withText.slice(0, half), withText.slice(half)].filter(
        (row) => row.length > 0
    )

    return (
        <section
            id={HOME_SECTION_IDS.reviews}
            aria-labelledby='reviews-title'
            className='hp-defer overflow-hidden bg-[var(--hp-porcelain)] py-16 md:py-28'
        >
            <div
                className={cn(
                    homeContainer,
                    'flex flex-wrap items-end justify-between gap-6'
                )}
            >
                <div className='max-w-[42rem]'>
                    <HomeEyebrow index={HOME_SECTION_INDEX.reviews}>
                        Google reviews
                    </HomeEyebrow>
                    <h2 id='reviews-title' className={cn(homeHeading, 'mt-5')}>
                        {rating !== null && reviewCount > 0 ? (
                            <>
                                {rating.toFixed(1)} stars.{' '}
                                <em>{reviewCount} reviews.</em>
                            </>
                        ) : (
                            <>
                                In their <em>own words.</em>
                            </>
                        )}
                    </h2>
                    <p className={cn(homeLead, 'mt-6 text-[var(--hp-fg-2)]')}>
                        A selection of what patients wrote on Google, including
                        many who flew in from other states. Read them all on our
                        reviews page.
                    </p>
                </div>
                <div className='flex items-center gap-5'>
                    <HomeMotionToggle />
                    <Link href='/reviews' className={homeLink}>
                        Read every review
                    </Link>
                </div>
            </div>

            <div className='mt-10 grid gap-5 md:mt-14' data-copy-check='data'>
                {rows.map((row, rowIndex) => (
                    <div
                        key={rowIndex}
                        className={cn(
                            'hp-marquee',
                            rowIndex % 2 === 1 && 'hp-marquee--reverse'
                        )}
                        style={
                            {
                                '--hp-marquee-gap': '1.25rem',
                                '--hp-marquee-duration': `${row.length * 9}s`,
                            } as CSSProperties
                        }
                    >
                        {[false, true].map((hidden) => (
                            <ul
                                key={String(hidden)}
                                className='hp-marquee__track items-stretch py-2'
                                aria-hidden={hidden || undefined}
                            >
                                {row.map((review) => (
                                    <li
                                        key={review.id}
                                        className='shrink-0 snap-start'
                                    >
                                        <ReviewCard review={review} />
                                    </li>
                                ))}
                            </ul>
                        ))}
                    </div>
                ))}
            </div>
        </section>
    )
}
