'use client'

/**
 * Review Card Component (Client)
 *
 * Interactive review card with expand/collapse functionality.
 * Used by the GoogleReviews server component.
 *
 * Features:
 * - Text truncation with "See more" expansion
 * - Collapsible owner reply
 * - Gold accent styling
 * - Staggered animation on mount
 */
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import Image from 'next/image'

import {
    GoogleIcon,
    StarRating,
} from '@/components/shared/sprite-icon.component'
import type { GoogleReviewPublic } from '@/lib/queries/reviews/google-reviews.query'

// ============================================================================
// Constants
// ============================================================================

/** Maximum characters to show before truncating */
const MAX_CHARS = 200

// ============================================================================
// Main Component
// ============================================================================

export type ReviewCardProps = {
    /** The review data to display */
    readonly review: GoogleReviewPublic
    /** Index for staggered animation delay */
    readonly index?: number
}

export function ReviewCard({ review, index = 0 }: ReviewCardProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [showReply, setShowReply] = useState(false)

    // Format date
    const dateFormatted = new Date(review.reviewCreatedAt).toLocaleDateString(
        'en-US',
        {
            month: 'short',
            year: 'numeric',
        }
    )

    // Truncation logic
    const hasLongComment = review.comment && review.comment.length > MAX_CHARS
    const displayText =
        hasLongComment && !isExpanded
            ? review.comment?.substring(0, MAX_CHARS) + '…'
            : review.comment

    // Check if this review has no comment (only owner reply)
    const hasNoComment = !review.comment || review.comment.trim() === ''

    return (
        <article
            className='animate-fade-in-up group hover:border-gold-400/50 flex h-full flex-col rounded-xl border border-stone-200 bg-white p-6 opacity-0 shadow-sm transition-all duration-300 hover:shadow-lg md:p-8'
            style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: 'forwards',
            }}
        >
            {/* Header with Avatar and Rating */}
            <div className='mb-4 flex items-start justify-between'>
                <div className='flex items-center gap-3'>
                    {review.reviewerPhotoUrl ? (
                        <Image
                            src={review.reviewerPhotoUrl}
                            alt={review.reviewerName}
                            width={48}
                            height={48}
                            className='rounded-full'
                        />
                    ) : (
                        <div className='bg-gold-100 flex h-12 w-12 items-center justify-center rounded-full'>
                            <span className='text-gold-600 text-lg font-semibold'>
                                {review.reviewerName.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                    <div>
                        <p className='font-serif font-semibold text-stone-900'>
                            {review.reviewerName}
                        </p>
                        <p className='text-xs text-stone-500'>
                            {dateFormatted}
                        </p>
                    </div>
                </div>
                <StarRating
                    rating={review.rating}
                    label={`${review.reviewerName} rated us ${review.rating} out of 5 stars`}
                />
            </div>

            {/* Review Text - Pushes footer down with flex-grow */}
            <div className='mb-4 flex-grow'>
                {hasNoComment ? (
                    <p className='text-sm text-stone-400 italic'>
                        This reviewer left a {review.rating}-star rating without
                        a written review.
                    </p>
                ) : (
                    <>
                        <blockquote className='text-base leading-relaxed text-stone-700'>
                            &ldquo;{displayText}&rdquo;
                        </blockquote>

                        {/* See More / Show Less Button */}
                        {hasLongComment && (
                            <button
                                type='button'
                                onClick={() => setIsExpanded(!isExpanded)}
                                className='text-gold-600 hover:text-gold-700 mt-2 inline-flex items-center gap-1 text-sm font-medium transition-colors'
                            >
                                {isExpanded ? (
                                    <>
                                        Show less
                                        <ChevronUp className='h-4 w-4' />
                                    </>
                                ) : (
                                    <>
                                        See more
                                        <ChevronDown className='h-4 w-4' />
                                    </>
                                )}
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* Owner Reply - Collapsible */}
            {review.replyText && (
                <div className='mb-4'>
                    <button
                        type='button'
                        onClick={() => setShowReply(!showReply)}
                        className='inline-flex items-center gap-1 text-xs font-medium text-stone-500 transition-colors hover:text-stone-700'
                    >
                        {showReply ? (
                            <>
                                Hide response
                                <ChevronUp className='h-3 w-3' />
                            </>
                        ) : (
                            <>
                                Response from owner
                                <ChevronDown className='h-3 w-3' />
                            </>
                        )}
                    </button>

                    {showReply && (
                        <div className='mt-2 rounded-lg bg-stone-50 p-3'>
                            <p className='text-sm leading-relaxed text-stone-600'>
                                {review.replyText}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Google Attribution - Footer */}
            <div className='mt-auto flex items-center gap-2 border-t border-stone-100 pt-4'>
                <GoogleIcon />
                <span className='text-xs text-stone-500'>Google Review</span>
            </div>
        </article>
    )
}
