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
import { FAQSchema, ServiceSchema, WebPageSchema } from '@workspace/seo/react'

import { ContainerLayout } from '@/components/container-layout.component'
import { LandingHero } from '@/components/landing/landing-hero.component'
import { TransformationNarrative } from '@/components/landing/transformation-narrative.component'
import { MiniLeadCapture } from '@/components/landing/mini-lead-capture.component'
import { FearBusters } from '@/components/shared/fear-busters.component'
import { GalleryCarousel } from '@/components/shared/gallery-carousel.component'
import { GoogleReviews } from '@/components/shared/google-reviews.component'
import { FinancingSection } from '@/components/shared/financing-section.component'
import { Journey } from '@/components/home/journey.component'
import { WhyUs } from '@/components/home/why-us.component'
import { CategorizedFAQ } from '@/components/shared/faq-categorized.component'
import { resolveClaimsIn } from '@/lib/claims/resolve-claims.server'
import { AREA_SERVED } from '@workspace/shared/claims/identity'
import { FINANCING_SENTENCE_SHORT } from '@workspace/shared/claims/financing'
import { CTASection } from '@/components/shared/cta-section.component'
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
    title: 'Free Consultation Miami | Alluring Plastic Surgery',
    description:
        'Claim your free, no-obligation consultation with one Miami surgeon, Victoria Karlinsky, MD, FACS. BBL, breast augmentation, mommy makeover & more. Financing available.',

    openGraph: {
        title: 'Free Consultation Miami | Alluring Plastic Surgery',
        description:
            'Claim your free, no-obligation consultation with one Miami surgeon, Victoria Karlinsky, MD, FACS. BBL, breast augmentation, mommy makeover & more. Financing available.',
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
        title: 'Free Consultation Miami | Alluring Plastic Surgery',
        description:
            'Claim your free, no-obligation consultation with one Miami surgeon, Victoria Karlinsky, MD, FACS. Financing available.',
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

    // Claim tokens in the answers (prices, financing; #354), resolved once
    // for both the visible list and its schema.
    const faqData = await resolveClaimsIn(
        landingFaqData,
        'text',
        'faq /free-consultation'
    )

    // Flatten FAQ data for schema
    const allFaqItems = Object.values(faqData).flat()
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
                description='Claim your free, no-obligation consultation with one Miami surgeon, Victoria Karlinsky, MD, FACS. BBL, breast augmentation, mommy makeover & more. Financing available.'
            />

            <FAQSchema items={faqSchemaItems} />

            {/* Structured Data - Service Schema for consultation offering */}
            <ServiceSchema
                name='Free Plastic Surgery Consultation'
                description='Complimentary, no-obligation consultation with Victoria Karlinsky, MD, FACS. Discuss your aesthetic goals, explore surgical and non-surgical options, and receive personalized recommendations.'
                url={`${seoConfig.siteUrl}/free-consultation`}
                serviceType='Cosmetic Surgery Consultation'
                provider={{
                    '@id': `${seoConfig.siteUrl}/#organization`,
                    name: siteConfig.business.name,
                    url: seoConfig.siteUrl,
                    type: 'MedicalBusiness',
                    logo: seoConfig.organization?.logo,
                }}
                // US only (claims canon §1, §8): the shared list every page uses.
                areaServed={[...AREA_SERVED]}
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

                {/* Section 4: Financing partners */}
                <FinancingSection id='financing' formAnchor='#hero-form' />

                {/* Section 5: Before/After Gallery */}
                <GalleryCarousel id='gallery' images={galleryImages} />

                {/* Section 6: Google Reviews - Real Google reviews for trust */}
                <GoogleReviews
                    title='What Patients Say on Google'
                    subtitle='Real reviews from our patients on Google'
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
                    faqData={faqData}
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
                            'Our patient coordinators are ready to help — no pressure, just honest answers.',
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
                    description={`You've dreamed about it. You've researched it. Now it's time to take the first step. One surgeon, Victoria Karlinsky, MD, FACS, performs every procedure. ${FINANCING_SENTENCE_SHORT}`}
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
        </>
    )
}
