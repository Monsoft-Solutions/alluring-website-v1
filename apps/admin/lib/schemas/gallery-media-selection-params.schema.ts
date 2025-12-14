import { z } from 'zod'

/**
 * Schema for validating gallery media selection query parameters
 * Used in /api/gallery/media/selection route
 */
export const galleryMediaSelectionParamsSchema = z.object({
    page: z.coerce.number().int().positive().default(1).catch(1),
    pageSize: z.coerce.number().int().positive().max(100).default(24).catch(24),
    sortBy: z
        .enum(['createdAt', 'title', 'displayOrder'])
        .default('createdAt')
        .catch('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc').catch('desc'),
    status: z
        .enum(['all', 'draft', 'published', 'archived'])
        .default('all')
        .catch('all'),
    type: z.enum(['all', 'image', 'video']).default('all').catch('all'),
    search: z.string().optional(),
    hasGroup: z
        .string()
        .transform((val) => {
            if (val === 'true') return true
            if (val === 'false') return false
            return null
        })
        .nullable()
        .optional()
        .default(null),
    excludeMediaIds: z
        .string()
        .optional()
        .default('')
        .transform((val) => val.split(',').filter(Boolean))
        .catch([]),
})

export type GalleryMediaSelectionParams = z.infer<
    typeof galleryMediaSelectionParamsSchema
>
