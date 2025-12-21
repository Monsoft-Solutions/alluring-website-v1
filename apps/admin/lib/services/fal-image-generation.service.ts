/**
 * fal.ai Image Generation Service
 *
 * Handles image generation using fal.ai's gpt-image-1 model
 * and uploads the result to Vercel Blob storage.
 *
 * @module @/lib/services/fal-image-generation
 */
import { put } from '@vercel/blob'
import { env } from '@/env'
import { fal } from '@fal-ai/client'

/**
 * Options for image generation
 */
export type GenerateImageWithFalOptions = {
    /** The prompt for image generation */
    prompt: string
    /** Blog post ID (used for blob storage path) */
    blogPostId: string
}

/**
 * Result of image generation
 */
export type GeneratedImageResult = {
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
 * fal.ai result type
 */
// type FalImageResult = {
//     data: {
//         images?: Array<{
//             url: string
//             width?: number
//             height?: number
//         }>
//     }
// }

/**
 * fal.ai client interface (subset)
 */
// interface FalClient {
//     subscribe: (
//         model: string,
//         options: {
//             input: Record<string, unknown>
//             credentials: string
//             logs?: boolean
//             onQueueUpdate?: (update: { status: string }) => void
//         }
//     ) => Promise<FalImageResult>
// }

/**
 * Generate an image using fal.ai gpt-image-1 and upload to Vercel Blob
 *
 * @param options - Generation options including prompt and blog post ID
 * @returns Generated image URLs and metadata
 * @throws Error if generation or upload fails
 */
export async function generateImageWithFal(
    options: GenerateImageWithFalOptions
): Promise<GeneratedImageResult> {
    const { prompt, blogPostId } = options

    // Import fal.ai client dynamically to avoid loading it on the client
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    fal.config({
        credentials: env.FAL_KEY,
    })

    try {
        // Generate image using gpt-image-1
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const result = (await fal.subscribe('fal-ai/gpt-image-1.5', {
            input: {
                prompt,
                num_images: 1,
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

        // Extract image URL from result
        const imageUrl = result.data.images?.[0]?.url
        if (!imageUrl) {
            throw new Error('No image URL returned from fal.ai')
        }

        console.log('Image generated, downloading from fal.ai...')

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
        const filename = `blog-images/${blogPostId}/${timestamp}-${randomStr}.jpg`

        console.log('Uploading to Vercel Blob...')

        // Upload to Vercel Blob
        const uploadedBlob = await put(filename, imageBlob, {
            access: 'public',
            token: env.BLOB_READ_WRITE_TOKEN,
        })

        return {
            blobUrl: uploadedBlob.url,
            falUrl: imageUrl,
            width: result.data.images?.[0]?.width,
            height: result.data.images?.[0]?.height,
        }
    } catch (error) {
        console.error('Error generating image with fal.ai:', error)
        throw new Error(
            `Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
    }
}
