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

import { SpecialsHero } from '@/components/sections/specials/specials-hero.component'
import { SpecialsHowItWorks } from '@/components/sections/specials/specials-how-it-works.component'
import { SpecialsPromotionsGrid } from '@/components/sections/specials/specials-promotions-grid.component'
import { SpecialsUrgencyStrip } from '@/components/sections/specials/specials-urgency-strip.component'
import { CTASection } from '@/components/shared/cta-section.component'
import { FAQComponent } from '@/components/shared/faq.component'
import { FearBusters } from '@/components/shared/fear-busters.component'
import { GalleryCarousel } from '@/components/shared/gallery-carousel.component'
import { Testimonials } from '@/components/shared/testimonials.component'
import { WeeklyPayments } from '@/components/shared/weekly-payments.component'
import { ChatSection } from '@/components/chat/chat-section.component'
import { specialsFaqData } from '@/lib/data/faq/specials-faq.data'
import { siteConfig } from '@/lib/data/site-config'
import { seoConfig } from '@/lib/seo-config'
import { generatePageTitle } from '@/lib/seo/generate-title.util'
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

export const metadata = toNextMetadata(seoConfig, {
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
        title: pageTitle,
        description:
            'Exclusive savings on BBL, breast augmentation, mommy makeover & more. Board-certified surgeons. Offers end soon.',
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

            {/* Main Content - Conversion-Optimized Flow */}
            <main className='selection:bg-gold-200 bg-stone-50 font-sans text-stone-900 selection:text-stone-900'>
                {/* Section 1: Hero with Promotions + Form */}
                <SpecialsHero
                    id='specials-hero'
                    featuredPromotion={featuredPromotion}
                    totalPromotions={promotions.length}
                />

                {/* Section 2: Fear Busters - Address objections immediately */}
                <FearBusters id='fear-busters' formAnchor='#specials-form' />

                {/* Section 3: Weekly Payments - Reinforce affordability */}
                <WeeklyPayments
                    id='weekly-payments'
                    formAnchor='#specials-form'
                />

                {/* Section 4: Testimonials - Social proof and emotional connection */}
                <Testimonials id='testimonials' formAnchor='#specials-form' />

                {/* Section 5: Gallery Carousel - Visual proof of results */}
                <GalleryCarousel id='gallery-results' images={galleryImages} />

                {/* Section 5.5: AI Chat - Engage and answer questions */}
                <ChatSection
                    id='chat-assistant'
                    title='Have Questions About Our Specials?'
                    description='Get instant answers about procedures, pricing, financing options, and more. Our AI assistant is available 24/7 to help you.'
                    welcomeMessage="Hi! I'm here to help you with any questions about our current specials and promotions. What procedure are you interested in?"
                />

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
            </main>

            {/* Mobile Sticky CTA - Removed: handled by root layout */}
        </>
    )
}
