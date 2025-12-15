/**
 * About Page
 *
 * Comprehensive About page showcasing Alluring Plastic Surgery's philosophy,
 * world-class surgeons, accreditations, and patient testimonials.
 * Includes SEO optimization and structured data.
 */
import { Metadata } from 'next'
import { OrganizationSchema, WebPageSchema } from '@workspace/seo/react'

import { AboutHeroFullbleed } from '@/components/sections/about/about-hero-fullbleed.component'
import { PhilosophySection } from '@/components/sections/about/philosophy-section.component'
import { SurgeonsGridSection } from '@/components/sections/about/surgeons-grid.component'
import { AccreditationSection } from '@/components/sections/about/accreditation-section.component'
import { Testimonials } from '@/components/home/testimonials.component'
import { CTASection } from '@/components/shared/cta-section.component'
import { aboutCTAData } from '@/lib/data/webpages/about.data'
import { siteConfig } from '@/lib/data/site-config'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'
import { env } from '@/env'

const siteUrl = env.NEXT_PUBLIC_SITE_URL ?? siteConfig.seo.siteUrl

/**
 * About Page Metadata
 *
 * Implements SEO best practices for the About page including:
 * - Unique, descriptive title targeting plastic surgery keywords
 * - Compelling meta description with primary keywords
 * - Open Graph tags for social sharing
 * - Twitter Card configuration
 * - Canonical URL
 */
export const metadata: Metadata = toNextMetadata(seoConfig, {
    // Canonical URL for about page
    canonical: '/about',

    // Page-specific metadata optimized for plastic surgery
    title: 'About Alluring Plastic Surgery | Board-Certified Surgeons in Miami',
    description:
        'Meet the board-certified surgeons at Alluring Plastic Surgery in Miami. AAAASF-accredited facility with 5,000+ successful procedures. Experience luxury plastic surgery made affordable with world-class expertise and personalized care.',

    // Open Graph tags for social sharing
    openGraph: {
        title: 'About Alluring Plastic Surgery | Expert Cosmetic Surgeons in Miami',
        description:
            'Board-certified plastic surgeons in Miami specializing in BBL, breast augmentation, tummy tuck, and facial procedures. AAAASF-accredited facility with 15+ years experience and 4.9-star patient reviews.',
        url: `${siteUrl}/about`,
        type: 'website',
        siteName: siteConfig.business.name,
        images: [
            {
                url: `${siteUrl}/og-about.jpg`,
                width: 1200,
                height: 630,
                alt: 'Alluring Plastic Surgery - Board-Certified Surgeons in Miami',
            },
        ],
    },

    // Twitter Card configuration
    twitter: {
        card: 'summary_large_image',
        title: 'About Alluring Plastic Surgery | Board-Certified Surgeons',
        description:
            'Meet our world-class surgical team in Miami. AAAASF-accredited facility, 5,000+ successful procedures, luxury results made affordable.',
        images: [`${siteUrl}/og-about.jpg`],
    },
})

export default function AboutPage() {
    return (
        <>
            {/* SEO Schema - WebPage */}
            <WebPageSchema
                name={metadata.title as string}
                url={`${siteUrl}/about`}
                description={metadata.description as string}
            />

            {/* SEO Schema - Organization */}
            <OrganizationSchema
                name={siteConfig.business.name}
                url={siteUrl}
                logo={siteConfig.brand.logo}
                sameAs={siteConfig.social.map((s) => s.url)}
            />

            {/* Main Content */}
            <main className='bg-stone-50'>
                {/* Hero Section - Full-bleed with Glassmorphism Card */}
                <AboutHeroFullbleed />

                {/* Philosophy Section - Three Pillars */}
                <PhilosophySection />

                {/* Surgeons Grid - All 3 Surgeons */}
                <SurgeonsGridSection />

                {/* Accreditation & Safety */}
                <AccreditationSection />

                {/* Testimonials Section */}
                <Testimonials />

                {/* Final CTA Section */}
                <CTASection
                    id='about-cta'
                    heading={aboutCTAData.title}
                    description={aboutCTAData.description}
                    primaryButton={{
                        text: aboutCTAData.primaryButton.text,
                        href: aboutCTAData.primaryButton.href,
                        variant: 'default',
                    }}
                    secondaryButton={{
                        text: aboutCTAData.secondaryButton.text,
                        href: aboutCTAData.secondaryButton.href,
                        variant: 'outline',
                    }}
                    variant={aboutCTAData.variant}
                    align='center'
                    className='h-dvh items-center'
                />
            </main>
        </>
    )
}
