/**
 * The proof on /lp/dr-karlinsky: her before-and-after photographs and Google
 * reviews that name her, read on the server.
 *
 * Photographs come from the same selection the ads landing page makes
 * (`selectLpProof`: the curated pairs, then gallery uploads of her own cases),
 * so the two pages vouch for the same images. Reviews are narrower here: only
 * five-star reviews that mention her, since the page is her voice.
 *
 * Both inputs are optional. If the database is unreachable the rail keeps its
 * curated five and the reviews section is left out.
 */

import { selectLpProof } from '@/components/landing-pages/request-consultation/lp-proof'
import { LP_COPY } from '@/components/landing-pages/request-consultation/lp-copy'
import type { GoogleReviewsResult } from '@/lib/queries/reviews/google-reviews.query'
import type { GalleryImage } from '@/lib/types/gallery/gallery.type'

import type { DrkLang } from './drk-copy'

export interface DrkPhoto {
    readonly id: string
    readonly src: string
    readonly alt: string
    /** "Brazilian Butt Lift", in the page's language. */
    readonly caption: string
}

export interface DrkReview {
    readonly id: string
    readonly name: string
    readonly text: string
    /** "May 2026", in the page's language. */
    readonly date: string
}

export interface DrkProof {
    readonly photos: readonly DrkPhoto[]
    readonly reviews: readonly DrkReview[]
    /** "4.7", or null when the live figure is unavailable. */
    readonly rating: string | null
    readonly reviewCount: number | null
}

const MAX_REVIEWS = 4

/** Long enough to say something, short enough to read on a phone. */
const REVIEW_LENGTH = { min: 80, max: 420 } as const

/** Her name, or the way patients shorten it ("Dr. K", "Dra. K"). */
const MENTIONS_HER = /karlinsk|\bdra?\.?\s?k\b|\bdoctor k\b/i

/**
 * Another doctor by name ("Dr. Moran"): the page speaks as her alone, so a
 * review crediting someone else is left for the reviews page.
 */
const OTHER_DOCTOR = /\bdra?\.?\s+(?!k\b|karlinsk|victoria|vicky)[a-z]{2,}/i

/** Google's machine translation carries both texts; neither reads well. */
const MACHINE_TRANSLATED = /\((Translated by Google|Original)\)/i

export function mentionsKarlinsky(text: string): boolean {
    return MENTIONS_HER.test(text)
}

export function selectDrkReviews(
    result: GoogleReviewsResult | null,
    lang: DrkLang
): DrkReview[] {
    if (!result) return []
    const month = new Intl.DateTimeFormat(lang === 'es' ? 'es-US' : 'en-US', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    })
    const seen = new Set<string>()
    return result.reviews
        .flatMap((review) => {
            const text = review.comment?.replace(/\s+/g, ' ').trim() ?? ''
            const name = review.reviewerName.trim()
            if (review.rating < 5) return []
            if (!mentionsKarlinsky(text)) return []
            if (OTHER_DOCTOR.test(text)) return []
            if (MACHINE_TRANSLATED.test(text)) return []
            if (text.length < REVIEW_LENGTH.min) return []
            if (text.length > REVIEW_LENGTH.max) return []
            if (seen.has(name)) return []
            seen.add(name)
            return [
                {
                    id: review.id,
                    name,
                    text,
                    date: month.format(new Date(review.reviewCreatedAt)),
                },
            ]
        })
        .slice(0, MAX_REVIEWS)
}

export function selectDrkProof(
    lang: DrkLang,
    gallery: readonly GalleryImage[],
    reviews: GoogleReviewsResult | null
): DrkProof {
    const lp = selectLpProof('default', gallery, reviews)
    const captions = LP_COPY[lang].results.captions
    return {
        photos: lp.photos.map((photo) => {
            const caption = captions[photo.procedure]
            return {
                id: photo.id,
                src: photo.src,
                alt:
                    caption?.alt ??
                    photo.alt ??
                    LP_COPY[lang].results.railLabel,
                caption: caption?.caption ?? '',
            }
        }),
        reviews: selectDrkReviews(reviews, lang),
        rating: lp.rating,
        reviewCount: lp.reviewCount,
    }
}
