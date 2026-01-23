import type { Review, WithContext } from 'schema-dts'

import type { ReviewSchemaProps } from '../types/schema/review.type'
import { withContext } from './_internal'

/**
 * Builds JSON-LD structured data for a Review
 *
 * Supports video testimonials by combining Review with VideoObject
 * for powerful social proof signals and potential video rich snippets.
 *
 * @see https://schema.org/Review
 * @see https://developers.google.com/search/docs/appearance/structured-data/review-snippet
 */
export function buildReviewJsonLd(
    props: ReviewSchemaProps
): WithContext<Review> {
    // Build the base review object using Record for flexible property addition
    const review: Record<string, unknown> = {
        '@type': 'Review',
        author: { '@type': 'Person', name: props.author },
        datePublished: props.datePublished,
    }

    // Add optional reviewBody
    if (props.reviewBody) {
        review.reviewBody = props.reviewBody
    }

    // Add itemReviewed - Use LocalBusiness as default (Thing causes Google validation errors)
    if (props.itemReviewed) {
        review.itemReviewed = {
            '@type': props.itemReviewed.type ?? 'LocalBusiness',
            name: props.itemReviewed.name,
            ...(props.itemReviewed.url && { url: props.itemReviewed.url }),
        }
    }

    // Add reviewRating
    if (props.reviewRating) {
        review.reviewRating = {
            '@type': 'Rating',
            ratingValue: String(props.reviewRating.ratingValue),
            ...(props.reviewRating.bestRating && {
                bestRating: String(props.reviewRating.bestRating),
            }),
            ...(props.reviewRating.worstRating && {
                worstRating: String(props.reviewRating.worstRating),
            }),
        }
    }

    // Add video for video testimonials
    if (props.video) {
        review.video = {
            '@type': 'VideoObject',
            name: props.video.name,
            thumbnailUrl: props.video.thumbnailUrl,
            uploadDate: props.video.uploadDate,
            ...(props.video.description && {
                description: props.video.description,
            }),
            ...(props.video.duration && { duration: props.video.duration }),
            ...(props.video.contentUrl && {
                contentUrl: props.video.contentUrl,
            }),
            ...(props.video.embedUrl && { embedUrl: props.video.embedUrl }),
        }
    }

    return withContext(review as unknown as Review)
}
