/**
 * Specials Gallery Types
 *
 * Type definitions for gallery images displayed on the specials page carousel.
 */

/**
 * Gallery image for the specials page carousel
 *
 * Contains image data with procedure context for display and linking.
 */
export type SpecialsGalleryImage = {
    readonly id: string
    readonly url: string
    readonly alt: string
    readonly blurDataUrl: string | null
    readonly width: number | null
    readonly height: number | null
    readonly procedureName: string // Human-readable name (e.g., "Brazilian Butt Lift")
    readonly procedureSlug: string // URL slug for linking (e.g., "brazilian-butt-lift-bbl-miami")
}
