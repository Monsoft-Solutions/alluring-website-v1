import { db } from '@workspace/db/client'
import { blogPost } from '@workspace/db/schema'
import {
    generateInlineImagePrompt,
    getPhotoGuidelinesWithDiversity,
    inlineImageTypeSchema,
    photoStyleSchema,
} from '@workspace/ai'
import { eq } from 'drizzle-orm'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

import { requireAuth, UnauthorizedError } from '@/lib/utils/auth.util'
import {
    INLINE_IMAGE_TYPES,
    PHOTO_STYLES,
} from '@/lib/constants/inline-image-types.constant'

export const runtime = 'nodejs'
export const maxDuration = 30

/**
 * Request schema for inline image prompt generation
 */
const requestSchema = z.object({
    selectedText: z
        .string()
        .min(10, 'Selected text must be at least 10 characters')
        .max(5000, 'Selected text must be less than 5000 characters'),
    imageType: inlineImageTypeSchema,
    photoStyle: photoStyleSchema.optional(),
    blogPostId: z.string().uuid('Invalid blog post ID').optional(),
})

/**
 * Response type for inline image prompt generation
 */
type PromptResponse =
    | {
          success: true
          prompt: string
      }
    | {
          success: false
          error: string
      }

/**
 * POST /api/blog/generate-inline-image-prompt
 * Generate optimized image prompt for inline blog post images
 *
 * Takes selected text from the editor and generates a type-specific
 * prompt optimized for AI image generation (infographic, marketing, etc.)
 */
export async function POST(
    request: NextRequest
): Promise<NextResponse<PromptResponse>> {
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

        const { selectedText, imageType, photoStyle, blogPostId } =
            validationResult.data

        // Get image type configuration
        const imageTypeConfig = INLINE_IMAGE_TYPES.find(
            (type) => type.id === imageType
        )

        if (!imageTypeConfig) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid image type',
                },
                { status: 400 }
            )
        }

        // Get photo style configuration if applicable
        const photoStyleConfig =
            imageType === 'photo' && photoStyle
                ? PHOTO_STYLES.find((style) => style.id === photoStyle)
                : undefined

        // Determine guidelines - use photo style guidelines with diversity for photos
        const guidelines: string =
            imageType === 'photo'
                ? getPhotoGuidelinesWithDiversity(
                      photoStyleConfig?.promptGuidelines ??
                          imageTypeConfig.promptGuidelines
                  )
                : imageTypeConfig.promptGuidelines

        // Optionally fetch blog post context if provided
        let blogPostTitle: string | undefined
        let blogPostTopic: string | undefined

        if (blogPostId) {
            const [blogPostData] = await db
                .select({
                    title: blogPost.title,
                    metaKeywords: blogPost.metaKeywords,
                })
                .from(blogPost)
                .where(eq(blogPost.id, blogPostId))
                .limit(1)

            if (blogPostData) {
                blogPostTitle = blogPostData.title
                // Use first keyword as topic if available
                blogPostTopic = blogPostData.metaKeywords?.split(',')[0]?.trim()
            }
        }

        // Generate inline image prompt
        const result = await generateInlineImagePrompt({
            selectedText,
            imageType,
            imageTypeGuidelines: guidelines,
            blogPostTitle,
            blogPostTopic,
            photoStyle,
        })

        return NextResponse.json({
            success: true,
            prompt: result.prompt,
        })
    } catch (error) {
        console.error('Error generating inline image prompt:', error)

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
                        : 'Failed to generate prompt',
            },
            { status: 500 }
        )
    }
}
