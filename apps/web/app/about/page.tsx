/**
 * About Page
 *
 * Comprehensive About page showcasing Alluring Plastic Surgery's philosophy,
 * world-class surgeons, accreditations, and patient testimonials.
 * Includes SEO optimization and structured data.
 */
import type { Metadata } from 'next'
import {
    BreadcrumbSchema,
    PhysicianSchema,
    WebPageSchema,
} from '@workspace/seo/react'

import { ContainerLayout } from '@/components/container-layout.component'
import { AboutHeroFullbleed } from '@/components/sections/about/about-hero-fullbleed.component'
import { PhilosophySection } from '@/components/sections/about/philosophy-section.component'
import { SurgeonsGridSection } from '@/components/sections/about/surgeons-grid.component'
import { AccreditationSection } from '@/components/sections/about/accreditation-section.component'
import { GoogleReviews } from '@/components/shared/google-reviews.component'
import { CTASection } from '@/components/shared/cta-section.component'
import { aboutCTAData } from '@/lib/data/webpages/about.data'
import { siteConfig } from '@/lib/data/site-config'
import { surgeons } from '@/lib/data/surgeons/surgeons-data'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'
import { env } from '@/env'

const siteUrl = env.NEXT_PUBLIC_SITE_URL ?? siteConfig.seo.siteUrl

/**
 * About Page Metadata
 *
 * Implements SEO best practices for the About page including:
 * - Experience-focused title with trust signals
 * - Compelling meta description with key differentiators
 * - Open Graph tags for social sharing
 * - Twitter Card configuration
 * - Canonical URL
 */
const pageTitle = 'Meet Our Surgeons | 15+ Years | Alluring Plastic Surgery'

export const metadata: Metadata = toNextMetadata(seoConfig, {
    // Canonical URL for about page
    canonical: '/about',

    // Page-specific metadata optimized for trust and CTR
    title: pageTitle,
    description:
        "Miami's trusted plastic surgery team. 5,000+ successful procedures. Double Board-Certified surgeons. 4.7-star reviews. Luxury care, affordable pricing.",

    // Open Graph tags for social sharing
    openGraph: {
        title: pageTitle,
        description:
            "Miami's trusted plastic surgery team. 5,000+ successful procedures. Double Board-Certified surgeons. 4.7-star reviews. Luxury care, affordable pricing.",
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
        title: pageTitle,
        description:
            "Miami's trusted plastic surgery team. 5,000+ procedures. Double Board-Certified surgeons. 4.7-star reviews. Luxury care, affordable pricing.",
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

            {/* SEO Schema - Breadcrumb */}
            <BreadcrumbSchema
                items={[
                    { name: 'Home', item: siteUrl },
                    { name: 'About Us', item: `${siteUrl}/about` },
                ]}
            />

            {/* SEO Schema - Physician for each surgeon (E-E-A-T signals) */}
            {surgeons.map((surgeon) => (
                <PhysicianSchema
                    key={surgeon.id}
                    id={`${siteUrl}/#physician-${surgeon.slug}`}
                    name={surgeon.name}
                    url={`${siteUrl}/${surgeon.slug}`}
                    image={
                        surgeon.images.featured.startsWith('http')
                            ? surgeon.images.featured
                            : `${siteUrl}${surgeon.images.featured}`
                    }
                    description={surgeon.shortBio}
                    jobTitle={surgeon.title}
                    medicalSpecialty={surgeon.specialties}
                    award={surgeon.certifications}
                    worksFor={{
                        '@id': `${siteUrl}/#organization`,
                        name: siteConfig.business.name,
                        url: siteUrl,
                        address: {
                            streetAddress: siteConfig.contact.address,
                            addressLocality: siteConfig.contact.city,
                            addressRegion: siteConfig.contact.state,
                            postalCode: siteConfig.contact.postalCode,
                            addressCountry: siteConfig.contact.country,
                        },
                    }}
                    knowsAbout={surgeon.specialties}
                    // Enhanced sameAs with external profiles for E-E-A-T authority signals
                    sameAs={[
                        // Social profiles
                        ...Object.values(surgeon.social ?? {}).filter(
                            (v): v is string => Boolean(v)
                        ),
                        // External medical directory profiles (Healthgrades, RealSelf, etc.)
                        ...Object.values(surgeon.externalProfiles ?? {}).filter(
                            (v): v is string => Boolean(v)
                        ),
                    ]}
                />
            ))}

            {/* Main Content */}
            <ContainerLayout as='div' noPaddingTop noPadding size='full'>
                {/* Hero Section - Full-bleed with Glassmorphism Card */}
                <AboutHeroFullbleed />

                {/* Philosophy Section - Three Pillars */}
                <PhilosophySection />

                {/* Surgeons Grid - All 3 Surgeons */}
                <SurgeonsGridSection />

                {/* Accreditation & Safety */}
                <AccreditationSection />

                {/* Google Reviews Section */}
                <GoogleReviews
                    title='What Our Patients Say'
                    subtitle='Real reviews from patients who trusted our surgeons'
                    limit={6}
                />

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
            </ContainerLayout>
        </>
    )
}
