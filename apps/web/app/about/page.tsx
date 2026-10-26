/**
 * About Page
 *
 * Comprehensive About page showcasing Alluring Plastic Surgery's philosophy,
 * surgeon, safety and patient reviews.
 * Includes SEO optimization and structured data.
 */
import type { Metadata } from 'next'
import {
    BreadcrumbSchema,
    JsonLdGraph,
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
import { karlinskyPersonNode } from '@/lib/seo/surgeon-graph.util'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'
import { getPublishedGoogleReviews } from '@/lib/queries/reviews/google-reviews.query'
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
// Verified claims only (claims canon §1, §2, §4; #354): one surgeon, no
// tenure, volume, board count or "luxury"/"affordable".
const pageTitle = 'About Alluring Plastic Surgery | One Surgeon in Miami'
const pageDescription =
    'Cosmetic surgery in Miami, Florida, with one surgeon: Victoria Karlinsky, MD, FACS, board certified in general surgery by the American Board of Surgery since 2008.'

export const metadata: Metadata = toNextMetadata(seoConfig, {
    // Canonical URL for about page
    canonical: '/about',

    // Page-specific metadata optimized for trust and CTR
    title: pageTitle,
    description: pageDescription,

    // Open Graph tags for social sharing
    openGraph: {
        title: pageTitle,
        description: pageDescription,
        url: `${siteUrl}/about`,
        type: 'website',
        siteName: siteConfig.business.name,
        images: [
            {
                url: `${siteUrl}/og-about.jpg`,
                width: 1200,
                height: 630,
                alt: 'Alluring Plastic Surgery, cosmetic surgery in Miami',
            },
        ],
    },

    // Twitter Card configuration
    twitter: {
        card: 'summary_large_image',
        title: pageTitle,
        description: pageDescription,
        images: [`${siteUrl}/og-about.jpg`],
    },
})

export default async function AboutPage() {
    // The synced Google rating (claims canon §4); siteConfig is the fallback.
    // Same limit as the reviews section below, so it shares its cache entry.
    const { averageRating } = await getPublishedGoogleReviews(6)

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

            {/* SEO Schema - Dr. Karlinsky as the verified-credentials Person
                node the home and procedure pages publish (claims canon §2,
                #354): no award list (it carried the cosmetic boards, which
                need the Florida statement), no education (D9), no specialty. */}
            <JsonLdGraph nodes={[karlinskyPersonNode(siteUrl)]} />

            {/* SEO Schema - Physician for the other profiles (D1: as they were) */}
            {surgeons
                .filter((surgeon) => surgeon.id !== 'dr-karlinsky')
                .map((surgeon) => (
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
                            ...Object.values(
                                surgeon.externalProfiles ?? {}
                            ).filter((v): v is string => Boolean(v)),
                        ]}
                    />
                ))}

            {/* Main Content */}
            <ContainerLayout as='div' noPaddingTop noPadding size='full'>
                {/* Hero Section - Full-bleed with Glassmorphism Card */}
                <AboutHeroFullbleed rating={averageRating} />

                {/* Philosophy Section - Three Pillars */}
                <PhilosophySection />

                {/* Surgeons Grid */}
                <SurgeonsGridSection />

                {/* Accreditation & Safety */}
                <AccreditationSection rating={averageRating} />

                {/* Google Reviews Section */}
                <GoogleReviews
                    title='What Our Patients Say'
                    subtitle='Real reviews from our patients on Google'
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
