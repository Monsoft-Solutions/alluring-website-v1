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
import {
    FAQSchema,
    OrganizationSchema,
    WebPageSchema,
} from '@workspace/seo/react'

import { ContainerLayout } from '@/components/container-layout.component'
import { MensHero } from '@/components/landing/mens-hero.component'
import { FearBusters } from '@/components/shared/fear-busters.component'
import { WeeklyPayments } from '@/components/shared/weekly-payments.component'
import { GalleryCarousel } from '@/components/shared/gallery-carousel.component'
import { Testimonials } from '@/components/shared/testimonials.component'
import { CategorizedFAQ } from '@/components/shared/faq-categorized.component'
import { CTASection } from '@/components/shared/cta-section.component'
import { ExitIntentPopup } from '@/components/home/exit-intent-popup.component'
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

// Men's cosmetic surgery testimonials
const MENS_TESTIMONIALS = [
    {
        id: 'mens-testimonial-1',
        quote: "I worked out religiously but couldn't get rid of my chest. Gynecomastia surgery at Alluring changed everything. I finally feel confident at the pool and in fitted shirts. The team was professional and the whole process was discrete.",
        name: 'Michael T.',
        procedure: 'Gynecomastia Surgery',
        timeframe: '8 months post-op',
        rating: 5,
    },
    {
        id: 'mens-testimonial-2',
        quote: "As an executive, looking tired and older than I felt was affecting my confidence in meetings. Dr. Karlinsky's approach was subtle—I look refreshed, not 'done.' Colleagues just think I got more sleep.",
        name: 'Robert K.',
        procedure: 'Facelift + Neck Lift',
        timeframe: '1 year post-op',
        rating: 5,
    },
    {
        id: 'mens-testimonial-3',
        quote: "No matter how much cardio I did, I couldn't lose my love handles. Liposuction gave me the athletic physique I'd been working toward. Back in the gym at 4 weeks and looking better than I did in my 20s.",
        name: 'James P.',
        procedure: 'Liposuction',
        timeframe: '6 months post-op',
        rating: 5,
    },
]

/**
 * Men's Plastic Surgery Landing Page Metadata
 *
 * SEO-optimized for male cosmetic surgery searches.
 */
export const metadata = toNextMetadata(seoConfig, {
    canonical: '/mens-plastic-surgery-miami',
    title: "Men's Plastic Surgery Miami | Gynecomastia & Body Contouring | Free Consultation",
    description:
        "Look as strong as you feel. Men's cosmetic surgery in Miami: gynecomastia surgery, liposuction, facelift. Board-certified surgeons. Discreet, professional care. Financing available.",

    openGraph: {
        title: "Men's Plastic Surgery Miami | Gynecomastia & Body Contouring | Free Consultation",
        description:
            "Look as strong as you feel. Men's cosmetic surgery in Miami: gynecomastia surgery, liposuction, facelift. Board-certified surgeons.",
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
            "Look as strong as you feel. Men's cosmetic surgery in Miami. Board-certified surgeons. Free consultation.",
        images: [`${seoConfig.siteUrl}/og-image.jpg`],
    },
})

export default async function MensPlasticSurgeryMiamiPage() {
    // Fetch gallery images for the carousel
    const galleryImages = await getSpecialsFeaturedGalleryImages()

    // Flatten FAQ data for schema
    const allFaqItems = Object.values(mensFaqData).flat()
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
                description="Men's cosmetic surgery in Miami. Gynecomastia surgery, liposuction, facelift, and body contouring for men. Board-certified surgeons with expertise in male aesthetics."
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

            {/* Main Content - Men's Surgery Focused Conversion Flow */}
            <ContainerLayout as='div' noPaddingTop noPadding size='full'>
                {/* Section 1: Hero with Masculine Messaging */}
                <MensHero id='hero' />

                {/* Section 2: Fear Busters - Address objections */}
                <FearBusters id='fear-busters' formAnchor='#hero-form' />

                {/* Section 3: Weekly Payments - Make it affordable */}
                <WeeklyPayments id='financing' formAnchor='#hero-form' />

                {/* Section 4: Before/After Gallery */}
                <GalleryCarousel id='gallery' images={galleryImages} />

                {/* Section 5: Men's Testimonials */}
                <Testimonials
                    id='testimonials'
                    formAnchor='#hero-form'
                    testimonials={MENS_TESTIMONIALS}
                />

                {/* Section 6: FAQ - Address male-specific concerns */}
                <CategorizedFAQ
                    id='faq'
                    categories={mensFaqCategories}
                    faqData={mensFaqData}
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
                            'Our specialists provide confidential consultations for men.',
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
                    description="You put in the work at the gym, in your career, and in life. But some things don't respond to effort alone. Our board-certified surgeons specialize in natural-looking results that enhance your masculine features. Confidential consultations available."
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
                    backgroundImage='/images/landing/mens-surgery-cta-bg.png'
                />
            </ContainerLayout>

            {/* Exit Intent Popup */}
            <ExitIntentPopup />
        </>
    )
}
