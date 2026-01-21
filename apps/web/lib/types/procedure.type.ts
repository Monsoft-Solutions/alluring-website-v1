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

    // Freshness signals for SEO/LLM optimization
    /** ISO date string when the content was last modified */
    dateModified?: string
    /** ISO date string when the content was first published */
    datePublished?: string

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
