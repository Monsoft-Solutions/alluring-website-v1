import { z } from 'zod'

import { baseGalleryMediaParamsSchema } from './gallery-media-base-params.schema'

/**
 * Schema for validating gallery media selection query parameters
 * Used in /api/gallery/media/selection route
 * Extends base schema with hasGroup filter and excludeMediaIds
 */
export const galleryMediaSelectionParamsSchema = baseGalleryMediaParamsSchema
    .extend({
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
    .extend(
        z.object({
            pageSize: z.coerce
                .number()
                .int()
                .positive()
                .max(100)
                .default(24)
                .catch(24),
        })
    )

export type GalleryMediaSelectionParams = z.infer<
    typeof galleryMediaSelectionParamsSchema
>
