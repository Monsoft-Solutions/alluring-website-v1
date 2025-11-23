/**
 * About Page
 *
 * Comprehensive About page showcasing company story, mission, vision, values,
 * and team. Includes SEO optimization and structured data.
 */
import { OrganizationSchema, WebPageSchema } from '@workspace/seo/react'

import { AboutHeroSection } from '@/components/sections/about/about-hero-section.component'
import { MissionSection } from '@/components/sections/about/mission-section.component'
import { StackingFeaturesSection } from '@/components/sections/home/stacking-features-section.component'
import { Breadcrumbs } from '@/components/shared/breadcrumbs.component'
import { CTASection } from '@/components/shared/cta-section.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import {
    aboutCTAData,
    aboutHeroData,
    missionData,
    ourStoryData,
} from '@/lib/data/webpages/about'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'

/**
 * About Page Metadata
 *
 * Implements SEO best practices for the About page including:
 * - Unique, descriptive title targeting business owners
 * - Compelling meta description with primary keywords
 * - Open Graph tags for social sharing
 * - Twitter Card configuration
 * - Canonical URL
 */
export const metadata = toNextMetadata(seoConfig, {
    // Canonical URL for about page
    canonical: '/about',

    // Page-specific metadata optimized for business owners
    title: 'About Us - Professional Website Solutions for Your Business',
    description:
        'Learn how we help business owners launch modern, professional websites in days. Built with Next.js, includes SEO, analytics, blog system, and everything your business needs to succeed online.',

    // Open Graph tags for social sharing
    openGraph: {
        title: 'Professional Website Development for Business Owners',
        description:
            'Fast, modern websites for businesses. Built with Next.js 15, includes blog, analytics, SEO optimization, and business-ready features. Launch in days, not months.',
        url: `${seoConfig.siteUrl}/about`,
        type: 'website',
        siteName: seoConfig.siteName,
        images: [
            {
                url: `${seoConfig.siteUrl}/og-about.jpg`,
                width: 1200,
                height: 630,
                alt: 'Modern professional website solutions for businesses',
            },
        ],
    },

    // Twitter Card configuration
    twitter: {
        card: 'summary_large_image',
        title: 'Professional Website Solutions for Your Business',
        description:
            'Launch your business website in days with modern technology, built-in SEO, analytics, and everything you need to succeed online.',
        images: [`${seoConfig.siteUrl}/og-about.jpg`],
    },
})

export default function AboutPage() {
    return (
        <>
            {/* SEO Schema */}
            <WebPageSchema
                name={metadata.title as string}
                url={`${seoConfig.siteUrl}/about`}
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
                {/* Breadcrumbs Navigation */}
                <div className='pt-8 pb-4'>
                    <ContentWrapper>
                        <Breadcrumbs
                            items={[
                                { label: 'Home', href: '/' },
                                { label: 'About' },
                            ]}
                        />
                    </ContentWrapper>
                </div>

                {/* About Hero Section */}
                <AboutHeroSection id='about-hero' {...aboutHeroData} />

                {/* Mission/Vision/Values Section */}
                <MissionSection id='mission-values' {...missionData} />

                {/* Our Story - Stacking Scroll Effect */}
                <StackingFeaturesSection
                    id='our-story'
                    title='Our Story'
                    description='How we built a template that works for everyone'
                    features={ourStoryData.map((feature) => {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const { icon, ...rest } = feature
                        return rest
                    })}
                    variant='muted'
                    animationIntensity='subtle'
                    stackingVariant='compact'
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
            </main>
        </>
    )
}
