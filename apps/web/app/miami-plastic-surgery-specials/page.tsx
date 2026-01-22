/**
 * Miami Plastic Surgery Specials Page
 *
 * Conversion-optimized landing page showcasing current promotions and deals.
 * Features hero with consultation form, urgency elements, and trust indicators.
 *
 * SEO-optimized for:
 * - "miami plastic surgery specials"
 * - "cosmetic surgery deals"
 * - "promotional offers"
 */
import type { Metadata } from 'next'

import {
    FAQSchema,
    OfferCatalogSchema,
    OrganizationSchema,
    WebPageSchema,
} from '@workspace/seo/react'

import { ContainerLayout } from '@/components/container-layout.component'
import { SpecialsHero } from '@/components/sections/specials/specials-hero.component'
import { SpecialsHowItWorks } from '@/components/sections/specials/specials-how-it-works.component'
import { SpecialsPromotionsGrid } from '@/components/sections/specials/specials-promotions-grid.component'
import { SpecialsUrgencyStrip } from '@/components/sections/specials/specials-urgency-strip.component'
import { CTASection } from '@/components/shared/cta-section.component'
import { FAQComponent } from '@/components/shared/faq.component'
import { FearBusters } from '@/components/shared/fear-busters.component'
import { GalleryCarousel } from '@/components/shared/gallery-carousel.component'
import { GoogleReviews } from '@/components/shared/google-reviews.component'
import { WeeklyPayments } from '@/components/shared/weekly-payments.component'
import { specialsFaqData } from '@/lib/data/faq/specials-faq.data'
import { siteConfig } from '@/lib/data/site-config'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'
import { getSpecialsFeaturedGalleryImages } from '@/lib/queries/gallery/specials-gallery.query'
import {
    formatDiscount,
    getActivePromotions,
    getRemainingDays,
    isExpiringSoon,
} from '@/lib/queries/promotion.query'

/**
 * Generate dynamic month/year for specials page title
 * Ensures freshness signals in search results
 */
function getCurrentMonthYear(): string {
    const now = new Date()
    const month = now.toLocaleString('en-US', { month: 'long' })
    const year = now.getFullYear()
    return `${month} ${year}`
}

/**
 * Specials Page Metadata
 *
 * SEO-optimized metadata including:
 * - Dynamic month/year for freshness signals
 * - Urgency elements for CTR
 * - Trust signals and clear value proposition
 */
const monthYear = getCurrentMonthYear()
const pageTitle = `Miami Plastic Surgery Specials ${monthYear} | Limited Time Offers`

/**
 * Generate dynamic metadata with featured promotion's OG image
 */
export async function generateMetadata(): Promise<Metadata> {
    const promotions = await getActivePromotions(1)
    const featuredPromotion = promotions[0]

    const ogImage = featuredPromotion?.imageUrl
        ? {
              url: featuredPromotion.imageUrl,
              width: 1200,
              height: 630,
              alt:
                  featuredPromotion.imageAlt ??
                  `${featuredPromotion.title} - ${siteConfig.business.name}`,
          }
        : {
              url: `${seoConfig.siteUrl}/og-image.jpg`,
              width: 1200,
              height: 630,
              alt: `Plastic Surgery Specials - ${siteConfig.business.name} Miami`,
          }

    return toNextMetadata(seoConfig, {
        canonical: '/miami-plastic-surgery-specials',
        title: pageTitle,
        description:
            'Exclusive savings on BBL, breast augmentation, mommy makeover & more. Double Board-Certified surgeons. Offers end soon. Book your free consultation.',

        openGraph: {
            title: pageTitle,
            description:
                'Exclusive savings on BBL, breast augmentation, mommy makeover & more. Double Board-Certified surgeons. Offers end soon. Book your free consultation.',
            url: `${seoConfig.siteUrl}/miami-plastic-surgery-specials`,
            type: 'website',
            siteName: seoConfig.siteName,
            images: [ogImage],
        },

        twitter: {
            card: 'summary_large_image',
            title: pageTitle,
            description:
                'Exclusive savings on BBL, breast augmentation, mommy makeover & more. Board-certified surgeons. Offers end soon.',
            images: [ogImage.url],
        },
    })
}

/**
 * Find the promotion with the nearest expiration date
 */
function findNearestExpiringPromotion(
    promotions: Awaited<ReturnType<typeof getActivePromotions>>
) {
    const promotionsWithDates = promotions.filter((p) => p.endsAt !== null)

    if (promotionsWithDates.length === 0) {
        return null
    }

    return promotionsWithDates.reduce((nearest, current) => {
        if (!nearest.endsAt) return current
        if (!current.endsAt) return nearest
        return new Date(current.endsAt) < new Date(nearest.endsAt)
            ? current
            : nearest
    })
}

export default async function MiamiPlasticSurgerySpecialsPage() {
    // Fetch promotions and gallery images in parallel
    const [promotions, galleryImages] = await Promise.all([
        getActivePromotions(),
        getSpecialsFeaturedGalleryImages(),
    ])

    const rawFeaturedPromotion = promotions[0] ?? null
    const nearestExpiringPromotion = findNearestExpiringPromotion(promotions)
    const urgencyDaysRemaining = nearestExpiringPromotion
        ? getRemainingDays(nearestExpiringPromotion)
        : null

    // Pre-process featured promotion for client component
    const featuredPromotion = rawFeaturedPromotion
        ? {
              title: rawFeaturedPromotion.title,
              excerpt: rawFeaturedPromotion.excerpt,
              imageUrl: rawFeaturedPromotion.imageUrl,
              imageAlt: rawFeaturedPromotion.imageAlt,
              discount: formatDiscount(rawFeaturedPromotion),
              daysRemaining: getRemainingDays(rawFeaturedPromotion),
              expiringSoon: isExpiringSoon(rawFeaturedPromotion),
          }
        : null

    return (
        <>
            {/* SEO Schema */}
            <WebPageSchema
                name={`Plastic Surgery Specials & Deals - ${siteConfig.business.name} Miami`}
                url={`${seoConfig.siteUrl}/miami-plastic-surgery-specials`}
                description='Exclusive plastic surgery specials in Miami. Limited-time offers on BBL, breast augmentation, tummy tuck, liposuction and more. Board-certified surgeons, luxury results at promotional pricing.'
            />

            <OrganizationSchema
                name={seoConfig.siteName}
                url={seoConfig.siteUrl}
                logo={seoConfig.organization?.logo}
                sameAs={seoConfig.organization?.socialProfiles?.map(
                    (s) => s.url
                )}
            />

            <FAQSchema
                items={specialsFaqData.map((faq) => ({
                    question: faq.question,
                    answer: faq.answer,
                }))}
            />

            <OfferCatalogSchema
                name={`Miami Plastic Surgery Specials - ${monthYear}`}
                url={`${seoConfig.siteUrl}/miami-plastic-surgery-specials`}
                description='Exclusive plastic surgery specials in Miami. Limited-time offers on BBL, breast augmentation, tummy tuck, liposuction and more. Board-certified surgeons, luxury results at promotional pricing.'
                numberOfItems={promotions.length}
                offeredBy={{
                    type: 'LocalBusiness',
                    name: siteConfig.business.name,
                    url: seoConfig.siteUrl,
                    image: `${seoConfig.siteUrl}${siteConfig.brand.logo}`,
                    telephone: siteConfig.contact.phone,
                    priceRange: '$2500-$25000',
                    address: {
                        streetAddress: siteConfig.contact.address,
                        addressLocality: siteConfig.contact.city ?? '',
                        addressRegion: siteConfig.contact.state ?? '',
                        postalCode: siteConfig.contact.postalCode ?? '',
                        addressCountry: siteConfig.contact.country ?? '',
                    },
                }}
                itemListElement={promotions.map((promo) => ({
                    name: promo.title,
                    url: `${seoConfig.siteUrl}/promotions/${promo.slug}`,
                    description: promo.excerpt ?? promo.description,
                    validThrough: promo.endsAt
                        ? new Date(promo.endsAt).toISOString()
                        : undefined,
                    image: promo.imageUrl ?? undefined,
                    category: promo.type,
                }))}
            />

            {/* Main Content - Conversion-Optimized Flow */}
            <ContainerLayout as='div' noPaddingTop noPadding size='full'>
                {/* Section 1: Hero with Promotions + Form */}
                <SpecialsHero
                    id='specials-hero'
                    featuredPromotion={featuredPromotion}
                    totalPromotions={promotions.length}
                />

                {/* Section 2: Google Reviews - Immediate social proof */}
                <GoogleReviews
                    title='What Our Patients Say'
                    subtitle='Real reviews from patients who trusted us with their transformation'
                    limit={6}
                />

                {/* Section 3: Fear Busters - Address objections */}
                <FearBusters id='fear-busters' formAnchor='#specials-form' />

                {/* Section 4: Weekly Payments - Reinforce affordability */}
                <WeeklyPayments
                    id='weekly-payments'
                    formAnchor='#specials-form'
                />

                {/* Section 5: Gallery Carousel - Visual proof of results */}
                <GalleryCarousel id='gallery-results' images={galleryImages} />

                {/* Section 6: How It Works - Make the process feel easy */}
                <SpecialsHowItWorks id='how-it-works' />

                {/* Section 7: All Promotions Grid - Additional offers */}
                <SpecialsPromotionsGrid
                    id='all-specials'
                    promotions={promotions}
                />

                {/* Section 8: Urgency Strip - Gentle reminder */}
                <SpecialsUrgencyStrip
                    id='urgency'
                    daysRemaining={urgencyDaysRemaining}
                />

                {/* Section 9: FAQ - Handle remaining questions */}
                <FAQComponent
                    id='faq'
                    faqs={specialsFaqData}
                    title='Questions About Our Specials'
                    description='Everything you need to know about claiming promotional offers at Alluring Plastic Surgery.'
                    variant='muted'
                    includeSchema={false}
                    ctaConfig={{
                        title: 'Ready to start your transformation?',
                        description:
                            'Our patient concierge is ready to answer your questions — no pressure, just honest answers.',
                        buttonText: 'Call Now',
                        phoneNumber: siteConfig.contact.phone.replace(
                            /\D/g,
                            ''
                        ),
                    }}
                />

                {/* Section 10: Final CTA - Last chance to convert */}
                <CTASection
                    id='final-cta'
                    variant='luxury'
                    heading='Your Transformation Starts Today'
                    description="You've researched, you've wondered, you've dreamed. Now it's your time. Board-certified surgeons, luxury care, and exclusive savings are waiting for you."
                    primaryButton={{
                        text: 'Yes, I Want My Free Consultation',
                        href: '#specials-form',
                    }}
                    secondaryButton={{
                        text: 'Call to Discuss Options',
                        href: `tel:${siteConfig.contact.phone.replace(/\D/g, '')}`,
                    }}
                    eyebrow='Take the First Step'
                    size='lg'
                />
            </ContainerLayout>

            {/* Mobile Sticky CTA - Removed: handled by root layout */}
        </>
    )
}
