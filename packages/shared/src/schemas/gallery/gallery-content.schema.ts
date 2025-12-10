/**
 * Gallery Content Schemas
 *
 * Zod schemas for SEO and visitor content generation results.
 * Single source of truth used across @workspace/ai and apps.
 *
 * @module @workspace/shared/schemas/gallery/gallery-content
 */
import { z } from 'zod'

/**
 * SEO content generation result schema
 */
export const seoContentSchema = z.object({
    seoTitle: z
        .string()
        .max(60)
        .describe(
            'SEO-optimized title for search engines, max 60 characters, includes relevant keywords'
        ),

    seoDescription: z
        .string()
        .max(160)
        .describe(
            'SEO meta description, max 160 characters, compelling and keyword-rich'
        ),

    slug: z
        .string()
        .describe(
            'URL-friendly slug derived from the content, lowercase with hyphens'
        ),
})

/**
 * Visitor content generation result schema
 */
export const visitorContentSchema = z.object({
    title: z
        .string()
        .describe(
            'Engaging, descriptive title for gallery visitors that captures attention'
        ),

    description: z
        .string()
        .describe(
            'Story-focused, benefits-oriented description that resonates with potential patients'
        ),

    alt: z
        .string()
        .describe(
            'Accessible alt text describing the image for screen readers, clear and descriptive'
        ),
})

/**
 * TypeScript types inferred from schemas
 */
export type SEOContent = z.infer<typeof seoContentSchema>
export type VisitorContent = z.infer<typeof visitorContentSchema>
