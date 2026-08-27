/**
 * Reviews Page Content
 *
 * The body shared by `/reviews` and `/reviews/page/[page]`.
 *
 * The page used to render all 81 approved reviews in one document — 892 KB of
 * HTML, a third of it repeated star and Google-logo SVG. It now serves twelve
 * per page behind real `<a>` pagination, so every review stays in server HTML
 * and stays crawlable while any single document stays small.
 *
 * Sections below the grid (before & after, surgeons, FAQ, lead form) render on
 * page 1 only. Repeating them on all seven pages would duplicate the FAQ schema
 * seven times and give six near-identical pages to a crawler.
 *
 * @module components/reviews/reviews-page-content
 */
import {
    BreadcrumbSchema,
    FAQSchema,
    LocalBusinessSchema,
    ReviewSchema,
    WebPageSchema,
} from '@workspace/seo/react'

import { ContainerLayout } from '@/components/container-layout.component'
import { BeforeAfter } from '@/components/home/before-after.component'
import { LeadForm } from '@/components/home/lead-form.component'
import { Surgeons } from '@/components/home/surgeons.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { CTASection } from '@/components/shared/cta-section.component'
import { CategorizedFAQ } from '@/components/shared/faq-categorized.component'
import {
    Pagination,
    PaginationLinks,
} from '@/components/shared/pagination.component'
import { ReviewCard } from '@/components/shared/review-card.component'
import { SectionContainer } from '@/components/shared/section-container.component'
import { SectionHeader } from '@/components/shared/section-header.component'
import {
    GoogleIcon,
    StarRating,
} from '@/components/shared/sprite-icon.component'
import { faqCategoriesHome, faqDataHome } from '@/lib/data/faq/home-faq-data'
import { siteConfig } from '@/lib/data/site-config'
import type { GoogleReviewsPageResult } from '@/lib/queries/reviews/google-reviews.query'
import {
    buildReviewsCopy,
    reviewsPagePath,
    reviewsPageUrl,
} from '@/lib/seo/reviews-page'
import { env } from '@/env'

const siteUrl = env.NEXT_PUBLIC_SITE_URL ?? siteConfig.seo.siteUrl
const pageUrl = `${siteUrl}/reviews`

type ReviewsPageContentProps = {
    readonly data: GoogleReviewsPageResult
}

export function ReviewsPageContent({ data }: ReviewsPageContentProps) {
    const { reviews, averageRating, totalCount, page, totalPages } = data
    const isFirstPage = page === 1

    // Same copy the metadata uses, from the same figures — the WebPage schema
    // and the <title> must not disagree about the rating.
    const { title: pageTitle, description: pageDescription } = buildReviewsCopy(
        averageRating,
        totalCount,
        page
    )

    const currentPageUrl = `${siteUrl}${reviewsPagePath(page)}`

    // Breadcrumb items for schema
    const breadcrumbItems = [
        { name: 'Home', item: siteUrl },
        { name: 'Reviews', item: pageUrl },
    ]

    // Flatten FAQ data for schema
    const allFaqItems = Object.values(faqDataHome).flat()
    const faqSchemaItems = allFaqItems.map((faq) => ({
        question: faq.question,
        answer: faq.answer,
    }))

    return (
        <>
            {/* rel prev/next for the paginated set. React hoists these into
                <head>; Next's metadata `alternates` cannot express them. */}
            <PaginationLinks
                currentPage={page}
                totalPages={totalPages}
                hrefForPage={reviewsPageUrl}
            />

            {/* Structured Data - WebPage Schema */}
            <WebPageSchema
                name={pageTitle}
                url={currentPageUrl}
                description={pageDescription}
            />

            {/* Structured Data - Breadcrumb Schema */}
            <BreadcrumbSchema items={breadcrumbItems} />

            {/* Structured Data - Review Schemas for the reviews on this page.
                Only the twelve rendered here: markup for reviews a visitor
                cannot see on the page is what Google calls invisible
                structured data. */}
            {reviews.map((review) => (
                <ReviewSchema
                    key={`schema-${review.id}`}
                    author={review.reviewerName}
                    datePublished={new Date(review.reviewCreatedAt)
                        .toISOString()
                        .slice(0, 10)}
                    reviewBody={review.comment ?? ''}
                    itemReviewed={{
                        '@id': `${siteUrl}/#organization`,
                        type: 'MedicalBusiness',
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

            {/* Structured Data - FAQ Schema. Page 1 only; the FAQ block itself
                only renders there. */}
            {isFirstPage && faqSchemaItems.length > 0 && (
                <FAQSchema items={faqSchemaItems} />
            )}

            {/* Structured Data - LocalBusiness with AggregateRating for LLM search */}
            {averageRating && totalCount > 0 && (
                <LocalBusinessSchema
                    id={`${siteUrl}/#organization`}
                    name={siteConfig.business.name}
                    url={siteUrl}
                    telephone={siteConfig.contact.phone}
                    address={{
                        streetAddress: siteConfig.contact.address,
                        addressLocality: siteConfig.contact.city,
                        addressRegion: siteConfig.contact.state,
                        postalCode: siteConfig.contact.postalCode,
                        addressCountry: 'US',
                    }}
                    image={`${siteUrl}/og-image.jpg`}
                    aggregateRating={{
                        ratingValue: averageRating,
                        reviewCount: totalCount,
                        bestRating: 5,
                        worstRating: 1,
                    }}
                />
            )}

            <ContainerLayout as='div' noPaddingTop noPadding size='full'>
                {/* Hero Section */}
                <SectionContainer
                    id='reviews-hero'
                    variant='default'
                    className='bg-white'
                    paddingY='pt-24 pb-12 lg:pt-32 lg:pb-16'
                >
                    <ContentWrapper size='lg' paddingX='px-6 md:px-12'>
                        <div className='text-center'>
                            <SectionHeader
                                as='h1'
                                badge='Patient Reviews'
                                title='What Our Patients Say'
                                description='Real reviews from real patients who trusted us with their care. Read their stories and see why thousands choose Alluring Plastic Surgery.'
                                align='center'
                            />

                            {/* Rating Summary Stats */}
                            {averageRating && totalCount > 0 && (
                                <div className='mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8'>
                                    {/* Average Rating */}
                                    <div className='flex items-center gap-3'>
                                        <StarRating
                                            rating={averageRating}
                                            size='h-6 w-6'
                                            gap='gap-1'
                                            label={`Rated ${averageRating.toFixed(1)} out of 5 stars across ${totalCount} Google reviews`}
                                        />
                                        <span className='text-2xl font-bold text-stone-900'>
                                            {averageRating.toFixed(1)}
                                        </span>
                                    </div>

                                    <span
                                        className='hidden text-stone-300 sm:block'
                                        aria-hidden='true'
                                    >
                                        |
                                    </span>

                                    {/* Total Reviews */}
                                    <div className='text-stone-600'>
                                        <span className='font-semibold text-stone-900'>
                                            {totalCount}+
                                        </span>{' '}
                                        verified reviews on Google
                                    </div>
                                </div>
                            )}

                            {/* Google Attribution */}
                            <div className='mt-6 flex items-center justify-center gap-2'>
                                <GoogleIcon className='h-5 w-5' />
                                <span className='text-sm text-stone-500'>
                                    Verified Google Reviews
                                </span>
                            </div>

                            {/* Where the visitor is in the set. Only shown once
                            there is more than one page to be in. */}
                            {totalPages > 1 && (
                                <p className='mt-4 text-sm text-stone-500'>
                                    Page {page} of {totalPages}
                                </p>
                            )}
                        </div>
                    </ContentWrapper>
                </SectionContainer>

                {/* Reviews Grid */}
                <SectionContainer
                    id='all-reviews'
                    variant='muted'
                    className='bg-stone-50'
                    paddingY='py-16 lg:py-24'
                >
                    <ContentWrapper size='lg' paddingX='px-6 md:px-12'>
                        {reviews.length > 0 ? (
                            <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                                {reviews.map((review, index) => (
                                    <ReviewCard
                                        key={review.id}
                                        review={review}
                                        index={index}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className='py-12 text-center'>
                                <p className='text-stone-500'>
                                    No reviews available at this time.
                                </p>
                            </div>
                        )}

                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            hrefForPage={reviewsPagePath}
                            label='Patient reviews pagination'
                        />

                        {/* View on Google Link */}
                        {siteConfig.business.googlePlaceId && (
                            <div className='mt-4 text-center'>
                                <a
                                    href={`https://search.google.com/local/reviews?placeid=${siteConfig.business.googlePlaceId}`}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-gold-600 hover:text-gold-700 inline-flex items-center gap-2 text-sm font-medium transition-colors'
                                >
                                    View all reviews on Google
                                    <svg
                                        xmlns='http://www.w3.org/2000/svg'
                                        width='16'
                                        height='16'
                                        viewBox='0 0 24 24'
                                        fill='none'
                                        stroke='currentColor'
                                        strokeWidth='2'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        className='h-4 w-4'
                                        aria-hidden='true'
                                    >
                                        <path d='M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6' />
                                        <polyline points='15 3 21 3 21 9' />
                                        <line x1='10' y1='14' x2='21' y2='3' />
                                    </svg>
                                </a>
                            </div>
                        )}
                    </ContentWrapper>
                </SectionContainer>

                {isFirstPage ? (
                    <>
                        {/* Before & After Gallery */}
                        <BeforeAfter />

                        {/* Meet Our Surgeons */}
                        <Surgeons />

                        {/* FAQ Section */}
                        <CategorizedFAQ
                            categories={faqCategoriesHome}
                            faqData={faqDataHome}
                            badge='Common Questions'
                            title='Frequently Asked'
                            subtitle='Questions'
                            description='Find answers to the most common questions our patients ask about procedures, recovery, financing, and more.'
                            variant='muted'
                            showBackgroundDecoration={true}
                            includeSchema={false}
                            ctaConfig={{
                                title: 'Still have questions?',
                                description:
                                    'Our patient concierge is ready to help you.',
                                buttonText: 'Chat with Concierge',
                                phoneNumber: siteConfig.contact.phone.replace(
                                    /\D/g,
                                    ''
                                ),
                            }}
                        />

                        {/* Contact Form */}
                        <LeadForm />
                    </>
                ) : (
                    /* Pages 2+ carry the conversion path without repeating four
                   heavy sections on every page of the set. */
                    <CTASection
                        variant='luxury'
                        eyebrow='Start Your Transformation'
                        heading='Ready to Write Your Own Review?'
                        description='Every result you have just read about started with a free consultation. Book yours with a board-certified surgeon.'
                        primaryButton={{
                            text: 'Schedule Your Consultation',
                            href: '/contact-us',
                        }}
                        secondaryButton={{
                            text: 'Back to Page 1',
                            href: '/reviews',
                        }}
                    />
                )}
            </ContainerLayout>
        </>
    )
}
