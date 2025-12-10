import { BreadcrumbSchema, WebPageSchema } from '@workspace/seo/react'
import { Award, Shield, Users, Building2 } from 'lucide-react'

import { BeforeAfterShowcase } from '@/components/gallery/before-after-showcase.component'
import { GalleryGroupsSection } from '@/components/gallery/gallery-groups-section.component'
import { GalleryHero } from '@/components/gallery/gallery-hero.component'
import { CTASection } from '@/components/shared/cta-section.component'
import { siteConfig } from '@/lib/data/site-config'
import { getFeaturedBeforeAfterPairs } from '@/lib/queries/gallery/before-after.query'
import { getVisibleGalleryGroups } from '@/lib/queries/gallery/gallery-list.query'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'
import { env } from '@/env'

const siteUrl = env.NEXT_PUBLIC_SITE_URL ?? siteConfig.seo.siteUrl
const pageUrl = `${siteUrl}/gallery`

export const metadata = toNextMetadata(seoConfig, {
    canonical: '/gallery',
    title: 'Gallery | Before & After Results',
    description: `View real before and after photos from ${siteConfig.business.name} in Miami. Explore authentic transformations showcasing the artistry of our board-certified surgeons.`,
    keywords: [
        'plastic surgery before after photos',
        'cosmetic surgery results Miami',
        'breast augmentation before after',
        'BBL before after',
        'tummy tuck results',
        'liposuction before after',
        'mommy makeover photos',
        'plastic surgery gallery Miami',
    ],
    openGraph: {
        type: 'website',
        url: pageUrl,
        title: `Gallery | ${siteConfig.business.name} Miami`,
        description:
            'Explore our gallery of real patient transformations. Before and after photos showcasing the exceptional results achieved by our board-certified surgeons.',
        siteName: siteConfig.business.name,
        images: [
            {
                url: `${siteUrl}/og-image.jpg`,
                width: 1200,
                height: 630,
                alt: `Before and After Gallery at ${siteConfig.business.name} Miami`,
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: `Gallery | ${siteConfig.business.name} Miami`,
        description:
            'Explore our gallery of real patient transformations and before/after results.',
        images: [`${siteUrl}/og-image.jpg`],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
})

export default async function GalleryPage() {
    // Fetch data in parallel
    const [groups, beforeAfterPairs] = await Promise.all([
        getVisibleGalleryGroups(),
        getFeaturedBeforeAfterPairs(6),
    ])

    // Breadcrumb items for schema
    const breadcrumbItems = [
        { name: 'Home', item: siteUrl },
        { name: 'Gallery', item: pageUrl },
    ]

    return (
        <>
            {/* Structured Data - WebPage Schema */}
            <WebPageSchema
                name={`Gallery | ${siteConfig.business.name} Miami`}
                url={pageUrl}
                description={`View real before and after photos from ${siteConfig.business.name} in Miami. Explore authentic transformations showcasing the artistry of our board-certified surgeons.`}
            />

            {/* Structured Data - Breadcrumb Schema */}
            <BreadcrumbSchema items={breadcrumbItems} />

            {/* Hero Section */}
            <GalleryHero />

            {/* Before/After Showcase */}
            {beforeAfterPairs.length > 0 && (
                <BeforeAfterShowcase pairs={beforeAfterPairs} />
            )}

            {/* Gallery Groups */}
            <GalleryGroupsSection groups={groups} />

            {/* CTA Section */}
            <CTASection
                variant='luxury'
                eyebrow='Your Transformation Awaits'
                heading='Ready to See Your Potential?'
                description="Every transformation in our gallery started with a single conversation. Schedule your free consultation with our board-certified surgeons and discover what's possible for you."
                primaryButton={{
                    text: 'Schedule Your Consultation',
                    href: '/contact-us',
                }}
                secondaryButton={{
                    text: 'Call Us Now',
                    href: `tel:${siteConfig.contact.phone.replace(/\D/g, '')}`,
                }}
                backgroundImage='/images/hero-beautiful-latin-woman.jpg'
                trustBadges={[
                    {
                        icon: <Award className='h-5 w-5' />,
                        label: 'Board-Certified Surgeons',
                    },
                    {
                        icon: <Shield className='h-5 w-5' />,
                        label: 'Accredited Facility',
                    },
                    {
                        icon: <Users className='h-5 w-5' />,
                        label: `${siteConfig.trustStats?.patients ?? '5,000+'} Happy Patients`,
                    },
                    {
                        icon: <Building2 className='h-5 w-5' />,
                        label: `${siteConfig.trustStats?.years ?? '15+'} Years Experience`,
                    },
                ]}
            />
        </>
    )
}
