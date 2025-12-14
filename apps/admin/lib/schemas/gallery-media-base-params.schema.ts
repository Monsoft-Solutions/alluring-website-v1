import { z } from 'zod'

/**
 * Base schema for common gallery media query parameters
 * Extended by specific endpoint schemas
 */
export const baseGalleryMediaParamsSchema = z.object({
    page: z.coerce.number().int().positive().default(1).catch(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20).catch(20),
    sortBy: z
        .enum(['createdAt', 'title', 'displayOrder', 'qualityScore'])
        .default('createdAt')
        .catch('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc').catch('desc'),
    status: z
        .enum(['all', 'draft', 'published', 'archived'])
        .default('all')
        .catch('all'),
    type: z.enum(['all', 'image', 'video']).default('all').catch('all'),
    groupId: z.string().optional(),
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
    search: z.string().optional(),
})

export type BaseGalleryMediaParams = z.infer<
    typeof baseGalleryMediaParamsSchema
>
