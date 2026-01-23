/**
 * Lead Generation Landing Page
 *
 * Conversion-optimized landing page targeting general audience (women 25-55).
 * Captures leads through emotional storytelling, trust building, and
 * multiple conversion touchpoints.
 *
 * URL: /free-consultation (SEO-optimized for consultation searches)
 * Variants: /free-consultation/miami, /fly-in-consultation
 *
 * SEO-optimized for:
 * - "free plastic surgery consultation miami"
 * - "plastic surgery financing"
 * - Lead generation landing searches
 */
import {
    FAQSchema,
    OrganizationSchema,
    ServiceSchema,
    WebPageSchema,
} from '@workspace/seo/react'

import { ContainerLayout } from '@/components/container-layout.component'
import { LandingHero } from '@/components/landing/landing-hero.component'
import { TransformationNarrative } from '@/components/landing/transformation-narrative.component'
import { MiniLeadCapture } from '@/components/landing/mini-lead-capture.component'
import { FearBusters } from '@/components/shared/fear-busters.component'
import { GalleryCarousel } from '@/components/shared/gallery-carousel.component'
import { GoogleReviews } from '@/components/shared/google-reviews.component'
import { WeeklyPayments } from '@/components/shared/weekly-payments.component'
import { Journey } from '@/components/home/journey.component'
import { WhyUs } from '@/components/home/why-us.component'
import { CategorizedFAQ } from '@/components/shared/faq-categorized.component'
import { CTASection } from '@/components/shared/cta-section.component'
import { ExitIntentPopup } from '@/components/home/exit-intent-popup.component'
import {
    landingFaqCategories,
    landingFaqData,
    landingFaqConfig,
} from '@/lib/data/faq/landing-faq.data'
import { siteConfig } from '@/lib/data/site-config'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'
import { getSpecialsFeaturedGalleryImages } from '@/lib/queries/gallery/specials-gallery.query'

/**
 * Landing Page Metadata
 *
 * SEO-optimized for lead generation and conversions.
 * Focus on action-oriented keywords and trust signals.
 */
export const metadata = toNextMetadata(seoConfig, {
    canonical: '/free-consultation',
    title: 'Free Consultation | Miami Plastic Surgery | Alluring',
    description:
        'Claim your free, no-obligation consultation with board-certified Miami plastic surgeons. BBL, breast augmentation, mommy makeover & more. Financing from $27/week.',

    openGraph: {
        title: 'Free Consultation | Miami Plastic Surgery | Alluring',
        description:
            'Claim your free, no-obligation consultation with board-certified Miami plastic surgeons. BBL, breast augmentation, mommy makeover & more. Financing from $27/week.',
        url: `${seoConfig.siteUrl}/free-consultation`,
        type: 'website',
        siteName: seoConfig.siteName,
        images: [
            {
                url: `${seoConfig.siteUrl}/og-image.jpg`,
                width: 1200,
                height: 630,
                alt: `Free Plastic Surgery Consultation - ${siteConfig.business.name} Miami`,
            },
        ],
    },

    twitter: {
        card: 'summary_large_image',
        title: 'Free Consultation | Miami Plastic Surgery | Alluring',
        description:
            'Claim your free, no-obligation consultation with board-certified Miami plastic surgeons. Financing from $27/week.',
        images: [`${seoConfig.siteUrl}/og-image.jpg`],
    },

    alternates: {
        canonical: '/free-consultation',
        languages: {
            'en-US': '/free-consultation',
            es: '/consulta-gratis',
            'x-default': '/free-consultation',
        },
    },
})

export default async function FreeConsultationPage() {
    // Fetch gallery images for the carousel
    const galleryImages = await getSpecialsFeaturedGalleryImages()

    // Flatten FAQ data for schema
    const allFaqItems = Object.values(landingFaqData).flat()
    const faqSchemaItems = allFaqItems.map((faq) => ({
        question: faq.question,
        answer: faq.answer,
    }))

    return (
        <>
            {/* SEO Schema */}
            <WebPageSchema
                name={`Free Consultation - ${siteConfig.business.name} Miami`}
                url={`${seoConfig.siteUrl}/free-consultation`}
                description='Claim your free, no-obligation consultation with board-certified Miami plastic surgeons. BBL, breast augmentation, mommy makeover & more. Flexible financing available.'
            />

            <OrganizationSchema
                id={`${seoConfig.siteUrl}/#organization`}
                name={seoConfig.siteName}
                url={seoConfig.siteUrl}
                logo={seoConfig.organization?.logo}
                sameAs={seoConfig.organization?.socialProfiles?.map(
                    (s) => s.url
                )}
            />

            <FAQSchema items={faqSchemaItems} />

            {/* Structured Data - Service Schema for consultation offering */}
            <ServiceSchema
                name='Free Plastic Surgery Consultation'
                description='Complimentary, no-obligation consultation with board-certified plastic surgeons. Discuss your aesthetic goals, explore surgical and non-surgical options, and receive personalized recommendations.'
                url={`${seoConfig.siteUrl}/free-consultation`}
                serviceType='Cosmetic Surgery Consultation'
                provider={{
                    '@id': `${seoConfig.siteUrl}/#organization`,
                    name: siteConfig.business.name,
                    url: seoConfig.siteUrl,
                    type: 'MedicalBusiness',
                    logo: seoConfig.organization?.logo,
                }}
                areaServed={['Miami', 'Florida', 'Latin America', 'Caribbean']}
                availableLanguage={['English', 'Spanish']}
                offers={{
                    price: 0,
                    priceCurrency: 'USD',
                    availability: 'InStock',
                    url: `${seoConfig.siteUrl}/free-consultation`,
                }}
                image={`${seoConfig.siteUrl}/og-image.jpg`}
            />

            {/* Main Content - Conversion-Optimized Flow */}
            <ContainerLayout as='div' noPaddingTop noPadding size='full'>
                {/* Section 1: Hero with Full Consultation Form */}
                <LandingHero id='hero' />

                {/* Section 2: Transformation Narrative - Emotional resonance */}
                <TransformationNarrative id='transformation' />

                {/* Section 3: Fear Busters - Address objections */}
                <FearBusters id='fear-busters' formAnchor='#hero-form' />

                {/* Section 4: Weekly Payments - Smart investment positioning */}
                <WeeklyPayments id='financing' formAnchor='#hero-form' />

                {/* Section 5: Before/After Gallery */}
                <GalleryCarousel id='gallery' images={galleryImages} />

                {/* Section 6: Google Reviews - Real Google reviews for trust */}
                <GoogleReviews
                    title='What Patients Say on Google'
                    subtitle='Verified reviews from real patients'
                    limit={3}
                    includeSchema={false}
                />

                {/* Section 8: Journey/Process - Make it feel easy */}
                <Journey />

                {/* Section 8: Why Alluring - Differentiators */}
                <WhyUs />

                {/* Section 9: FAQ - Handle remaining questions */}
                <CategorizedFAQ
                    id='faq'
                    categories={landingFaqCategories}
                    faqData={landingFaqData}
                    badge={landingFaqConfig.badge}
                    title={landingFaqConfig.title}
                    subtitle={landingFaqConfig.subtitle}
                    description={landingFaqConfig.description}
                    variant='default'
                    showBackgroundDecoration={true}
                    includeSchema={false}
                    ctaConfig={{
                        title: 'Still have questions?',
                        description:
                            'Our patient concierge is ready to help — no pressure, just honest answers.',
                        buttonText: 'Call Now',
                        phoneNumber: siteConfig.contact.phone.replace(
                            /\D/g,
                            ''
                        ),
                    }}
                />

                {/* Section 10: Mid-Page Lead Capture for scroll-engaged users */}
                <MiniLeadCapture id='mini-capture' />

                {/* Section 11: Final CTA */}
                <CTASection
                    id='final-cta'
                    variant='luxury'
                    heading='Your Transformation Starts Today'
                    description="You've dreamed about it. You've researched it. Now it's time to take the first step. Board-certified surgeons, luxury care, and flexible financing are waiting for you."
                    primaryButton={{
                        text: 'Yes, I Want My Free Consultation',
                        href: '#hero-form',
                    }}
                    secondaryButton={{
                        text: 'Call to Discuss Options',
                        href: `tel:${siteConfig.contact.phone.replace(/\D/g, '')}`,
                    }}
                    eyebrow='Take the First Step'
                    size='lg'
                />
            </ContainerLayout>

            {/* Exit Intent Popup - triggers on exit or after 60 seconds */}
            <ExitIntentPopup />
        </>
    )
}
