/**
 * Generate Blog Outline Function
 *
 * AI-powered blog outline generation for structured content planning.
 * Creates detailed, SEO-optimized outlines following brand guidelines.
 *
 * @module @workspace/ai/functions/generate-blog-outline
 */
import { z } from 'zod'

import {
    GENERATE_OUTLINE_SYSTEM_PROMPT,
    getGenerateOutlinePrompt,
} from '../prompts/blog/generate-outline.prompt'
import { coreGenerateObject } from '../core'

/**
 * Schema for an outline subsection (H3)
 */
const outlineSubsectionSchema = z.object({
    id: z.string().describe('Unique ID for the subsection'),
    title: z.string().describe('H3 heading text'),
    description: z.string().optional().describe('Brief description of content'),
})

/**
 * Schema for an outline section (H2)
 */
const outlineSectionSchema = z.object({
    id: z.string().describe('Unique ID for the section'),
    title: z.string().describe('H2 heading text'),
    description: z.string().describe('Description of what this section covers'),
    estimatedWords: z.number().optional().describe('Estimated word count'),
    subsections: z
        .array(outlineSubsectionSchema)
        .optional()
        .describe('H3 subsections within this section'),
    keyPoints: z
        .array(z.string())
        .optional()
        .describe('Key points to cover in this section'),
})

/**
 * Schema for SEO notes
 */
const seoNotesSchema = z.object({
    internalLinks: z
        .array(z.string())
        .describe('Suggested internal pages/posts to link'),
    externalSources: z
        .array(z.string())
        .describe('Authority sources to reference'),
    imageIdeas: z
        .array(z.string())
        .optional()
        .describe('Suggested images or visuals'),
})

/**
 * Schema for the full outline response
 */
const generateOutlineResponseSchema = z.object({
    tldr: z
        .array(z.string())
        .min(2)
        .max(4)
        .describe('Key takeaways for TL;DR section'),
    introduction: z.object({
        hook: z.string().describe('Opening hook or problem statement'),
        preview: z.string().describe('What reader will learn'),
        estimatedWords: z.number().optional(),
    }),
    sections: z
        .array(outlineSectionSchema)
        .min(3)
        .max(10)
        .describe('Main H2 sections'),
    conclusion: z.object({
        summaryPoints: z.array(z.string()).describe('Key points to summarize'),
        nextSteps: z.string().describe('Suggested next steps for reader'),
        ctaNote: z.string().optional().describe('CTA placement suggestion'),
    }),
    seoNotes: seoNotesSchema,
    totalEstimatedWords: z.number().describe('Total estimated word count'),
})

/**
 * Default model for outline generation
 */
const DEFAULT_MODEL_ID = 'x-ai/grok-4.6'

/**
 * Options for outline generation
 */
export type GenerateBlogOutlineOptions = {
    /** Blog post title */
    title: string
    /** Main topic */
    topic: string
    /** Primary keyword to target */
    primaryKeyword: string
    /** Secondary keywords */
    secondaryKeywords?: string[]
    /** Content type (tutorial, guide, etc.) */
    contentType: string
    /** Target audience description */
    targetAudience?: string
    /** What makes this post unique */
    uniqueAngle?: string
    /** Target word count */
    estimatedWordCount?: number
    /** Model ID to use */
    modelId?: string
}

/**
 * Outline section type
 */
export type OutlineSection = z.infer<typeof outlineSectionSchema>

/**
 * Full outline response type
 */
export type GenerateBlogOutlineResult = z.infer<
    typeof generateOutlineResponseSchema
>

/**
 * Generate a structured blog post outline using AI
 *
 * Creates a detailed, SEO-optimized outline with sections,
 * subsections, and content guidance.
 *
 * @param options - Generation options
 * @returns Structured outline with sections and SEO notes
 *
 * @example
 * ```typescript
 * const outline = await generateBlogOutline({
 *   title: 'BBL Recovery Guide: Week by Week',
 *   topic: 'Brazilian Butt Lift Recovery',
 *   primaryKeyword: 'bbl recovery',
 *   contentType: 'guide',
 * })
 *
 * console.log(outline.sections[0])
 * // {
 * //   id: 'week-1',
 * //   title: 'Week 1: The Critical Healing Phase',
 * //   description: 'What to expect during the first week...',
 * //   estimatedWords: 300,
 * //   subsections: [...]
 * // }
 * ```
 */
export async function generateBlogOutline(
    options: GenerateBlogOutlineOptions
): Promise<GenerateBlogOutlineResult> {
    const {
        title,
        topic,
        primaryKeyword,
        secondaryKeywords,
        contentType,
        targetAudience,
        uniqueAngle,
        estimatedWordCount,
        modelId = DEFAULT_MODEL_ID,
    } = options

    const result = await coreGenerateObject({
        modelId,
        schema: generateOutlineResponseSchema,
        system: GENERATE_OUTLINE_SYSTEM_PROMPT,
        prompt: getGenerateOutlinePrompt({
            title,
            topic,
            primaryKeyword,
            secondaryKeywords,
            contentType,
            targetAudience,
            uniqueAngle,
            estimatedWordCount,
        }),
    })

    return result.object
}
