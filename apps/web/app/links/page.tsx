import type { Metadata } from 'next'

import { siteConfig } from '@/lib/data/site-config'

import { LinksBackground } from './components/links-background'
import { LinksProfile } from './components/links-profile'
import { LinksPrimaryCTA } from './components/links-primary-cta'
import { LinksGrid } from './components/links-grid'
import { LinksSocial } from './components/links-social'
import { LinksFooter } from './components/links-footer'

/**
 * Page Metadata
 */
export const metadata: Metadata = {
    title: `Links | ${siteConfig.business.name}`,
    description: `Quick links to book consultations, view procedures, see results, and connect with ${siteConfig.business.name} in Miami.`,
    openGraph: {
        title: `Links | ${siteConfig.business.name}`,
        description: `Quick links to book consultations, view procedures, see results, and connect with ${siteConfig.business.name} in Miami.`,
        type: 'website',
        url: `${siteConfig.seo.siteUrl}/links`,
        siteName: siteConfig.seo.siteName,
        images: [
            {
                url: siteConfig.brand.ogImage,
                width: 1200,
                height: 630,
                alt: siteConfig.business.name,
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: `Links | ${siteConfig.business.name}`,
        description: `Quick links to book consultations, view procedures, see results, and connect with ${siteConfig.business.name} in Miami.`,
        images: [siteConfig.brand.ogImage],
    },
    robots: {
        index: true,
        follow: true,
    },
}

/**
 * Generate structured data for the links page
 */
function generateStructuredData() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `Links | ${siteConfig.business.name}`,
        description: `Quick links to book consultations, view procedures, see results, and connect with ${siteConfig.business.name} in Miami.`,
        url: `${siteConfig.seo.siteUrl}/links`,
        isPartOf: {
            '@type': 'WebSite',
            name: siteConfig.seo.siteName,
            url: siteConfig.seo.siteUrl,
        },
        publisher: {
            '@type': 'MedicalBusiness',
            name: siteConfig.business.name,
            url: siteConfig.seo.siteUrl,
            telephone: siteConfig.contact.phone,
            address: {
                '@type': 'PostalAddress',
                streetAddress: siteConfig.contact.address,
                addressLocality: siteConfig.contact.city,
                addressRegion: siteConfig.contact.state,
                postalCode: siteConfig.contact.postalCode,
                addressCountry: siteConfig.contact.country,
            },
        },
    }
}

/**
 * Links Page
 *
 * A world-class, mobile-first social links page (Linktree-style)
 * that serves as the link-in-bio for social media profiles.
 *
 * Features:
 * - Immersive dark gradient background with gold accents
 * - Glassmorphic card design
 * - Mobile-optimized touch targets
 * - CSS-first staggered animations
 * - Full SSR for SEO
 * - No header/footer for standalone experience
 */
export default function LinksPage() {
    return (
        <>
            {/* Structured Data */}
            <script
                type='application/ld+json'
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(generateStructuredData()),
                }}
            />

            {/* Background */}
            <LinksBackground />

            {/* Main Content */}
            <div className='relative flex min-h-svh flex-col items-center justify-start sm:justify-center sm:py-16'>
                {/* Glassmorphic Container */}
                <div className='animate-fade-in-up w-full max-w-md'>
                    <div className='bg-white/5 p-6 backdrop-blur-xl sm:p-8'>
                        {/* Profile Section */}
                        <div className='animate-fade-in-up animate-delay-100'>
                            <LinksProfile />
                        </div>

                        {/* Divider */}
                        <div className='my-6 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent' />

                        {/* Primary CTAs */}
                        <div className='animate-fade-in-up animate-delay-200'>
                            <LinksPrimaryCTA />
                        </div>

                        {/* Divider */}
                        <div className='my-6 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent' />

                        {/* Links Grid */}
                        <LinksGrid />

                        {/* Divider */}
                        <div className='my-6 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent' />

                        {/* Social Links */}
                        <div className='animate-fade-in-up animate-delay-700'>
                            <LinksSocial />
                        </div>

                        {/* Footer */}
                        <div className='animate-fade-in-up animate-delay-1000 mt-6'>
                            <LinksFooter />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
