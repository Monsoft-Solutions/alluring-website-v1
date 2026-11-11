/**
 * The proof on /lp/dr-karlinsky: her before-and-after photographs and Google
 * reviews that name her, read on the server.
 *
 * Photographs: the five curated pairs the ads landing page started from
 * (`LP_BEFORE_AFTER`), then gallery uploads of her own cases. Reviews are
 * narrower than the ads page's: only five-star reviews that mention her,
 * since the page is her voice.
 *
 * Both inputs are optional. If the database is unreachable the rail keeps its
 * curated five and the reviews section is left out.
 */

import { LP_BEFORE_AFTER } from '@/components/landing-pages/request-consultation/lp-assets'
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
    /** The language the patient wrote in, for the quote's `lang`. */
    readonly lang: DrkLang
}

export interface DrkProof {
    readonly photos: readonly DrkPhoto[]
    readonly reviews: readonly DrkReview[]
    /** "4.7", or null when the live figure is unavailable. */
    readonly rating: string | null
    readonly reviewCount: number | null
}

const MAX_REVIEWS = 4
const MAX_PHOTOS = 14

const VIDEO_URL = /\.(mp4|mov|m4v|webm)(\?|$)/i

/**
 * The gallery also holds Instagram imports — lifestyle shots, carousel
 * frames — that are not before-and-after pairs. A gallery photo is used only
 * when its alt text says it is a before-and-after and its file is one of her
 * named uploads. The upload slug is sometimes cut short
 * (`…-brazilian-butt-lift-karli-…`), hence `karli`.
 */
const BEFORE_AFTER_ALT = /before[\s-]+and[\s-]+after/i
const KARLINSKY_UPLOAD = /karli/i

/** Gallery group (procedure page slug) → the caption key in `LP_COPY`. */
const GALLERY_PROCEDURE: Readonly<Record<string, string>> = {
    'brazilian-butt-lift-bbl-miami': 'bbl',
    'breast-augmentation-miami': 'breast-augmentation',
    'mommy-makeover-miami': 'mommy-makeover',
    'liposuction-miami': 'liposuction',
    'tummy-tuck-miami': 'tummy-tuck',
}

interface DrkPhotoSource {
    readonly id: string
    readonly src: string
    readonly alt: string | null
    readonly procedure: string
}

/** The curated pairs first, then her gallery uploads, no repeats. */
export function selectDrkPhotoSources(
    gallery: readonly GalleryImage[]
): DrkPhotoSource[] {
    const curated: DrkPhotoSource[] = LP_BEFORE_AFTER.map((item) => ({
        id: item.src,
        src: item.src,
        alt: null,
        procedure: item.procedure,
    }))
    const fromGallery: DrkPhotoSource[] = gallery
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

    const seen = new Set<string>()
    return [...curated, ...fromGallery]
        .filter((photo) => {
            if (seen.has(photo.src)) return false
            seen.add(photo.src)
            return true
        })
        .slice(0, MAX_PHOTOS)
}

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

const SPANISH_WORDS =
    /\b(que|muy|con|por|para|mi|una|el|la|los|las|todo|gracias|excelente|doctora)\b/gi
const ENGLISH_WORDS =
    /\b(the|and|was|my|she|very|with|is|her|to|of|for|amazing)\b/gi

/** Which language a review is written in, by its common words. */
export function reviewLanguage(text: string): DrkLang {
    const es = text.match(SPANISH_WORDS)?.length ?? 0
    const en = text.match(ENGLISH_WORDS)?.length ?? 0
    return es > en ? 'es' : 'en'
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
                    lang: reviewLanguage(text),
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
    const lp = selectLpProof('default', reviews)
    const captions = LP_COPY[lang].results.captions
    return {
        photos: selectDrkPhotoSources(gallery).map((photo) => {
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
