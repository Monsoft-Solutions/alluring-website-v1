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
import {
    FAQSchema,
    OrganizationSchema,
    WebPageSchema,
} from '@workspace/seo/react'

import { SpecialsGalleryCarousel } from '@/components/sections/specials/specials-gallery-carousel.component'
import { SpecialsHero } from '@/components/sections/specials/specials-hero.component'
import { SpecialsHowItWorks } from '@/components/sections/specials/specials-how-it-works.component'
import { SpecialsPromotionsGrid } from '@/components/sections/specials/specials-promotions-grid.component'
import { SpecialsUrgencyStrip } from '@/components/sections/specials/specials-urgency-strip.component'
import { FAQComponent } from '@/components/shared/faq.component'
import { CTASection } from '@/components/shared/cta-section.component'
import { MobileCallButton } from '@/components/shared/mobile-call-button.component'
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
 * Specials Page Metadata
 *
 * SEO-optimized metadata including:
 * - Compelling title and description with keywords
 * - Open Graph tags for social sharing
 * - Twitter Card configuration
 * - Canonical URL
 */
export const metadata = toNextMetadata(seoConfig, {
    canonical: '/miami-plastic-surgery-specials',
    title: `Plastic Surgery Specials & Deals Miami | ${siteConfig.business.name}`,
    description:
        'Exclusive plastic surgery specials in Miami. Limited-time offers on BBL, breast augmentation, tummy tuck, liposuction & more. Board-certified surgeons, luxury results at promotional pricing.',

    openGraph: {
        title: `Plastic Surgery Specials & Deals | ${siteConfig.business.name} Miami`,
        description:
            'Exclusive savings on transformative procedures. BBL, breast augmentation, tummy tuck & more at special promotional pricing. Board-certified surgeons in Miami.',
        url: `${seoConfig.siteUrl}/miami-plastic-surgery-specials`,
        type: 'website',
        siteName: seoConfig.siteName,
        images: [
            {
                url: `${seoConfig.siteUrl}/og-image.jpg`,
                width: 1200,
                height: 630,
                alt: `Plastic Surgery Specials - ${siteConfig.business.name} Miami`,
            },
        ],
    },

    twitter: {
        card: 'summary_large_image',
        title: `Plastic Surgery Specials & Deals | ${siteConfig.business.name} Miami`,
        description:
            'Exclusive plastic surgery specials in Miami. Limited-time offers on BBL, breast augmentation, tummy tuck & more.',
        images: [`${seoConfig.siteUrl}/og-image.jpg`],
    },
})

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

            {/* Main Content */}
            <main className='selection:bg-gold-200 bg-stone-50 font-sans text-stone-900 selection:text-stone-900'>
                {/* Section 1: Hero with Promotions + Form */}
                <SpecialsHero
                    id='specials-hero'
                    featuredPromotion={featuredPromotion}
                    totalPromotions={promotions.length}
                />

                {/* Section 2: Gallery Carousel */}
                <SpecialsGalleryCarousel
                    id='gallery-results'
                    images={galleryImages}
                />

                {/* Section 3: How It Works */}
                <SpecialsHowItWorks id='how-it-works' />

                {/* Section 4: All Promotions Grid */}
                <SpecialsPromotionsGrid
                    id='all-specials'
                    promotions={promotions}
                />

                {/* Section 5: Urgency Strip */}
                <SpecialsUrgencyStrip
                    id='urgency'
                    daysRemaining={urgencyDaysRemaining}
                />

                {/* Section 6: FAQ */}
                <FAQComponent
                    id='faq'
                    faqs={specialsFaqData}
                    title='Questions About Our Specials'
                    description='Everything you need to know about claiming promotional offers at Alluring Plastic Surgery.'
                    variant='muted'
                    includeSchema={false}
                    ctaConfig={{
                        title: 'Ready to claim your special offer?',
                        description:
                            'Our patient concierge is ready to help you get started.',
                        buttonText: 'Call Now',
                        phoneNumber: siteConfig.contact.phone.replace(
                            /\D/g,
                            ''
                        ),
                    }}
                />

                {/* Section 7: Final CTA */}
                <CTASection
                    id='final-cta'
                    variant='luxury'
                    heading='Ready for Your Transformation?'
                    description='Take advantage of our exclusive specials and start your journey to the body you deserve. Board-certified surgeons, luxury care, and promotional pricing await.'
                    primaryButton={{
                        text: 'Book Consultation',
                        href: '#specials-form',
                    }}
                    secondaryButton={{
                        text: 'Call Now',
                        href: `tel:${siteConfig.contact.phone.replace(/\D/g, '')}`,
                    }}
                    eyebrow='Limited Time Offers'
                    size='lg'
                />
            </main>

            {/* Mobile Sticky CTA */}
            <MobileCallButton />
        </>
    )
}
