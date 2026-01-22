/**
 * Travel/Out-of-Town Lead Generation Landing Page
 *
 * Landing page targeting out-of-town and medical tourism patients.
 * Emphasizes virtual consultations, fly-in concierge services,
 * and the complete travel surgery experience.
 *
 * URL: /fly-in-consultation
 *
 * Key differentiators from general landing page:
 * - Virtual consultation first approach
 * - Concierge guidance and recommendations
 * - Recovery accommodation recommendations
 * - Privacy/discretion benefits
 * - Out-of-state testimonials
 *
 * SEO-optimized for:
 * - "fly in plastic surgery miami"
 * - "medical tourism miami plastic surgery"
 * - "virtual plastic surgery consultation"
 * - "plastic surgery travel package"
 */
import {
    FAQSchema,
    OrganizationSchema,
    WebPageSchema,
} from '@workspace/seo/react'

import { ContainerLayout } from '@/components/container-layout.component'
import { TravelHero } from '@/components/landing/travel-hero.component'
import { WhyTravelMiami } from '@/components/landing/why-travel-miami.component'
import { TravelJourney } from '@/components/landing/travel-journey.component'
import { TravelMiniCapture } from '@/components/landing/travel-mini-capture.component'
import { FearBusters } from '@/components/shared/fear-busters.component'
import { WeeklyPayments } from '@/components/shared/weekly-payments.component'
import { GalleryCarousel } from '@/components/shared/gallery-carousel.component'
import { GoogleReviews } from '@/components/shared/google-reviews.component'
import { CategorizedFAQ } from '@/components/shared/faq-categorized.component'
import { CTASection } from '@/components/shared/cta-section.component'
import { ExitIntentPopup } from '@/components/home/exit-intent-popup.component'
import {
    travelLandingFaqCategories,
    travelLandingFaqData,
    travelLandingFaqConfig,
} from '@/lib/data/faq/travel-landing-faq.data'
import { siteConfig } from '@/lib/data/site-config'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'
import { getSpecialsFeaturedGalleryImages } from '@/lib/queries/gallery/specials-gallery.query'

/**
 * Travel Landing Page Metadata
 *
 * SEO-optimized for medical tourism and fly-in surgery searches.
 */
export const metadata = toNextMetadata(seoConfig, {
    canonical: '/fly-in-consultation',
    title: 'Fly-In Plastic Surgery Miami | Virtual Consultation | Concierge Service',
    description:
        'World-class plastic surgery in Miami with concierge support. Virtual consultation, travel guidance, recovery accommodation recommendations. BBL, breast augmentation, mommy makeover. Financing available.',

    openGraph: {
        title: 'Fly-In Plastic Surgery Miami | Virtual Consultation | Concierge Service',
        description:
            'World-class plastic surgery in Miami with concierge support. Virtual consultation, travel guidance, recovery accommodation recommendations. BBL, breast augmentation, mommy makeover.',
        url: `${seoConfig.siteUrl}/fly-in-consultation`,
        type: 'website',
        siteName: seoConfig.siteName,
        locale: 'en_US',
        images: [
            {
                url: `${seoConfig.siteUrl}/og-image.jpg`,
                width: 1200,
                height: 630,
                alt: `Fly-In Plastic Surgery Miami - ${siteConfig.business.name}`,
            },
        ],
    },

    twitter: {
        card: 'summary_large_image',
        title: 'Fly-In Plastic Surgery Miami | Concierge Service',
        description:
            'World-class plastic surgery in Miami with concierge support. Virtual consultation first. We guide your entire journey.',
        images: [`${seoConfig.siteUrl}/og-image.jpg`],
    },
})

export default async function FlyInConsultationPage() {
    // Fetch gallery images for the carousel
    const galleryImages = await getSpecialsFeaturedGalleryImages()

    // Flatten FAQ data for schema
    const allFaqItems = Object.values(travelLandingFaqData).flat()
    const faqSchemaItems = allFaqItems.map((faq) => ({
        question: faq.question,
        answer: faq.answer,
    }))

    return (
        <>
            {/* SEO Schema */}
            <WebPageSchema
                name={`Fly-In Plastic Surgery - ${siteConfig.business.name} Miami`}
                url={`${seoConfig.siteUrl}/fly-in-consultation`}
                description='World-class plastic surgery in Miami with fly-in concierge support. Start with a virtual consultation, then get expert guidance on travel, accommodations, and recovery.'
            />

            <OrganizationSchema
                name={seoConfig.siteName}
                url={seoConfig.siteUrl}
                logo={seoConfig.organization?.logo}
                sameAs={seoConfig.organization?.socialProfiles?.map(
                    (s) => s.url
                )}
            />

            <FAQSchema items={faqSchemaItems} />

            {/* Main Content - Travel-Focused Conversion Flow */}
            <ContainerLayout as='div' noPaddingTop noPadding size='full'>
                {/* Section 1: Travel Hero with Virtual Consultation Focus */}
                <TravelHero id='hero' />

                {/* Section 2: Why Travel to Miami */}
                <WhyTravelMiami id='why-travel' />

                {/* Section 3: Travel Journey - Step by Step Process */}
                <TravelJourney id='journey' />

                {/* Section 4: Fear Busters - Universal objection handling */}
                <FearBusters id='fear-busters' formAnchor='#hero-form' />

                {/* Section 5: Weekly Payments - Financing options */}
                <WeeklyPayments id='financing' formAnchor='#hero-form' />

                {/* Section 6: Before/After Gallery */}
                <GalleryCarousel id='gallery' images={galleryImages} />

                {/* Section 7: Google Reviews */}
                <GoogleReviews
                    title='What Our Fly-In Patients Say'
                    subtitle='Real reviews from patients who traveled to Miami for their transformation'
                    limit={6}
                />

                {/* Section 8: Travel FAQ */}
                <CategorizedFAQ
                    id='faq'
                    categories={travelLandingFaqCategories}
                    faqData={travelLandingFaqData}
                    badge={travelLandingFaqConfig.badge}
                    title={travelLandingFaqConfig.title}
                    subtitle={travelLandingFaqConfig.subtitle}
                    description={travelLandingFaqConfig.description}
                    variant='default'
                    showBackgroundDecoration={true}
                    includeSchema={false}
                    ctaConfig={{
                        title: 'Have more questions about traveling?',
                        description:
                            'Our concierge team specializes in fly-in patients.',
                        buttonText: 'Call Our Concierge',
                        phoneNumber: siteConfig.contact.phone.replace(
                            /\D/g,
                            ''
                        ),
                    }}
                />

                {/* Section 9: Travel Mini Lead Capture */}
                <TravelMiniCapture id='travel-capture' />

                {/* Section 10: Final CTA - Travel emphasis */}
                <CTASection
                    id='final-cta'
                    variant='luxury'
                    heading='Your Miami Transformation Awaits'
                    description="Start with a virtual consultation from anywhere in the world. When you're ready, our specialists will guide you through every step of planning your trip—so you can focus on becoming the best version of yourself."
                    primaryButton={{
                        text: 'Schedule Virtual Consultation',
                        href: '#hero-form',
                    }}
                    secondaryButton={{
                        text: 'Call Our Concierge Team',
                        href: `tel:${siteConfig.contact.phone.replace(/\D/g, '')}`,
                    }}
                    eyebrow='Fly-In Concierge Service'
                    size='lg'
                />
            </ContainerLayout>

            {/* Exit Intent Popup */}
            <ExitIntentPopup />
        </>
    )
}
