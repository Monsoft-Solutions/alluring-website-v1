import { describe, expect, it } from 'vitest'

import { getPostProcedure } from '@/lib/blog/post-procedure.util'
import { getReaderStage } from '@/lib/blog/reader-stage.util'

/** The #295 fixtures, checked against every published title on 26 Sep. */
const FIXTURES = [
    [
        'How to Reduce Pubic Swelling After Tummy Tuck?',
        'tummy-tuck-miami',
        'recovering',
    ],
    [
        'Breast Implant Size Guide: Perfect CC Chart',
        'breast-augmentation-miami',
        'planning',
    ],
    [
        'When Can I Sleep Without a Bra After Breast Reduction?',
        'breast-reduction-miami',
        'recovering',
    ],
    [
        'Lymphatic Massage After Lipo: When to Start and How Many',
        'liposuction-miami',
        'recovering',
    ],
    [
        'Do BBLs Stink? What BBL Smell Is and How Long It Lasts',
        'brazilian-butt-lift-bbl-miami',
        'recovering',
    ],
    [
        'Lipo Foam and Boards: What They Do, How Long to Wear Them',
        'liposuction-miami',
        'recovering',
    ],
    [
        'What Is More Painful BBL or Tummy Tuck?',
        'brazilian-butt-lift-bbl-miami',
        'planning',
    ],
    [
        'Tummy Tuck vs Mommy Makeover Miami: Costs & Recovery',
        'tummy-tuck-miami',
        'recovering',
    ],
    [
        'Breast Lift vs Breast Reduction: Post-Pregnancy Miami Guide',
        'breast-lift-miami',
        'planning',
    ],
    [
        'Blepharoplasty and Facelift Miami: Rejuvenate Your Look',
        'blepharoplasty-miami',
        'planning',
    ],
    [
        'What Age Can You Get a BBL?',
        'brazilian-butt-lift-bbl-miami',
        'planning',
    ],
    ['Affordable Plastic Surgery Miami: Costs & Financing', null, 'planning'],
] as const

describe('getPostProcedure and getReaderStage', () => {
    for (const [title, slug, stage] of FIXTURES) {
        it(title, () => {
            expect(getPostProcedure(title)?.slug ?? null).toBe(slug)
            expect(getReaderStage(title)).toBe(stage)
        })
    }
})

describe('getPostProcedure', () => {
    it('gives the thread value, short name and recovery for a BBL post', () => {
        expect(getPostProcedure('How to Sleep After BBL')).toMatchObject({
            slug: 'brazilian-butt-lift-bbl-miami',
            chatValue: 'bbl',
            shortName: 'BBL',
            recovery: '10-14 days off work',
        })
    })

    it('prices only BBL and lipo, from the facts files', () => {
        const bbl = getPostProcedure('How Many Massages After BBL?')?.price
        expect(bbl).toMatchObject({ label: 'BBL', startingAt: '$5,500' })
        expect(bbl?.note).toContain('set for each patient')
        expect(
            getPostProcedure('How to Reduce Itching After Lipo')?.price
        ).toMatchObject({ label: 'Lipo 360', startingAt: '$4,000' })

        for (const title of [
            'How to Reduce Tightness After Tummy Tuck',
            'Breast Implant Size Guide: Perfect CC Chart',
            'Facelift Recovery Time Miami',
            'Mommy Makeover Recovery Timeline',
        ]) {
            expect(getPostProcedure(title)?.price, title).toBeNull()
        }
    })

    it('maps every procedure to a value the consultation thread offers', () => {
        const values = [
            'Mommy Makeover Recovery',
            'BBL Recovery',
            'Tummy Tuck Recovery',
            'Breast Reduction Recovery',
            'Breast Lift Recovery',
            'Breast Augmentation Recovery',
            'Liposuction Recovery',
            'Facelift Recovery',
            'Eyelid Surgery Recovery',
        ].map((title) => getPostProcedure(title)?.chatValue)

        expect(values).toEqual([
            'mommy-makeover',
            'bbl',
            'tummy-tuck',
            'breast-reduction',
            'breast-lift',
            'breast-augmentation',
            'liposuction',
            'facelift',
            'blepharoplasty',
        ])
    })

    it('does not read "lipo" inside another word', () => {
        expect(getPostProcedure('Understanding Lipoma Removal')).toBeNull()
    })

    it('reads implants and augmentation of another body part as not breast', () => {
        expect(
            getPostProcedure('Butt Implants vs BBL: Which Is Safer?')?.slug
        ).toBe('brazilian-butt-lift-bbl-miami')
        expect(getPostProcedure('Lip Augmentation Aftercare')).toBeNull()
        expect(getPostProcedure('Implant Removal Recovery')?.slug).toBe(
            'breast-augmentation-miami'
        )
    })
})

describe('getReaderStage', () => {
    it('reads "before and after" as results, not recovery', () => {
        expect(
            getReaderStage(
                'Breast Augmentation Before & After: Miami Natural Results'
            )
        ).toBe('planning')
        expect(getReaderStage('BBL Before and After Photos')).toBe('planning')
        expect(getReaderStage('Swelling Before and After Surgery')).toBe(
            'recovering'
        )
    })
})
