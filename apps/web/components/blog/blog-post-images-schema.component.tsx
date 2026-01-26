/**
 * BlogPostImagesSchema Component
 *
 * Server component that renders ImageObjectSchema structured data for each
 * inline image in a blog post. This enables better image discovery and SEO
 * by providing detailed metadata for all images within the article content.
 *
 * Benefits:
 * - Better image search visibility for inline images
 * - Copyright and licensing signals
 * - Rich image metadata for search engines
 */
import { ImageObjectSchema } from '@workspace/seo/react'

import { siteConfig } from '@/lib/data/site-config'
import type { InlineImage } from '@/lib/queries/blog/post-images.query'
import { seoConfig } from '@/lib/seo-config'

type BlogPostImagesSchemaProps = {
    /** Array of inline images with metadata */
    images: InlineImage[]
    /** URL of the blog post page */
    postUrl: string
    /** Title of the blog post */
    postTitle: string
    /** Author name for the images */
    authorName?: string
    /** Date the post was published (ISO 8601) */
    datePublished?: string
}

/**
 * Renders ImageObjectSchema for each inline image in a blog post
 */
export function BlogPostImagesSchema({
    images,
    postUrl,
    postTitle,
    authorName,
    datePublished,
}: BlogPostImagesSchemaProps) {
    if (images.length === 0) {
        return null
    }

    const siteUrl = seoConfig.siteUrl

    return (
        <>
            {images.map((image) => (
                <ImageObjectSchema
                    key={image.id}
                    // Core properties
                    url={image.url}
                    contentUrl={image.url}
                    name={image.title ?? `Image from ${postTitle}`}
                    alt={image.alt}
                    // Size properties
                    width={image.width ?? undefined}
                    height={image.height ?? undefined}
                    // Caption and description
                    caption={image.description ?? image.alt}
                    description={image.description ?? undefined}
                    // MIME type from database or undefined
                    encodingFormat={image.mimeType ?? undefined}
                    // Author information
                    author={{
                        '@type': 'Organization',
                        name:
                            authorName ??
                            seoConfig.organization?.name ??
                            siteConfig.business.name,
                        url: siteUrl,
                    }}
                    // Copyright and licensing
                    copyrightHolder={
                        siteConfig.legal?.copyrightHolder ??
                        siteConfig.business.name
                    }
                    license={siteConfig.legal?.defaultImageLicense}
                    // Publishing info
                    datePublished={datePublished}
                    // Link back to the article
                    mainEntityOfPage={postUrl}
                />
            ))}
        </>
    )
}
