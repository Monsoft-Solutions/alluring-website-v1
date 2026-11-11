/**
 * Mommy Makeover Lead Generation Landing Page
 *
 * Ultra-targeted landing page for post-pregnancy mothers (28-45).
 * Emphasizes emotional transformation, combined procedure benefits,
 * and addresses specific concerns about timing, recovery with kids, and results.
 *
 * URL: /mommy-makeover-consultation
 *
 * Key differentiators:
 * - Emotional messaging: "You gave them everything. Now it's your turn."
 * - Addresses timing concerns (after children, breastfeeding)
 * - Recovery planning with children at home
 * - Combined procedures for comprehensive transformation
 *
 * Owns booking intent ("mommy makeover consultation"). "mommy makeover miami"
 * and the cost terms belong to /procedures/mommy-makeover-miami, in the keyword
 * registry.
 *
 * It renders `ConsultationConcerns` rather than the shared `FearBusters` and
 * `WeeklyPayments`, which quote weekly payments, 0% APR and board and volume
 * claims that AI engines were repeating as this page's.
 */
import { FAQSchema, WebPageSchema } from '@workspace/seo/react'

import { ContainerLayout } from '@/components/container-layout.component'
import { MommyMakeoverHero } from '@/components/landing/mommy-makeover-hero.component'
import { GalleryCarousel } from '@/components/shared/gallery-carousel.component'
import { GoogleReviews } from '@/components/shared/google-reviews.component'
import { CategorizedFAQ } from '@/components/shared/faq-categorized.component'
import { CTASection } from '@/components/shared/cta-section.component'
import { MiniLeadCapture } from '@/components/landing/mini-lead-capture.component'
import {
    mommyMakeoverFaqCategories,
    mommyMakeoverFaqData,
    mommyMakeoverFaqConfig,
} from '@/lib/data/faq/mommy-makeover-faq.data'
import { siteConfig } from '@/lib/data/site-config'
import { KARLINSKY_NAME } from '@/lib/data/surgeons/karlinsky-credentials.constant'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'
import { getSpecialsFeaturedGalleryImages } from '@/lib/queries/gallery/specials-gallery.query'

import { ConsultationConcerns } from './components/consultation-concerns.component'

const PAGE_TITLE = 'Free Mommy Makeover Consultation in Miami'
const PAGE_DESCRIPTION = `Mommy makeover consultation in Miami with ${KARLINSKY_NAME}. Plan your tummy tuck, breast surgery and liposuction, priced part by part.`

/**
 * Mommy Makeover Landing Page Metadata
 *
 * Named for booking intent, so it doesn't compete with the procedure page.
 */
export const metadata = toNextMetadata(seoConfig, {
    canonical: '/mommy-makeover-consultation',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,

    openGraph: {
        title: PAGE_TITLE,
        description: PAGE_DESCRIPTION,
        url: `${seoConfig.siteUrl}/mommy-makeover-consultation`,
        type: 'website',
        siteName: seoConfig.siteName,
        images: [
            {
                url: `${seoConfig.siteUrl}/og-image.jpg`,
                width: 1200,
                height: 630,
                alt: `${PAGE_TITLE} - ${siteConfig.business.name}`,
            },
        ],
    },

    twitter: {
        card: 'summary_large_image',
        title: PAGE_TITLE,
        description: PAGE_DESCRIPTION,
        images: [`${seoConfig.siteUrl}/og-image.jpg`],
    },
})

export default async function MommyMakeoverConsultationPage() {
    // Fetch gallery images for the carousel
    const galleryImages = await getSpecialsFeaturedGalleryImages()

    // Flatten FAQ data for schema
    const allFaqItems = Object.values(mommyMakeoverFaqData).flat()
    const faqSchemaItems = allFaqItems.map((faq) => ({
        question: faq.question,
        answer: faq.answer,
    }))

    return (
        <>
            {/* SEO Schema */}
            <WebPageSchema
                name={`${PAGE_TITLE} - ${siteConfig.business.name}`}
                url={`${seoConfig.siteUrl}/mommy-makeover-consultation`}
                description={PAGE_DESCRIPTION}
            />

            <FAQSchema items={faqSchemaItems} />

            {/* Main Content - Mommy Makeover Focused Conversion Flow */}
            <ContainerLayout as='div' noPaddingTop noPadding size='full'>
                {/* Section 1: Hero with Emotional Messaging */}
                <MommyMakeoverHero id='hero' />

                {/* Section 2: Answer the objections, financing included */}
                <ConsultationConcerns id='concerns' formAnchor='#hero-form' />

                {/* Section 3: Before/After Gallery */}
                <GalleryCarousel id='gallery' images={galleryImages} />

                {/* Section 4: Google Reviews. All patients, not only mothers. */}
                <GoogleReviews
                    title='What Patients Are Saying'
                    subtitle='Real reviews from our Google Business Profile'
                    limit={6}
                />

                {/* Section 5: FAQ - Address timing, recovery, results */}
                <CategorizedFAQ
                    id='faq'
                    categories={mommyMakeoverFaqCategories}
                    faqData={mommyMakeoverFaqData}
                    badge={mommyMakeoverFaqConfig.badge}
                    title={mommyMakeoverFaqConfig.title}
                    subtitle={mommyMakeoverFaqConfig.subtitle}
                    description={mommyMakeoverFaqConfig.description}
                    variant='default'
                    showBackgroundDecoration={true}
                    includeSchema={false}
                    ctaConfig={{
                        title: 'Have more questions?',
                        description:
                            'Our patient coordinators specialize in helping moms plan their transformation.',
                        buttonText: 'Call Us Now',
                        phoneNumber: siteConfig.contact.phone.replace(
                            /\D/g,
                            ''
                        ),
                    }}
                />

                {/* Section 6: Mid-Page Lead Capture */}
                <MiniLeadCapture id='mini-capture' />

                {/* Section 7: Final CTA (primary variant). */}
                <CTASection
                    id='final-cta'
                    variant='primary'
                    heading='Your Transformation Starts Today'
                    description="You've given so much to your family. Now it's time to invest in yourself. Dr. Karlinsky will create a customized mommy makeover plan that fits your goals, your timeline, and your budget."
                    primaryButton={{
                        text: 'Yes, I Want My Free Consultation',
                        href: '#hero-form',
                    }}
                    secondaryButton={{
                        text: 'Call to Discuss My Options',
                        href: `tel:${siteConfig.contact.phone.replace(/\D/g, '')}`,
                    }}
                    size='lg'
                    backgroundImage='https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/landing/mommy-makeover-cta-bg.png'
                />
            </ContainerLayout>
        </>
    )
}
