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

export type GenerateImageStepInput = {
    postId: string
    opportunityId: string
    prompt: string
    imageType: string
    photoStyle?: string
    insertAfterText: string
    altText: string
}

export type GenerateImageStepResult = {
    success: boolean
    opportunityId: string
    imageUrl?: string
    insertAfterText: string
    altText: string
    error?: string
}

/**
 * Get the appropriate FAL model for an image type
 */
function getModelForImageType(imageType: string): ImageModelId {
    if (imageType === 'infographic' || imageType === 'illustration') {
        return 'nano-banana-pro'
    }
    return 'gpt-image-1.5'
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
        })

        if (!images.length || !images[0]?.blobUrl) {
            return {
                success: false,
                opportunityId,
                insertAfterText,
                altText,
                error: 'No image returned from FAL.ai',
            }
        }

        console.log(
            `[Workflow Step] Generated image for ${opportunityId}: ${images[0].blobUrl}`
        )

        return {
            success: true,
            opportunityId,
            imageUrl: images[0].blobUrl,
            insertAfterText,
            altText,
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
            error:
                error instanceof Error
                    ? error.message
                    : 'Image generation failed',
        }
    }
}
