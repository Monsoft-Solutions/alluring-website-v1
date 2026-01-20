/**
 * Save Content Step
 *
 * Durable workflow step that inserts generated images into the blog post
 * content and saves the updated content to the database.
 *
 * @module @admin/app/workflows/inline-image-generation/save-content
 */

import { db } from '@workspace/db/client'
import {
    blogPost,
    blogPostImages,
    images as imagesTable,
} from '@workspace/db/schema/blog'
import { eq } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'

import { CACHE_TAGS } from '@workspace/shared/cache'
import { insertInlineImagesIntoMarkdown } from '@/lib/utils/insert-inline-images.util'
import type { GeneratedInlineImage, InlineImageTypeValue } from '@workspace/ai'

export type SaveContentStepInput = {
    postId: string
    images: Array<{
        imageUrl: string
        insertAfterText: string
        altText: string
        imageType: InlineImageTypeValue
    }>
}

export type SaveContentStepResult = {
    success: boolean
    postId: string
    imagesInserted: number
    error?: string
}

/**
 * Inserts generated images into the blog post content and saves to database.
 *
 * This is a durable step that will be retried automatically on failure.
 */
export async function saveContentStep(
    input: SaveContentStepInput
): Promise<SaveContentStepResult> {
    'use step'

    const { postId, images } = input

    console.log(
        `[Workflow Step] Saving ${images.length} images to post: ${postId}`
    )

    if (images.length === 0) {
        return {
            success: true,
            postId,
            imagesInserted: 0,
        }
    }

    try {
        // Fetch current content
        const [post] = await db
            .select({
                content: blogPost.content,
                slug: blogPost.slug,
            })
            .from(blogPost)
            .where(eq(blogPost.id, postId))
            .limit(1)

        if (!post?.content) {
            return {
                success: false,
                postId,
                imagesInserted: 0,
                error: 'Post not found or has no content',
            }
        }

        // Convert to the format expected by insertInlineImagesIntoMarkdown
        const workflowTimestamp = Date.now()
        const generatedImages: GeneratedInlineImage[] = images.map(
            (img, index) => ({
                opportunityId: `workflow-${workflowTimestamp}-${index}`,
                imageUrl: img.imageUrl,
                altText: img.altText,
                insertAfterText: img.insertAfterText,
                imageType: img.imageType,
                status: 'success' as const,
            })
        )

        // Insert images into markdown
        const updatedContent = insertInlineImagesIntoMarkdown(
            post.content,
            generatedImages
        )

        // Execute all database operations in a single transaction
        // This ensures atomicity - either all operations succeed or all are rolled back
        await db.transaction(async (tx) => {
            // Save updated content to blog post
            await tx
                .update(blogPost)
                .set({ content: updatedContent })
                .where(eq(blogPost.id, postId))

            // Track inline images in the junction table
            for (const img of input.images) {
                // First, create the image record
                const [imageRecord] = await tx
                    .insert(imagesTable)
                    .values({
                        url: img.imageUrl,
                        alt: img.altText,
                        generatedBy: 'fal-ai',
                        generationPrompt: img.altText,
                    })
                    .onConflictDoUpdate({
                        target: imagesTable.url,
                        set: { updatedAt: new Date() },
                    })
                    .returning({ id: imagesTable.id })

                // Ensure imageRecord exists before linking
                if (!imageRecord?.id) {
                    throw new Error(
                        `Failed to insert or retrieve image record for URL: ${img.imageUrl}`
                    )
                }

                // Then link to blog post with 'inline' type
                await tx
                    .insert(blogPostImages)
                    .values({
                        blogPostId: postId,
                        imageId: imageRecord.id,
                        prompt: img.altText,
                        imageType: 'inline',
                    })
                    .onConflictDoNothing()
            }
        })

        // Revalidate cache for this post
        if (post.slug) {
            revalidateTag(CACHE_TAGS.blogPostBySlug(post.slug), { expire: 0 })
        }

        console.log(
            `[Workflow Step] Successfully saved ${input.images.length} images to post: ${postId}`
        )

        return {
            success: true,
            postId,
            imagesInserted: images.length,
        }
    } catch (error) {
        console.error(
            `[Workflow Step] Failed to save content for ${postId}:`,
            error
        )

        return {
            success: false,
            postId,
            imagesInserted: 0,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to save content',
        }
    }
}
