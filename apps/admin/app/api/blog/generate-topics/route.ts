import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { generateBlogTopics } from '@workspace/ai/functions'

import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'
import { getProcedureContext } from '@/lib/data/procedure-context.data'
import { evaluateTopicCandidates } from '@/lib/services/ideation-gate.service'
import { getGscTopicSeeds } from '@/lib/services/topic-sourcing.service'
import { getBlogAiConfig } from '@/lib/queries/blog-ai-config.query'

export const runtime = 'nodejs'
export const maxDuration = 60 // Allow up to 60 seconds for AI generation

/**
 * Context hints schema for enhanced topic generation
 */
const contextHintsSchema = z.object({
    /** Procedure slug for context enrichment */
    procedureSlug: z.string().optional(),
    /** Search intent filter */
    searchIntent: z
        .enum(['informational', 'commercial', 'transactional', 'mixed'])
        .optional(),
    /** Target audience description */
    targetAudience: z.string().optional(),
    /** Unique angle or perspective */
    uniqueAngle: z.string().optional(),
    /** Preferred content type */
    contentType: z.string().optional(),
})

const requestSchema = z.object({
    // Sourcing mode: 'search-console' seeds topics from live GSC demand
    // (opportunities, gaps, decaying queries) instead of picked keywords
    mode: z.enum(['keywords', 'search-console']).optional(),
    // NEW: Structured context hints for enhanced generation
    contextHints: contextHintsSchema.optional(),
    // GSC keyword integration
    selectedKeywords: z
        .object({
            primary: z.string().nullable(),
            secondary: z.array(z.string()),
        })
        .optional(),
    // Keep existing fields for backwards compatibility
    procedureFocus: z.string().optional(),
    contentType: z.string().optional(),
    targetAudience: z.string().optional(),
    existingTopics: z.array(z.string()).optional(),
    additionalContext: z.string().optional(),
})

/**
 * POST /api/blog/generate-topics
 * Generate blog topic ideas using AI
 */
export async function POST(request: NextRequest) {
    try {
        await requireAuth()

        const body: unknown = await request.json()
        const validationResult = requestSchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid request body',
                    details: validationResult.error.format(),
                },
                { status: 400 }
            )
        }

        const { mode, contextHints, ...restData } = validationResult.data

        // Look up procedure context if procedureSlug provided
        const procedureContext = contextHints?.procedureSlug
            ? getProcedureContext(contextHints.procedureSlug)
            : undefined

        // Search Console mode: seed generation from live demand data
        const gscSeeds =
            mode === 'search-console' ? await getGscTopicSeeds() : undefined
        if (mode === 'search-console' && (!gscSeeds || gscSeeds.length === 0)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'No Search Console data available — check the integration configuration',
                },
                { status: 400 }
            )
        }

        // Admin-configured ideation model wins; the function keeps its own
        // default when no configuration row exists yet
        const aiConfig = await getBlogAiConfig()

        // Build enriched options for AI generation
        const result = await generateBlogTopics({
            ...restData,
            contextHints,
            procedureContext,
            gscSeeds,
            modelId: aiConfig.ideationModelId,
        })

        // Ideation gate: every candidate gets a new/refresh/reject verdict
        // against the keyword ownership registry + live posts
        const gatedTopics = await evaluateTopicCandidates(result.topics)

        return NextResponse.json({
            success: true,
            ...result,
            topics: gatedTopics,
            // Seeds echoed back so idea cards can show sourcing metrics
            gscSeeds,
        })
    } catch (error) {
        return handleApiError(
            error,
            'Failed to generate topics',
            'Error generating blog topics:'
        )
    }
}
