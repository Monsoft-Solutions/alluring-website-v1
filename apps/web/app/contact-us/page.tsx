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
import { ConsultationBenefits } from '@/components/sections/contact/consultation-benefits.component'
import { ContactStatsStrip } from '@/components/sections/contact/contact-stats-strip.component'
import { SurgeonPreview } from '@/components/sections/contact/surgeon-preview.component'
import { ContactTestimonial } from '@/components/sections/contact/contact-testimonial.component'
import { ContactAlternative } from '@/components/sections/contact/contact-alternative.component'
import { CategorizedFAQ } from '@/components/shared/faq-categorized.component'
import { MobileCallButton } from '@/components/shared/mobile-call-button.component'
import {
    faqCategoriesContact,
    faqDataContact,
} from '@/lib/data/faq/contact-faq-data'
import { siteConfig } from '@/lib/data/site-config'
import { seoConfig } from '@/lib/seo-config'
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
export const metadata = toNextMetadata(seoConfig, {
    canonical: '/contact-us',
    title: 'Free Plastic Surgery Consultation Miami',
    description:
        'Request your private consultation with our board-certified plastic surgeons in Miami. Discuss your goals, explore your options, and start your transformation journey. Complimentary, confidential, no obligation.',

    openGraph: {
        title: `Free Plastic Surgery Consultation Miami | Alluring Miami`,
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
        title: `Free Plastic Surgery Consultation Miami | Alluring Miami`,
        description:
            'Request your private consultation with board-certified plastic surgeons in Miami. Luxury results, personalized care.',
        images: [`${seoConfig.siteUrl}/og-image.jpg`],
    },
})

export default function ContactPage() {
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

            {/* Main Content */}
            <main className='selection:bg-gold-200 bg-stone-50 font-sans text-stone-900 selection:text-stone-900'>
                {/* Section 1: Hero Contact Form */}
                <ContactHeroForm id='contact-form' />

                {/* Section 2: Consultation Benefits */}
                <ConsultationBenefits id='what-to-expect' />

                {/* Section 3: Stats Strip */}
                <ContactStatsStrip id='stats' />

                {/* Section 4: Surgeon Preview */}
                <SurgeonPreview id='surgeons' />

                {/* Section 5: Featured Testimonial */}
                <ContactTestimonial id='testimonial' />

                {/* Section 6: Categorized FAQ */}
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

                {/* Section 7: Alternative Contact Methods */}
                <ContactAlternative id='location' />
            </main>

            {/* Mobile Call Button - Always visible on contact page for conversion optimization */}
            <MobileCallButton position='bottom-right' style='icon-only' />
        </>
    )
}
