/**
 * fal.ai Image Generation Service
 *
 * Handles image generation using fal.ai models (gpt-image-1.5 and nano-banana-pro)
 * and uploads the results to Vercel Blob storage.
 *
 * @module @/lib/services/fal-image-generation
 */
import { put } from '@vercel/blob'
import { env } from '@/env'
import { fal } from '@fal-ai/client'

/**
 * Available image generation models
 * Prioritized for GPT-Image-1.5 prompting guidelines (Background/Scene → Subject → Key Details → Constraints)
 */
export const IMAGE_MODELS = [
    {
        id: 'gpt-image-1.5',
        name: 'GPT Image 1.5 (Recommended)',
        description:
            'Best for structured prompts with Background/Scene → Subject → Key Details → Constraints format',
        falId: 'fal-ai/gpt-image-1.5',
    },
    {
        id: 'nano-banana-pro',
        name: 'Nano Banana Pro',
        description:
            'High-quality photorealistic images with natural language prompts',
        falId: 'fal-ai/nano-banana-pro',
    },
] as const

export type ImageModelId = (typeof IMAGE_MODELS)[number]['id']

/**
 * Options for image generation
 */
export type GenerateImageWithFalOptions = {
    /** The prompt for image generation */
    prompt: string
    /** Blog post ID (used for blob storage path) */
    blogPostId: string
    /** Model to use for generation (defaults to gpt-image-1.5) */
    model?: ImageModelId
    /** Number of images to generate (1-3, defaults to 1) */
    numImages?: 1 | 2 | 3
}

/**
 * Result of a single generated image
 */
export type GeneratedImageItem = {
    /** Vercel Blob URL of the uploaded image */
    blobUrl: string
    /** Original fal.ai URL (temporary) */
    falUrl: string
    /** Width of the generated image */
    width?: number
    /** Height of the generated image */
    height?: number
}

/**
 * Result of image generation (array of images)
 */
export type GeneratedImageResult = GeneratedImageItem[]

/**
 * Get the fal.ai model ID from our model ID
 */
function getFalModelId(modelId: ImageModelId): string {
    const model = IMAGE_MODELS.find((m) => m.id === modelId)
    return model?.falId ?? 'fal-ai/gpt-image-1.5'
}

/**
 * Upload a single generated image to Vercel Blob
 *
 * @param imageUrl - URL of the image from fal.ai
 * @param blogPostId - Blog post ID for organizing blob storage
 * @param imageIndex - Index of the image in the batch
 * @param width - Image width
 * @param height - Image height
 * @returns Uploaded image metadata
 * @throws Error if download or upload fails
 */
async function uploadImageToBlob(
    imageUrl: string,
    blogPostId: string,
    imageIndex: number,
    width?: number,
    height?: number
): Promise<GeneratedImageItem> {
    // Download image from fal.ai
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
        throw new Error(
            `Failed to download image: ${imageResponse.status} ${imageResponse.statusText}`
        )
    }

    const imageBlob = await imageResponse.blob()

    // Generate unique filename
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const filename = `blog-images/${blogPostId}/${timestamp}-${randomStr}-${imageIndex}.jpg`

    // Upload to Vercel Blob
    const uploadedBlob = await put(filename, imageBlob, {
        access: 'public',
        token: env.BLOB_READ_WRITE_TOKEN,
    })

    return {
        blobUrl: uploadedBlob.url,
        falUrl: imageUrl,
        width,
        height,
    }
}

/**
 * Generate images using fal.ai and upload to Vercel Blob
 *
 * @param options - Generation options including prompt, model, and image count
 * @returns Array of generated image URLs and metadata
 * @throws Error if generation or upload fails
 */
export async function generateImageWithFal(
    options: GenerateImageWithFalOptions
): Promise<GeneratedImageResult> {
    const {
        prompt,
        blogPostId,
        model = 'gpt-image-1.5',
        numImages = 1,
    } = options

    fal.config({
        credentials: env.FAL_KEY,
    })

    const falModelId = getFalModelId(model)

    try {
        console.log(
            `Generating ${numImages} image(s) with ${model} (${falModelId})...`
        )

        const result = (await fal.subscribe(falModelId, {
            input: {
                prompt,
                num_images: numImages,
                // 16:9 aspect ratio for featured blog images (1392x752)
                size: '1392x752',
            },
            logs: true,
            onQueueUpdate: (update: { status: string }) => {
                if (update.status === 'IN_PROGRESS') {
                    console.log('Image generation in progress...')
                }
            },
        })) as {
            data: {
                images?: Array<{
                    url: string
                    width?: number
                    height?: number
                }>
            }
        }

        const generatedImages = result.data.images
        if (!generatedImages || generatedImages.length === 0) {
            throw new Error('No images returned from fal.ai')
        }

        console.log(
            `Generated ${generatedImages.length} image(s), uploading to Vercel Blob...`
        )

        // Process all generated images
        const uploadedImages: GeneratedImageResult = []

        for (let i = 0; i < generatedImages.length; i++) {
            const image = generatedImages[i]
            if (!image?.url) {
                console.warn(`Skipping image ${i + 1}: missing URL`)
                continue
            }

            try {
                const uploadedImage = await uploadImageToBlob(
                    image.url,
                    blogPostId,
                    i,
                    image.width,
                    image.height
                )

                uploadedImages.push(uploadedImage)
                console.log(`Uploaded image ${i + 1}/${generatedImages.length}`)
            } catch (error) {
                console.error(
                    `Failed to upload image ${i + 1}:`,
                    error instanceof Error ? error.message : 'Unknown error'
                )
                // Continue with other images even if one fails
                continue
            }
        }

        if (uploadedImages.length === 0) {
            throw new Error('Failed to upload any images')
        }

        console.log(
            `Successfully generated and uploaded ${uploadedImages.length} image(s)`
        )

        return uploadedImages
    } catch (error) {
        console.error('Error generating image with fal.ai:', error)
        throw new Error(
            `Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
    }
}
