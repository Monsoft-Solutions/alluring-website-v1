import { describe, expect, it } from 'vitest'

import { selectDrkPhotoSources } from '@/components/landing-pages/dr-karlinsky-ig/drk-proof'
import {
    LP_BEFORE_AFTER,
    LP_OPEN_PHOTOS,
} from '@/components/landing-pages/request-consultation/lp-assets'
import { LP_COPY } from '@/components/landing-pages/request-consultation/lp-copy'
import {
    gatedPhotosFor,
    hasPhotoGate,
    LP_GATED_PHOTO_SET,
    parsePhotoGateOff,
} from '@/components/landing-pages/request-consultation/lp-gated-photos'
import { selectLpProof } from '@/components/landing-pages/request-consultation/lp-proof'
import {
    AD_VARIANTS,
    type AdVariant,
} from '@/components/landing-pages/request-consultation/lp-variants'
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

const NONE: ReadonlySet<AdVariant> = new Set()

/** Each view's photos in the page and behind the card, by photo number. */
const EXPECTED: Readonly<
    Record<AdVariant, { open: readonly string[]; gated: readonly string[] }>
> = {
    default: {
        open: ['04', '08c', '05c'],
        gated: ['01', '02', '03', '05', '06', '07', '08', '09'],
    },
    'second-opinion': {
        open: ['04', '08c', '05c'],
        gated: ['01', '02', '03', '05', '06', '07', '08', '09'],
    },
    'mommy-makeover': { open: ['08c', '02c', '04'], gated: ['02', '07', '08'] },
    'tummy-tuck': { open: ['04', '08c', '02c'], gated: ['02', '08'] },
    liposuction: { open: ['05c', '08c'], gated: ['05', '09', '08'] },
    'skin-removal': { open: ['04', '02c', '08c'], gated: ['02', '08'] },
    bbl: { open: [], gated: ['01', '06'] },
    'breast-augmentation': { open: [], gated: ['03'] },
    'breast-lift': { open: [], gated: [] },
    'breast-reduction': { open: [], gated: [] },
}

const ALL_GATED_SRCS = new Set(
    Object.values(LP_GATED_PHOTO_SET).map((photo) => photo.src)
)

describe('photos in the page and behind the card', () => {
    it('covers every view', () => {
        expect(Object.keys(EXPECTED).sort()).toEqual([...AD_VARIANTS].sort())
        expect(Object.keys(LP_OPEN_PHOTOS).sort()).toEqual(
            [...AD_VARIANTS].sort()
        )
    })

    it.each(AD_VARIANTS)('%s matches the table', (view) => {
        expect(LP_OPEN_PHOTOS[view].map((photo) => photo.id)).toEqual(
            EXPECTED[view].open
        )
        expect(gatedPhotosFor(view, NONE).map((photo) => photo.id)).toEqual(
            EXPECTED[view].gated
        )
    })

    it.each(AD_VARIANTS)('%s keeps the two lists disjoint', (view) => {
        const open = new Set(LP_OPEN_PHOTOS[view].map((photo) => photo.src))
        for (const photo of gatedPhotosFor(view, NONE)) {
            expect(open.has(photo.src)).toBe(false)
        }
    })

    it.each(
        AD_VARIANTS.flatMap(
            (view) =>
                [
                    [view, 'en'],
                    [view, 'es'],
                ] as const
        )
    )(
        '%s (%s) selects only its own photos, none from behind the card',
        (view, lang) => {
            const { photos, photoGate } = selectLpProof(
                view,
                null,
                hasPhotoGate(view, NONE)
            )
            expect(photos).toEqual(LP_OPEN_PHOTOS[view])
            expect(photoGate).toBe(EXPECTED[view].gated.length > 0)
            const copy = LP_COPY[lang].results
            for (const photo of photos) {
                expect(ALL_GATED_SRCS.has(photo.src)).toBe(false)
                const alt =
                    copy.photoAlts[photo.id] ??
                    copy.captions[photo.procedure]?.alt
                expect(alt).toBeTruthy()
            }
        }
    )

    it('shows the open photos even with the card off', () => {
        const off = parsePhotoGateOff('liposuction')
        expect(hasPhotoGate('liposuction', off)).toBe(false)
        expect(gatedPhotosFor('liposuction', off)).toEqual([])
        expect(selectLpProof('liposuction', null, false).photos).toEqual(
            LP_OPEN_PHOTOS.liposuction
        )
    })

    it('reads the off switch leniently and ignores unknown views', () => {
        const off = parsePhotoGateOff(' Liposuction , tummy-tuck,nope,, ')
        expect([...off].sort()).toEqual(['liposuction', 'tummy-tuck'])
        expect(parsePhotoGateOff(undefined).size).toBe(0)
        expect(parsePhotoGateOff('').size).toBe(0)
    })

    it('has alt text and a caption for every photo behind the card', () => {
        for (const lang of ['en', 'es'] as const) {
            const copy = LP_COPY[lang].results
            for (const photo of Object.values(LP_GATED_PHOTO_SET)) {
                expect(
                    copy.photoAlts[photo.id] ??
                        copy.captions[photo.procedure]?.alt
                ).toBeTruthy()
                expect(copy.captions[photo.procedure]?.caption).toBeTruthy()
            }
        }
    })
})

describe('selectDrkPhotoSources — Dr. Karlinsky’s page', () => {
    it('keeps the curated five first, then her gallery uploads', () => {
        const gallery = [image('tt-1', 'tummy-tuck-miami')]
        const photos = selectDrkPhotoSources(gallery)
        expect(photos.slice(0, 5).map((photo) => photo.src)).toEqual(
            LP_BEFORE_AFTER.map((item) => item.src)
        )
        expect(photos[5]?.id).toBe('tt-1')
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
        const ids = selectDrkPhotoSources(gallery).map((photo) => photo.id)

        expect(ids).toContain('kept')
        expect(ids).toContain('cut-slug')
        expect(ids).not.toContain('video')
        expect(ids).not.toContain('instagram')
        expect(ids).not.toContain('lifestyle')
        expect(ids).not.toContain('unknown-procedure')
    })

    it('never repeats a photograph and caps the rail', () => {
        const curatedAgain = image('dup', 'tummy-tuck-miami', {
            url: LP_BEFORE_AFTER.find(
                (item) => item.procedure === 'tummy-tuck'
            )!.src,
        })
        const many = Array.from({ length: 30 }, (_, index) =>
            image(`bbl-${index}`, 'brazilian-butt-lift-bbl-miami')
        )
        const photos = selectDrkPhotoSources([curatedAgain, ...many])
        const srcs = photos.map((photo) => photo.src)

        expect(new Set(srcs).size).toBe(srcs.length)
        expect(photos.length).toBeLessThanOrEqual(14)
    })
})

describe('selectLpProof — reviews', () => {
    it('falls back to the published figures when the query failed', () => {
        const proof = selectLpProof('default', null)
        expect(proof.rating).toBeNull()
        expect(proof.reviewCount).toBeNull()
        expect(proof.reviews).toEqual([])
    })

    it('formats the live rating and keeps the count', () => {
        const proof = selectLpProof('default', {
            reviews: [],
            averageRating: 4.73,
            totalCount: 81,
        })
        expect(proof.rating).toBe('4.7')
        expect(proof.reviewCount).toBe(81)
    })

    it('keeps five-star reviews of a readable length only', () => {
        const proof = selectLpProof('default', {
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
