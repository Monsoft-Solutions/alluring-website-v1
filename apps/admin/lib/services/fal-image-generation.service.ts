/**
 * fal.ai Image Generation Service
 *
 * Handles image generation using fal.ai models (gpt-image-2, gpt-image-1.5 and
 * nano-banana-pro) and uploads the results to Vercel Blob storage.
 *
 * @module @/lib/services/fal-image-generation
 */
import { put } from '@vercel/blob'
import { env } from '@/env'
import { fal } from '@fal-ai/client'
import type { ArtisticImageAspectRatio } from '@workspace/ai'

/**
 * Available image generation models
 * Prioritized for GPT-Image-1.5 prompting guidelines (Background/Scene → Subject → Key Details → Constraints)
 */
export const IMAGE_MODELS = [
    {
        id: 'gpt-image-2',
        name: 'GPT Image 2 (Recommended)',
        description:
            "OpenAI's latest image model — exact aspect ratios, fine detail and typography, resolutions up to 4K",
        falId: 'openai/gpt-image-2',
    },
    {
        id: 'gpt-image-1.5',
        name: 'GPT Image 1.5',
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
 * Default aspect ratio for featured blog images
 */
const DEFAULT_ASPECT_RATIO: ArtisticImageAspectRatio = '16:9'

/**
 * `image_size` values accepted by fal-ai/gpt-image-1.5.
 *
 * The model only offers three fixed sizes, so 16:9 and 3:2 both map to the
 * widest landscape option. Sending anything else (for example a raw
 * `1392x752`) is silently ignored and the model falls back to a square image.
 */
const GPT_IMAGE_SIZE_BY_RATIO: Record<ArtisticImageAspectRatio, string> = {
    '16:9': '1536x1024',
    '3:2': '1536x1024',
    '1:1': '1024x1024',
}

/**
 * Explicit pixel sizes for openai/gpt-image-2, which accepts arbitrary
 * `{width, height}` (multiples of 16, max edge 3840px) — so it can hit the
 * site's exact 1392x752 featured dimensions where gpt-image-1.5 cannot.
 */
const GPT_IMAGE_2_SIZE_BY_RATIO: Record<
    ArtisticImageAspectRatio,
    { width: number; height: number }
> = {
    '16:9': { width: 1392, height: 752 },
    '3:2': { width: 1248, height: 832 },
    '1:1': { width: 1024, height: 1024 },
}

/**
 * Pixel dimensions actually produced per model and ratio.
 * Used to fill in width/height when fal omits them from the response.
 */
const FALLBACK_DIMENSIONS: Record<
    ImageModelId,
    Record<ArtisticImageAspectRatio, { width: number; height: number }>
> = {
    'gpt-image-2': GPT_IMAGE_2_SIZE_BY_RATIO,
    'gpt-image-1.5': {
        '16:9': { width: 1536, height: 1024 },
        '3:2': { width: 1536, height: 1024 },
        '1:1': { width: 1024, height: 1024 },
    },
    'nano-banana-pro': {
        '16:9': { width: 1344, height: 768 },
        '3:2': { width: 1248, height: 832 },
        '1:1': { width: 1024, height: 1024 },
    },
}

/**
 * Options for image generation
 */
export type GenerateImageWithFalOptions = {
    /** The prompt for image generation */
    prompt: string
    /** Blog post ID (used for the fallback blob storage path) */
    blogPostId: string
    /** Model to use for generation (defaults to gpt-image-2) */
    model?: ImageModelId
    /** Number of images to generate (1-3, defaults to 1) */
    numImages?: 1 | 2 | 3
    /** Aspect ratio for the generated image (defaults to 16:9) */
    aspectRatio?: ArtisticImageAspectRatio
    /**
     * Blog post slug. Combined with `descriptor` it produces SEO-friendly blob
     * paths; without both, the legacy ID-based path is used.
     */
    slug?: string
    /** Short kebab-case descriptor of the image concept, for the filename */
    descriptor?: string
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
 * Get the fal.ai endpoint ID from our model ID.
 *
 * Accepts plain strings so provenance writers (`generatedBy`) can pass
 * whatever the pipeline recorded; unknown ids fall back to the default model.
 */
export function getFalModelId(modelId: string): string {
    const model = IMAGE_MODELS.find((m) => m.id === modelId)
    return model?.falId ?? 'openai/gpt-image-2'
}

/**
 * Build the model-specific sizing parameters for a requested aspect ratio.
 *
 * The models expose completely different knobs: gpt-image-2 accepts explicit
 * `{width, height}` objects (plus a `quality` tier), gpt-image-1.5 takes an
 * `image_size` enum of fixed pixel dimensions, and nano-banana-pro takes an
 * `aspect_ratio` enum plus a `resolution` tier.
 */
function buildSizeInput(
    model: ImageModelId,
    aspectRatio: ArtisticImageAspectRatio
): Record<string, unknown> {
    if (model === 'gpt-image-2') {
        return {
            image_size: GPT_IMAGE_2_SIZE_BY_RATIO[aspectRatio],
            quality: 'high',
        }
    }

    if (model === 'nano-banana-pro') {
        return { aspect_ratio: aspectRatio, resolution: '1K' }
    }

    return { image_size: GPT_IMAGE_SIZE_BY_RATIO[aspectRatio] }
}

/**
 * Normalise a string into a URL-safe kebab-case slug fragment.
 */
function toKebabCase(value: string, maxWords: number): string {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .split('-')
        .filter(Boolean)
        .slice(0, maxWords)
        .join('-')
}

/**
 * Build the Vercel Blob path for a generated image.
 *
 * Prefers an SEO-friendly, human-readable path built from the post slug and a
 * concept descriptor. Falls back to the legacy ID + timestamp scheme when
 * either is missing, so existing callers keep working unchanged.
 */
function buildBlobPath(input: {
    blogPostId: string
    imageIndex: number
    slug?: string
    descriptor?: string
}): string {
    const { blogPostId, imageIndex, slug, descriptor } = input

    const safeSlug = slug ? toKebabCase(slug, 12) : ''
    const safeDescriptor = descriptor ? toKebabCase(descriptor, 6) : ''

    if (safeSlug && safeDescriptor) {
        // 6 random chars keep multi-image batches and regenerations unique
        const shortId = Math.random().toString(36).substring(2, 8)

        return `blog/${safeSlug}/${safeDescriptor}-alluring-plastic-surgery-miami-${shortId}.jpg`
    }

    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)

    return `blog-images/${blogPostId}/${timestamp}-${randomStr}-${imageIndex}.jpg`
}

/**
 * Upload a single generated image to Vercel Blob
 *
 * @param input - Image source URL, storage path inputs and known dimensions
 * @returns Uploaded image metadata
 * @throws Error if download or upload fails
 */
async function uploadImageToBlob(input: {
    imageUrl: string
    blogPostId: string
    imageIndex: number
    slug?: string
    descriptor?: string
    width?: number
    height?: number
}): Promise<GeneratedImageItem> {
    const {
        imageUrl,
        blogPostId,
        imageIndex,
        slug,
        descriptor,
        width,
        height,
    } = input

    // Download image from fal.ai
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
        throw new Error(
            `Failed to download image: ${imageResponse.status} ${imageResponse.statusText}`
        )
    }

    const imageBlob = await imageResponse.blob()

    const filename = buildBlobPath({
        blogPostId,
        imageIndex,
        slug,
        descriptor,
    })

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
 * @param options - Generation options including prompt, model, ratio and naming
 * @returns Array of generated image URLs and metadata
 * @throws Error if generation or upload fails
 */
export async function generateImageWithFal(
    options: GenerateImageWithFalOptions
): Promise<GeneratedImageResult> {
    const {
        prompt,
        blogPostId,
        model = 'gpt-image-2',
        numImages = 1,
        aspectRatio = DEFAULT_ASPECT_RATIO,
        slug,
        descriptor,
    } = options

    fal.config({
        credentials: env.FAL_KEY,
    })

    const falModelId = getFalModelId(model)
    const fallbackDimensions = FALLBACK_DIMENSIONS[model][aspectRatio]

    try {
        console.log(
            `Generating ${numImages} image(s) with ${model} (${falModelId}) at ${aspectRatio}...`
        )

        const result = (await fal.subscribe(falModelId, {
            input: {
                prompt,
                num_images: numImages,
                output_format: 'jpeg',
                ...buildSizeInput(model, aspectRatio),
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
                const uploadedImage = await uploadImageToBlob({
                    imageUrl: image.url,
                    blogPostId,
                    imageIndex: i,
                    slug,
                    descriptor,
                    width: image.width ?? fallbackDimensions.width,
                    height: image.height ?? fallbackDimensions.height,
                })

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
