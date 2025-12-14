import { z } from 'zod'

import { baseGalleryMediaParamsSchema } from './gallery-media-base-params.schema'

/**
 * Schema for validating gallery media selection query parameters
 * Used in /api/gallery/media/selection route
 * Extends base schema with custom pageSize for selection dialog
 */
export const galleryMediaSelectionParamsSchema =
    baseGalleryMediaParamsSchema.extend({
        pageSize: z.coerce
            .number()
            .int()
            .positive()
            .max(100)
            .default(24)
            .catch(24),
    })

export type GalleryMediaSelectionParams = z.infer<
    typeof galleryMediaSelectionParamsSchema
>
