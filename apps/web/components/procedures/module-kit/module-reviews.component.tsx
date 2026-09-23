import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'

import { AnswerBlock } from '@/components/procedures/sections/answer-block.component'
import { mentionsProcedure } from '@/lib/procedures/procedure-mentions'
import type { GoogleReviewPublic } from '@/lib/queries/reviews/google-reviews.query'
import { readGoogleReviewText } from '@/lib/utils/google-review-text.util'

import { ModuleStars } from './module-stars.component'
import { moduleContainer, moduleLink } from './module-ui.constant'

/**
 * Up to `limit` reviews: those that mention the procedure first, then the
 * rest in the query's own order (featured, display order, newest). This is
 * the order the section's answer describes, so keep the two in step.
 *
 * Pass every published review: the ones that name a procedure can sit far
 * down the featured-first order (on 2026-09-22 the BBL ones were at
 * positions 58, 62 and 69 of 75).
 */
export function selectProcedureReviews(
    reviews: GoogleReviewPublic[],
    procedureSlug: string,
    limit = 3
): GoogleReviewPublic[] {
    const withText = reviews.filter((review) => review.comment?.trim())
    const named = withText.filter((review) =>
        mentionsProcedure(procedureSlug, review.comment)
    )
    const rest = withText.filter((review) => !named.includes(review))

    return [...named, ...rest].slice(0, limit)
}

type ModuleReviewsProps = {
    reviews: GoogleReviewPublic[]
    procedureSlug: string
    /** The heading and answer when every review shown names the procedure. */
    named: { question: string; answer: string }
    /** The answer under "What Alluring patients say on Google" otherwise. */
    mixedAnswer: string
}

/**
 * What patients say, from the practice's public Google Business Profile as
 * synced into the database.
 *
 * The heading names the procedure's patients only when every review shown
 * mentions the procedure; otherwise it is "What Alluring patients say on
 * Google", because a heading its reviews don't back reads as bait.
 * `selectProcedureReviews` lists the named ones first. No Review JSON-LD:
 * reviews a business publishes about itself are not eligible for review rich
 * results, and the markup would only add weight.
 *
 * A review written in another language shows Google's translation, marked
 * as such, rather than the marker, the translation and the original run
 * together. Review text is the reviewer's, not ours, so it is marked
 * `data-copy-check="data"` and the copy sweep leaves its figures alone.
 */
export function ModuleReviews({
    reviews,
    procedureSlug,
    named,
    mixedAnswer,
}: ModuleReviewsProps) {
    if (reviews.length === 0) return null

    const allNamed = reviews.every((review) =>
        mentionsProcedure(procedureSlug, review.comment)
    )

    return (
        <div className='pm-defer bg-stone-50'>
            <AnswerBlock
                id='reviews'
                question={
                    allNamed
                        ? named.question
                        : 'What Alluring patients say on Google'
                }
                className={cn(moduleContainer, 'py-12 md:py-24')}
                answer={allNamed ? named.answer : mixedAnswer}
            >
                <ul
                    data-copy-check='data'
                    className='mt-10 grid gap-x-10 gap-y-9 md:mt-12 lg:grid-cols-3'
                >
                    {reviews.map((review) => {
                        const { text, translatedByGoogle } =
                            readGoogleReviewText(review.comment ?? '')
                        return (
                            <li key={review.id}>
                                <figure className='flex h-full flex-col border-t border-stone-300 pt-5'>
                                    <ModuleStars
                                        rating={review.rating}
                                        className='text-base'
                                    />
                                    <blockquote className='mt-4 flex-1'>
                                        <p className='line-clamp-[9] font-serif text-lg leading-[1.55] text-stone-900'>
                                            {text}
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
                                        {translatedByGoogle && (
                                            <span className='block text-stone-500'>
                                                Translated by Google
                                            </span>
                                        )}
                                    </figcaption>
                                </figure>
                            </li>
                        )
                    })}
                </ul>
                <p className='mt-9'>
                    <Link
                        href='/reviews'
                        className={cn(moduleLink, 'text-base font-bold')}
                    >
                        Read every review
                    </Link>
                </p>
            </AnswerBlock>
        </div>
    )
}
