/**
 * Gallery Procedure Schema
 *
 * Procedure slugs that can be detected in gallery images.
 * Single source of truth used across @workspace/ai and apps.
 *
 * @module @workspace/shared/schemas/gallery/gallery-procedure
 */
import { z } from 'zod'

/**
 * Procedure slugs that can be detected in images
 * These map to the actual page slugs used in the web app
 */
export const GALLERY_PROCEDURE_SLUGS = [
    'brazilian-butt-lift-bbl-miami',
    'breast-augmentation-miami',
    'breast-lift-miami',
    'breast-reduction-miami',
    'tummy-tuck-miami',
    'liposuction-miami',
    'mommy-makeover-miami',
    'facelift-miami',
    'blepharoplasty-miami',
    'rhinoplasty-miami',
] as const

/**
 * Zod schema for procedure slug
 */
export const galleryProcedureSlugSchema = z.enum(GALLERY_PROCEDURE_SLUGS)

/**
 * TypeScript type inferred from schema
 */
export type GalleryProcedureSlug = z.infer<typeof galleryProcedureSlugSchema>
