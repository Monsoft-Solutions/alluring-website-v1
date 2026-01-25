/**
 * Blog Post Images Query
 *
 * Fetches inline images associated with a blog post from the junction table.
 * Used to generate ImageObject structured data for SEO.
 */
import { unstable_cache } from 'next/cache'

import { db } from '@workspace/db/client'
import { blogPostImages, images } from '@workspace/db/schema/blog'
import { and, eq } from 'drizzle-orm'

/**
 * Inline image data for schema generation
 */
export type InlineImage = {
    id: string
    url: string
    alt: string
    title: string | null
    description: string | null
    width: number | null
    height: number | null
    mimeType: string | null
}

/**
 * Internal function to fetch inline images for a blog post
 */
async function fetchInlineImagesByPostId(
    blogPostId: string
): Promise<InlineImage[]> {
    const rows = await db
        .select({
            id: images.id,
            url: images.url,
            alt: images.alt,
            title: images.title,
            description: images.description,
            width: images.width,
            height: images.height,
            mimeType: images.mimeType,
        })
        .from(blogPostImages)
        .innerJoin(images, eq(images.id, blogPostImages.imageId))
        .where(
            and(
                eq(blogPostImages.blogPostId, blogPostId),
                eq(blogPostImages.imageType, 'inline')
            )
        )

    return rows
}

/**
 * Get inline images for a blog post with persistent caching
 *
 * Uses Next.js unstable_cache for cross-request caching.
 * Cache is tagged with 'blog-posts' and specific post ID for targeted invalidation.
 *
 * @param blogPostId - The blog post ID
 * @returns Array of inline images with metadata
 */
export const getInlineImagesByPostId = (
    blogPostId: string
): Promise<InlineImage[]> => {
    return unstable_cache(
        () => fetchInlineImagesByPostId(blogPostId),
        [`blog-post-images-${blogPostId}`],
        {
            tags: ['blog-posts', `blog-post-${blogPostId}`],
            revalidate: 60, // Cache for 60 seconds
        }
    )()
}
