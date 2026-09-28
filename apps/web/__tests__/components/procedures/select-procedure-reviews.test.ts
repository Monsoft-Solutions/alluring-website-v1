import { describe, expect, it } from 'vitest'

import { selectProcedureReviews } from '@/components/procedures/module-kit/module-reviews.component'
import type { GoogleReviewPublic } from '@/lib/queries/reviews/google-reviews.query'

const MM = 'mommy-makeover-miami'

function review(id: string, comment: string | null): GoogleReviewPublic {
    return {
        id,
        reviewerName: id,
        reviewerPhotoUrl: null,
        rating: 5,
        comment,
        reviewCreatedAt: '2026-09-01T00:00:00.000Z',
        replyText: null,
    }
}

/** In the query's own order: featured first, as the page receives them. */
const REVIEWS = [
    review('general-1', 'Lovely staff and a clean office.'),
    review('tummy-tuck', 'My tummy tuck healed beautifully.'),
    review('empty', '   '),
    review('general-2', 'Answered every question I had.'),
    review('no-text', null),
    review('breast-aug', 'So happy with my breast augmentation!'),
    review('mommy', 'My mommy makeover changed how I feel.'),
    review('liposuction', 'Lipo on my arms, very smooth recovery.'),
]

const ids = (reviews: GoogleReviewPublic[]) => reviews.map((r) => r.id)

describe('selectProcedureReviews', () => {
    it('puts the reviews that name the procedure first, then the query order', () => {
        expect(ids(selectProcedureReviews(REVIEWS, MM))).toEqual([
            'mommy',
            'general-1',
            'tummy-tuck',
        ])
    })

    it('skips reviews without text', () => {
        const all = selectProcedureReviews(REVIEWS, MM, { limit: 100 })
        expect(ids(all)).not.toContain('empty')
        expect(ids(all)).not.toContain('no-text')
        expect(all).toHaveLength(6)
    })

    it('fills a second tier with reviews that name a related procedure', () => {
        expect(
            ids(
                selectProcedureReviews(REVIEWS, MM, {
                    relatedSlugs: [
                        'tummy-tuck-miami',
                        'breast-augmentation-miami',
                    ],
                })
            )
        ).toEqual(['mommy', 'tummy-tuck', 'breast-aug'])
    })

    it('keeps the query order inside the related tier, whatever the slug order', () => {
        expect(
            ids(
                selectProcedureReviews(REVIEWS, MM, {
                    relatedSlugs: [
                        'liposuction-miami',
                        'breast-augmentation-miami',
                        'tummy-tuck-miami',
                    ],
                    limit: 5,
                })
            )
        ).toEqual([
            'mommy',
            'tummy-tuck',
            'breast-aug',
            'liposuction',
            'general-1',
        ])
    })

    it('lists a review that names this procedure and a related one once, in the first tier', () => {
        const both = review('both', 'Mommy makeover: tummy tuck and lipo.')
        expect(
            ids(
                selectProcedureReviews([both, ...REVIEWS], MM, {
                    relatedSlugs: ['tummy-tuck-miami'],
                    limit: 4,
                })
            )
        ).toEqual(['both', 'mommy', 'tummy-tuck', 'general-1'])
    })

    it('is unchanged by an empty relatedSlugs', () => {
        expect(
            selectProcedureReviews(REVIEWS, MM, { relatedSlugs: [] })
        ).toEqual(selectProcedureReviews(REVIEWS, MM))
    })

    it('never lets a related review name an unknown slug', () => {
        expect(
            ids(
                selectProcedureReviews(REVIEWS, MM, {
                    relatedSlugs: ['not-a-procedure'],
                })
            )
        ).toEqual(['mommy', 'general-1', 'tummy-tuck'])
    })
})
