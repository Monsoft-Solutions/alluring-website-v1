/**
 * The proof the landing page shows in place of links to the main site: more
 * before-and-after photographs and more Google reviews, on the page itself.
 *
 * The page used to send a visitor who wanted more to /gallery and /reviews,
 * which is a way off a paid landing page that rarely comes back. Now the
 * results rail carries the gallery's photos (the ad group's procedure first)
 * and the reviews section carries a rail of recent Google reviews, with the
 * live rating and count.
 *
 * Pure selection, run on the server by the page. Both inputs are optional:
 * if the database is unreachable the page falls back to its curated five
 * photographs, its three quoted reviews and the published "4.7 · 80+".
 */

import type { GoogleReviewsResult } from '@/lib/queries/reviews/google-reviews.query'
import type { GalleryImage } from '@/lib/types/gallery/gallery.type'

import { LP_BEFORE_AFTER } from './lp-assets'
import { LP_COPY } from './lp-copy'
import type { AdVariant } from './lp-variants'

export interface LpPhoto {
    readonly id: string
    readonly src: string
    /** English alt text from the gallery; curated photos use the deck's. */
    readonly alt: string | null
    /** The ad-group slug, for the caption in the visitor's language. */
    readonly procedure: string
}

export interface LpLiveReview {
    readonly id: string
    readonly name: string
    readonly text: string
    /** ISO date; formatted in the visitor's language, in UTC. */
    readonly date: string
}

export interface LpProof {
    readonly photos: readonly LpPhoto[]
    /** `"4.7"`, or null to fall back to the published figure. */
    readonly rating: string | null
    readonly reviewCount: number | null
    readonly reviews: readonly LpLiveReview[]
}

const MAX_PHOTOS = 14
const MAX_REVIEWS = 8

/** Long enough to say something, short enough to read on a card. */
const REVIEW_LENGTH = { min: 90, max: 340 } as const

const VIDEO_URL = /\.(mp4|mov|m4v|webm)(\?|$)/i

/**
 * The gallery also holds Instagram imports — lifestyle shots, carousel
 * frames — that are not before-and-after pairs. The rail captions every
 * photo "Before · After" and the footer says they show Dr. Karlinsky's
 * patients, so a gallery photo is used only when its alt text says it is a
 * before-and-after and its file is one of her named uploads. The upload slug
 * is sometimes cut short (`…-brazilian-butt-lift-karli-…`), hence `karli`.
 */
const BEFORE_AFTER_ALT = /before[\s-]+and[\s-]+after/i
const KARLINSKY_UPLOAD = /karli/i

/** Google's machine translation carries both texts; neither reads well on a card. */
const MACHINE_TRANSLATED = /\((Translated by Google|Original)\)/i

/** Gallery group (procedure page slug) → ad-group slug. */
const GALLERY_PROCEDURE: Readonly<Record<string, string>> = {
    'brazilian-butt-lift-bbl-miami': 'bbl',
    'breast-augmentation-miami': 'breast-augmentation',
    'mommy-makeover-miami': 'mommy-makeover',
    'liposuction-miami': 'liposuction',
    'tummy-tuck-miami': 'tummy-tuck',
}

/**
 * Ad groups with no photographs of their own lead with the nearest set: a
 * breast lift is often done with implants, and a tummy tuck is the one
 * skin-removal result there are photographs of. Breast reduction and a
 * second opinion keep the page's own order rather than lead with results
 * she didn't ask about.
 */
const PHOTO_LEAD: Partial<Record<AdVariant, string>> = {
    'breast-lift': 'breast-augmentation',
    'skin-removal': 'tummy-tuck',
}

/**
 * Curated pairs first — they are the ones the page vouches for by name — but
 * the ad group's procedure leads, curated and gallery together, so a BBL
 * click opens on BBL results.
 */
function selectPhotos(
    adVariant: AdVariant,
    gallery: readonly GalleryImage[]
): LpPhoto[] {
    const curated: LpPhoto[] = LP_BEFORE_AFTER.map((item) => ({
        id: item.src,
        src: item.src,
        alt: null,
        procedure: item.procedure,
    }))
    const fromGallery: LpPhoto[] = gallery
        .filter(
            (image) =>
                !VIDEO_URL.test(image.url) &&
                BEFORE_AFTER_ALT.test(image.alt) &&
                KARLINSKY_UPLOAD.test(image.url)
        )
        .flatMap((image) => {
            const procedure = GALLERY_PROCEDURE[image.procedureSlug]
            return procedure
                ? [{ id: image.id, src: image.url, alt: image.alt, procedure }]
                : []
        })

    const lead = PHOTO_LEAD[adVariant] ?? adVariant
    const mine = (photo: LpPhoto) => photo.procedure === lead
    const ordered = [
        ...curated.filter(mine),
        ...fromGallery.filter(mine),
        ...curated.filter((photo) => !mine(photo)),
        ...fromGallery.filter((photo) => !mine(photo)),
    ]

    const seen = new Set<string>()
    return ordered
        .filter((photo) => {
            if (seen.has(photo.src)) return false
            seen.add(photo.src)
            return true
        })
        .slice(0, MAX_PHOTOS)
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
    gallery: readonly GalleryImage[],
    reviews: GoogleReviewsResult | null
): LpProof {
    const rating = reviews?.averageRating
    return {
        photos: selectPhotos(adVariant, gallery),
        rating: rating ? rating.toFixed(1) : null,
        reviewCount: reviews?.totalCount || null,
        reviews: reviews ? selectReviews(reviews) : [],
    }
}
