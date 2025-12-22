import { db } from '@workspace/db/client'
import { blogPost, blogPostImages, images } from '@workspace/db/schema'
import {
    summarizeBlogPost,
    generateImagePrompt,
    generateImageAlt,
} from '@workspace/ai'
import { eq } from 'drizzle-orm'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

import { requireAuth, UnauthorizedError } from '@/lib/utils/auth.util'
import {
    generateImageWithFal,
    IMAGE_MODELS,
} from '@/lib/services/fal-image-generation.service'

export const runtime = 'nodejs'
export const maxDuration = 120 // Increased for multiple images

/**
 * Request schema for image generation
 */
const requestSchema = z.object({
    blogPostId: z.string().uuid('Invalid blog post ID'),
    prompt: z.string().optional(), // Optional - will generate if not provided
    model: z
        .enum(['gpt-image-1.5', 'nano-banana-pro'])
        .optional()
        .default('gpt-image-1.5'),
    numImages: z
        .union([z.literal(1), z.literal(2), z.literal(3)])
        .optional()
        .default(1),
})

/**
 * Generated image info for response
 */
type GeneratedImageInfo = {
    imageId: string
    imageUrl: string
    alt: string
}

/**
 * Response type for image generation
 */
type ImageResponse =
    | {
          success: true
          images: GeneratedImageInfo[]
          summary?: string
          prompt: string
          model: string
      }
    | {
          success: false
          error: string
      }

/**
 * POST /api/blog/generate-image
 * Generate featured image(s) for blog post using fal.ai
 *
 * Workflow:
 * 1. Check/generate summary if missing
 * 2. Check/generate prompt if not provided
 * 3. Generate image(s) with fal.ai (supports multiple)
 * 4. Upload to Vercel Blob
 * 5. Create image records and link to blog post
 */
export async function POST(
    request: NextRequest
): Promise<NextResponse<ImageResponse>> {
    try {
        await requireAuth()

        const body = (await request.json()) as unknown
        const validationResult = requestSchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid request parameters',
                },
                { status: 400 }
            )
        }

        const {
            blogPostId,
            prompt: providedPrompt,
            model,
            numImages,
        } = validationResult.data

        // Fetch blog post
        const [blogPostData] = await db
            .select({
                title: blogPost.title,
                content: blogPost.content,
                aiSummary: blogPost.aiSummary,
                metaKeywords: blogPost.metaKeywords,
            })
            .from(blogPost)
            .where(eq(blogPost.id, blogPostId))
            .limit(1)

        if (!blogPostData) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Blog post not found',
                },
                { status: 404 }
            )
        }

        let summary = blogPostData.aiSummary
        let wasGeneratedSummary = false

        // Step 1: Ensure we have a summary
        if (!summary) {
            console.log('Generating summary for blog post...')
            const summaryResult = await summarizeBlogPost({
                title: blogPostData.title,
                content: blogPostData.content,
            })

            summary = summaryResult.summary
            wasGeneratedSummary = true

            // Persist summary
            await db
                .update(blogPost)
                .set({ aiSummary: summary })
                .where(eq(blogPost.id, blogPostId))
        }

        // Step 2: Get or generate prompt
        let finalPrompt = providedPrompt

        if (!finalPrompt) {
            console.log('Generating image prompt...')
            const promptResult = await generateImagePrompt({
                summary,
                title: blogPostData.title,
                keywords: blogPostData.metaKeywords || undefined,
            })

            finalPrompt = promptResult.prompt
        }

        const modelName =
            IMAGE_MODELS.find((m) => m.id === model)?.name ?? model

        console.log(`Generating ${numImages} image(s) with ${modelName}...`, {
            prompt: finalPrompt,
        })

        // Step 3: Generate images with fal.ai
        const generatedImages = await generateImageWithFal({
            prompt: finalPrompt,
            blogPostId,
            model,
            numImages,
        })

        console.log(
            `${generatedImages.length} image(s) generated successfully, creating database records...`
        )

        // Generate alt text from prompt using AI
        console.log('Generating alt text from prompt...')
        const altTextResult = await generateImageAlt({
            prompt: finalPrompt,
        })
        const altText = altTextResult.alt

        // Step 4 & 5: Create image records and link to blog post
        const createdImages: GeneratedImageInfo[] = []

        for (const generatedImage of generatedImages) {
            const [imageRecord] = await db
                .insert(images)
                .values({
                    url: generatedImage.blobUrl,
                    alt: altText,
                    title: blogPostData.title,
                    width: generatedImage.width,
                    height: generatedImage.height,
                    generationPrompt: finalPrompt,
                    generatedBy: `fal-ai/${model}`,
                })
                .returning({ id: images.id, url: images.url, alt: images.alt })

            if (!imageRecord) {
                console.error('Failed to create image record')
                continue
            }

            // Link image to blog post
            await db.insert(blogPostImages).values({
                blogPostId,
                imageId: imageRecord.id,
                prompt: finalPrompt,
            })

            createdImages.push({
                imageId: imageRecord.id,
                imageUrl: imageRecord.url,
                alt: imageRecord.alt,
            })
        }

        if (createdImages.length === 0) {
            throw new Error('Failed to create any image records')
        }

        console.log(
            `Image generation complete! Created ${createdImages.length} image(s)`
        )

        return NextResponse.json({
            success: true,
            images: createdImages,
            prompt: finalPrompt,
            model: modelName,
            ...(wasGeneratedSummary && { summary }),
        })
    } catch (error) {
        console.error('Error generating image:', error)

        if (error instanceof UnauthorizedError) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to generate image',
            },
            { status: 500 }
        )
    }
}
