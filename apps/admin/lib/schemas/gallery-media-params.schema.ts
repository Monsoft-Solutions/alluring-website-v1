import { z } from 'zod'

import { baseGalleryMediaParamsSchema } from './gallery-media-base-params.schema'

/**
 * Schema for validating gallery media query parameters
 * Used in /api/gallery/media route
 * Extends base schema with groupId filter
 */
export const galleryMediaParamsSchema = baseGalleryMediaParamsSchema.extend({
    groupId: z.string().optional(),
})

export type GalleryMediaParams = z.infer<typeof galleryMediaParamsSchema>
