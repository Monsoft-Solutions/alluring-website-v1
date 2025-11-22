/**
 * Contact Page
 *
 * Comprehensive Contact page with hero section, contact form, and contact information.
 * Includes SEO optimization, structured data, and proper accessibility.
 */
import { OrganizationSchema, WebPageSchema } from '@workspace/seo/react'
import { ArrowRight } from 'lucide-react'

import { ContactForm } from '@/components/sections/contact/contact-form.component'
import { ContactHeroSection } from '@/components/sections/contact/contact-hero-section.component'
import { ContactInfoSection } from '@/components/sections/contact/contact-info-section.component'
import { CTASection } from '@/components/shared/cta-section.component'
import {
    contactCTAData,
    contactFormData,
    contactHeroData,
    contactInfoData,
} from '@/lib/data/webpages/contact'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'

/**
 * Contact Page Metadata
 *
 * Implements SEO best practices for the Contact page including:
 * - Unique, descriptive title
 * - Compelling meta description
 * - Open Graph tags for social sharing
 * - Twitter Card configuration
 * - Canonical URL
 */
export const metadata = toNextMetadata(seoConfig, {
    // Canonical URL for contact page
    canonical: '/contact',

    // Page-specific metadata
    title: 'Contact Us - Get In Touch',
    description:
        "Have a question or want to work together? Get in touch with our team. We're here to help and will respond within 24 hours.",

    // Open Graph tags for social sharing
    openGraph: {
        title: "Contact Us - Let's Start a Conversation",
        description:
            'Get in touch with our team. Fill out our contact form or reach us directly via phone, email, or social media.',
        url: `${seoConfig.siteUrl}/contact`,
        type: 'website',
        siteName: seoConfig.siteName,
        images: [
            {
                url: `${seoConfig.siteUrl}/og-contact.jpg`,
                width: 1200,
                height: 630,
                alt: 'Contact us - Get in touch',
            },
        ],
    },

    // Twitter Card configuration
    twitter: {
        card: 'summary_large_image',
        title: 'Contact Us - Get In Touch',
        description:
            'Have a question or want to work together? Get in touch with our team.',
        images: [`${seoConfig.siteUrl}/og-contact.jpg`],
    },
})

export default function ContactPage() {
    return (
        <>
            {/* SEO Schema */}
            <WebPageSchema
                name={metadata.title as string}
                url={`${seoConfig.siteUrl}/contact`}
                description={metadata.description as string}
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
            <main>
                {/* Contact Hero Section */}
                <ContactHeroSection id='contact-hero' {...contactHeroData} />

                {/* Contact Form Section */}
                <ContactForm id='contact-form' {...contactFormData} />

                {/* Contact Information Section */}
                <ContactInfoSection id='contact-info' {...contactInfoData} />

                {/* Final CTA Section */}
                <CTASection
                    id='contact-cta'
                    heading={contactCTAData.title}
                    description={contactCTAData.description}
                    primaryButton={{
                        text: contactCTAData.primaryButton.text,
                        href: contactCTAData.primaryButton.href,
                        variant: 'default',
                        icon: <ArrowRight className='size-5' />,
                        iconPosition: 'right',
                    }}
                    secondaryButton={{
                        text: contactCTAData.secondaryButton.text,
                        href: contactCTAData.secondaryButton.href,
                        variant: 'outline',
                    }}
                    variant={contactCTAData.variant}
                    align='center'
                />
            </main>
        </>
    )
}
