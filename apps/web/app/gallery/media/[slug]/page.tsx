/**
 * Gallery Media Detail Page
 *
 * SEO note (issue #118): these individual media detail pages are thin
 * (~230 words) and number in the hundreds, so they are intentionally
 * `noindex, follow` — they pass link equity to the indexable gallery
 * GROUP pages (`/gallery` and `/gallery/[slug]`), which carry the real
 * procedure context and remain fully indexable.
 *
 * Videos are the exception (issue #321): Google indexes a video only from
 * an indexable page where it is the main content, so a video's detail page
 * is its watch page — indexable, and listed in the video sitemap under its
 * own URL.
 */
import {
    BreadcrumbSchema,
    ImageObjectSchema,
    VideoObjectSchema,
    WebPageSchema,
} from '@workspace/seo/react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'

import { MediaDetailView } from '@/components/gallery/media-detail-view.component'
import { RelatedMedia } from '@/components/gallery/related-media.component'
import { ContainerLayout } from '@/components/container-layout.component'
import { siteConfig } from '@/lib/data/site-config'
import { formatSecondsToISO8601 } from '@/lib/utils/duration.util'
import { getImageMimeType } from '@/lib/utils/image.util'
import {
    getAllGalleryMediaSlugs,
    getGalleryMediaBySlug,
} from '@/lib/queries/gallery/gallery-detail.query'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'
import { stripBrandSuffix } from '@/lib/seo/strip-brand-suffix.util'
import { env } from '@/env'

type PageProps = {
    params: Promise<{ slug: string }>
}

const siteUrl = env.NEXT_PUBLIC_SITE_URL ?? siteConfig.seo.siteUrl

const getCachedMediaBySlug = cache(async (slug: string) =>
    getGalleryMediaBySlug(slug)
)

export async function generateStaticParams() {
    const slugs = await getAllGalleryMediaSlugs()
    return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { slug } = await params
    const media = await getCachedMediaBySlug(slug)

    if (!media) {
        return { title: 'Image Not Found' }
    }

    const pageUrl = `${siteUrl}/gallery/media/${media.slug}`
    const pageTitle = stripBrandSuffix(
        media.seoTitle ?? `${media.title} | Gallery`
    )
    const description =
        media.seoDescription ??
        media.description ??
        `View ${media.title} from our ${media.groups.length > 0 ? media.groups[0]?.name : 'photo'} gallery at ${siteConfig.business.name} Miami.`

    // Image pages are thin, high-volume detail pages: noindex but follow so
    // link equity flows to the gallery group pages (issue #118). A video's
    // page is its watch page, which Google must be able to index (#321).
    const isWatchPage = media.type === 'video'
    const previewImage = isWatchPage ? media.thumbnailUrl : media.url

    return toNextMetadata(seoConfig, {
        title: pageTitle,
        description,
        canonical: `/gallery/media/${media.slug}`,
        // A watch page keeps the site-wide googleBot directives (which carry
        // max-video-preview); an image page must override them, since the
        // merge is shallow and they say `index`.
        robots: isWatchPage
            ? { index: true, follow: true }
            : {
                  index: false,
                  follow: true,
                  googleBot: { index: false, follow: true },
              },
        openGraph: {
            type: isWatchPage ? 'video.other' : 'article',
            url: pageUrl,
            title: pageTitle,
            description,
            ...(previewImage && {
                images: [
                    {
                        url: previewImage,
                        width: media.width ?? undefined,
                        height: media.height ?? undefined,
                        alt: media.alt,
                    },
                ],
            }),
            ...(isWatchPage && {
                videos: [
                    {
                        url: media.url,
                        type: 'video/mp4',
                        width: media.width ?? undefined,
                        height: media.height ?? undefined,
                    },
                ],
            }),
        },
        twitter: {
            card: 'summary_large_image',
            title: pageTitle,
            description,
            ...(previewImage && { images: [previewImage] }),
        },
    })
}

export default async function GalleryMediaPage({ params }: PageProps) {
    const { slug } = await params
    const media = await getCachedMediaBySlug(slug)

    if (!media) {
        notFound()
    }

    const pageUrl = `${siteUrl}/gallery/media/${media.slug}`

    // Build breadcrumb items
    const breadcrumbItems = [
        { name: 'Home', item: siteUrl },
        { name: 'Gallery', item: `${siteUrl}/gallery` },
    ]

    // Add first group if available
    if (media.groups.length > 0) {
        breadcrumbItems.push({
            name: media.groups[0]!.name,
            item: `${siteUrl}/gallery/${media.groups[0]!.slug}`,
        })
    }

    breadcrumbItems.push({ name: media.title, item: pageUrl })

    return (
        <>
            {/* Structured Data */}
            <WebPageSchema
                name={`${media.title} | ${siteConfig.business.name}`}
                url={pageUrl}
                description={
                    media.description ??
                    `View ${media.title} from our photo gallery.`
                }
            />
            <BreadcrumbSchema items={breadcrumbItems} />

            {/* ImageObject Schema (for images) - mainEntityOfPage signals this is a gallery page */}
            {media.type === 'image' && (
                <ImageObjectSchema
                    name={media.title}
                    description={media.description ?? undefined}
                    alt={media.alt}
                    url={pageUrl}
                    contentUrl={media.url}
                    thumbnailUrl={media.thumbnailUrl ?? media.url}
                    width={media.width ?? undefined}
                    height={media.height ?? undefined}
                    datePublished={media.publishedAt ?? undefined}
                    author={{
                        '@type': 'Organization',
                        name: siteConfig.business.name,
                        url: siteUrl,
                    }}
                    mainEntityOfPage={pageUrl}
                    // Enhanced SEO properties
                    caption={media.description ?? media.alt}
                    encodingFormat={getImageMimeType(media.url)}
                    representativeOfPage={true}
                    copyrightHolder={
                        siteConfig.legal?.copyrightHolder ??
                        siteConfig.business.name
                    }
                    license={siteConfig.legal?.defaultImageLicense}
                />
            )}

            {/* VideoObject Schema (for videos) - mainEntityOfPage signals this is a watch page */}
            {media.type === 'video' && (
                <VideoObjectSchema
                    name={media.title}
                    description={
                        media.description ??
                        media.alt ??
                        `Video from ${siteConfig.business.name} gallery`
                    }
                    thumbnailUrl={media.thumbnailUrl ?? media.url}
                    uploadDate={media.publishedAt ?? new Date().toISOString()}
                    contentUrl={media.url}
                    embedUrl={pageUrl}
                    duration={
                        media.duration
                            ? formatSecondsToISO8601(media.duration)
                            : undefined
                    }
                    width={media.width ?? undefined}
                    height={media.height ?? undefined}
                    author={{
                        type: 'Organization',
                        name: siteConfig.business.name,
                        url: siteUrl,
                    }}
                    mainEntityOfPage={pageUrl}
                />
            )}

            <ContainerLayout
                as='article'
                size='xl'
                className='pt-32 pb-12 lg:pt-40 lg:pb-16'
            >
                {/* Media Detail */}
                <MediaDetailView media={media} />

                {/* Related Media */}
                {media.relatedMedia.length > 0 && (
                    <div className='mt-16'>
                        <RelatedMedia media={media.relatedMedia} />
                    </div>
                )}
            </ContainerLayout>
        </>
    )
}
