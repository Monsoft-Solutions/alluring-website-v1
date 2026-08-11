import { db } from '@workspace/db/client'
import { blogPost } from '@workspace/db/schema'
import {
    summarizeBlogPost,
    generateFeaturedImagePrompt,
    getArtisticStyleAspectRatio,
    isArtisticImageStyleId,
} from '@workspace/ai'
import { ARTISTIC_IMAGE_STYLE_IDS } from '@workspace/shared/schemas/blog'
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
    buildModelDescription,
    type ModelProfile,
} from '@/lib/constants/featured-image-options.constant'

export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * Model profile schema for patient-model subject type
 */
const modelProfileSchema = z.object({
    age: z.enum(['young-adult', 'mid-adult', 'mature-adult']),
    ethnicity: z.enum([
        'latina-hispanic',
        'caribbean',
        'african-american',
        'caucasian',
        'asian',
        'middle-eastern',
        'mixed-heritage',
    ]),
    bodyType: z.enum(['slim', 'athletic', 'average', 'curvy', 'plus-size']),
    hairColor: z.enum([
        'blonde',
        'brunette',
        'black',
        'auburn',
        'gray-silver',
        'highlighted',
    ]),
    hairLength: z.enum(['short', 'medium', 'long']),
    hairStyle: z.enum(['straight', 'wavy', 'curly', 'braided', 'updo']),
    skinTone: z.enum([
        'fair',
        'light',
        'medium',
        'olive',
        'tan',
        'deep',
        'rich',
    ]),
    expression: z.enum([
        'confident-smile',
        'serene-peaceful',
        'contemplative',
        'joyful',
        'natural-relaxed',
    ]),
    pose: z.enum([
        'front-facing',
        'three-quarter',
        'profile',
        'full-body',
        'upper-body',
    ]),
    attire: z.enum([
        'clinical',
        'casual-elegant',
        'athleisure',
        'professional',
        'spa-wellness',
    ]),
})

/**
 * Request schema for featured image prompt generation
 */
const requestSchema = z.object({
    blogPostId: z.string().uuid('Invalid blog post ID'),
    scene: z.enum([
        // Artistic path
        'material-study',
        // Legacy photographic scenes
        'luxury-clinic',
        'miami-lifestyle',
        'abstract-wellness',
        'spa-retreat',
        'modern-minimalist',
    ]),
    subject: z.enum([
        // Artistic path
        'artistic-composition',
        // Legacy subjects — 'patient-model' is the opt-in human path
        'patient-model',
        'luxury-space',
        'wellness-concept',
        'lifestyle-scene',
        'beauty-details',
    ]),
    style: z.enum([
        // Artistic presets
        ...ARTISTIC_IMAGE_STYLE_IDS,
        // Legacy photographic styles
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
    modelProfile: modelProfileSchema.optional(),
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
 * following GPT-Image-1.5 format: Background/Scene → Subject → Key Details → Constraints
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
            modelProfile,
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
            // Ensure post has content before generating summary
            if (!blogPostData.content) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Blog post must have content to generate featured image prompt',
                    },
                    { status: 400 }
                )
            }

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

        // The human-subject path is opt-in: it requires an admin to have picked
        // the `patient-model` subject AND supplied a model profile. Everything
        // else renders through the people-free artistic path.
        const isHumanSubjectPath = subject === 'patient-model' && !!modelProfile

        const modelDescription = isHumanSubjectPath
            ? buildModelDescription(modelProfile as ModelProfile)
            : undefined

        // Art-direction modifiers honoured by both paths
        const sharedModifiers = {
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
        }

        // Generate featured image prompt with customization
        const result = await generateFeaturedImagePrompt(
            isHumanSubjectPath
                ? {
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
                      ...sharedModifiers,
                      modelDescription,
                      keywords: blogPostData.metaKeywords || undefined,
                  }
                : {
                      title: blogPostData.title,
                      summary,
                      artisticStyleId: style,
                      aspectRatio: isArtisticImageStyleId(style)
                          ? getArtisticStyleAspectRatio(style, 'featured')
                          : '16:9',
                      ...sharedModifiers,
                      keywords: blogPostData.metaKeywords || undefined,
                  }
        )

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
