/**
 * Men's Plastic Surgery Lead Generation Landing Page
 *
 * Ultra-targeted landing page for men 30-55 seeking cosmetic procedures.
 * Emphasizes confidence, professional appearance, and discretion.
 *
 * URL: /mens-plastic-surgery-miami
 *
 * Key differentiators:
 * - Messaging focused on confidence, strength, and professional image
 * - Addresses male-specific concerns (gynecomastia, stubborn fat, aging)
 * - Emphasizes natural, masculine results
 * - Discreet, professional environment
 *
 * SEO-optimized for:
 * - "men's plastic surgery miami"
 * - "male breast reduction miami"
 * - "gynecomastia surgery miami"
 * - "liposuction for men miami"
 */
import { FAQSchema, WebPageSchema } from '@workspace/seo/react'

import { ContainerLayout } from '@/components/container-layout.component'
import { MensHero } from '@/components/landing/mens-hero.component'
import { FearBusters } from '@/components/shared/fear-busters.component'
import { FinancingSection } from '@/components/shared/financing-section.component'
import { GalleryCarousel } from '@/components/shared/gallery-carousel.component'
import { GoogleReviews } from '@/components/shared/google-reviews.component'
import { CategorizedFAQ } from '@/components/shared/faq-categorized.component'
import { resolveClaimsIn } from '@/lib/claims/resolve-claims.server'
import { CTASection } from '@/components/shared/cta-section.component'
import { MiniLeadCapture } from '@/components/landing/mini-lead-capture.component'
import {
    mensFaqCategories,
    mensFaqData,
    mensFaqConfig,
} from '@/lib/data/faq/mens-faq.data'
import { siteConfig } from '@/lib/data/site-config'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'
import { getSpecialsFeaturedGalleryImages } from '@/lib/queries/gallery/specials-gallery.query'

/**
 * Men's Plastic Surgery Landing Page Metadata
 *
 * SEO-optimized for male cosmetic surgery searches.
 */
export const metadata = toNextMetadata(seoConfig, {
    canonical: '/mens-plastic-surgery-miami',
    title: "Men's Plastic Surgery Miami | Gynecomastia & Body Contouring",
    description:
        "Look as strong as you feel. Men's cosmetic surgery in Miami: gynecomastia surgery, liposuction, facelift. One surgeon: Victoria Karlinsky, MD, FACS. Discreet, professional care. Financing available.",

    openGraph: {
        title: "Men's Plastic Surgery Miami | Gynecomastia & Body Contouring",
        description:
            "Look as strong as you feel. Men's cosmetic surgery in Miami: gynecomastia surgery, liposuction, facelift. One surgeon: Victoria Karlinsky, MD, FACS.",
        url: `${seoConfig.siteUrl}/mens-plastic-surgery-miami`,
        type: 'website',
        siteName: seoConfig.siteName,
        images: [
            {
                url: `${seoConfig.siteUrl}/og-image.jpg`,
                width: 1200,
                height: 630,
                alt: `Men's Plastic Surgery Miami - ${siteConfig.business.name}`,
            },
        ],
    },

    twitter: {
        card: 'summary_large_image',
        title: "Men's Plastic Surgery Miami | Gynecomastia & Body Contouring",
        description:
            "Look as strong as you feel. Men's cosmetic surgery in Miami. One surgeon: Victoria Karlinsky, MD, FACS. Free consultation.",
        images: [`${seoConfig.siteUrl}/og-image.jpg`],
    },
})

export default async function MensPlasticSurgeryMiamiPage() {
    // Fetch gallery images for the carousel
    const galleryImages = await getSpecialsFeaturedGalleryImages()

    // Claim tokens in the answers (prices, financing; #354), resolved once
    // for both the visible list and its schema.
    const faqData = await resolveClaimsIn(
        mensFaqData,
        'text',
        'faq /mens-plastic-surgery-miami'
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
                name={`Men's Plastic Surgery Miami - ${siteConfig.business.name}`}
                url={`${seoConfig.siteUrl}/mens-plastic-surgery-miami`}
                description="Men's cosmetic surgery in Miami. Gynecomastia surgery, liposuction, facelift, and body contouring for men. One surgeon: Victoria Karlinsky, MD, FACS."
            />

            <FAQSchema items={faqSchemaItems} />

            {/* Main Content - Men's Surgery Focused Conversion Flow */}
            <ContainerLayout as='div' noPaddingTop noPadding size='full'>
                {/* Section 1: Hero with Masculine Messaging */}
                <MensHero id='hero' />

                {/* Section 2: Fear Busters - Address objections */}
                <FearBusters id='fear-busters' formAnchor='#hero-form' />

                {/* Section 3: Financing partners */}
                <FinancingSection id='financing' formAnchor='#hero-form' />

                {/* Section 4: Before/After Gallery */}
                <GalleryCarousel id='gallery' images={galleryImages} />

                {/* Section 5: Google Reviews */}
                <GoogleReviews
                    title='What Our Patients Say'
                    subtitle='Real reviews from our patients on Google'
                    limit={6}
                />

                {/* Section 6: FAQ - Address male-specific concerns */}
                <CategorizedFAQ
                    id='faq'
                    categories={mensFaqCategories}
                    faqData={faqData}
                    badge={mensFaqConfig.badge}
                    title={mensFaqConfig.title}
                    subtitle={mensFaqConfig.subtitle}
                    description={mensFaqConfig.description}
                    variant='default'
                    showBackgroundDecoration={true}
                    includeSchema={false}
                    ctaConfig={{
                        title: 'Have questions about your options?',
                        description:
                            'Dr. Karlinsky provides confidential consultations for men.',
                        buttonText: 'Call Us Now',
                        phoneNumber: siteConfig.contact.phone.replace(
                            /\D/g,
                            ''
                        ),
                    }}
                />

                {/* Section 7: Mid-Page Lead Capture */}
                <MiniLeadCapture id='mini-capture' />

                {/* Section 8: Final CTA */}
                <CTASection
                    id='final-cta'
                    variant='luxury'
                    heading='Look as Strong as You Feel'
                    description="You put in the work at the gym, in your career, and in life. But some things don't respond to effort alone. Victoria Karlinsky, MD, FACS, aims for natural-looking results that suit your build. Confidential consultations available."
                    primaryButton={{
                        text: 'Yes, I Want My Free Consultation',
                        href: '#hero-form',
                    }}
                    secondaryButton={{
                        text: 'Call to Discuss My Options',
                        href: `tel:${siteConfig.contact.phone.replace(/\D/g, '')}`,
                    }}
                    eyebrow="Men's Cosmetic Surgery"
                    size='lg'
                />
            </ContainerLayout>
        </>
    )
}
