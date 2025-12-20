/**
 * Blog Landing Page
 *
 * Luxury blog page showcasing expert articles on plastic surgery
 * procedures, recovery tips, and patient education.
 *
 * Features:
 * - Immersive dark hero with gold accents
 * - Featured post highlight section
 * - Infinite scroll article grid
 * - Luxury CTA section
 * - Full SEO optimization with structured data
 */
import { Award, Building2, Shield, Users } from 'lucide-react'
import type { Metadata } from 'next'

import { BreadcrumbSchema, WebPageSchema } from '@workspace/seo/react'

import { BlogHeroSection } from '@/components/blog/blog-hero-section.component'
import { FeaturedPost } from '@/components/blog/featured-post.component'
import { InfinitePostList } from '@/components/blog/infinite-post-list.component'
import { CTASection } from '@/components/shared/cta-section.component'
import { siteConfig } from '@/lib/data/site-config'
import {
    blogArticlesSectionData,
    blogCtaData,
    blogHeroData,
    blogSeoData,
} from '@/lib/data/webpages/blog'
import { getPublishedPostCardsPage } from '@/lib/queries/blog/post-list.query'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'

const siteUrl = siteConfig.seo.siteUrl
const pageUrl = `${siteUrl}/blog`

/**
 * Page Metadata
 *
 * SEO-optimized metadata for the blog landing page.
 * CTR-optimized with content type indicators and freshness signal.
 */
const pageTitle = 'Plastic Surgery Blog | Expert Tips & Recovery Guides | Miami'

export const metadata: Metadata = toNextMetadata(seoConfig, {
    title: pageTitle,
    description:
        "Expert insights from Miami's board-certified plastic surgeons. Recovery tips, procedure guides, patient stories & the latest in cosmetic surgery. Updated weekly.",
    keywords: blogSeoData.keywords,
    canonical: blogSeoData.canonical,

    openGraph: {
        type: 'website',
        url: pageUrl,
        title: pageTitle,
        description:
            "Expert insights from Miami's board-certified plastic surgeons. Recovery tips, procedure guides, patient stories & the latest in cosmetic surgery. Updated weekly.",
        siteName: siteConfig.business.name,
        images: [
            {
                url: `${siteUrl}/og-image.jpg`,
                width: 1200,
                height: 630,
                alt: `${siteConfig.business.name} Blog`,
            },
        ],
    },

    twitter: {
        card: 'summary_large_image',
        title: pageTitle,
        description:
            "Expert insights from Miami's board-certified plastic surgeons. Recovery tips, procedure guides & patient stories. Updated weekly.",
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

export default async function BlogPage() {
    const pageSize = 12

    // Fetch initial posts for SSR
    const { items: initialPosts, nextCursor } = await getPublishedPostCardsPage(
        {
            limit: pageSize,
        }
    )

    // Encode the cursor for client-side use
    const encodedCursor = nextCursor
        ? Buffer.from(
              JSON.stringify({
                  publishedAt: nextCursor.publishedAt.toISOString(),
                  id: nextCursor.id,
              })
          ).toString('base64')
        : undefined

    // Get the featured post (first/latest post)
    const featuredPost = initialPosts[0]
    // Remaining posts for the grid (exclude featured)
    const remainingPosts = initialPosts.slice(1)

    // Breadcrumb items for schema
    const breadcrumbItems = [
        { name: 'Home', item: siteUrl },
        { name: 'Blog', item: pageUrl },
    ]

    return (
        <>
            {/* Structured Data - WebPage Schema */}
            <WebPageSchema
                name={`Plastic Surgery Blog | ${siteConfig.business.name}`}
                url={pageUrl}
                description={blogSeoData.description}
            />

            {/* Structured Data - Breadcrumb Schema */}
            <BreadcrumbSchema items={breadcrumbItems} />

            {/* Main Content */}
            <main className='bg-stone-50'>
                {/* Hero Section */}
                <BlogHeroSection
                    badge={blogHeroData.badge}
                    headline={blogHeroData.headline}
                    subheadline={blogHeroData.subheadline}
                    description={blogHeroData.description}
                    backgroundImage={blogHeroData.backgroundImage}
                />

                {/* Featured Post Section */}
                {featuredPost && (
                    <section className='relative z-10 -mt-16 pb-8'>
                        <FeaturedPost
                            post={featuredPost}
                            badge='Latest Article'
                        />
                    </section>
                )}

                {/* Articles Grid */}
                <InfinitePostList
                    initialPosts={remainingPosts}
                    initialCursor={encodedCursor}
                    pageSize={pageSize}
                    badge={blogArticlesSectionData.badge}
                    title={blogArticlesSectionData.title}
                    description={blogArticlesSectionData.description}
                    showHeader={remainingPosts.length > 0}
                />

                {/* CTA Section */}
                <CTASection
                    id='blog-cta'
                    variant='luxury'
                    eyebrow={blogCtaData.eyebrow}
                    heading={blogCtaData.heading}
                    description={blogCtaData.description}
                    primaryButton={{
                        text: blogCtaData.primaryButton.text,
                        href: blogCtaData.primaryButton.href,
                    }}
                    secondaryButton={
                        blogCtaData.secondaryButton
                            ? {
                                  text: blogCtaData.secondaryButton.text,
                                  href: blogCtaData.secondaryButton.href,
                                  variant: 'outline',
                              }
                            : undefined
                    }
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
                    size='lg'
                />
            </main>
        </>
    )
}
