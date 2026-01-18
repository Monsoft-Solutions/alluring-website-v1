/**
 * Post-Weight Loss Body Contouring Lead Generation Landing Page
 *
 * Ultra-targeted landing page for adults 30-55 who've lost 50+ pounds
 * through bariatric surgery, diet, or exercise.
 * Emphasizes completing their transformation and addressing excess skin.
 *
 * URL: /after-weight-loss-consultation
 *
 * Key differentiators:
 * - Emotional messaging: "You did the hard part. Let us help you finish."
 * - Addresses loose skin concerns after major weight loss
 * - Post-bariatric surgery expertise
 * - Staged procedure options for comprehensive transformation
 *
 * SEO-optimized for:
 * - "body contouring after weight loss"
 * - "loose skin surgery miami"
 * - "plastic surgery after bariatric surgery"
 * - "skin removal after weight loss"
 */
import {
    FAQSchema,
    OrganizationSchema,
    WebPageSchema,
} from '@workspace/seo/react'

import { ContainerLayout } from '@/components/container-layout.component'
import { WeightLossHero } from '@/components/landing/weight-loss-hero.component'
import { FearBusters } from '@/components/shared/fear-busters.component'
import { WeeklyPayments } from '@/components/shared/weekly-payments.component'
import { GalleryCarousel } from '@/components/shared/gallery-carousel.component'
import { Testimonials } from '@/components/shared/testimonials.component'
import { CategorizedFAQ } from '@/components/shared/faq-categorized.component'
import { CTASection } from '@/components/shared/cta-section.component'
import { ExitIntentPopup } from '@/components/home/exit-intent-popup.component'
import { MiniLeadCapture } from '@/components/landing/mini-lead-capture.component'
import {
    weightLossFaqCategories,
    weightLossFaqData,
    weightLossFaqConfig,
} from '@/lib/data/faq/weight-loss-faq.data'
import { siteConfig } from '@/lib/data/site-config'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'
import { getSpecialsFeaturedGalleryImages } from '@/lib/queries/gallery/specials-gallery.query'

// Post-weight loss specific testimonials
const WEIGHT_LOSS_TESTIMONIALS = [
    {
        id: 'weight-loss-testimonial-1',
        quote: "I lost 120 pounds after gastric bypass but couldn't see my progress because of all the excess skin. After my body lift at Alluring, I finally look like the healthy person I became. The transformation is complete.",
        name: 'Marcus T.',
        procedure: 'Lower Body Lift',
        timeframe: 'Lost 120 lbs • 10 months post-op',
        rating: 5,
    },
    {
        id: 'weight-loss-testimonial-2',
        quote: 'The hanging skin on my arms and thighs made me so self-conscious. I worked so hard to lose 85 pounds, and now I can finally wear short sleeves and shorts. Dr. Karlinsky gave me my confidence back.',
        name: 'Patricia L.',
        procedure: 'Arm Lift + Thigh Lift',
        timeframe: 'Lost 85 lbs • 8 months post-op',
        rating: 5,
    },
    {
        id: 'weight-loss-testimonial-3',
        quote: 'After losing 100+ pounds through diet and exercise, I was left with so much loose skin. The team at Alluring staged my procedures perfectly—body lift first, then arms. I look like a completely different person now.',
        name: 'David R.',
        procedure: 'Staged Body Contouring',
        timeframe: 'Lost 110 lbs • 1 year post-op',
        rating: 5,
    },
]

/**
 * Post-Weight Loss Landing Page Metadata
 *
 * SEO-optimized for body contouring and skin removal after weight loss searches.
 */
export const metadata = toNextMetadata(seoConfig, {
    canonical: '/after-weight-loss-consultation',
    title: 'Body Contouring After Weight Loss Miami | Skin Removal | Free Consultation',
    description:
        'Complete your weight loss transformation with body contouring in Miami. Tummy tuck, body lift, arm lift after bariatric surgery or major weight loss. Board-certified surgeons. Financing available.',

    openGraph: {
        title: 'Body Contouring After Weight Loss Miami | Skin Removal | Free Consultation',
        description:
            'Complete your weight loss transformation with body contouring in Miami. Tummy tuck, body lift, arm lift after bariatric surgery or major weight loss.',
        url: `${seoConfig.siteUrl}/after-weight-loss-consultation`,
        type: 'website',
        siteName: seoConfig.siteName,
        images: [
            {
                url: `${seoConfig.siteUrl}/og-image.jpg`,
                width: 1200,
                height: 630,
                alt: `Body Contouring After Weight Loss - ${siteConfig.business.name} Miami`,
            },
        ],
    },

    twitter: {
        card: 'summary_large_image',
        title: 'Body Contouring After Weight Loss Miami | Skin Removal Surgery',
        description:
            'You did the hard part. Let us help you finish. Body contouring for post-weight loss patients in Miami. Financing available.',
        images: [`${seoConfig.siteUrl}/og-image.jpg`],
    },
})

export default async function AfterWeightLossConsultationPage() {
    // Fetch gallery images for the carousel
    const galleryImages = await getSpecialsFeaturedGalleryImages()

    // Flatten FAQ data for schema
    const allFaqItems = Object.values(weightLossFaqData).flat()
    const faqSchemaItems = allFaqItems.map((faq) => ({
        question: faq.question,
        answer: faq.answer,
    }))

    return (
        <>
            {/* SEO Schema */}
            <WebPageSchema
                name={`Body Contouring After Weight Loss - ${siteConfig.business.name} Miami`}
                url={`${seoConfig.siteUrl}/after-weight-loss-consultation`}
                description="Complete your weight loss transformation with body contouring in Miami. Expert skin removal surgery for patients who've lost 50+ pounds through bariatric surgery, diet, or exercise."
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

            {/* Main Content - Post-Weight Loss Focused Conversion Flow */}
            <ContainerLayout as='div' noPaddingTop noPadding size='full'>
                {/* Section 1: Hero with Transformation Messaging */}
                <WeightLossHero id='hero' />

                {/* Section 2: Fear Busters - Address objections */}
                <FearBusters id='fear-busters' formAnchor='#hero-form' />

                {/* Section 3: Weekly Payments - Make it affordable */}
                <WeeklyPayments id='financing' formAnchor='#hero-form' />

                {/* Section 4: Before/After Gallery */}
                <GalleryCarousel id='gallery' images={galleryImages} />

                {/* Section 5: Post-Weight Loss Testimonials */}
                <Testimonials
                    id='testimonials'
                    formAnchor='#hero-form'
                    testimonials={WEIGHT_LOSS_TESTIMONIALS}
                />

                {/* Section 6: FAQ - Address eligibility, procedures, recovery */}
                <CategorizedFAQ
                    id='faq'
                    categories={weightLossFaqCategories}
                    faqData={weightLossFaqData}
                    badge={weightLossFaqConfig.badge}
                    title={weightLossFaqConfig.title}
                    subtitle={weightLossFaqConfig.subtitle}
                    description={weightLossFaqConfig.description}
                    variant='default'
                    showBackgroundDecoration={true}
                    includeSchema={false}
                    ctaConfig={{
                        title: 'Have more questions?',
                        description:
                            'Our team specializes in post-weight loss body contouring.',
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
                    heading='Finish What You Started'
                    description="You've already proven you have the dedication to transform your life. Losing the weight was the hard part—now let us help you see the body you've worked so hard for. Free consultation, no obligation."
                    primaryButton={{
                        text: 'Yes, I Want My Free Consultation',
                        href: '#hero-form',
                    }}
                    secondaryButton={{
                        text: 'Call to Discuss My Options',
                        href: `tel:${siteConfig.contact.phone.replace(/\D/g, '')}`,
                    }}
                    eyebrow='Complete Your Transformation'
                    size='lg'
                    backgroundImage='/images/landing/weight-loss-cta-bg.png'
                />
            </ContainerLayout>

            {/* Exit Intent Popup */}
            <ExitIntentPopup />
        </>
    )
}
