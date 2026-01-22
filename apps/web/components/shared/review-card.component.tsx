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
import { Star, ChevronDown, ChevronUp } from 'lucide-react'
import Image from 'next/image'

import type { GoogleReviewPublic } from '@/lib/queries/reviews/google-reviews.query'

// ============================================================================
// Constants
// ============================================================================

/** Maximum characters to show before truncating */
const MAX_CHARS = 200

// ============================================================================
// Sub-Components
// ============================================================================

function StarRating({ rating }: { rating: number }) {
    return (
        <div className='flex items-center gap-0.5'>
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    className={`h-4 w-4 ${
                        i < rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-stone-300'
                    }`}
                />
            ))}
        </div>
    )
}

function GoogleLogo() {
    return (
        <svg viewBox='0 0 24 24' className='h-4 w-4' aria-hidden='true'>
            <path
                fill='#4285F4'
                d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
            />
            <path
                fill='#34A853'
                d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
            />
            <path
                fill='#FBBC05'
                d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
            />
            <path
                fill='#EA4335'
                d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
            />
        </svg>
    )
}

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
                <StarRating rating={review.rating} />
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
                <GoogleLogo />
                <span className='text-xs text-stone-500'>Google Review</span>
            </div>
        </article>
    )
}
