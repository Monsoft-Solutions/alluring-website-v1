/**
 * Before/After Types
 *
 * Type definitions for before/after comparison pairs
 * used in the gallery showcase.
 */

/**
 * Image data for before/after comparisons
 */
export type BeforeAfterImage = {
    readonly id: string
    readonly url: string
    readonly alt: string
    readonly blurDataUrl: string | null
    readonly width: number | null
    readonly height: number | null
}

/**
 * Before/After pair for display
 */
export type BeforeAfterPairCard = {
    readonly id: string
    readonly procedureType: string | null
    readonly timeframe: string | null
    readonly patientInfo: string | null
    readonly beforeImage: BeforeAfterImage
    readonly afterImage: BeforeAfterImage
}
