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
    const pageTitle = media.seoTitle ?? `${media.title} | Gallery`
    const description =
        media.seoDescription ??
        media.description ??
        `View ${media.title} from our ${media.groups.length > 0 ? media.groups[0]?.name : 'photo'} gallery at ${siteConfig.business.name} Miami.`

    return toNextMetadata(seoConfig, {
        title: pageTitle,
        description,
        canonical: `/gallery/media/${media.slug}`,
        openGraph: {
            type: 'article',
            url: pageUrl,
            title: pageTitle,
            description,
            images: [
                {
                    url: media.url,
                    width: media.width ?? undefined,
                    height: media.height ?? undefined,
                    alt: media.alt,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: pageTitle,
            description,
            images: [media.url],
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
