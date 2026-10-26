/**
 * Typed Alluring prices (issue #354): every writer of DB text finds them,
 * and the pipeline and the post migration turn the ones that fit one price
 * line into tokens that render the same figure.
 */
import { describe, expect, it } from 'vitest'

import { FALLBACK_PRICING } from '@workspace/shared/claims/prices'
import { resolveClaimTokens } from '@workspace/shared/claims/tokens'
import {
    convertTypedPrices,
    findTypedPrices,
} from '@workspace/shared/claims/typed-prices'

const render = (text: string) =>
    resolveClaimTokens(text, { mode: 'text', onIssue: () => {} })

describe('convertTypedPrices', () => {
    it.each([
        [
            'A BBL at Alluring starts at $5,500, and most patients pay between $5,500 and $10,000.',
            'A BBL at Alluring starts at [[price:bbl:lipo360-bbl]], and [[price-range:bbl]].',
        ],
        [
            'A mini tummy tuck is $3,000 and a full tummy tuck $4,500.',
            'A mini tummy tuck is [[price:tummy-tuck:mini]] and a full tummy tuck [[price:tummy-tuck:full]].',
        ],
        [
            'Implant removal added to another breast procedure is $500 per breast.',
            'Implant removal added to another breast procedure is [[price:breast-augmentation:implant-removal-added]].',
        ],
        [
            'Liposuction of one area added to another procedure is $500 to $1,500, depending on the area.',
            'Liposuction of one area added to another procedure is [[price-span:lipo:add-ons]], depending on the area.',
        ],
        [
            'When procedures are combined in one surgery, $500 comes off the total for two procedures and $1,000 for three.',
            '[[combo-discount]]',
        ],
    ])('writes %j as tokens', (typed, tokens) => {
        const result = convertTypedPrices(typed)
        expect(result.text).toBe(tokens)
        expect(result.remaining).toEqual([])
        // With no discount on, the page prints exactly what was typed.
        expect(render(result.text)).toBe(typed)
    })

    it('reads a table row against its section heading', () => {
        const table = [
            '## Breast augmentation cost',
            '',
            '| Option | Price |',
            '| --- | --- |',
            '| Saline | $3,500 |',
            '| Silicone | $4,500 |',
        ].join('\n')
        expect(convertTypedPrices(table).text).toContain(
            '| Saline | [[price:breast-augmentation:saline]] |'
        )
    })

    it('leaves a figure several lines share for a person, and reports it', () => {
        const text = 'Chin liposuction or pubic liposuction is $500.'
        const result = convertTypedPrices(text)
        expect(result.text).toBe(text)
        expect(result.remaining).toHaveLength(1)
    })

    it.each([
        // The paragraph names eyelid surgery, whose "both" line is $6,500,
        // but the sentence is about a BBL.
        'Eyelid surgery is popular here. A BBL with extra areas is $6,500.',
        // The section names breast reduction ($8,000 for a large one), but
        // the sentence is about a BBL.
        '## Breast reduction\n\nIt removes weight.\n\nA BBL revision is $8,000.',
    ])(
        'never ties a figure to a procedure the sentence does not name: %j',
        (text) => {
            const result = convertTypedPrices(text)
            expect(result.text).toBe(text)
            expect(result.converted).toEqual([])
            expect(result.remaining).toHaveLength(1)
            expect(result.remaining[0]?.suggestion).toBeNull()
        }
    )

    it('leaves a capitalised "Most patients pay" range for a person', () => {
        const text =
            'Most patients pay between $5,500 and $10,000 for a BBL at Alluring.'
        const result = convertTypedPrices(text)
        expect(result.text).toBe(text)
        // One issue for the phrase; its two figures are not reported again.
        expect(result.remaining).toHaveLength(1)
        expect(result.remaining[0]).toMatchObject({
            raw: 'Most patients pay between $5,500 and $10,000',
            suggestion: null,
        })
    })
})

describe('findTypedPrices', () => {
    it('ignores tokens, the ASPS averages and attributed third-party figures', () => {
        expect(
            findTypedPrices(
                "A BBL starts at [[price:bbl]]. ASPS puts the average surgeon's fee for a tummy tuck at $8,174."
            )
        ).toEqual([])
        expect(
            findTypedPrices('ASPS reports a national average of $5,500.')
        ).toEqual([])
    })

    it.each([
        'The national average in the US is $4,500 for breast augmentation.',
        'According to RealSelf, U.S. patients report paying $10,000 for a BBL.',
        'RealSelf reviewers across the US report an average of $5,500.',
    ])('reads "US" and "U.S." as the country, not the practice: %j', (text) => {
        expect(findTypedPrices(text)).toEqual([])
    })

    it('still reads a lowercase "us" as the practice', () => {
        expect(
            findTypedPrices(
                'ASPS lists a national figure, but a BBL with us starts at $5,500.'
            )
        ).toHaveLength(1)
    })

    it.each([
        'Other clinics charge $5,500 for a BBL.',
        'A big-name clinic in Miami can run $10,000 for a BBL.',
        'Some surgeons quote $4,500 or more for a tummy tuck.',
        'Elsewhere, a mini tummy tuck is $3,000.',
    ])('skips figures attributed to other practices: %j', (text) => {
        expect(findTypedPrices(text)).toEqual([])
    })

    it('reports, but never converts, a figure in a sentence comparing us with others', () => {
        const text = 'Other clinics charge more, but our BBL starts at $5,500.'
        const [issue, ...rest] = findTypedPrices(text)
        expect(rest).toEqual([])
        expect(issue).toMatchObject({ raw: '$5,500', suggestion: null })
        expect(convertTypedPrices(text).text).toBe(text)
    })

    it('flags a sheet figure the practice states as its own', () => {
        const [issue] = findTypedPrices('Our eyelid surgery starts at $3,500.')
        expect(issue).toMatchObject({
            raw: '$3,500',
            suggestion: '[[price:blepharoplasty:upper]]',
        })
    })

    it('checks against the pricing it is given', () => {
        const changed = {
            ...FALLBACK_PRICING,
            lines: FALLBACK_PRICING.lines.map((line) =>
                line.procedure === 'bbl' ? { ...line, usd: 6000 } : line
            ),
        }
        expect(
            findTypedPrices('A BBL starts at $6,000.', { pricing: changed })
        ).toHaveLength(1)
    })
})
