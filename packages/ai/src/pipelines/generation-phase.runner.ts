/**
 * Generation Phase Runner
 *
 * Standalone runner for the content generation phase.
 * Generates blog content with on-demand research using AI tools.
 *
 * @module @workspace/ai/pipelines/generation-phase
 */
import { generateText, stepCountIs } from 'ai'

import { getModel, temperatureParam } from '../models/model-resolver.util'
import {
    validateGeneratedMdx,
    type MdxSanitizationAction,
} from '../functions/validate-generated-mdx.function'
import {
    createResearchTools,
    createSourceCollector,
    type CollectedSource,
} from '../tools/research-tools.tool'
import {
    getInternalPagesContext,
    type LinkableBlogPost,
} from '../data/internal-pages.data'
import { telemetryConfig } from '../telemetry'
import {
    buildAgenticSystemPrompt,
    buildAgenticUserPrompt,
    type ContentType,
} from '../prompts/blog/agentic-writer.prompt'
import type { RefreshBriefInput } from '../prompts/blog/refresh-writer.prompt'
import type { AgenticPipelineProgressCallback } from '../types/pipeline/agentic-pipeline-progress-callback.type'

/**
 * Default configuration for generation phase
 */
const DEFAULTS = {
    CONTENT_MODEL: 'claude-opus-5',
    TEMPERATURE: 0.7,
    MAX_STEPS: 25,
    MIN_WORD_COUNT: 200,
} as const

/**
 * Input for the generation phase
 */
export type GenerationPhaseInput = {
    /** Blog post title */
    title: string
    /** Main topic */
    topic?: string
    /** Primary SEO keyword */
    primaryKeyword?: string
    /** Secondary SEO keywords */
    secondaryKeywords?: string[]
    /** Target audience description */
    targetAudience?: string
    /** Unique angle/perspective */
    uniqueAngle?: string
    /** Content type (guide, tutorial, etc.) */
    contentType?: string
    /** Estimated word count target */
    estimatedWordCount?: number
    /**
     * Refresh mode (epic #144): the brief + the existing article. When set,
     * the writer improves the article in place instead of writing anew.
     */
    refresh?: RefreshBriefInput
}

/**
 * Outline structure for generation
 */
export type GenerationPhaseOutline = {
    tldr: string[]
    introduction: {
        hook: string
        preview: string
    }
    sections: Array<{
        title: string
        description: string
        keyPoints?: string[]
        subsections?: Array<{
            title: string
            description: string
        }>
    }>
    conclusion: {
        summaryPoints: string[]
        nextSteps: string
    }
}

/**
 * Options for running the generation phase
 */
export type GenerationPhaseOptions = {
    /** Blog input data */
    input: GenerationPhaseInput
    /** Content outline */
    outline?: string
    /** Model ID for content generation */
    contentModelId?: string
    /** Temperature for generation */
    temperature?: number
    /** Maximum tool call steps */
    maxSteps?: number
    /**
     * Published posts this article may link to, supplied by the caller because
     * this package has no database access. Without them the writer sees only
     * the static marketing pages, cannot build blog-to-blog links, and invents
     * URLs when asked for a related article.
     */
    linkableBlogPosts?: LinkableBlogPost[]
    /** Progress callback */
    onProgress?: AgenticPipelineProgressCallback
}

/**
 * Result from the generation phase
 */
export type GenerationPhaseResult = {
    /** Whether generation succeeded */
    success: boolean
    /** Error message if failed */
    error?: string
    /** Generated content (markdown) */
    content: string
    /** Word count */
    wordCount: number
    /** Sources used during research */
    sources: CollectedSource[]
    /** Number of tool calls made */
    toolCallCount: number
    /** Number of steps taken */
    stepCount: number
    /** Processing time in ms */
    timeMs: number
    /** Model that generated the content (resolved after defaults) */
    modelId: string
    /**
     * MDX hazards the validator had to neutralise before the content could be
     * persisted. Empty on a clean generation; a non-empty list means the writer
     * prompt produced something the renderer could not have rendered.
     */
    sanitizationActions: MdxSanitizationAction[]
}

/**
 * Count words in content
 */
function countWords(text: string): number {
    return text.split(/\s+/).filter((w) => w.length > 0).length
}

/**
 * Run the generation phase standalone
 *
 * Generates blog content using AI with on-demand research tools.
 * This is extracted from the unified pipeline to allow stage-based processing.
 *
 * @param options - Generation options
 * @returns Generation result with content and sources
 *
 * @example
 * ```typescript
 * const result = await runGenerationPhase({
 *   input: {
 *     title: 'BBL Recovery Guide',
 *     topic: 'Brazilian Butt Lift Recovery',
 *     primaryKeyword: 'bbl recovery',
 *     contentType: 'guide',
 *   },
 *   outline: {
 *     tldr: ['Recovery takes 6-8 weeks'],
 *     introduction: { hook: '...', preview: '...' },
 *     sections: [...],
 *     conclusion: { summaryPoints: [...], nextSteps: '...' },
 *   },
 * })
 * ```
 */
export async function runGenerationPhase(
    options: GenerationPhaseOptions
): Promise<GenerationPhaseResult> {
    const startTime = Date.now()
    const {
        input,
        outline,
        contentModelId = DEFAULTS.CONTENT_MODEL,
        temperature = DEFAULTS.TEMPERATURE,
        maxSteps = DEFAULTS.MAX_STEPS,
        linkableBlogPosts,
        onProgress,
    } = options

    try {
        onProgress?.('generation', 5, 'Starting content generation...')

        // Create source collector and tools
        const sourceContext = createSourceCollector()
        const tools = createResearchTools(sourceContext)

        // Get internal pages context, including the published posts this
        // article may link to
        const internalPagesContext = getInternalPagesContext(linkableBlogPosts)

        // Build prompts using modular prompt system
        const contentType = input.contentType as ContentType | undefined
        const systemPrompt = buildAgenticSystemPrompt(
            contentType,
            input.refresh
        )
        const userPrompt = buildAgenticUserPrompt({
            title: input.title,
            topic: input.topic || input.title,
            primaryKeyword: input.primaryKeyword || '',
            secondaryKeywords: input.secondaryKeywords,
            targetAudience: input.targetAudience,
            uniqueAngle: input.uniqueAngle,
            contentType,
            outline,
            estimatedWordCount: input.estimatedWordCount,
            internalPagesContext,
            refresh: input.refresh,
        })

        // Track progress
        let toolCallCount = 0
        let stepCount = 0

        console.log(
            '[Generation Phase] ========================================'
        )
        console.log('[Generation Phase] Starting Content Generation')
        console.log(`[Generation Phase] Title: "${input.title}"`)
        console.log(
            `[Generation Phase] Content Type: ${input.contentType || 'guide'}`
        )
        console.log(`[Generation Phase] Model: ${contentModelId}`)
        console.log(`[Generation Phase] Max steps: ${maxSteps}`)
        console.log(
            '[Generation Phase] ========================================'
        )

        const model = getModel(contentModelId)

        // Generate content with tools
        const result = await generateText({
            model,
            system: systemPrompt,
            prompt: userPrompt,
            ...temperatureParam(contentModelId, temperature),
            maxOutputTokens: 16000,
            tools,
            stopWhen: stepCountIs(maxSteps),
            experimental_telemetry: telemetryConfig,
            onStepFinish: (event) => {
                stepCount++
                const hasToolCalls = (event.toolCalls?.length ?? 0) > 0

                if (hasToolCalls) {
                    toolCallCount += event.toolCalls?.length ?? 0

                    // Send tool call progress
                    for (const toolCall of event.toolCalls) {
                        const toolInput =
                            'input' in toolCall
                                ? (toolCall.input as Record<string, unknown>)
                                : {}
                        const query =
                            typeof toolInput?.query === 'string'
                                ? toolInput.query
                                : 'research query'

                        onProgress?.(
                            'generation-tool-call',
                            Math.min(80, 10 + toolCallCount * 5),
                            `Searching: ${query}`,
                            {
                                type: 'tool-call',
                                toolName: toolCall.toolName,
                                query,
                                toolCallIndex: toolCallCount,
                            }
                        )

                        console.log(
                            `[Generation Phase] Tool call ${toolCallCount}: ${toolCall.toolName} - "${query}"`
                        )
                    }
                } else {
                    console.log(
                        `[Generation Phase] Step ${stepCount}: Text generation (${event.text?.length ?? 0} chars)`
                    )
                }
            },
        })

        // Neutralise anything the blog renderer could not survive before the
        // content is allowed anywhere near the database.
        const validation = validateGeneratedMdx(result.text)
        const content = validation.content
        const wordCount = countWords(content)
        const timeMs = Date.now() - startTime

        console.log(
            '[Generation Phase] ----------------------------------------'
        )
        console.log(
            `[Generation Phase] Generation complete: ${wordCount} words`
        )
        console.log(`[Generation Phase] Tool calls: ${toolCallCount}`)
        console.log(
            `[Generation Phase] Sources: ${sourceContext.sources.length}`
        )
        console.log(`[Generation Phase] Time: ${timeMs}ms`)

        if (!validation.clean) {
            console.warn(
                `[Generation Phase] Sanitised ${validation.actions.length} MDX hazard(s):`
            )
            for (const action of validation.actions) {
                console.warn(`[Generation Phase]   ${action.detail}`)
            }
        }

        // Validate content
        if (!content || content.trim().length === 0) {
            throw new Error(
                `Content generation failed: Empty result. Finish reason: ${result.finishReason}`
            )
        }

        if (wordCount < DEFAULTS.MIN_WORD_COUNT) {
            throw new Error(
                `Content generation incomplete: Only ${wordCount} words generated (minimum: ${DEFAULTS.MIN_WORD_COUNT})`
            )
        }

        onProgress?.(
            'generation',
            100,
            `Content generation complete: ${wordCount} words`
        )

        return {
            success: true,
            content,
            wordCount,
            sources: sourceContext.sources,
            toolCallCount,
            stepCount,
            timeMs,
            modelId: contentModelId,
            sanitizationActions: validation.actions,
        }
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : 'Unknown error'
        console.error('[Generation Phase] ERROR:', errorMessage)

        onProgress?.('error', 0, `Generation failed: ${errorMessage}`)

        return {
            success: false,
            error: errorMessage,
            content: '',
            wordCount: 0,
            sources: [],
            toolCallCount: 0,
            stepCount: 0,
            timeMs: Date.now() - startTime,
            modelId: contentModelId,
            sanitizationActions: [],
        }
    }
}
