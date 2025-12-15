/**
 * Featured Promotion Type
 *
 * Type definition for featured promotion data displayed in the specials hero section.
 * Pre-processed by the server to include computed values like discount and days remaining.
 */

/**
 * Featured promotion data pre-processed by the server
 */
export type FeaturedPromotionData = {
    readonly title: string
    readonly excerpt: string | null
    readonly imageUrl: string | null
    readonly imageAlt: string | null
    readonly discount: string | null
    readonly daysRemaining: number | null
    readonly expiringSoon: boolean
}
