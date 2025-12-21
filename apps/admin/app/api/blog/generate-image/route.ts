import { db } from '@workspace/db/client'
import { blogPost, blogPostImages, images } from '@workspace/db/schema'
import { summarizeBlogPost, generateImagePrompt } from '@workspace/ai'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { requireAuth, UnauthorizedError } from '@/lib/utils/auth.util'
import { generateImageWithFal } from '@/lib/services/fal-image-generation.service'

export const runtime = 'nodejs'
export const maxDuration = 60 // Image generation can take longer

/**
 * Request schema for image generation
 */
const requestSchema = z.object({
    blogPostId: z.string().uuid('Invalid blog post ID'),
    prompt: z.string().optional(), // Optional - will generate if not provided
})

/**
 * Response type for image generation
 */
type ImageResponse =
    | {
          success: true
          imageId: string
          imageUrl: string
          summary?: string
          prompt: string
      }
    | {
          success: false
          error: string
      }

/**
 * POST /api/blog/generate-image
 * Generate featured image for blog post using fal.ai
 *
 * Workflow:
 * 1. Check/generate summary if missing
 * 2. Check/generate prompt if not provided
 * 3. Generate image with fal.ai
 * 4. Upload to Vercel Blob
 * 5. Create image record and link to blog post
 */
export async function POST(
    request: NextRequest
): Promise<NextResponse<ImageResponse>> {
    try {
        await requireAuth()

        const body = await request.json()
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

        const { blogPostId, prompt: providedPrompt } = validationResult.data

        // Fetch blog post
        const [post] = await db
            .select({
                title: blogPost.title,
                content: blogPost.content,
                aiSummary: blogPost.aiSummary,
                metaKeywords: blogPost.metaKeywords,
            })
            .from(blogPost)
            .where(eq(blogPost.id, blogPostId))
            .limit(1)

        if (!post) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Blog post not found',
                },
                { status: 404 }
            )
        }

        let summary = post.aiSummary
        let wasGeneratedSummary = false

        // Step 1: Ensure we have a summary
        if (!summary) {
            console.log('Generating summary for blog post...')
            const summaryResult = await summarizeBlogPost({
                title: post.title,
                content: post.content,
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
                title: post.title,
                keywords: post.metaKeywords || undefined,
            })

            finalPrompt = promptResult.prompt
        }

        console.log('Generating image with fal.ai...', { prompt: finalPrompt })

        // Step 3: Generate image with fal.ai
        const generatedImage = await generateImageWithFal({
            prompt: finalPrompt,
            blogPostId,
        })

        console.log(
            'Image generated successfully, creating database records...'
        )

        // Step 4: Create image record
        const [imageRecord] = await db
            .insert(images)
            .values({
                url: generatedImage.blobUrl,
                alt: post.title,
                title: post.title,
                width: generatedImage.width,
                height: generatedImage.height,
                generationPrompt: finalPrompt,
                generatedBy: 'fal-ai',
            })
            .returning({ id: images.id, url: images.url })

        if (!imageRecord) {
            throw new Error('Failed to create image record')
        }

        // Step 5: Link image to blog post
        await db.insert(blogPostImages).values({
            blogPostId,
            imageId: imageRecord.id,
            prompt: finalPrompt,
        })

        console.log('Image generation complete!')

        return NextResponse.json({
            success: true,
            imageId: imageRecord.id,
            imageUrl: imageRecord.url,
            prompt: finalPrompt,
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
