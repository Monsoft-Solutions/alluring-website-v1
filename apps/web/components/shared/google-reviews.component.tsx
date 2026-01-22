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
 * - Text truncation with expand/collapse (via client component)
 * - Luxury gold accent styling
 */
import { Star, ExternalLink } from 'lucide-react'
import { ReviewSchema } from '@workspace/seo/react'

import { SectionContainer } from '@/components/shared/section-container.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionHeader } from '@/components/shared/section-header.component'
import { ReviewCard } from '@/components/shared/review-card.component'
import { siteConfig } from '@/lib/data/site-config'
import { getPublishedGoogleReviews } from '@/lib/queries/reviews/google-reviews.query'

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
                        {reviews.map((review, index) => (
                            <ReviewCard
                                key={review.id}
                                review={review}
                                index={index}
                            />
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
