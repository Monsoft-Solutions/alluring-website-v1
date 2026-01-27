/**
 * Generate Title Step
 *
 * Durable workflow step that generates an SEO title for a single Instagram post.
 * Each title generation is a separate step for durability - if one fails,
 * it can be retried without affecting others.
 *
 * @module @admin/app/workflows/seo-title-generation/generate-title
 */
import { db } from '@workspace/db/client'
import { instagramPost } from '@workspace/db/schema/social-media'
import { galleryMedia } from '@workspace/db/schema/gallery'
import { eq } from 'drizzle-orm'
import { generateInstagramSeoTitle } from '@workspace/ai'

export type GenerateTitleStepInput = {
    postId: string
}

export type GenerateTitleStepResult = {
    success: boolean
    postId: string
    seoTitle?: string
    seoDescription?: string
    error?: string
}

/**
 * Generates an SEO title for a single Instagram post and saves it to the database.
 *
 * This is a durable step that will be retried automatically on failure.
 */
export async function generateTitleStep(
    input: GenerateTitleStepInput
): Promise<GenerateTitleStepResult> {
    'use step'

    const { postId } = input

    console.log(`[Workflow Step] Generating SEO title for post: ${postId}`)

    try {
        // Fetch the post with its media and AI analysis
        const posts = await db
            .select({
                id: instagramPost.id,
                caption: instagramPost.caption,
                mediaType: instagramPost.mediaType,
                takenAt: instagramPost.takenAt,
                aiAnalysis: instagramPost.aiAnalysis,
                mediaAiAnalysis: galleryMedia.aiAnalysis,
            })
            .from(instagramPost)
            .innerJoin(galleryMedia, eq(instagramPost.mediaId, galleryMedia.id))
            .where(eq(instagramPost.id, postId))
            .limit(1)

        if (posts.length === 0) {
            return {
                success: false,
                postId,
                error: 'Post not found',
            }
        }

        const post = posts[0]!

        // Prefer post-level AI analysis, fallback to media-level
        const aiAnalysis = post.aiAnalysis ?? post.mediaAiAnalysis

        // Generate the SEO title using AI
        const result = await generateInstagramSeoTitle({
            caption: post.caption,
            mediaType: post.mediaType,
            takenAt: post.takenAt,
            aiAnalysis: aiAnalysis
                ? {
                      detectedProcedure: aiAnalysis.detectedProcedure,
                      bodyArea: aiAnalysis.bodyArea,
                      contentTags: aiAnalysis.suggestedTags,
                      isBeforeAfter: aiAnalysis.isBeforeAfter,
                  }
                : null,
        })

        // Update the post with the generated title and description
        await db
            .update(instagramPost)
            .set({
                seoTitle: result.seoTitle,
                seoDescription: result.seoDescription,
                updatedAt: new Date(),
            })
            .where(eq(instagramPost.id, postId))

        console.log(
            `[Workflow Step] Generated SEO metadata for ${postId}: "${result.seoTitle}" / "${result.seoDescription}"`
        )

        return {
            success: true,
            postId,
            seoTitle: result.seoTitle,
            seoDescription: result.seoDescription,
        }
    } catch (error) {
        console.error(
            `[Workflow Step] SEO title generation failed for ${postId}:`,
            error
        )

        return {
            success: false,
            postId,
            error:
                error instanceof Error
                    ? error.message
                    : 'Title generation failed',
        }
    }
}
