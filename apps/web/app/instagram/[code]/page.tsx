/**
 * Individual Instagram Post Page
 *
 * SEO-optimized page for individual Instagram posts.
 * Statically generated for all posts.
 *
 * Intentionally `noindex, follow` per issue #118 (thin-content consolidation):
 * these ~800 pages are thin (no h1, ~300 words) and dragged down site-wide
 * quality signals as the majority of the site's indexable URLs. The pages
 * stay live and linked (crawlable, internally linked from the hub and from
 * each other) so link equity still flows, but they are excluded from the
 * index. The `/instagram` hub page remains fully indexable.
 *
 * @module app/instagram/[code]/page
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import {
    BreadcrumbSchema,
    ImageObjectSchema,
    VideoObjectSchema,
} from '@workspace/seo/react'

import { InstagramPostContent } from '@/components/instagram/instagram-post-content.component'
import { MorePostsSection } from '@/components/instagram/more-posts-section.component'
import { CTASection } from '@/components/shared/cta-section.component'
import {
    getInstagramPostByCode,
    getAllInstagramPostCodes,
} from '@/lib/queries/instagram/instagram-post.query'
import { getInstagramProfile } from '@/lib/queries/instagram/instagram-profile.query'
import { siteConfig } from '@/lib/data/site-config'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'
import { stripBrandSuffix } from '@/lib/seo/strip-brand-suffix.util'
import { formatSecondsToISO8601 } from '@/lib/utils/duration.util'
import { env } from '@/env'

const siteUrl = env.NEXT_PUBLIC_SITE_URL ?? siteConfig.seo.siteUrl

type PageProps = {
    params: Promise<{ code: string }>
}

const getCachedPostByCode = cache(async (code: string) =>
    getInstagramPostByCode(code)
)

/**
 * Generate a fallback SEO title when seoTitle is not available
 * Format: "Photo Jan 2024" (the root layout's title template appends
 * "| Alluring Plastic Surgery" automatically — do not append it here or
 * the brand ends up doubled in the rendered <title>)
 */
function generateFallbackTitle(post: {
    mediaType: string
    takenAt: Date
}): string {
    const date = new Date(post.takenAt)
    const monthYear = date.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
    })
    const prefix =
        post.mediaType === 'video'
            ? 'Video'
            : post.mediaType === 'carousel'
              ? 'Gallery'
              : 'Photo'
    return `${prefix} ${monthYear}`
}

/**
 * Generate static params for all Instagram posts
 */
export async function generateStaticParams() {
    const codes = await getAllInstagramPostCodes()
    return codes.map((code) => ({ code }))
}

/**
 * Generate metadata for the post
 */
export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { code } = await params
    const post = await getCachedPostByCode(code)

    if (!post) {
        return { title: 'Post not found' }
    }

    // Generate unique title - use seoTitle if available, else smart fallback.
    // Strip any trailing brand suffix so the root layout's title template
    // ("%s | Alluring Plastic Surgery") doesn't double it up.
    const title = stripBrandSuffix(post.seoTitle ?? generateFallbackTitle(post))

    // Create a description - use seoDescription if available, else caption fallback
    const description =
        post.seoDescription ??
        (post.caption
            ? post.caption.substring(0, 160).replace(/\s+/g, ' ').trim() +
              (post.caption.length > 160 ? '...' : '')
            : `Instagram post from ${siteConfig.business.name}`)

    const pageUrl = `${siteUrl}/instagram/${code}`

    return toNextMetadata(seoConfig, {
        title,
        description,
        canonical: `/instagram/${code}`,
        // Thin, high-volume detail pages: noindex but follow so link equity
        // still flows to the indexable /instagram hub (issue #118). Passed
        // through toNextMetadata so mergeRobots keeps the stricter global
        // noindex set on non-production deploys.
        robots: {
            index: false,
            follow: true,
            googleBot: {
                index: false,
                follow: true,
            },
        },
        openGraph: {
            type: 'article',
            url: pageUrl,
            images: [
                {
                    url: post.media.thumbnailUrl ?? post.media.url,
                    alt: description,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            images: [post.media.thumbnailUrl ?? post.media.url],
        },
    })
}

export default async function InstagramPostPage({ params }: PageProps) {
    const { code } = await params
    const [post, profile] = await Promise.all([
        getCachedPostByCode(code),
        getInstagramProfile(),
    ])

    if (!post) {
        notFound()
    }

    const pageUrl = `${siteUrl}/instagram/${code}`
    const instagramUrl =
        siteConfig.social.find((s) => s.platform === 'instagram')?.url ??
        'https://instagram.com/alluringplasticsurgery'

    // Breadcrumb items
    const breadcrumbItems = [
        { name: 'Home', item: siteUrl },
        { name: 'Instagram', item: `${siteUrl}/instagram` },
        { name: 'Post', item: pageUrl },
    ]

    // Article structured data
    const articleDescription = post.caption
        ? post.caption.substring(0, 160).replace(/\s+/g, ' ').trim()
        : `Instagram post from ${siteConfig.business.name}`

    // Check if this is a video post
    const isVideo = post.media.type === 'video'

    return (
        <>
            {/* Structured Data - Video posts get VideoObjectSchema (watch page)
                Image posts get ImageObjectSchema (gallery page) */}
            {isVideo ? (
                <VideoObjectSchema
                    name={
                        post.caption
                            ?.substring(0, 70)
                            .replace(/\s+/g, ' ')
                            .trim() || `Video from ${siteConfig.business.name}`
                    }
                    description={articleDescription}
                    thumbnailUrl={post.media.thumbnailUrl ?? post.media.url}
                    uploadDate={new Date(post.takenAt).toISOString()}
                    contentUrl={post.media.url}
                    embedUrl={pageUrl}
                    duration={
                        post.media.duration
                            ? formatSecondsToISO8601(post.media.duration)
                            : undefined
                    }
                    width={post.media.width ?? undefined}
                    height={post.media.height ?? undefined}
                    author={{
                        type: 'Organization',
                        name: siteConfig.business.name,
                        url: siteUrl,
                    }}
                    mainEntityOfPage={pageUrl}
                />
            ) : (
                <ImageObjectSchema
                    name={`Instagram Post - ${new Date(post.takenAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
                    description={articleDescription}
                    alt={articleDescription}
                    url={pageUrl}
                    contentUrl={post.media.url}
                    thumbnailUrl={post.media.thumbnailUrl ?? post.media.url}
                    width={post.media.width ?? undefined}
                    height={post.media.height ?? undefined}
                    datePublished={new Date(post.takenAt).toISOString()}
                    author={{
                        '@type': 'Organization',
                        name: siteConfig.business.name,
                        url: siteUrl,
                    }}
                    mainEntityOfPage={pageUrl}
                />
            )}

            {/* Structured Data - Breadcrumb Schema */}
            <BreadcrumbSchema items={breadcrumbItems} />

            {/* Post Content */}
            <InstagramPostContent
                post={post}
                profile={profile}
                isVideo={isVideo}
            />

            {/* Video posts: Minimal layout for Google "watch page" classification
                Image posts: Full layout with related posts and CTA */}
            {isVideo ? (
                /* Minimal inline CTA for video posts - keeps video as primary content */
                <div className='bg-white py-8 text-center'>
                    <p className='mb-2 text-stone-600'>
                        Ready to start your transformation?
                    </p>
                    <Link
                        href='/contact-us'
                        className='text-gold-600 hover:text-gold-700 font-medium transition-colors'
                    >
                        Schedule a Consultation →
                    </Link>
                </div>
            ) : (
                <>
                    {/* More Posts Section - only for image posts */}
                    <MorePostsSection currentPostId={post.id} />

                    {/* CTA Section - only for image posts */}
                    <CTASection
                        variant='luxury'
                        eyebrow='Start Your Transformation'
                        heading='Ready to Make a Change?'
                        description='Every transformation starts with a single conversation. Schedule your free consultation with our board-certified surgeons.'
                        primaryButton={{
                            text: 'Schedule Your Consultation',
                            href: '/contact-us',
                        }}
                        secondaryButton={{
                            text: 'Follow Us on Instagram',
                            href: instagramUrl,
                        }}
                        backgroundImage='/images/hero-beautiful-latin-woman.jpg'
                    />
                </>
            )}
        </>
    )
}
