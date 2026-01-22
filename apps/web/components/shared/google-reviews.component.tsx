/**
 * Google Reviews Component
 *
 * Displays real Google reviews from Google Business Profile.
 * Server component (SSR) for SEO benefits.
 *
 * Features:
 * - Displays only 4+ star reviews
 * - Includes Review JSON-LD schema for rich search results
 * - Responsive grid layout
 * - Google branding/attribution
 */
import { Star, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import { ReviewSchema } from '@workspace/seo/react'

import { SectionContainer } from '@/components/shared/section-container.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionHeader } from '@/components/shared/section-header.component'
import { siteConfig } from '@/lib/data/site-config'
import {
    getPublishedGoogleReviews,
    type GoogleReviewPublic,
} from '@/lib/queries/reviews/google-reviews.query'

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

function ReviewCard({ review }: { review: GoogleReviewPublic }) {
    const dateFormatted = new Date(review.reviewCreatedAt).toLocaleDateString(
        'en-US',
        {
            month: 'short',
            year: 'numeric',
        }
    )

    return (
        <article className='group flex h-full flex-col rounded-xl border border-stone-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg md:p-8'>
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
                        <div className='flex h-12 w-12 items-center justify-center rounded-full bg-stone-100'>
                            <span className='text-lg font-semibold text-stone-600'>
                                {review.reviewerName.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                    <div>
                        <p className='font-semibold text-stone-900'>
                            {review.reviewerName}
                        </p>
                        <p className='text-xs text-stone-500'>
                            {dateFormatted}
                        </p>
                    </div>
                </div>
                <StarRating rating={review.rating} />
            </div>

            {/* Review Text */}
            {review.comment && (
                <blockquote className='mb-4 flex-grow text-base leading-relaxed text-stone-700'>
                    &ldquo;{review.comment}&rdquo;
                </blockquote>
            )}

            {/* Owner Reply */}
            {review.replyText && (
                <div className='rounded-lg bg-stone-50 p-3'>
                    <p className='mb-1 text-xs font-medium text-stone-500'>
                        Response from the owner
                    </p>
                    <p className='line-clamp-2 text-sm text-stone-600'>
                        {review.replyText}
                    </p>
                </div>
            )}

            {/* Google Attribution */}
            <div className='mt-4 flex items-center gap-2 border-t border-stone-100 pt-4'>
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
                <span className='text-xs text-stone-500'>Google Review</span>
            </div>
        </article>
    )
}

// ============================================================================
// Main Component
// ============================================================================

export type GoogleReviewsProps = {
    /** Section ID for anchor links */
    readonly id?: string
    /** Title for the section */
    readonly title?: string
    /** Subtitle for the section */
    readonly subtitle?: string
    /** Maximum number of reviews to show */
    readonly limit?: number
    /** Show only featured reviews */
    readonly featuredOnly?: boolean
    /** Show the "View all on Google" link */
    readonly showGoogleLink?: boolean
    /** Include Review JSON-LD schema */
    readonly includeSchema?: boolean
    /** Custom CSS class */
    readonly className?: string
}

export async function GoogleReviews({
    id = 'google-reviews',
    title = 'What Our Patients Say',
    subtitle = 'Real reviews from real patients on Google',
    limit = 6,
    featuredOnly = false,
    showGoogleLink = true,
    includeSchema = true,
    className,
}: GoogleReviewsProps) {
    const { reviews, averageRating, totalCount } =
        await getPublishedGoogleReviews(limit, featuredOnly)

    // Don't render if no reviews
    if (reviews.length === 0) {
        return null
    }

    return (
        <>
            {/* Review Schema for rich search results */}
            {includeSchema &&
                reviews.map((review) => (
                    <ReviewSchema
                        key={`schema-${review.id}`}
                        author={review.reviewerName}
                        datePublished={new Date(review.reviewCreatedAt)
                            .toISOString()
                            .slice(0, 10)}
                        reviewBody={review.comment ?? ''}
                        itemReviewed={{
                            name: siteConfig.business.name,
                            url: siteConfig.seo.siteUrl,
                        }}
                        reviewRating={{
                            ratingValue: review.rating,
                            bestRating: 5,
                            worstRating: 1,
                        }}
                    />
                ))}

            <SectionContainer
                id={id}
                variant='muted'
                className={className ?? 'bg-stone-50'}
                paddingY='py-16 lg:py-24'
            >
                <ContentWrapper size='lg' paddingX='px-6 md:px-12'>
                    {/* Header */}
                    <div className='mb-12 text-center'>
                        <SectionHeader
                            badge='Google Reviews'
                            title={title}
                            description={subtitle}
                            align='center'
                        />

                        {/* Rating Summary */}
                        {averageRating && totalCount > 0 && (
                            <div className='mt-6 flex items-center justify-center gap-2'>
                                <div className='flex items-center gap-1'>
                                    <Star className='h-5 w-5 fill-yellow-400 text-yellow-400' />
                                    <span className='text-lg font-semibold text-stone-900'>
                                        {averageRating.toFixed(1)}
                                    </span>
                                </div>
                                <span className='text-stone-500'>|</span>
                                <span className='text-stone-600'>
                                    {totalCount} reviews on Google
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Reviews Grid */}
                    <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                        {reviews.map((review) => (
                            <ReviewCard key={review.id} review={review} />
                        ))}
                    </div>

                    {/* Google Link */}
                    {showGoogleLink && siteConfig.business.googlePlaceId && (
                        <div className='mt-10 text-center'>
                            <a
                                href={`https://search.google.com/local/reviews?placeid=${siteConfig.business.googlePlaceId}`}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='text-gold-600 hover:text-gold-700 inline-flex items-center gap-2 text-sm font-medium transition-colors'
                            >
                                View all reviews on Google
                                <ExternalLink className='h-4 w-4' />
                            </a>
                        </div>
                    )}
                </ContentWrapper>
            </SectionContainer>
        </>
    )
}
