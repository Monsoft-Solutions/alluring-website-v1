import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { BreadcrumbSchema, WebPageSchema } from '@workspace/seo/react'
import { cache } from 'react'

// Surgeon imports
import { surgeons } from '@/lib/data/surgeons/surgeons-data'
import { siteConfig } from '@/lib/data/site-config'
import { SurgeonHero } from '@/components/surgeons/surgeon-hero.component'
import { SurgeonBio } from '@/components/surgeons/surgeon-bio.component'
import { SurgeonCredentials } from '@/components/surgeons/surgeon-credentials.component'
import { SurgeonSpecialties } from '@/components/surgeons/surgeon-specialties.component'
import { SurgeonCTA } from '@/components/surgeons/surgeon-cta.component'
import { env } from '@/env'

// Blog imports
import { BlogPostContent } from '@/components/blog/blog-post-content.component'
import { getAdjacentPosts } from '@/lib/queries/blog/adjacent-posts.query'
import { getPublishedPostBySlug } from '@/lib/queries/blog/post-detail.query'
import { getRelatedPosts } from '@/lib/queries/blog/related-posts.query'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'
import { extractTableOfContents } from '@/lib/utils/extract-toc.util'
import { findCTAInsertionPoint } from '@/lib/utils/inject-cta-marker.util'

type PageProps = {
    params: Promise<{ slug: string }>
}

// Cache the blog post query to avoid duplicate fetches
const getCachedPostBySlug = cache(async (slug: string) =>
    getPublishedPostBySlug(slug)
)

/**
 * Generate static params for surgeon pages
 * Blog posts are fetched dynamically from the database
 */
export function generateStaticParams() {
    return surgeons.map((surgeon) => ({
        slug: surgeon.slug,
    }))
}

/**
 * Generate metadata for the page
 * Checks surgeons first (static), then blog posts (database)
 */
export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { slug } = await params

    // Check surgeons first (static, instant)
    const surgeon = surgeons.find((s) => s.slug === slug)
    if (surgeon) {
        return generateSurgeonMetadata(surgeon, slug)
    }

    // Check blog posts (database query)
    const post = await getCachedPostBySlug(slug)
    if (post) {
        return generateBlogPostMetadata(post)
    }

    return { title: 'Not Found' }
}

/**
 * Generate metadata for surgeon pages
 */
function generateSurgeonMetadata(
    surgeon: (typeof surgeons)[0],
    slug: string
): Metadata {
    const siteUrl = env.NEXT_PUBLIC_SITE_URL ?? siteConfig.seo.siteUrl
    const pageUrl = `${siteUrl}/${slug}`
    const ogImage = surgeon.images.featured.startsWith('http')
        ? surgeon.images.featured
        : `${siteUrl}${surgeon.images.featured}`

    const pageTitle = `${surgeon.name}`
    const pageDescription = surgeon.shortBio

    return {
        title: pageTitle,
        description: pageDescription,

        // Canonical URL
        alternates: {
            canonical: pageUrl,
        },

        // Open Graph tags for social sharing
        openGraph: {
            type: 'profile',
            url: pageUrl,
            title: `${pageTitle} | ${siteConfig.business.name}`,
            description: pageDescription,
            siteName: siteConfig.business.name,
            locale: 'en_US',
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: `${surgeon.name} - Board Certified Plastic Surgeon at ${siteConfig.business.name}`,
                },
            ],
        },

        // Twitter Card tags
        twitter: {
            card: 'summary_large_image',
            title: `${pageTitle} | ${siteConfig.business.name}`,
            description: pageDescription,
            images: [ogImage],
        },

        // Robots directives
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
    }
}

/**
 * Generate metadata for blog post pages
 * Uses root-level canonical URL to match WordPress structure
 */
function generateBlogPostMetadata(
    post: NonNullable<Awaited<ReturnType<typeof getPublishedPostBySlug>>>
): Metadata {
    return toNextMetadata(seoConfig, {
        title: post.title,
        description: post.excerpt ?? undefined,
        openGraph: {
            type: 'article',
            images: post.featuredImage
                ? [
                      {
                          url: post.featuredImage.url,
                          alt: post.featuredImage.alt,
                      },
                  ]
                : undefined,
        },
        // Root-level canonical URL to match WordPress structure
        canonical: `/${post.slug}`,
    })
}

/**
 * Dynamic page handler for both surgeons and blog posts
 * Checks surgeons first (static), then blog posts (database)
 */
export default async function DynamicPage({ params }: PageProps) {
    const { slug } = await params

    // Check surgeons first (static, instant)
    const surgeon = surgeons.find((s) => s.slug === slug)
    if (surgeon) {
        return <SurgeonContent surgeon={surgeon} slug={slug} />
    }

    // Check blog posts (database query)
    const post = await getCachedPostBySlug(slug)
    if (post) {
        // Fetch related data for blog post (6 posts for better discovery)
        const tableOfContents = extractTableOfContents(post.content)
        const [relatedPosts, adjacentPosts] = await Promise.all([
            getRelatedPosts(
                post.id,
                post.categories.map((c) => c.id),
                post.tags.map((t) => t.id),
                6
            ),
            post.publishedAt
                ? getAdjacentPosts(post.id, post.publishedAt)
                : Promise.resolve({ previousPost: null, nextPost: null }),
        ])
        const { beforeCTA, afterCTA, ctaId } = findCTAInsertionPoint(
            post.content
        )

        return (
            <BlogPostContent
                post={post}
                relatedPosts={relatedPosts}
                tableOfContents={tableOfContents}
                beforeCTA={beforeCTA}
                afterCTA={afterCTA}
                ctaId={ctaId ?? null}
                adjacentPosts={adjacentPosts}
            />
        )
    }

    notFound()
}

/**
 * Surgeon page content component
 */
function SurgeonContent({
    surgeon,
    slug,
}: {
    surgeon: (typeof surgeons)[0]
    slug: string
}) {
    const siteUrl = env.NEXT_PUBLIC_SITE_URL ?? siteConfig.seo.siteUrl
    const pageUrl = `${siteUrl}/${slug}`

    // Breadcrumb items for schema
    const breadcrumbItems = [
        { name: 'Home', item: siteUrl },
        { name: 'Our Surgeons', item: `${siteUrl}/about` },
        { name: surgeon.name, item: pageUrl },
    ]

    return (
        <>
            {/* Structured Data - WebPage Schema */}
            <WebPageSchema
                name={`${surgeon.name} | ${siteConfig.business.name}`}
                url={pageUrl}
                description={surgeon.shortBio}
            />

            {/* Structured Data - Breadcrumb Schema */}
            <BreadcrumbSchema items={breadcrumbItems} />

            <main className='min-h-screen bg-stone-950'>
                <SurgeonHero surgeon={surgeon} />
                <SurgeonBio surgeon={surgeon} />
                <SurgeonCredentials surgeon={surgeon} />
                <SurgeonSpecialties surgeon={surgeon} />
                <SurgeonCTA />
            </main>
        </>
    )
}
