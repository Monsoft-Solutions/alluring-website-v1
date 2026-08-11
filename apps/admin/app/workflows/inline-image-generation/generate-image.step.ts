/**
 * Generate Image Step
 *
 * Durable workflow step that generates a single image using FAL.ai
 * and uploads it to Vercel Blob storage.
 *
 * Each image generation is a separate step for durability - if one fails,
 * it can be retried without affecting others.
 *
 * @module @admin/app/workflows/inline-image-generation/generate-image
 */

import { generateImageWithFal } from '@/lib/services/fal-image-generation.service'
import type { ImageModelId } from '@/lib/services/fal-image-generation.service'
import {
    generateImageAlt,
    getInlineImageTypeById,
    type ArtisticImageAspectRatio,
    type InlineImageTypeValue,
} from '@workspace/ai'

export type GenerateImageStepInput = {
    postId: string
    opportunityId: string
    prompt: string
    imageType: InlineImageTypeValue
    photoStyle?: string
    insertAfterText: string
    altText: string
    /** Blog post slug, for SEO-friendly blob storage paths */
    slug?: string
    /** Primary keyword, woven into the generated alt text where it fits */
    primaryKeyword?: string
}

export type GenerateImageStepResult = {
    success: boolean
    opportunityId: string
    imageUrl?: string
    insertAfterText: string
    altText: string
    imageType: InlineImageTypeValue
    /** The prompt that produced the image, for the `generationPrompt` column */
    prompt: string
    error?: string
}

/**
 * Get the appropriate FAL model for an image type
 */
function getModelForImageType(imageType: string): ImageModelId {
    if (imageType === 'infographic' || imageType === 'illustration') {
        return 'nano-banana-pro'
    }
    return 'gpt-image-2'
}

/**
 * Get the aspect ratio declared for an inline image type.
 *
 * Until now every inline image was rendered at the featured-image ratio; the
 * per-type ratios in the AI constants were declared but never used.
 */
function getAspectRatioForImageType(
    imageType: InlineImageTypeValue
): ArtisticImageAspectRatio {
    return getInlineImageTypeById(imageType).aspectRatio
}

/**
 * Generates a single image using FAL.ai and uploads to Vercel Blob.
 *
 * This is a durable step that will be retried automatically on failure.
 */
export async function generateImageStep(
    input: GenerateImageStepInput
): Promise<GenerateImageStepResult> {
    'use step'

    const {
        postId,
        opportunityId,
        prompt,
        imageType,
        insertAfterText,
        altText,
        slug,
        primaryKeyword,
    } = input

    console.log(
        `[Workflow Step] Generating image for opportunity: ${opportunityId}`
    )

    try {
        const model = getModelForImageType(imageType)

        const images = await generateImageWithFal({
            prompt,
            blogPostId: postId,
            model,
            numImages: 1,
            aspectRatio: getAspectRatioForImageType(imageType),
            slug,
            descriptor: altText,
        })

        if (!images.length || !images[0]?.blobUrl) {
            return {
                success: false,
                opportunityId,
                insertAfterText,
                altText,
                imageType,
                prompt,
                error: 'No image returned from FAL.ai',
            }
        }

        console.log(
            `[Workflow Step] Generated image for ${opportunityId}: ${images[0].blobUrl}`
        )

        // The analyzer's `altText` is a short subject label, not accessible alt
        // text. Turn it into a real description; fall back to the label if the
        // alt call fails, since a workable alt beats blocking the workflow.
        let resolvedAltText = altText
        try {
            const altResult = await generateImageAlt({
                prompt,
                concept: altText,
                primaryKeyword,
            })
            resolvedAltText = altResult.alt || altText
        } catch (error) {
            console.warn(
                `[Workflow Step] Alt text generation failed for ${opportunityId}, using the subject label:`,
                error instanceof Error ? error.message : 'Unknown error'
            )
        }

        return {
            success: true,
            opportunityId,
            imageUrl: images[0].blobUrl,
            insertAfterText,
            altText: resolvedAltText,
            imageType,
            prompt,
        }
    } catch (error) {
        console.error(
            `[Workflow Step] Image generation failed for ${opportunityId}:`,
            error
        )

        return {
            success: false,
            opportunityId,
            insertAfterText,
            altText,
            imageType,
            prompt,
            error:
                error instanceof Error
                    ? error.message
                    : 'Image generation failed',
        }
    }
}
