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
 * SEO-optimized for:
 * - "mommy makeover miami"
 * - "post pregnancy plastic surgery"
 * - "tummy tuck after baby"
 * - "breast lift after breastfeeding"
 */
import {
    FAQSchema,
    OrganizationSchema,
    WebPageSchema,
} from '@workspace/seo/react'

import { ContainerLayout } from '@/components/container-layout.component'
import { MommyMakeoverHero } from '@/components/landing/mommy-makeover-hero.component'
import { FearBusters } from '@/components/shared/fear-busters.component'
import { WeeklyPayments } from '@/components/shared/weekly-payments.component'
import { GalleryCarousel } from '@/components/shared/gallery-carousel.component'
import { GoogleReviews } from '@/components/shared/google-reviews.component'
import { CategorizedFAQ } from '@/components/shared/faq-categorized.component'
import { CTASection } from '@/components/shared/cta-section.component'
import { ExitIntentPopup } from '@/components/home/exit-intent-popup.component'
import { MiniLeadCapture } from '@/components/landing/mini-lead-capture.component'
import {
    mommyMakeoverFaqCategories,
    mommyMakeoverFaqData,
    mommyMakeoverFaqConfig,
} from '@/lib/data/faq/mommy-makeover-faq.data'
import { siteConfig } from '@/lib/data/site-config'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'
import { getSpecialsFeaturedGalleryImages } from '@/lib/queries/gallery/specials-gallery.query'

/**
 * Mommy Makeover Landing Page Metadata
 *
 * SEO-optimized for mommy makeover and post-pregnancy plastic surgery searches.
 */
export const metadata = toNextMetadata(seoConfig, {
    canonical: '/mommy-makeover-consultation',
    title: 'Mommy Makeover Miami | Post-Pregnancy Transformation | Free Consultation',
    description:
        'Reclaim your pre-baby body with a customized mommy makeover in Miami. Tummy tuck, breast lift, liposuction. Board-certified surgeons. Financing from $67/week. Free consultation.',

    openGraph: {
        title: 'Mommy Makeover Miami | Post-Pregnancy Transformation | Free Consultation',
        description:
            'Reclaim your pre-baby body with a customized mommy makeover in Miami. Tummy tuck, breast lift, liposuction. Board-certified surgeons. Financing available.',
        url: `${seoConfig.siteUrl}/mommy-makeover-consultation`,
        type: 'website',
        siteName: seoConfig.siteName,
        images: [
            {
                url: `${seoConfig.siteUrl}/og-image.jpg`,
                width: 1200,
                height: 630,
                alt: `Mommy Makeover Miami - ${siteConfig.business.name}`,
            },
        ],
    },

    twitter: {
        card: 'summary_large_image',
        title: 'Mommy Makeover Miami | Post-Pregnancy Transformation',
        description:
            'Reclaim your pre-baby body with a customized mommy makeover in Miami. Board-certified surgeons. Financing from $67/week.',
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
                name={`Mommy Makeover Miami - ${siteConfig.business.name}`}
                url={`${seoConfig.siteUrl}/mommy-makeover-consultation`}
                description='Reclaim your pre-baby body with a customized mommy makeover in Miami. Tummy tuck, breast lift, liposuction combined in one transformative procedure. Board-certified surgeons with 15+ years of experience.'
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

            {/* Main Content - Mommy Makeover Focused Conversion Flow */}
            <ContainerLayout as='div' noPaddingTop noPadding size='full'>
                {/* Section 1: Hero with Emotional Messaging */}
                <MommyMakeoverHero id='hero' />

                {/* Section 2: Fear Busters - Address objections */}
                <FearBusters id='fear-busters' formAnchor='#hero-form' />

                {/* Section 3: Weekly Payments - Make it affordable */}
                <WeeklyPayments id='financing' formAnchor='#hero-form' />

                {/* Section 4: Before/After Gallery */}
                <GalleryCarousel id='gallery' images={galleryImages} />

                {/* Section 5: Google Reviews */}
                <GoogleReviews
                    title='What Moms Are Saying'
                    subtitle='Real reviews from mothers who reclaimed their confidence'
                    limit={6}
                />

                {/* Section 6: FAQ - Address timing, recovery, results */}
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

                {/* Section 7: Mid-Page Lead Capture */}
                <MiniLeadCapture id='mini-capture' />

                {/* Section 8: Final CTA */}
                <CTASection
                    id='final-cta'
                    variant='luxury'
                    heading='Your Transformation Starts Today'
                    description="You've given so much to your family. Now it's time to invest in yourself. Our board-certified surgeons will create a customized mommy makeover plan that fits your goals, your timeline, and your budget."
                    primaryButton={{
                        text: 'Yes, I Want My Free Consultation',
                        href: '#hero-form',
                    }}
                    secondaryButton={{
                        text: 'Call to Discuss My Options',
                        href: `tel:${siteConfig.contact.phone.replace(/\D/g, '')}`,
                    }}
                    eyebrow="It's Your Turn Now"
                    size='lg'
                    backgroundImage='/images/landing/mommy-makeover-cta-bg.png'
                />
            </ContainerLayout>

            {/* Exit Intent Popup */}
            <ExitIntentPopup />
        </>
    )
}
