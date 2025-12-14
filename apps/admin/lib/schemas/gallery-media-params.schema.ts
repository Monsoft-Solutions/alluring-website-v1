import { z } from 'zod'

import { baseGalleryMediaParamsSchema } from './gallery-media-base-params.schema'

/**
 * Schema for validating gallery media query parameters
 * Used in /api/gallery/media route
 * Now just re-exports base schema since all filters are unified
 */
export const galleryMediaParamsSchema = baseGalleryMediaParamsSchema

export type GalleryMediaParams = z.infer<typeof galleryMediaParamsSchema>
