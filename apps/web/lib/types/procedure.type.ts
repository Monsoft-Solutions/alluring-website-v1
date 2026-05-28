import { z } from 'zod'

export interface ProcedureFAQ {
    question: string
    answer: string
}

export interface ProcedureBenefit {
    title: string
    description: string
    iconName?: string // For dynamic icon loading if needed
}

export interface ProcedureStep {
    title: string
    description: string
    step: number
}

export interface ProcedureStats {
    duration: string
    anesthesia: string
    recovery: string
    results: string
    inpatientOutpatient?: string
}

export interface ProcedureQuickAnswer {
    question: string
    answer: string
    details?: string
}

/**
 * Inline content image for procedure pages
 * Used to add visual engagement throughout the content sections
 */
export interface ProcedureContentImage {
    /** Unique identifier for the image (used for positioning) */
    id: string
    /** Image source path (relative to public folder) */
    src: string
    /** Alt text for accessibility */
    alt: string
    /** Optional caption displayed below the image */
    caption?: string
    /** Section where this image should appear */
    section:
        | 'hero'
        | 'intro'
        | 'benefits'
        | 'process'
        | 'content'
        | 'recovery'
        | 'cta'
    /** Optional display variant */
    variant?: 'full-width' | 'half' | 'float-right' | 'float-left'
}

export interface Procedure {
    title: string
    slug: string
    description: string
    shortDescription?: string
    heroSubtitle?: string
    image?: string
    keywords?: string[]
    category?: 'face' | 'breast' | 'body' | 'combined'
    faqs?: ProcedureFAQ[]
    content?: string // Markdown content for the main procedure description

    // Structured content for redesign
    quickStats?: ProcedureStats
    benefits?: ProcedureBenefit[]
    process?: ProcedureStep[]
    quickAnswer?: ProcedureQuickAnswer

    // Inline content images for enhanced engagement
    contentImages?: ProcedureContentImage[]

    // Freshness signals for SEO/LLM optimization
    /** ISO date string when the content was last modified */
    dateModified?: string
    /** ISO date string when the content was first published */
    datePublished?: string

    // Paid-LP copy fields — surfaced on /landing/procedure/[slug]. All
    // optional; the template falls back gracefully when unset.
    /** Starting "from" price, formatted with currency, e.g. "$4,500" */
    priceFrom?: string
    /** Starting financing-payment phrase, e.g. "$27/week with approved credit" */
    weeklyPaymentFrom?: string
    /** Outcome-focused H1 override (overrides `title` on the landing hero) */
    outcomeHeadline?: string
    /** One-line social proof for the landing hero */
    microProof?: string
    /** Optional inline scarcity line in the landing hero */
    urgencyNote?: string
    /** Reassurance shown under the landing form submit button */
    postSubmitPromise?: string

    // Legacy/Optional details
    details?: {
        intro: string
        benefits: string[]
        candidates: string[]
        recovery: string
        results: string
    }
}

/**
 * Zod schema for runtime validation of Procedure objects
 *
 * Validates core fields and optional datetime strings for SEO/LLM freshness signals.
 * Use this schema when creating/consuming Procedure objects to ensure data integrity.
 */
export const procedureSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    slug: z
        .string()
        .min(1, 'Slug is required')
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be kebab-case'),
    description: z.string().min(1, 'Description is required'),
    shortDescription: z.string().optional(),
    heroSubtitle: z.string().optional(),
    image: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    category: z.enum(['face', 'breast', 'body', 'combined']).optional(),
    faqs: z
        .array(
            z.object({
                question: z.string(),
                answer: z.string(),
            })
        )
        .optional(),
    content: z.string().optional(),

    // Structured content
    quickStats: z
        .object({
            duration: z.string(),
            anesthesia: z.string(),
            recovery: z.string(),
            results: z.string(),
            inpatientOutpatient: z.string().optional(),
        })
        .optional(),
    benefits: z
        .array(
            z.object({
                title: z.string(),
                description: z.string(),
                iconName: z.string().optional(),
            })
        )
        .optional(),
    process: z
        .array(
            z.object({
                title: z.string(),
                description: z.string(),
                step: z.number(),
            })
        )
        .optional(),
    quickAnswer: z
        .object({
            question: z.string(),
            answer: z.string(),
            details: z.string().optional(),
        })
        .optional(),

    // Inline content images
    contentImages: z
        .array(
            z.object({
                id: z.string(),
                src: z.string(),
                alt: z.string(),
                caption: z.string().optional(),
                section: z.enum([
                    'hero',
                    'intro',
                    'benefits',
                    'process',
                    'content',
                    'recovery',
                    'cta',
                ]),
                variant: z
                    .enum(['full-width', 'half', 'float-right', 'float-left'])
                    .optional(),
            })
        )
        .optional(),

    // Freshness signals for SEO/LLM optimization
    dateModified: z
        .string()
        .datetime({ message: 'dateModified must be a valid ISO 8601 datetime' })
        .optional(),
    datePublished: z
        .string()
        .datetime({
            message: 'datePublished must be a valid ISO 8601 datetime',
        })
        .optional(),

    // Paid-LP copy fields (all optional, hero falls back gracefully)
    priceFrom: z.string().optional(),
    weeklyPaymentFrom: z.string().optional(),
    outcomeHeadline: z.string().optional(),
    microProof: z.string().optional(),
    urgencyNote: z.string().optional(),
    postSubmitPromise: z.string().optional(),

    // Legacy details
    details: z
        .object({
            intro: z.string(),
            benefits: z.array(z.string()),
            candidates: z.array(z.string()),
            recovery: z.string(),
            results: z.string(),
        })
        .optional(),
})

/**
 * Inferred TypeScript type from the Zod schema
 */
export type ProcedureValidated = z.infer<typeof procedureSchema>
