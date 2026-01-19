import { z } from 'zod'

/**
 * Schema for image data to be uploaded to Vercel Blob
 */
export const imageDataSchema = z.object({
    url: z.url('Invalid image URL'),
    alt: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    fileSize: z.number().int().positive().optional(),
    mimeType: z.string().optional(),
    originalFilename: z.string().optional(),
})

/**
 * Resource creation schema for API
 */
export const createResourceSchema = z.object({
    slug: z.string().min(1, 'Slug is required'),
    title: z.string().min(1, 'Title is required'),
    metaDescription: z.string().min(1, 'Meta description is required'),
    metaTitle: z.string().optional(),
    metaKeywords: z.string().optional(),
    excerpt: z.string().optional(),
    date: z.string().min(1, 'Date is required'),
    readingTime: z.string().optional(),
    content: z.string().min(1, 'Content is required'),
    status: z.enum(['draft', 'ready_to_publish', 'published']).default('draft'),
    authorId: z.uuid('Invalid author ID'),
    featuredImageUrl: z.url('Invalid featured image URL').optional(),
    featuredImage: imageDataSchema.optional(),
    categoryIds: z.array(z.uuid('Invalid category ID')).default([]),
    tagIds: z.array(z.uuid('Invalid tag ID')).default([]),
})

export type CreateResourceInput = z.infer<typeof createResourceSchema>
