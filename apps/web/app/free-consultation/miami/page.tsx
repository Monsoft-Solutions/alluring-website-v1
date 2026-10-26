/**
 * Miami Lead Generation Landing Page
 *
 * Ultra-focused landing page targeting Miami local residents (women 25-55).
 * Emphasizes local presence, community trust, convenience, and Spanish support.
 *
 * URL: /free-consultation/miami
 *
 * Key differentiators from general landing page:
 * - Local surgeon, no travel messaging
 * - Miami office location prominently featured
 * - Spanish language support emphasized
 * - Local testimonials and community references
 * - Convenience of nearby follow-up care
 *
 * SEO-optimized for:
 * - "plastic surgery miami"
 * - "plastic surgeon near me miami"
 * - "miami plastic surgery consultation"
 * - "cirugía plástica miami"
 */
import {
    FAQSchema,
    LocalBusinessSchema,
    WebPageSchema,
} from '@workspace/seo/react'

import { ContainerLayout } from '@/components/container-layout.component'
import { MiamiHero } from '@/components/landing/miami-hero.component'
import { WhyLocal } from '@/components/landing/why-local.component'
import { MiamiMiniCapture } from '@/components/landing/miami-mini-capture.component'
import { FearBusters } from '@/components/shared/fear-busters.component'
import { FinancingSection } from '@/components/shared/financing-section.component'
import { GalleryCarousel } from '@/components/shared/gallery-carousel.component'
import { GoogleReviews } from '@/components/shared/google-reviews.component'
import { CategorizedFAQ } from '@/components/shared/faq-categorized.component'
import { resolveClaimsIn } from '@/lib/claims/resolve-claims.server'
import { CTASection } from '@/components/shared/cta-section.component'
import {
    miamiLandingFaqCategories,
    miamiLandingFaqData,
    miamiLandingFaqConfig,
} from '@/lib/data/faq/miami-landing-faq.data'
import { siteConfig } from '@/lib/data/site-config'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'
import { getSpecialsFeaturedGalleryImages } from '@/lib/queries/gallery/specials-gallery.query'

/**
 * Miami Landing Page Metadata
 *
 * SEO-optimized for local Miami searches.
 * Emphasizes local presence and Spanish language support.
 */
export const metadata = toNextMetadata(seoConfig, {
    canonical: '/free-consultation/miami',
    title: 'Miami Plastic Surgery | One Local Surgeon',
    description:
        'Cosmetic surgery in Miami with one surgeon, Victoria Karlinsky, MD, FACS. BBL, breast augmentation, mommy makeover & more. Hablamos español. Free consultation.',

    openGraph: {
        title: 'Miami Plastic Surgery | One Local Surgeon',
        description:
            'Cosmetic surgery in Miami with one surgeon, Victoria Karlinsky, MD, FACS. BBL, breast augmentation, mommy makeover & more. Hablamos español.',
        url: `${seoConfig.siteUrl}/free-consultation/miami`,
        type: 'website',
        siteName: seoConfig.siteName,
        locale: 'en_US',
        images: [
            {
                url: `${seoConfig.siteUrl}/og-image.jpg`,
                width: 1200,
                height: 630,
                alt: `Miami Plastic Surgery - ${siteConfig.business.name}`,
            },
        ],
    },

    twitter: {
        card: 'summary_large_image',
        title: 'Miami Plastic Surgery | One Local Surgeon',
        description:
            'Cosmetic surgery in Miami with one surgeon, Victoria Karlinsky, MD, FACS. Hablamos español. Free consultation.',
        images: [`${seoConfig.siteUrl}/og-image.jpg`],
    },

    alternates: {
        languages: {
            'en-US': '/free-consultation/miami',
            'es-US': '/free-consultation/miami', // Same page, bilingual support
        },
    },
})

export default async function MiamiConsultationPage() {
    // Fetch gallery images for the carousel
    const galleryImages = await getSpecialsFeaturedGalleryImages()

    // Claim tokens in the answers (prices, financing; #354), resolved once
    // for both the visible list and its schema.
    const faqData = await resolveClaimsIn(
        miamiLandingFaqData,
        'text',
        'faq /free-consultation/miami'
    )

    // Flatten FAQ data for schema
    const allFaqItems = Object.values(faqData).flat()
    const faqSchemaItems = allFaqItems.map((faq) => ({
        question: faq.question,
        answer: faq.answer,
    }))

    return (
        <>
            {/* SEO Schema - Local Business for Miami targeting */}
            <LocalBusinessSchema
                name={siteConfig.business.name}
                url={`${seoConfig.siteUrl}/free-consultation/miami`}
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
                image={`${seoConfig.siteUrl}/og-image.jpg`}
            />

            <WebPageSchema
                name={`Miami Plastic Surgery - ${siteConfig.business.name}`}
                url={`${seoConfig.siteUrl}/free-consultation/miami`}
                description='Cosmetic surgery in Miami. One surgeon, Victoria Karlinsky, MD, FACS, performs every procedure: BBL, breast augmentation, mommy makeover & more.'
            />

            <FAQSchema items={faqSchemaItems} />

            {/* Main Content - Miami-Focused Conversion Flow */}
            <ContainerLayout as='div' noPaddingTop noPadding size='full'>
                {/* Section 1: Miami Hero with Local Messaging */}
                <MiamiHero id='hero' />

                {/* Section 2: Why Choose Local - Miami Advantages */}
                <WhyLocal id='why-local' />

                {/* Section 3: Fear Busters - Universal objection handling */}
                <FearBusters id='fear-busters' formAnchor='#hero-form' />

                {/* Section 4: Financing partners */}
                <FinancingSection id='financing' formAnchor='#hero-form' />

                {/* Section 5: Before/After Gallery */}
                <GalleryCarousel id='gallery' images={galleryImages} />

                {/* Section 6: Google Reviews */}
                <GoogleReviews
                    title='What Our Patients Say'
                    subtitle='Real reviews from our patients on Google'
                    limit={6}
                />

                {/* Section 7: Miami FAQ - Location, Experience, Aftercare */}
                <CategorizedFAQ
                    id='faq'
                    categories={miamiLandingFaqCategories}
                    faqData={faqData}
                    badge={miamiLandingFaqConfig.badge}
                    title={miamiLandingFaqConfig.title}
                    subtitle={miamiLandingFaqConfig.subtitle}
                    description={miamiLandingFaqConfig.description}
                    variant='default'
                    showBackgroundDecoration={true}
                    includeSchema={false}
                    ctaConfig={{
                        title: 'Prefer to talk to someone?',
                        description:
                            'Our Miami team is ready to help. Hablamos español.',
                        buttonText: 'Call Us Now',
                        phoneNumber: siteConfig.contact.phone.replace(
                            /\D/g,
                            ''
                        ),
                    }}
                />

                {/* Section 8: Miami Mini Lead Capture */}
                <MiamiMiniCapture id='miami-capture' />

                {/* Section 9: Final CTA - Local emphasis */}
                <CTASection
                    id='final-cta'
                    variant='luxury'
                    heading='Your Miami Transformation Awaits'
                    description='No travel required. No strangers. Just your local Miami surgeon, ready to help. Schedule your free consultation at our Miami office today.'
                    primaryButton={{
                        text: 'Book My Free Consultation',
                        href: '#hero-form',
                    }}
                    secondaryButton={{
                        text: 'Call Our Miami Office',
                        href: `tel:${siteConfig.contact.phone.replace(/\D/g, '')}`,
                    }}
                    eyebrow='Right Here in Miami'
                    size='lg'
                />
            </ContainerLayout>
        </>
    )
}
