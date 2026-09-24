import { describe, expect, it } from 'vitest'

import { LP_BEFORE_AFTER } from '@/components/landing-pages/request-consultation/lp-assets'
import { selectLpProof } from '@/components/landing-pages/request-consultation/lp-proof'
import type { GoogleReviewsResult } from '@/lib/queries/reviews/google-reviews.query'
import type { GalleryImage } from '@/lib/types/gallery/gallery.type'

const BLOB = 'https://example.public.blob.vercel-storage.com/gallery'

function image(
    id: string,
    procedureSlug: string,
    overrides: Partial<GalleryImage> = {}
): GalleryImage {
    return {
        id,
        url: `${BLOB}/alluring-karlinsky-${id}.jpg`,
        alt: 'Side-by-side before and after photos',
        blurDataUrl: null,
        width: 1000,
        height: 1250,
        procedureName: 'Procedure',
        procedureSlug,
        ...overrides,
    }
}

function review(
    id: string,
    comment: string | null,
    overrides: Partial<GoogleReviewsResult['reviews'][number]> = {}
): GoogleReviewsResult['reviews'][number] {
    return {
        id,
        reviewerName: `Reviewer ${id}`,
        reviewerPhotoUrl: null,
        rating: 5,
        comment,
        reviewCreatedAt: '2026-05-10T12:00:00.000Z',
        replyText: null,
        ...overrides,
    }
}

const LONG_ENOUGH =
    'Everyone on the team was kind and clear from the first message to my last follow-up visit.'

describe('selectLpProof — photographs', () => {
    it('leads with the ad group’s procedure, curated first, then the rest', () => {
        const gallery = [
            image('tt-1', 'tummy-tuck-miami'),
            image('bbl-1', 'brazilian-butt-lift-bbl-miami'),
        ]
        const { photos } = selectLpProof('tummy-tuck', gallery, null)

        expect(photos.map((photo) => photo.procedure).slice(0, 2)).toEqual([
            'tummy-tuck',
            'tummy-tuck',
        ])
        expect(photos[0]?.src).toBe(
            LP_BEFORE_AFTER.find((item) => item.procedure === 'tummy-tuck')?.src
        )
        expect(photos[1]?.id).toBe('tt-1')
    })

    it('keeps the curated order for the general variant', () => {
        const { photos } = selectLpProof('default', [], null)
        expect(photos.map((photo) => photo.src)).toEqual(
            LP_BEFORE_AFTER.map((item) => item.src)
        )
    })

    it('drops videos, Instagram imports and photos that are not before/afters', () => {
        const gallery = [
            image('video', 'tummy-tuck-miami', {
                url: `${BLOB}/karlinsky-clip.mp4`,
            }),
            image('instagram', 'tummy-tuck-miami', {
                url: `${BLOB}/DOJf4Czjnlz-primary.jpg`,
            }),
            image('lifestyle', 'tummy-tuck-miami', {
                alt: 'Woman in a fitted white dress on a dark background',
            }),
            image('unknown-procedure', 'facelift-miami'),
            image('cut-slug', 'tummy-tuck-miami', {
                url: `${BLOB}/alluring-tummy-tuck-karli-1765751221426.jpg`,
            }),
            image('kept', 'tummy-tuck-miami'),
        ]
        const ids = selectLpProof('tummy-tuck', gallery, null).photos.map(
            (photo) => photo.id
        )

        expect(ids).toContain('kept')
        expect(ids).toContain('cut-slug')
        expect(ids).not.toContain('video')
        expect(ids).not.toContain('instagram')
        expect(ids).not.toContain('lifestyle')
        expect(ids).not.toContain('unknown-procedure')
    })

    it('never repeats a photograph and caps the rail', () => {
        // The gallery holds the curated tummy tuck pair too.
        const curatedAgain = image('dup', 'tummy-tuck-miami', {
            url: LP_BEFORE_AFTER.find(
                (item) => item.procedure === 'tummy-tuck'
            )!.src,
        })
        const many = Array.from({ length: 30 }, (_, index) =>
            image(`bbl-${index}`, 'brazilian-butt-lift-bbl-miami')
        )
        const { photos } = selectLpProof('bbl', [curatedAgain, ...many], null)
        const srcs = photos.map((photo) => photo.src)

        expect(new Set(srcs).size).toBe(srcs.length)
        expect(photos.length).toBeLessThanOrEqual(14)
    })
})

describe('selectLpProof — reviews', () => {
    it('falls back to the published figures when the query failed', () => {
        const proof = selectLpProof('default', [], null)
        expect(proof.rating).toBeNull()
        expect(proof.reviewCount).toBeNull()
        expect(proof.reviews).toEqual([])
    })

    it('formats the live rating and keeps the count', () => {
        const proof = selectLpProof('default', [], {
            reviews: [],
            averageRating: 4.73,
            totalCount: 81,
        })
        expect(proof.rating).toBe('4.7')
        expect(proof.reviewCount).toBe(81)
    })

    it('keeps five-star reviews of a readable length only', () => {
        const proof = selectLpProof('default', [], {
            reviews: [
                review('keep', LONG_ENOUGH),
                review('four-stars', LONG_ENOUGH, { rating: 4 }),
                review('short', 'Great!'),
                review('empty', null),
                review('long', LONG_ENOUGH.repeat(5)),
                review(
                    'translated',
                    `(Translated by Google) ${LONG_ENOUGH} (Original) ${LONG_ENOUGH}`
                ),
                review('quoted', LONG_ENOUGH, {
                    reviewerName: 'Erika Frausto',
                }),
            ],
            averageRating: 4.7,
            totalCount: 81,
        })

        expect(proof.reviews.map((item) => item.id)).toEqual(['keep'])
        expect(proof.reviews[0]?.date).toBe('2026-05-10T12:00:00.000Z')
    })
})
