import type { Review, WithContext } from 'schema-dts'

import type { ReviewSchemaProps } from '../types/schema/review.type'
import { withContext } from './_internal'

export function buildReviewJsonLd(
    props: ReviewSchemaProps
): WithContext<Review> {
    const review: Review = {
        '@type': 'Review',
        author: { '@type': 'Person', name: props.author },
        datePublished: props.datePublished,
        reviewBody: props.reviewBody,
        // Use LocalBusiness as default - 'Thing' is too generic and causes Google validation errors
        itemReviewed: props.itemReviewed && {
            '@type': props.itemReviewed.type ?? 'LocalBusiness',
            name: props.itemReviewed.name,
            url: props.itemReviewed.url,
        },
        reviewRating: props.reviewRating && {
            '@type': 'Rating',
            ratingValue: String(props.reviewRating.ratingValue),
            bestRating: props.reviewRating.bestRating
                ? String(props.reviewRating.bestRating)
                : undefined,
            worstRating: props.reviewRating.worstRating
                ? String(props.reviewRating.worstRating)
                : undefined,
        },
    }

    return withContext(review)
}
