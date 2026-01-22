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
    | 'Organization'
    | 'Product'
    | 'Service'
    | 'Place'

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
}
