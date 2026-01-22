/**
 * Reviews Page
 *
 * Dedicated page displaying ALL approved Google reviews.
 * SEO-optimized with rich schema markup for enhanced search visibility.
 *
 * Features:
 * - SSR for SEO crawlability
 * - WebPage and Breadcrumb schemas for structured data
 * - Review JSON-LD schemas for rich snippets
 * - Hero section with rating stats
 * - Full grid of all published reviews
 * - Before & After gallery
 * - Surgeons section
 * - FAQ section
 * - Contact form
 */
import type { Metadata } from 'next'
import { Star } from 'lucide-react'
import {
    BreadcrumbSchema,
    FAQSchema,
    LocalBusinessSchema,
    ReviewSchema,
    WebPageSchema,
} from '@workspace/seo/react'

import { ContainerLayout } from '@/components/container-layout.component'
import { SectionContainer } from '@/components/shared/section-container.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionHeader } from '@/components/shared/section-header.component'
import { ReviewCard } from '@/components/shared/review-card.component'
import { BeforeAfter } from '@/components/home/before-after.component'
import { Surgeons } from '@/components/home/surgeons.component'
import { CategorizedFAQ } from '@/components/shared/faq-categorized.component'
import { LeadForm } from '@/components/home/lead-form.component'
import { siteConfig } from '@/lib/data/site-config'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'
import { getPublishedGoogleReviews } from '@/lib/queries/reviews/google-reviews.query'
import { faqCategoriesHome, faqDataHome } from '@/lib/data/faq/home-faq-data'
import { env } from '@/env'

const siteUrl = env.NEXT_PUBLIC_SITE_URL ?? siteConfig.seo.siteUrl
const pageUrl = `${siteUrl}/reviews`

/**
 * Reviews Page Metadata
 *
 * SEO-optimized for review-related searches and local SEO.
 * Includes trust signals and procedure keywords.
 */
const pageTitle = 'Patient Reviews | 4.9 Stars | Alluring Plastic Surgery Miami'
const pageDescription =
    'Read real reviews from our patients on Google. 4.9-star rating with 100+ reviews. See why patients trust Alluring Plastic Surgery for BBL, breast augmentation, mommy makeover & more.'

export const metadata: Metadata = toNextMetadata(seoConfig, {
    canonical: '/reviews',
    title: pageTitle,
    description: pageDescription,

    openGraph: {
        type: 'website',
        url: pageUrl,
        title: pageTitle,
        description: pageDescription,
        siteName: siteConfig.business.name,
        images: [
            {
                url: `${siteUrl}/og-image.jpg`,
                width: 1200,
                height: 630,
                alt: `${siteConfig.business.name} - Patient Reviews`,
            },
        ],
    },

    twitter: {
        card: 'summary_large_image',
        title: pageTitle,
        description: pageDescription,
        images: [`${siteUrl}/og-image.jpg`],
    },

    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
})

export default async function ReviewsPage() {
    // Fetch ALL published reviews (high limit)
    const { reviews, averageRating, totalCount } =
        await getPublishedGoogleReviews(100, false)

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
            {/* Structured Data - WebPage Schema */}
            <WebPageSchema
                name={pageTitle}
                url={pageUrl}
                description={pageDescription}
            />

            {/* Structured Data - Breadcrumb Schema */}
            <BreadcrumbSchema items={breadcrumbItems} />

            {/* Structured Data - Review Schemas for rich snippets */}
            {reviews.map((review) => (
                <ReviewSchema
                    key={`schema-${review.id}`}
                    author={review.reviewerName}
                    datePublished={new Date(review.reviewCreatedAt)
                        .toISOString()
                        .slice(0, 10)}
                    reviewBody={review.comment ?? ''}
                    itemReviewed={{
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

            {/* Structured Data - FAQ Schema */}
            {faqSchemaItems.length > 0 && <FAQSchema items={faqSchemaItems} />}

            {/* Structured Data - LocalBusiness with AggregateRating for LLM search */}
            {averageRating && totalCount > 0 && (
                <LocalBusinessSchema
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

            {/* Main Content */}
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
                                        <div className='flex items-center gap-1'>
                                            {Array.from({ length: 5 }).map(
                                                (_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`h-6 w-6 ${
                                                            i <
                                                            Math.round(
                                                                averageRating
                                                            )
                                                                ? 'fill-yellow-400 text-yellow-400'
                                                                : 'text-stone-300'
                                                        }`}
                                                    />
                                                )
                                            )}
                                        </div>
                                        <span className='text-2xl font-bold text-stone-900'>
                                            {averageRating.toFixed(1)}
                                        </span>
                                    </div>

                                    <span className='hidden text-stone-300 sm:block'>
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
                                <svg
                                    viewBox='0 0 24 24'
                                    className='h-5 w-5'
                                    aria-hidden='true'
                                >
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
                                <span className='text-sm text-stone-500'>
                                    Verified Google Reviews
                                </span>
                            </div>
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

                        {/* View on Google Link */}
                        {siteConfig.business.googlePlaceId && (
                            <div className='mt-12 text-center'>
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
            </ContainerLayout>
        </>
    )
}
