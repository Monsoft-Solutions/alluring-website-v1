import type { Metadata } from 'next'
import {
    BreadcrumbSchema,
    FAQSchema,
    MedicalClinicSchema,
    OfferSchema,
    PhysicianSchema,
    VideoObjectSchema,
    WebPageSchema,
} from '@workspace/seo/react'

import { ContainerLayout } from '@/components/container-layout.component'
import { Hero } from '@/components/home/hero.component'
import { Journey } from '@/components/home/journey.component'
import { Procedures } from '@/components/home/procedures.component'
import { GalleryShowcase } from '@/components/shared/gallery-showcase.component'
import { WhyUs } from '@/components/home/why-us.component'
import { Surgeons } from '@/components/home/surgeons.component'
import { BlogPostsSection } from '@/components/shared/blog-posts-section.component'
import { CategorizedFAQ } from '@/components/shared/faq-categorized.component'
import { GoogleReviews } from '@/components/shared/google-reviews.component'
import { LeadForm } from '@/components/home/lead-form.component'
import { PromoSection } from '@/components/promotions/promo-section.component'
import { siteConfig } from '@/lib/data/site-config'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'
import { faqCategoriesHome, faqDataHome } from '@/lib/data/faq/home-faq-data'
import {
    formatDiscount,
    getFeaturedPromotion,
} from '@/lib/queries/promotion.query'
import { getPublishedGoogleReviews } from '@/lib/queries/reviews/google-reviews.query'
import { env } from '@/env'

const siteUrl = env.NEXT_PUBLIC_SITE_URL ?? siteConfig.seo.siteUrl

/**
 * Homepage Metadata
 * SEO-optimized for plastic surgery + Miami + credentials + value proposition
 * CTR-optimized with trust signals and clear value proposition
 */
export const metadata: Metadata = toNextMetadata(seoConfig, {
    canonical: '/',
    title: 'Miami Plastic Surgery | Board-Certified Surgeons | Financing Available',
    description:
        "5,000+ happy patients trust Miami's premier plastic surgery clinic. BBL, breast augmentation, mommy makeover & more. Double Board-Certified surgeons. Free consultation.",

    // Open Graph tags for social sharing
    openGraph: {
        type: 'website',
        url: siteUrl,
        title: 'Miami Plastic Surgery | Board-Certified Surgeons | Financing Available',
        description:
            "5,000+ happy patients trust Miami's premier plastic surgery clinic. BBL, breast augmentation, mommy makeover & more. Double Board-Certified surgeons. Free consultation.",
        siteName: siteConfig.business.name,
        locale: 'en_US',
        images: [
            {
                url: `${siteUrl}/og-image.jpg`,
                width: 1200,
                height: 630,
                alt: `${siteConfig.business.name} - Board-Certified Plastic Surgery in Miami`,
            },
        ],
    },

    // Twitter Card tags
    twitter: {
        card: 'summary_large_image',
        title: 'Miami Plastic Surgery | Board-Certified Surgeons | Financing Available',
        description:
            "5,000+ happy patients trust Miami's premier plastic surgery clinic. BBL, breast augmentation, mommy makeover & more. Double Board-Certified surgeons.",
        images: [`${siteUrl}/og-image.jpg`],
    },

    // Robots directives
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

/**
 * Homepage Component
 *
 * The main landing page of the website.
 * Adapted from the prototype design with all sections in order.
 */
export default async function Page() {
    // Fetch featured promotion for homepage section
    const featuredPromotion = await getFeaturedPromotion()

    // Fetch Google reviews for aggregate rating schema
    const { averageRating, totalCount } = await getPublishedGoogleReviews(1)

    // Flatten FAQ data for schema (combine all categories)
    const allFaqItems = Object.values(faqDataHome).flat()
    const faqSchemaItems = allFaqItems.map((faq) => ({
        question: faq.question,
        answer: faq.answer,
    }))

    return (
        <>
            {/* Structured Data - WebPage Schema with Speakable for Voice Search */}
            <WebPageSchema
                name={`${siteConfig.business.name} | ${siteConfig.business.tagline}`}
                url={siteUrl}
                description={siteConfig.seo.siteDescription}
                speakable={{
                    cssSelector: [
                        'h1',
                        '.quick-answer',
                        '[data-speakable="true"]',
                    ],
                }}
            />

            {/* Structured Data - BreadcrumbList for navigation */}
            <BreadcrumbSchema items={[{ name: 'Home', item: siteUrl }]} />

            {/* Structured Data - VideoObject for hero background video */}
            <VideoObjectSchema
                name='Alluring Plastic Surgery - Miami Clinic Experience'
                description="Experience world-class cosmetic surgery at Miami's premier plastic surgery destination. Our state-of-the-art facility combines luxury with affordability."
                thumbnailUrl={`${siteUrl}/og-image.jpg`}
                uploadDate='2024-01-01'
                contentUrl='https://sarpxxbehh1ep7ka.public.blob.vercel-storage.com/videos/alluring-home-hero-v1-desktop.mp4'
                author={{
                    type: 'Organization',
                    name: siteConfig.business.name,
                    url: siteUrl,
                }}
            />

            {/* Structured Data - MedicalBusiness Schema for healthcare SEO */}
            <MedicalClinicSchema
                name={siteConfig.business.name}
                id={`${siteUrl}/#organization`}
                url={siteUrl}
                logo={`${siteUrl}${siteConfig.brand.logo}`}
                telephone={siteConfig.contact.phone}
                address={{
                    streetAddress: siteConfig.contact.address,
                    addressLocality: siteConfig.contact.city,
                    addressRegion: siteConfig.contact.state,
                    postalCode: siteConfig.contact.postalCode,
                    addressCountry: 'US',
                }}
                geo={{
                    latitude: siteConfig.contact.coordinates?.lat ?? 25.7529,
                    longitude: siteConfig.contact.coordinates?.lng ?? -80.3309,
                }}
                openingHoursSpecification={[
                    {
                        dayOfWeek: [
                            'Monday',
                            'Tuesday',
                            'Wednesday',
                            'Thursday',
                            'Friday',
                        ],
                        opens: '09:00',
                        closes: '17:00',
                    },
                    {
                        dayOfWeek: ['Saturday'],
                        opens: '09:00',
                        closes: '15:00',
                    },
                ]}
                image={`${siteUrl}/og-image.jpg`}
                medicalSpecialty={['PlasticSurgery']}
                isAcceptingNewPatients={true}
                priceRange='$2500-$25000'
                availableLanguage={['English', 'Spanish']}
                contactPoint={[
                    {
                        contactType: 'Appointments',
                        telephone: siteConfig.contact.phone,
                        availableLanguage: ['English', 'Spanish'],
                        areaServed: 'US',
                    },
                ]}
                sameAs={siteConfig.social.map((s) => s.url)}
                {...(averageRating && totalCount > 0
                    ? {
                          aggregateRating: {
                              ratingValue: averageRating,
                              reviewCount: totalCount,
                              bestRating: 5,
                              worstRating: 1,
                          },
                      }
                    : {})}
            />

            {/* Structured Data - Physician Schema for Dr. Victoria Karlinsky (E-E-A-T) */}
            <PhysicianSchema
                id={`${siteUrl}/#physician-dr-karlinsky`}
                name='Dr. Victoria Karlinsky'
                url={`${siteUrl}/about`}
                image={`${siteUrl}/images/surgeons/dr-karlinsky.webp`}
                description='Double Board-Certified Cosmetic Surgeon specializing in Brazilian Butt Lift (BBL), breast augmentation, mommy makeover, and body contouring procedures at Alluring Plastic Surgery in Miami, FL.'
                jobTitle='Double Board-Certified Cosmetic Surgeon'
                medicalSpecialty={['Plastic Surgery', 'Cosmetic Surgery']}
                telephone={siteConfig.contact.phone}
                address={{
                    streetAddress: siteConfig.contact.address,
                    addressLocality: siteConfig.contact.city,
                    addressRegion: siteConfig.contact.state,
                    postalCode: siteConfig.contact.postalCode,
                    addressCountry: 'US',
                }}
                worksFor={{
                    '@id': `${siteUrl}/#organization`,
                    name: siteConfig.business.name,
                    url: siteUrl,
                }}
                hasCredential={[
                    {
                        credentialCategory: 'BoardCertification',
                        name: 'Board Certified Cosmetic Surgeon',
                        recognizedBy: {
                            name: 'American Board of Cosmetic Surgery',
                            url: 'https://www.americanboardcosmeticsurgery.org/',
                        },
                    },
                ]}
                knowsAbout={[
                    'Brazilian Butt Lift (BBL)',
                    'Breast Augmentation',
                    'Mommy Makeover',
                    'Liposuction',
                    'Tummy Tuck',
                    'Body Contouring',
                    'Facial Rejuvenation',
                ]}
                sameAs={siteConfig.social.map((s) => s.url)}
            />

            {/* Structured Data - FAQ Schema for rich snippets */}
            {faqSchemaItems.length > 0 && <FAQSchema items={faqSchemaItems} />}

            {/* Structured Data - Offer Schema for featured promotion */}
            {featuredPromotion && (
                <OfferSchema
                    name={featuredPromotion.title}
                    description={
                        featuredPromotion.excerpt ??
                        featuredPromotion.description
                    }
                    url={`${siteUrl}/promotions/${featuredPromotion.slug}`}
                    validFrom={
                        featuredPromotion.startsAt
                            ? new Date(featuredPromotion.startsAt).toISOString()
                            : undefined
                    }
                    validThrough={
                        featuredPromotion.endsAt
                            ? new Date(featuredPromotion.endsAt).toISOString()
                            : undefined
                    }
                    priceValidUntil={
                        featuredPromotion.endsAt
                            ? new Date(featuredPromotion.endsAt).toISOString()
                            : undefined
                    }
                    availability='LimitedAvailability'
                    category={featuredPromotion.type}
                    image={featuredPromotion.imageUrl ?? undefined}
                    discount={formatDiscount(featuredPromotion) ?? undefined}
                    discountDescription={
                        formatDiscount(featuredPromotion)
                            ? `${formatDiscount(featuredPromotion)} - ${featuredPromotion.title}`
                            : undefined
                    }
                    offeredBy={{
                        '@id': `${siteUrl}/#organization`,
                        type: 'MedicalBusiness',
                        name: siteConfig.business.name,
                        url: siteUrl,
                    }}
                    itemOffered={
                        featuredPromotion.procedureSlug
                            ? {
                                  type: 'MedicalProcedure',
                                  name: featuredPromotion.title
                                      .replace(/\d+%?\s*(OFF|off)?\s*/g, '')
                                      .trim(),
                                  url: `${siteUrl}/procedures/${featuredPromotion.procedureSlug}`,
                              }
                            : undefined
                    }
                />
            )}

            <ContainerLayout as='div' noPaddingTop noPadding size='full'>
                <Hero />
                <Journey />
                <Procedures />
                {/* Featured Promotion Section - Only shown when active promotion exists */}
                {featuredPromotion && (
                    <PromoSection promotion={featuredPromotion} />
                )}
                <GalleryShowcase variant='muted' />
                <WhyUs />
                <Surgeons />
                <GoogleReviews
                    title='Real Reviews from Google'
                    subtitle='See what our patients are saying on Google'
                    limit={6}
                />
                <BlogPostsSection
                    title='Latest from Our Blog'
                    description='Expert insights and advice from our board-certified plastic surgeons'
                    badge='Knowledge Center'
                    variant='muted'
                    limit={3}
                    columns={3}
                />
                <CategorizedFAQ
                    categories={faqCategoriesHome}
                    faqData={faqDataHome}
                    badge='Clarity & Confidence'
                    title='Your Questions,'
                    subtitle='Answered.'
                    description='We believe transparency is the ultimate luxury. Here are the answers to the most common questions our patients ask.'
                    variant='default'
                    showBackgroundDecoration={true}
                    includeSchema={false}
                    ctaConfig={{
                        title: 'Still have questions?',
                        description:
                            'Our patient concierge is ready to help you.',
                        buttonText: 'Chat with Concierge',
                        phoneNumber: '7863058649',
                    }}
                />
                <LeadForm />
            </ContainerLayout>
        </>
    )
}
