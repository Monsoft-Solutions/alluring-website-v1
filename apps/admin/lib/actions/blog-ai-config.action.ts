/**
 * Blog AI Config Actions
 *
 * Server actions for the Blog AI Settings page — the singleton configuration
 * that decides which models the blog pipeline runs on.
 *
 * @module lib/actions/blog-ai-config
 */
'use server'

import { db } from '@workspace/db/client'
import { blogAiConfig } from '@workspace/db/schema/blog'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { ARTISTIC_IMAGE_STYLE_IDS, isValidModelId } from '@workspace/ai'

import { IMAGE_MODELS } from '@/lib/services/fal-image-generation.service'
import { requireAuth, UnauthorizedError } from '@/lib/utils/auth.util'

type ActionResult = {
    success: boolean
    error?: string
}

/**
 * Model id validator shared by the content and review fields.
 *
 * Accepts anything `isValidModelId` allows — curated ids plus any OpenRouter
 * `vendor/model` id — so admins can point the pipeline at a model that is not
 * in the curated registry without a deploy.
 */
const modelIdSchema = z
    .string()
    .trim()
    .min(1, 'Model is required')
    .refine(isValidModelId, {
        message:
            'Unknown model. Use a listed model, or an OpenRouter id in "vendor/model" form (e.g. google/gemini-3.6-flash).',
    })

const imageModelIds = IMAGE_MODELS.map((model) => model.id) as [
    string,
    ...string[],
]

/**
 * Input schema for {@link updateBlogAiConfig}
 */
const blogAiConfigSchema = z.object({
    ideationModelId: modelIdSchema,
    contentModelId: modelIdSchema,
    reviewModelId: modelIdSchema,
    extractionModelId: modelIdSchema,
    imageModelId: z.enum(imageModelIds, {
        message: 'Select a supported image model',
    }),
    // `null` is meaningful: it means "auto — the AI picks a preset per topic".
    artisticStyleId: z
        .enum(ARTISTIC_IMAGE_STYLE_IDS, {
            message: 'Select a supported artistic style',
        })
        .nullable(),
    // Autopilot (epic #122)
    autopilotMode: z.enum(['off', 'ideas', 'full'], {
        message: 'Select an autopilot mode',
    }),
    autopilotIdeationCadence: z.enum(['daily', 'weekdays', 'weekly'], {
        message: 'Select an ideation cadence',
    }),
    autopilotContentCadence: z.enum(['daily', 'weekdays', 'weekly'], {
        message: 'Select a content cadence',
    }),
    autopilotPostsPerRun: z
        .number()
        .int()
        .min(1, 'At least 1 post per run')
        .max(3, 'At most 3 posts per run'),
    autopilotDraftCap: z
        .number()
        .int()
        .min(1, 'Draft cap must be at least 1')
        .max(20, 'Draft cap must be 20 or less'),
    autopilotIdeasPerRun: z
        .number()
        .int()
        .min(3, 'At least 3 ideas per run')
        .max(10, 'At most 10 ideas per run'),
})

export type BlogAiConfigInput = z.infer<typeof blogAiConfigSchema>

/**
 * Create or update the singleton blog AI configuration.
 *
 * @param data - The configuration to persist
 * @returns Success flag with an error message on failure
 */
export async function updateBlogAiConfig(
    data: BlogAiConfigInput
): Promise<ActionResult> {
    try {
        await requireAuth()

        const validated = blogAiConfigSchema.parse(data)

        const [existing] = await db
            .select({ id: blogAiConfig.id })
            .from(blogAiConfig)
            .limit(1)

        const values = {
            ideationModelId: validated.ideationModelId,
            contentModelId: validated.contentModelId,
            reviewModelId: validated.reviewModelId,
            extractionModelId: validated.extractionModelId,
            imageModelId: validated.imageModelId,
            artisticStyleId: validated.artisticStyleId,
            autopilotMode: validated.autopilotMode,
            autopilotIdeationCadence: validated.autopilotIdeationCadence,
            autopilotContentCadence: validated.autopilotContentCadence,
            autopilotPostsPerRun: validated.autopilotPostsPerRun,
            autopilotDraftCap: validated.autopilotDraftCap,
            autopilotIdeasPerRun: validated.autopilotIdeasPerRun,
        }

        if (existing) {
            await db
                .update(blogAiConfig)
                .set(values)
                .where(eq(blogAiConfig.id, existing.id))
        } else {
            await db.insert(blogAiConfig).values(values)
        }

        revalidatePath('/blog/settings')

        return { success: true }
    } catch (error) {
        console.error('Error updating blog AI config:', error)

        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

        if (error instanceof z.ZodError) {
            return {
                success: false,
                error:
                    error.issues[0]?.message ?? 'Invalid configuration values',
            }
        }

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to update configuration',
        }
    }
}
