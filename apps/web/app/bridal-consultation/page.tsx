/**
 * Bridal/Wedding Lead Generation Landing Page
 *
 * Ultra-targeted landing page for brides-to-be (25-40) preparing for
 * their wedding day or other major life events.
 *
 * URL: /bridal-consultation
 *
 * Key differentiators:
 * - Time-sensitive urgency (wedding date as deadline)
 * - Premium pricing tolerance (wedding budget mindset)
 * - Emphasis on looking perfect for photos
 * - Wedding timeline planning expertise
 *
 * SEO-optimized for:
 * - "plastic surgery before wedding"
 * - "bridal plastic surgery miami"
 * - "body contouring for wedding"
 * - "breast augmentation before wedding"
 */
import {
    FAQSchema,
    OrganizationSchema,
    WebPageSchema,
} from '@workspace/seo/react'

import { ContainerLayout } from '@/components/container-layout.component'
import { BridalHero } from '@/components/landing/bridal-hero.component'
import { FearBusters } from '@/components/shared/fear-busters.component'
import { WeeklyPayments } from '@/components/shared/weekly-payments.component'
import { GalleryCarousel } from '@/components/shared/gallery-carousel.component'
import { Testimonials } from '@/components/shared/testimonials.component'
import { CategorizedFAQ } from '@/components/shared/faq-categorized.component'
import { CTASection } from '@/components/shared/cta-section.component'
import { ExitIntentPopup } from '@/components/home/exit-intent-popup.component'
import { MiniLeadCapture } from '@/components/landing/mini-lead-capture.component'
import {
    bridalFaqCategories,
    bridalFaqData,
    bridalFaqConfig,
} from '@/lib/data/faq/bridal-faq.data'
import { siteConfig } from '@/lib/data/site-config'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'
import { getSpecialsFeaturedGalleryImages } from '@/lib/queries/gallery/specials-gallery.query'

// Bridal-specific testimonials
const BRIDAL_TESTIMONIALS = [
    {
        id: 'bridal-testimonial-1',
        quote: 'I wanted to feel confident in my strapless wedding dress. Dr. Karlinsky helped me plan the perfect timeline—my results settled beautifully and I felt like the best version of myself walking down the aisle.',
        name: 'Michelle K.',
        procedure: 'Breast Augmentation',
        timeframe: 'Bride, March 2024',
        rating: 5,
    },
    {
        id: 'bridal-testimonial-2',
        quote: "I couldn't get rid of my arm and back fat no matter how much I worked out. Five months before my wedding, I had liposuction at Alluring. My dress fit perfectly and every photo was gorgeous!",
        name: 'Amanda T.',
        procedure: 'Liposuction',
        timeframe: 'Bride, October 2023',
        rating: 5,
    },
    {
        id: 'bridal-testimonial-3',
        quote: 'The team helped me coordinate everything with my wedding timeline. They understood how important this day was to me and treated me like a VIP from consultation to my final follow-up.',
        name: 'Jessica R.',
        procedure: 'Rhinoplasty',
        timeframe: 'Bride, June 2024',
        rating: 5,
    },
]

/**
 * Bridal Landing Page Metadata
 *
 * SEO-optimized for bridal/wedding plastic surgery searches.
 */
export const metadata = toNextMetadata(seoConfig, {
    canonical: '/bridal-consultation',
    title: 'Bridal Plastic Surgery Miami | Wedding Ready | Free Consultation',
    description:
        'Look radiant on your wedding day. Bridal plastic surgery consultations with wedding timeline planning. Breast augmentation, body contouring, rhinoplasty. Board-certified surgeons. Free consultation.',

    openGraph: {
        title: 'Bridal Plastic Surgery Miami | Wedding Ready | Free Consultation',
        description:
            'Look radiant on your wedding day. Bridal plastic surgery consultations with wedding timeline planning. Board-certified surgeons.',
        url: `${seoConfig.siteUrl}/bridal-consultation`,
        type: 'website',
        siteName: seoConfig.siteName,
        images: [
            {
                url: `${seoConfig.siteUrl}/og-image.jpg`,
                width: 1200,
                height: 630,
                alt: `Bridal Plastic Surgery Miami - ${siteConfig.business.name}`,
            },
        ],
    },

    twitter: {
        card: 'summary_large_image',
        title: 'Bridal Plastic Surgery Miami | Wedding Ready',
        description:
            'Look radiant on your wedding day. Wedding timeline planning for plastic surgery. Free consultation.',
        images: [`${seoConfig.siteUrl}/og-image.jpg`],
    },
})

export default async function BridalConsultationPage() {
    // Fetch gallery images for the carousel
    const galleryImages = await getSpecialsFeaturedGalleryImages()

    // Flatten FAQ data for schema
    const allFaqItems = Object.values(bridalFaqData).flat()
    const faqSchemaItems = allFaqItems.map((faq) => ({
        question: faq.question,
        answer: faq.answer,
    }))

    return (
        <>
            {/* SEO Schema */}
            <WebPageSchema
                name={`Bridal Plastic Surgery Miami - ${siteConfig.business.name}`}
                url={`${seoConfig.siteUrl}/bridal-consultation`}
                description='Look radiant on your wedding day with bridal plastic surgery consultations. Expert wedding timeline planning for breast augmentation, body contouring, rhinoplasty, and more.'
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

            {/* Main Content - Bridal-Focused Conversion Flow */}
            <ContainerLayout as='div' noPaddingTop noPadding size='full'>
                {/* Section 1: Hero with Wedding Messaging */}
                <BridalHero id='hero' />

                {/* Section 2: Fear Busters - Address objections */}
                <FearBusters id='fear-busters' formAnchor='#hero-form' />

                {/* Section 3: Weekly Payments - Make it affordable */}
                <WeeklyPayments id='financing' formAnchor='#hero-form' />

                {/* Section 4: Before/After Gallery */}
                <GalleryCarousel id='gallery' images={galleryImages} />

                {/* Section 5: Bridal Testimonials */}
                <Testimonials
                    id='testimonials'
                    formAnchor='#hero-form'
                    testimonials={BRIDAL_TESTIMONIALS}
                />

                {/* Section 6: FAQ - Address timing, recovery, planning */}
                <CategorizedFAQ
                    id='faq'
                    categories={bridalFaqCategories}
                    faqData={bridalFaqData}
                    badge={bridalFaqConfig.badge}
                    title={bridalFaqConfig.title}
                    subtitle={bridalFaqConfig.subtitle}
                    description={bridalFaqConfig.description}
                    variant='default'
                    showBackgroundDecoration={true}
                    includeSchema={false}
                    ctaConfig={{
                        title: 'Questions about your wedding timeline?',
                        description:
                            'Our bridal specialists will help you plan the perfect timing.',
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
                    heading='Look Radiant on Your Special Day'
                    description='Every detail of your wedding is planned to perfection. Let us help you feel just as confident about yourself. Our bridal specialists will create a customized plan that fits your wedding timeline.'
                    primaryButton={{
                        text: 'Yes, I Want My Bridal Consultation',
                        href: '#hero-form',
                    }}
                    secondaryButton={{
                        text: 'Call to Discuss My Timeline',
                        href: `tel:${siteConfig.contact.phone.replace(/\D/g, '')}`,
                    }}
                    eyebrow='Your Perfect Day Awaits'
                    size='lg'
                    backgroundImage='/images/landing/bridal-cta-bg.png'
                />
            </ContainerLayout>

            {/* Exit Intent Popup */}
            <ExitIntentPopup />
        </>
    )
}
