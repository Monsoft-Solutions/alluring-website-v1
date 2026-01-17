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
 * - Coral Gables office location prominently featured
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
    OrganizationSchema,
    WebPageSchema,
} from '@workspace/seo/react'

import { ContainerLayout } from '@/components/container-layout.component'
import { MiamiHero } from '@/components/landing/miami-hero.component'
import { WhyLocal } from '@/components/landing/why-local.component'
import { MiamiMiniCapture } from '@/components/landing/miami-mini-capture.component'
import { FearBusters } from '@/components/shared/fear-busters.component'
import { WeeklyPayments } from '@/components/shared/weekly-payments.component'
import { GalleryCarousel } from '@/components/shared/gallery-carousel.component'
import { Testimonials } from '@/components/shared/testimonials.component'
import { CategorizedFAQ } from '@/components/shared/faq-categorized.component'
import { CTASection } from '@/components/shared/cta-section.component'
import { ExitIntentPopup } from '@/components/home/exit-intent-popup.component'
import {
    miamiLandingFaqCategories,
    miamiLandingFaqData,
    miamiLandingFaqConfig,
} from '@/lib/data/faq/miami-landing-faq.data'
import { siteConfig } from '@/lib/data/site-config'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'
import { getSpecialsFeaturedGalleryImages } from '@/lib/queries/gallery/specials-gallery.query'

// Miami-specific testimonials emphasizing local experience
const MIAMI_TESTIMONIALS = [
    {
        id: 'miami-testimonial-1',
        quote: "I love that I didn't have to travel. My surgeon is right here in Coral Gables, and the follow-up appointments were so easy to fit into my schedule. The whole team speaks Spanish, which made me feel right at home.",
        name: 'Isabella M.',
        procedure: 'Mommy Makeover',
        timeframe: 'Brickell Resident • 8 months post-op',
        rating: 5,
    },
    {
        id: 'miami-testimonial-2',
        quote: 'My neighbor recommended Alluring, and I am so glad I listened. Having my surgeon nearby during recovery gave me such peace of mind. Plus, I could see her results in person before making my decision.',
        name: 'Carmen R.',
        procedure: 'BBL',
        timeframe: 'Kendall Resident • 6 months post-op',
        rating: 5,
    },
    {
        id: 'miami-testimonial-3',
        quote: "As a busy Miami mom, I couldn't imagine traveling for surgery. Alluring made everything so convenient—from the consultation to my final follow-up, everything was just minutes from home.",
        name: 'Sofia T.',
        procedure: 'Breast Augmentation',
        timeframe: 'South Miami Resident • 1 year post-op',
        rating: 5,
    },
]

/**
 * Miami Landing Page Metadata
 *
 * SEO-optimized for local Miami searches.
 * Emphasizes local presence and Spanish language support.
 */
export const metadata = toNextMetadata(seoConfig, {
    canonical: '/free-consultation/miami',
    title: 'Miami Plastic Surgery | Board-Certified Local Surgeons | Free Consultation',
    description:
        "Miami's trusted plastic surgeons in Coral Gables. BBL, breast augmentation, mommy makeover & more. 15+ years serving Miami. Hablamos Español. Free consultation.",

    openGraph: {
        title: 'Miami Plastic Surgery | Board-Certified Local Surgeons | Free Consultation',
        description:
            "Miami's trusted plastic surgeons in Coral Gables. BBL, breast augmentation, mommy makeover & more. 15+ years serving Miami. Hablamos Español.",
        url: `${seoConfig.siteUrl}/free-consultation/miami`,
        type: 'website',
        siteName: seoConfig.siteName,
        locale: 'en_US',
        images: [
            {
                url: `${seoConfig.siteUrl}/og-image.jpg`,
                width: 1200,
                height: 630,
                alt: `Miami Plastic Surgery - ${siteConfig.business.name} Coral Gables`,
            },
        ],
    },

    twitter: {
        card: 'summary_large_image',
        title: 'Miami Plastic Surgery | Board-Certified Local Surgeons',
        description:
            "Miami's trusted plastic surgeons in Coral Gables. 15+ years serving Miami. Hablamos Español. Free consultation.",
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

    // Flatten FAQ data for schema
    const allFaqItems = Object.values(miamiLandingFaqData).flat()
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
                description="Miami's trusted plastic surgeons in Coral Gables. Board-certified surgeons with 15+ years serving the Miami community. BBL, breast augmentation, mommy makeover & more."
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

            {/* Main Content - Miami-Focused Conversion Flow */}
            <ContainerLayout as='div' noPaddingTop noPadding size='full'>
                {/* Section 1: Miami Hero with Local Messaging */}
                <MiamiHero id='hero' />

                {/* Section 2: Why Choose Local - Miami Advantages */}
                <WhyLocal id='why-local' />

                {/* Section 3: Fear Busters - Universal objection handling */}
                <FearBusters id='fear-busters' formAnchor='#hero-form' />

                {/* Section 4: Weekly Payments - Financing options */}
                <WeeklyPayments id='financing' formAnchor='#hero-form' />

                {/* Section 5: Before/After Gallery */}
                <GalleryCarousel id='gallery' images={galleryImages} />

                {/* Section 6: Miami-Specific Testimonials */}
                <Testimonials
                    id='testimonials'
                    formAnchor='#hero-form'
                    testimonials={MIAMI_TESTIMONIALS}
                />

                {/* Section 7: Miami FAQ - Location, Experience, Aftercare */}
                <CategorizedFAQ
                    id='faq'
                    categories={miamiLandingFaqCategories}
                    faqData={miamiLandingFaqData}
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
                            'Our Miami team is ready to help. Hablamos Español.',
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
                    description='No travel required. No strangers. Just your local Miami surgeons ready to help you look and feel your best. Schedule your free consultation at our Coral Gables office today.'
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

            {/* Exit Intent Popup */}
            <ExitIntentPopup />
        </>
    )
}
