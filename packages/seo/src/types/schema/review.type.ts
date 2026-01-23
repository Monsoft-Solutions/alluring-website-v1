export type ReviewRating = {
    ratingValue: number
    bestRating?: number
    worstRating?: number
}

/**
 * Valid types for itemReviewed in Review schema.
 * Google requires specific types - 'Thing' is too generic and causes validation errors.
 * @see https://developers.google.com/search/docs/appearance/structured-data/review-snippet
 */
export type ItemReviewedType =
    | 'LocalBusiness'
    | 'MedicalBusiness'
    | 'HealthAndBeautyBusiness'
    | 'MedicalClinic'
    | 'Organization'
    | 'Product'
    | 'Service'
    | 'Place'

/**
 * Video object for video testimonial reviews
 * @see https://schema.org/VideoObject
 */
export type ReviewVideo = {
    /** Name/title of the video */
    name: string
    /** Description of the video content */
    description?: string
    /** URL of the video thumbnail image */
    thumbnailUrl: string
    /** Date the video was uploaded (ISO format) */
    uploadDate: string
    /** Duration in ISO 8601 format (e.g., "PT2M30S" for 2:30) */
    duration?: string
    /** Direct URL to the video file */
    contentUrl?: string
    /** URL to embed the video */
    embedUrl?: string
}

export type ReviewSchemaProps = {
    author: string
    datePublished: string
    reviewBody?: string
    itemReviewed?: {
        name: string
        url?: string
        /** @default 'LocalBusiness' */
        type?: ItemReviewedType
    }
    reviewRating?: ReviewRating
    /**
     * Video testimonial associated with this review
     * Combines Review schema with VideoObject for powerful social proof signals
     */
    video?: ReviewVideo
}
