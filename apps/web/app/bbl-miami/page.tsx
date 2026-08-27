/**
 * BBL Miami Lead Generation Landing Page
 *
 * Ultra-targeted landing page for women 25-40 seeking Brazilian Butt Lift.
 * Emphasizes Miami as THE global BBL destination, safety-first approach,
 * and natural-looking results.
 *
 * URL: /bbl-miami
 *
 * Key differentiators:
 * - Safety emphasis (critical for BBL marketing)
 * - Miami's expertise and reputation
 * - Natural results focus over dramatic transformations
 * - Ultrasound-guided technique
 *
 * SEO-optimized for:
 * - "bbl miami"
 * - "brazilian butt lift miami"
 * - "best bbl surgeon miami"
 * - "natural bbl results"
 */
import { FAQSchema, WebPageSchema } from '@workspace/seo/react'

import { ContainerLayout } from '@/components/container-layout.component'
import { BBLHero } from '@/components/landing/bbl-hero.component'
import { FearBusters } from '@/components/shared/fear-busters.component'
import { WeeklyPayments } from '@/components/shared/weekly-payments.component'
import { GalleryCarousel } from '@/components/shared/gallery-carousel.component'
import { GoogleReviews } from '@/components/shared/google-reviews.component'
import { CategorizedFAQ } from '@/components/shared/faq-categorized.component'
import { CTASection } from '@/components/shared/cta-section.component'
import { ExitIntentPopup } from '@/components/home/exit-intent-popup.component'
import { MiniLeadCapture } from '@/components/landing/mini-lead-capture.component'
import {
    bblFaqCategories,
    bblFaqData,
    bblFaqConfig,
} from '@/lib/data/faq/bbl-faq.data'
import { siteConfig } from '@/lib/data/site-config'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'
import { getSpecialsFeaturedGalleryImages } from '@/lib/queries/gallery/specials-gallery.query'

/**
 * BBL Miami Landing Page Metadata
 *
 * SEO-optimized for Brazilian Butt Lift searches.
 */
export const metadata = toNextMetadata(seoConfig, {
    canonical: '/bbl-miami',
    title: 'BBL Miami | Brazilian Butt Lift | Natural Results',
    description:
        'The Miami BBL: Natural curves with world-class safety. Board-certified surgeons, ultrasound-guided technique, AAAASF-accredited facility. Financing from $45/week. Free consultation.',

    openGraph: {
        title: 'BBL Miami | Brazilian Butt Lift | Natural Results',
        description:
            'The Miami BBL: Natural curves with world-class safety. Board-certified surgeons, ultrasound-guided technique, AAAASF-accredited facility.',
        url: `${seoConfig.siteUrl}/bbl-miami`,
        type: 'website',
        siteName: seoConfig.siteName,
        images: [
            {
                url: `${seoConfig.siteUrl}/og-image.jpg`,
                width: 1200,
                height: 630,
                alt: `BBL Miami - Brazilian Butt Lift - ${siteConfig.business.name}`,
            },
        ],
    },

    twitter: {
        card: 'summary_large_image',
        title: 'BBL Miami | Brazilian Butt Lift | Natural Results',
        description:
            'The Miami BBL: Natural curves with world-class safety. Board-certified surgeons. Financing from $45/week.',
        images: [`${seoConfig.siteUrl}/og-image.jpg`],
    },
})

export default async function BBLMiamiPage() {
    // Fetch gallery images for the carousel
    const galleryImages = await getSpecialsFeaturedGalleryImages()

    // Flatten FAQ data for schema
    const allFaqItems = Object.values(bblFaqData).flat()
    const faqSchemaItems = allFaqItems.map((faq) => ({
        question: faq.question,
        answer: faq.answer,
    }))

    return (
        <>
            {/* SEO Schema */}
            <WebPageSchema
                name={`BBL Miami - Brazilian Butt Lift - ${siteConfig.business.name}`}
                url={`${seoConfig.siteUrl}/bbl-miami`}
                description='The Miami BBL: Natural curves with world-class safety. Board-certified surgeons using ultrasound-guided technique at AAAASF-accredited facility. 2,000+ BBLs performed with exceptional results.'
            />

            <FAQSchema items={faqSchemaItems} />

            {/* Main Content - BBL-Focused Conversion Flow */}
            <ContainerLayout as='div' noPaddingTop noPadding size='full'>
                {/* Section 1: Hero with Safety-First Messaging */}
                <BBLHero id='hero' />

                {/* Section 2: Fear Busters - Address objections */}
                <FearBusters id='fear-busters' formAnchor='#hero-form' />

                {/* Section 3: Weekly Payments - Make it affordable */}
                <WeeklyPayments id='financing' formAnchor='#hero-form' />

                {/* Section 4: Before/After Gallery */}
                <GalleryCarousel id='gallery' images={galleryImages} />

                {/* Section 5: Google Reviews */}
                <GoogleReviews
                    title='What Our BBL Patients Say'
                    subtitle='Real reviews from patients who got the curves they deserve'
                    limit={6}
                />

                {/* Section 6: FAQ - Address safety, procedure, results */}
                <CategorizedFAQ
                    id='faq'
                    categories={bblFaqCategories}
                    faqData={bblFaqData}
                    badge={bblFaqConfig.badge}
                    title={bblFaqConfig.title}
                    subtitle={bblFaqConfig.subtitle}
                    description={bblFaqConfig.description}
                    variant='default'
                    showBackgroundDecoration={true}
                    includeSchema={false}
                    ctaConfig={{
                        title: 'Have more questions about BBL?',
                        description:
                            'Our patient coordinators specialize in BBL consultations.',
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
                    heading='Get the Curves You Deserve'
                    description='Miami is the BBL capital of the world for a reason. Our board-certified surgeons combine artistry with safety to create natural, beautiful curves. See why thousands of women trust Alluring for their Brazilian Butt Lift.'
                    primaryButton={{
                        text: 'Yes, I Want My Free Consultation',
                        href: '#hero-form',
                    }}
                    secondaryButton={{
                        text: 'Call to Discuss My BBL',
                        href: `tel:${siteConfig.contact.phone.replace(/\D/g, '')}`,
                    }}
                    eyebrow='The Miami BBL'
                    size='lg'
                    backgroundImage='/images/landing/bbl-miami-cta-bg.webp'
                />
            </ContainerLayout>

            {/* Exit Intent Popup */}
            <ExitIntentPopup />
        </>
    )
}
