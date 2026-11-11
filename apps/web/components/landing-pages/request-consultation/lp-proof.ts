/**
 * The proof the landing page shows in place of links to the main site:
 * before-and-after photographs and Google reviews, on the page itself.
 *
 * The page used to send a visitor who wanted more to /gallery and /reviews,
 * which is a way off a paid landing page that rarely comes back. Now the
 * results rail carries the photographs and the reviews section carries a
 * rail of recent Google reviews, with the live rating and count.
 *
 * Each view shows a fixed list of photographs in the page (`LP_OPEN_PHOTOS`
 * in `lp-assets.ts`). The rest load after the visitor taps the card under
 * them; the page only learns here whether that card is shown (`photoGate`),
 * never which photos are behind it.
 *
 * Pure selection, run on the server by the page. The reviews are optional:
 * if the database is unreachable the page falls back to its three quoted
 * reviews and the published "4.7 · 80+".
 */

import type { GoogleReviewsResult } from '@/lib/queries/reviews/google-reviews.query'

import { LP_OPEN_PHOTOS, type LpResultPhoto } from './lp-assets'
import { LP_COPY } from './lp-copy'
import type { AdVariant } from './lp-variants'

export type LpPhoto = LpResultPhoto

export interface LpLiveReview {
    readonly id: string
    readonly name: string
    readonly text: string
    /** ISO date; formatted in the visitor's language, in UTC. */
    readonly date: string
}

export interface LpProof {
    /** The photographs shown in the page, in order. */
    readonly photos: readonly LpPhoto[]
    /** True when the view shows the tap-to-view card for more photographs. */
    readonly photoGate: boolean
    /** `"4.7"`, or null to fall back to the published figure. */
    readonly rating: string | null
    readonly reviewCount: number | null
    readonly reviews: readonly LpLiveReview[]
}

const MAX_REVIEWS = 8

/** Long enough to say something, short enough to read on a card. */
const REVIEW_LENGTH = { min: 90, max: 340 } as const

/** Google's machine translation carries both texts; neither reads well on a card. */
const MACHINE_TRANSLATED = /\((Translated by Google|Original)\)/i

/** The view's own photographs, the same in both languages. */
export function selectPhotos(adVariant: AdVariant): readonly LpPhoto[] {
    return LP_OPEN_PHOTOS[adVariant]
}

/** The authors already quoted above the rail, in either language. */
const QUOTED = new Set(
    Object.values(LP_COPY).flatMap((copy) =>
        copy.reviews.items.map((item) => item.by.split(' · ')[0]?.trim())
    )
)

function selectReviews(result: GoogleReviewsResult): LpLiveReview[] {
    return result.reviews
        .flatMap((review) => {
            const text = review.comment?.replace(/\s+/g, ' ').trim() ?? ''
            if (review.rating < 5) return []
            if (MACHINE_TRANSLATED.test(text)) return []
            if (text.length < REVIEW_LENGTH.min) return []
            if (text.length > REVIEW_LENGTH.max) return []
            if (QUOTED.has(review.reviewerName.trim())) return []
            return [
                {
                    id: review.id,
                    name: review.reviewerName.trim(),
                    text,
                    date: new Date(review.reviewCreatedAt).toISOString(),
                },
            ]
        })
        .slice(0, MAX_REVIEWS)
}

export function selectLpProof(
    adVariant: AdVariant,
    reviews: GoogleReviewsResult | null,
    photoGate = false
): LpProof {
    const rating = reviews?.averageRating
    return {
        photos: selectPhotos(adVariant),
        photoGate,
        rating: rating ? rating.toFixed(1) : null,
        reviewCount: reviews?.totalCount || null,
        reviews: reviews ? selectReviews(reviews) : [],
    }
}
