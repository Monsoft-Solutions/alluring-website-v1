/**
 * New Beginning / Life Transitions Lead Generation Landing Page
 *
 * Ultra-targeted landing page for women 35-55 going through major life
 * transitions: divorce, empty nest, career milestone, or personal reinvention.
 *
 * URL: /new-beginning-consultation
 *
 * Key differentiators:
 * - Older demographic with more disposable income
 * - High emotional motivation ("fresh start" mindset)
 * - Less price-sensitive, more quality-focused
 * - Natural rejuvenation vs dramatic transformation
 *
 * SEO-optimized for:
 * - "plastic surgery after divorce"
 * - "mommy makeover empty nester"
 * - "facelift miami"
 * - "look younger plastic surgery"
 */
import {
    FAQSchema,
    OrganizationSchema,
    WebPageSchema,
} from '@workspace/seo/react'

import { ContainerLayout } from '@/components/container-layout.component'
import { NewBeginningHero } from '@/components/landing/new-beginning-hero.component'
import { FearBusters } from '@/components/shared/fear-busters.component'
import { WeeklyPayments } from '@/components/shared/weekly-payments.component'
import { GalleryCarousel } from '@/components/shared/gallery-carousel.component'
import { Testimonials } from '@/components/shared/testimonials.component'
import { CategorizedFAQ } from '@/components/shared/faq-categorized.component'
import { CTASection } from '@/components/shared/cta-section.component'
import { ExitIntentPopup } from '@/components/home/exit-intent-popup.component'
import { MiniLeadCapture } from '@/components/landing/mini-lead-capture.component'
import {
    newBeginningFaqCategories,
    newBeginningFaqData,
    newBeginningFaqConfig,
} from '@/lib/data/faq/new-beginning-faq.data'
import { siteConfig } from '@/lib/data/site-config'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'
import { getSpecialsFeaturedGalleryImages } from '@/lib/queries/gallery/specials-gallery.query'

// New beginning specific testimonials
const NEW_BEGINNING_TESTIMONIALS = [
    {
        id: 'new-beginning-testimonial-1',
        quote: "After my divorce, I wanted to do something for myself. The facelift was the best investment I've ever made in myself. I look refreshed, not different—and I feel like I have a whole new life ahead of me.",
        name: 'Linda S.',
        procedure: 'Facelift',
        timeframe: '52 years old • 1 year post-op',
        rating: 5,
    },
    {
        id: 'new-beginning-testimonial-2',
        quote: 'With both kids in college, it was finally my turn. I had been wanting to do something about my neck and jowls for years. Dr. Karlinsky gave me results that look completely natural—people just say I look "well-rested."',
        name: 'Catherine M.',
        procedure: 'Mini Facelift + Neck Lift',
        timeframe: 'Empty Nester • 8 months post-op',
        rating: 5,
    },
    {
        id: 'new-beginning-testimonial-3',
        quote: 'I turned 50 and decided it was time to invest in myself. Between the tummy tuck and breast lift, I feel like I got my confidence back. The team treated me with such care throughout the whole process.',
        name: 'Patricia D.',
        procedure: 'Tummy Tuck + Breast Lift',
        timeframe: '50 years old • 10 months post-op',
        rating: 5,
    },
]

/**
 * New Beginning Landing Page Metadata
 *
 * SEO-optimized for life transition and rejuvenation plastic surgery searches.
 */
export const metadata = toNextMetadata(seoConfig, {
    canonical: '/new-beginning-consultation',
    title: 'New Beginning Plastic Surgery Miami | Rejuvenation | Free Consultation',
    description:
        'A new chapter deserves a new you. Natural rejuvenation for women ready to invest in themselves. Facelift, body contouring, breast procedures. Board-certified surgeons. Free consultation.',

    openGraph: {
        title: 'New Beginning Plastic Surgery Miami | Rejuvenation | Free Consultation',
        description:
            'A new chapter deserves a new you. Natural rejuvenation for women ready to invest in themselves. Board-certified surgeons.',
        url: `${seoConfig.siteUrl}/new-beginning-consultation`,
        type: 'website',
        siteName: seoConfig.siteName,
        images: [
            {
                url: `${seoConfig.siteUrl}/og-image.jpg`,
                width: 1200,
                height: 630,
                alt: `New Beginning Plastic Surgery Miami - ${siteConfig.business.name}`,
            },
        ],
    },

    twitter: {
        card: 'summary_large_image',
        title: 'New Beginning Plastic Surgery Miami | Natural Rejuvenation',
        description:
            'A new chapter deserves a new you. Natural rejuvenation for women ready to invest in themselves. Free consultation.',
        images: [`${seoConfig.siteUrl}/og-image.jpg`],
    },
})

export default async function NewBeginningConsultationPage() {
    // Fetch gallery images for the carousel
    const galleryImages = await getSpecialsFeaturedGalleryImages()

    // Flatten FAQ data for schema
    const allFaqItems = Object.values(newBeginningFaqData).flat()
    const faqSchemaItems = allFaqItems.map((faq) => ({
        question: faq.question,
        answer: faq.answer,
    }))

    return (
        <>
            {/* SEO Schema */}
            <WebPageSchema
                name={`New Beginning Plastic Surgery Miami - ${siteConfig.business.name}`}
                url={`${seoConfig.siteUrl}/new-beginning-consultation`}
                description='A new chapter deserves a new you. Natural rejuvenation and body contouring for women ready to invest in themselves. Board-certified surgeons specializing in natural, refreshed results.'
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

            {/* Main Content - New Beginning Focused Conversion Flow */}
            <ContainerLayout as='div' noPaddingTop noPadding size='full'>
                {/* Section 1: Hero with Fresh Start Messaging */}
                <NewBeginningHero id='hero' />

                {/* Section 2: Fear Busters - Address objections */}
                <FearBusters id='fear-busters' formAnchor='#hero-form' />

                {/* Section 3: Weekly Payments - Make it affordable */}
                <WeeklyPayments id='financing' formAnchor='#hero-form' />

                {/* Section 4: Before/After Gallery */}
                <GalleryCarousel id='gallery' images={galleryImages} />

                {/* Section 5: New Beginning Testimonials */}
                <Testimonials
                    id='testimonials'
                    formAnchor='#hero-form'
                    testimonials={NEW_BEGINNING_TESTIMONIALS}
                />

                {/* Section 6: FAQ - Address mindset, procedures, results */}
                <CategorizedFAQ
                    id='faq'
                    categories={newBeginningFaqCategories}
                    faqData={newBeginningFaqData}
                    badge={newBeginningFaqConfig.badge}
                    title={newBeginningFaqConfig.title}
                    subtitle={newBeginningFaqConfig.subtitle}
                    description={newBeginningFaqConfig.description}
                    variant='default'
                    showBackgroundDecoration={true}
                    includeSchema={false}
                    ctaConfig={{
                        title: 'Ready to start your new chapter?',
                        description:
                            'Our compassionate team is here to support you on this journey.',
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
                    heading="It's Your Time Now"
                    description="You've spent years taking care of everyone else. Now it's time to invest in yourself. Our board-certified surgeons specialize in natural rejuvenation that helps you look as vibrant as you feel inside."
                    primaryButton={{
                        text: 'Yes, I Want My Free Consultation',
                        href: '#hero-form',
                    }}
                    secondaryButton={{
                        text: 'Call for a Confidential Conversation',
                        href: `tel:${siteConfig.contact.phone.replace(/\D/g, '')}`,
                    }}
                    eyebrow='Your New Beginning Awaits'
                    size='lg'
                    backgroundImage='/images/landing/new-beginning-cta-bg.png'
                />
            </ContainerLayout>

            {/* Exit Intent Popup */}
            <ExitIntentPopup />
        </>
    )
}
