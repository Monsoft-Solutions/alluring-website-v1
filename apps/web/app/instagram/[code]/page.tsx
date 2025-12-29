/**
 * Individual Instagram Post Page
 *
 * SEO-optimized page for individual Instagram posts.
 * Statically generated for all posts.
 *
 * @module app/instagram/[code]/page
 */
import type { Metadata } from 'next'
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

    // Create a description from the caption
    const description = post.caption
        ? post.caption.substring(0, 160).replace(/\s+/g, ' ').trim() +
          (post.caption.length > 160 ? '...' : '')
        : `Instagram post from ${siteConfig.business.name}`

    const pageUrl = `${siteUrl}/instagram/${code}`

    return toNextMetadata(seoConfig, {
        title: `Instagram Post | ${siteConfig.business.name}`,
        description,
        canonical: `/instagram/${code}`,
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
            <InstagramPostContent post={post} profile={profile} />

            {/* More Posts Section */}
            <MorePostsSection currentPostId={post.id} />

            {/* CTA Section */}
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
    )
}
