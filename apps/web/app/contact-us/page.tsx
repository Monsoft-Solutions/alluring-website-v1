/**
 * Contact Page
 *
 * World-class contact page with immersive hero contact form, trust-building sections,
 * surgeon previews, testimonials, and categorized FAQ.
 *
 * Optimized for conversions with the contact form as the primary hero element.
 */
import { OrganizationSchema, WebPageSchema } from '@workspace/seo/react'

import { ContactHeroForm } from '@/components/sections/contact/contact-hero-form.component'
import { ContactStatsStrip } from '@/components/sections/contact/contact-stats-strip.component'
import { SurgeonPreview } from '@/components/sections/contact/surgeon-preview.component'
import { ContactAlternative } from '@/components/sections/contact/contact-alternative.component'
import { CategorizedFAQ } from '@/components/shared/faq-categorized.component'
import { FearBusters } from '@/components/shared/fear-busters.component'
import { GalleryCarousel } from '@/components/shared/gallery-carousel.component'
import { MobileCallButton } from '@/components/shared/mobile-call-button.component'
import { Testimonials } from '@/components/shared/testimonials.component'
import { WeeklyPayments } from '@/components/shared/weekly-payments.component'
import {
    faqCategoriesContact,
    faqDataContact,
} from '@/lib/data/faq/contact-faq-data'
import { siteConfig } from '@/lib/data/site-config'
import { getSpecialsFeaturedGalleryImages } from '@/lib/queries/gallery/specials-gallery.query'
import { seoConfig } from '@/lib/seo-config'
import { generatePageTitle } from '@/lib/seo/generate-title.util'
import { toNextMetadata } from '@/lib/seo/metadata'

/**
 * Contact Page Metadata
 *
 * SEO-optimized metadata for the contact page including:
 * - Compelling title and description
 * - Open Graph tags for social sharing
 * - Twitter Card configuration
 * - Canonical URL
 */
const pageTitle = generatePageTitle('Free Plastic Surgery Consultation Miami')

export const metadata = toNextMetadata(seoConfig, {
    canonical: '/contact-us',
    title: pageTitle,
    description:
        'Request your private consultation with our board-certified plastic surgeons in Miami. Discuss your goals, explore your options, and start your transformation journey. Complimentary, confidential, no obligation.',

    openGraph: {
        title: pageTitle,
        description:
            'Request your private consultation with board-certified plastic surgeons in Miami. BBL, Mommy Makeover, Breast Augmentation & more. Luxury results, personalized care.',
        url: `${seoConfig.siteUrl}/contact-us`,
        type: 'website',
        siteName: seoConfig.siteName,
        images: [
            {
                url: `${seoConfig.siteUrl}/og-image.jpg`,
                width: 1200,
                height: 630,
                alt: `Schedule Your Consultation - ${siteConfig.business.name} Miami`,
            },
        ],
    },

    twitter: {
        card: 'summary_large_image',
        title: pageTitle,
        description:
            'Request your private consultation with board-certified plastic surgeons in Miami. Luxury results, personalized care.',
        images: [`${seoConfig.siteUrl}/og-image.jpg`],
    },
})

export default async function ContactPage() {
    // Fetch gallery images for visual proof section
    const galleryImages = await getSpecialsFeaturedGalleryImages()

    return (
        <>
            {/* SEO Schema */}
            <WebPageSchema
                name={`Schedule Your Consultation - ${siteConfig.business.name} Miami`}
                url={`${seoConfig.siteUrl}/contact-us`}
                description='Request your private consultation with board-certified plastic surgeons in Miami. Discuss your goals, explore your options, and start your transformation journey.'
            />

            <OrganizationSchema
                name={seoConfig.siteName}
                url={seoConfig.siteUrl}
                logo={seoConfig.organization?.logo}
                sameAs={seoConfig.organization?.socialProfiles?.map(
                    (s) => s.url
                )}
            />

            {/* Main Content - Conversion-Optimized Flow */}
            <main className='selection:bg-gold-200 bg-stone-50 font-sans text-stone-900 selection:text-stone-900'>
                {/* Section 1: Hero Contact Form */}
                <ContactHeroForm id='contact-form' />

                {/* Section 2: Fear Busters - Address objections immediately */}
                <FearBusters id='fear-busters' formAnchor='#contact-form' />

                {/* Section 3: Weekly Payments - Reinforce affordability */}
                <WeeklyPayments
                    id='weekly-payments'
                    formAnchor='#contact-form'
                />

                {/* Section 4: Testimonials - Social proof and emotional connection */}
                <Testimonials id='testimonials' formAnchor='#contact-form' />

                {/* Section 5: Gallery Carousel - Visual proof of results */}
                <GalleryCarousel id='gallery-results' images={galleryImages} />

                {/* Section 6: Stats Strip */}
                <ContactStatsStrip id='stats' />

                {/* Section 7: Surgeon Preview */}
                <SurgeonPreview id='surgeons' />

                {/* Section 8: Categorized FAQ */}
                <CategorizedFAQ
                    id='faq'
                    categories={faqCategoriesContact}
                    faqData={faqDataContact}
                    badge='Common Questions'
                    title='Before You Visit,'
                    subtitle='Know This.'
                    description='We believe in complete transparency. Here are answers to the most common questions patients ask before their consultation.'
                    variant='default'
                    showBackgroundDecoration={true}
                    ctaConfig={{
                        title: 'Have a specific question?',
                        description: 'Our patient concierge is ready to help.',
                        buttonText: 'Call Now',
                        phoneNumber: siteConfig.contact.phone.replace(
                            /\D/g,
                            ''
                        ),
                    }}
                />

                {/* Section 9: Alternative Contact Methods */}
                <ContactAlternative id='location' />
            </main>

            {/* Mobile Call Button - Always visible on contact page for conversion optimization */}
            <MobileCallButton position='bottom-right' style='icon-only' />
        </>
    )
}
