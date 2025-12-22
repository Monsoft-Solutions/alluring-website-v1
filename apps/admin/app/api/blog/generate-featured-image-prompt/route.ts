import { db } from '@workspace/db/client'
import { blogPost } from '@workspace/db/schema'
import { summarizeBlogPost, generateFeaturedImagePrompt } from '@workspace/ai'
import { eq } from 'drizzle-orm'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

import { requireAuth, UnauthorizedError } from '@/lib/utils/auth.util'
import {
    getSceneOption,
    getSubjectOption,
    getStyleOption,
    getLightingOption,
    getColorOption,
    getCompositionOption,
    type SceneId,
    type SubjectId,
    type StyleId,
    type LightingId,
    type ColorPaletteId,
    type CompositionId,
} from '@/lib/constants/featured-image-options.constant'

export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * Request schema for featured image prompt generation
 */
const requestSchema = z.object({
    blogPostId: z.string().uuid('Invalid blog post ID'),
    scene: z.enum([
        'luxury-clinic',
        'miami-lifestyle',
        'abstract-wellness',
        'spa-retreat',
        'modern-minimalist',
    ]),
    subject: z.enum([
        'elegant-model',
        'luxury-space',
        'wellness-concept',
        'lifestyle-scene',
        'beauty-details',
    ]),
    style: z.enum([
        'editorial-photo',
        'luxury-lifestyle',
        'clinical-clean',
        'warm-aspirational',
        'artistic-conceptual',
    ]),
    lighting: z.enum([
        'golden-hour',
        'studio-soft',
        'natural-bright',
        'dramatic-moody',
        'soft-ethereal',
    ]),
    colorPalette: z.enum([
        'stone-gold',
        'ocean-blues',
        'warm-neutrals',
        'blush-rose',
        'monochrome-elegant',
    ]),
    composition: z.enum([
        'centered-focus',
        'rule-of-thirds',
        'close-up-detail',
        'wide-environmental',
        'negative-space',
    ]),
})

/**
 * Response type for featured image prompt generation
 */
type PromptResponse =
    | {
          success: true
          prompt: string
          summary: string
          wasGeneratedSummary: boolean
      }
    | {
          success: false
          error: string
      }

/**
 * POST /api/blog/generate-featured-image-prompt
 * Generate optimized image prompt for featured blog post images
 *
 * Takes customization options and generates a structured prompt
 * incorporating scene, subject, style, lighting, colors, and composition.
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

        const {
            blogPostId,
            scene,
            subject,
            style,
            lighting,
            colorPalette,
            composition,
        } = validationResult.data

        // Fetch blog post data
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

        // Generate summary if not available
        if (!summary) {
            console.log('Generating summary for blog post...')
            const summaryResult = await summarizeBlogPost({
                title: blogPostData.title,
                content: blogPostData.content,
            })

            summary = summaryResult.summary
            wasGeneratedSummary = true

            // Persist summary for future use
            await db
                .update(blogPost)
                .set({ aiSummary: summary })
                .where(eq(blogPost.id, blogPostId))
        }

        // Get option configurations
        const sceneOption = getSceneOption(scene)
        const subjectOption = getSubjectOption(subject)
        const styleOption = getStyleOption(style)
        const lightingOption = getLightingOption(lighting)
        const colorOption = getColorOption(colorPalette)
        const compositionOption = getCompositionOption(composition)

        if (
            !sceneOption ||
            !subjectOption ||
            !styleOption ||
            !lightingOption ||
            !colorOption ||
            !compositionOption
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid customization options',
                },
                { status: 400 }
            )
        }

        // Generate featured image prompt with customization
        const result = await generateFeaturedImagePrompt({
            title: blogPostData.title,
            summary,
            scene: {
                id: sceneOption.id,
                promptGuidelines: sceneOption.promptGuidelines,
            },
            subject: {
                id: subjectOption.id,
                promptGuidelines: subjectOption.promptGuidelines,
            },
            style: {
                id: styleOption.id,
                promptGuidelines: styleOption.promptGuidelines,
            },
            lighting: {
                id: lightingOption.id,
                promptGuidelines: lightingOption.promptGuidelines,
            },
            colorPalette: {
                id: colorOption.id,
                promptGuidelines: colorOption.promptGuidelines,
            },
            composition: {
                id: compositionOption.id,
                promptGuidelines: compositionOption.promptGuidelines,
            },
            keywords: blogPostData.metaKeywords || undefined,
        })

        return NextResponse.json({
            success: true,
            prompt: result.prompt,
            summary,
            wasGeneratedSummary,
        })
    } catch (error) {
        console.error('Error generating featured image prompt:', error)

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
