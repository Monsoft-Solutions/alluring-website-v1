import { describe, expect, it } from 'vitest'

import { formatProcedureFigure } from '@/lib/data/procedures/facts/procedure-facts'
import { procedureCopyConfigs } from '@/scripts/procedure-copy.config'
import { extractFigures } from '@/scripts/procedure-copy-figures'

/** `unit:min-max` for each figure, the keys the sweep checks facts by. */
function read(
    text: string,
    identifiers?: Parameters<typeof extractFigures>[1]
) {
    const { figures, stray } = extractFigures(text, identifiers)
    return {
        figures: figures.map((f) => `${f.unit}:${f.min}-${f.max}`),
        stray,
    }
}

describe('extractFigures: implant and fat volumes in cc', () => {
    it.each([
        ['A 300 cc implant', 'cc:300-300'],
        ['A 300cc implant', 'cc:300-300'],
        ['Most choose 300 to 400 cc', 'cc:300-400'],
        ['Most choose 300–400cc', 'cc:300-400'],
        ['About 350 ccs each', 'cc:350-350'],
        ['At most 4,000 cc of fat', 'cc:4000-4000'],
        ['Up to 1,000 cubic centimeters', 'cc:1000-1000'],
    ])('%s', (text, key) => {
        expect(read(text)).toEqual({ figures: [key], stray: [] })
    })
})

describe('extractFigures: ages', () => {
    it.each([
        ['Silicone implants are for women 22 or older.', 'age:22-22'],
        ['Saline implants are approved from 18 and older.', 'age:18-18'],
        ['You must be 18 and over', 'age:18-18'],
        ['approved for women age 22 or older', 'age:22-22'],
        ['approved for women aged 18 and up', 'age:18-18'],
        ['under the age of 18', 'age:18-18'],
        ['for ages 18 to 22', 'age:18-22'],
        ['at least 22 years old', 'age:22-22'],
        ['women 22 years of age or older', 'age:22-22'],
        ['22 years or older', 'age:22-22'],
    ])('%s', (text, key) => {
        expect(read(text)).toEqual({ figures: [key], stray: [] })
    })

    it('leaves a bare "22 years" a duration', () => {
        expect(read('Implants can last 10 to 20 years').figures).toEqual([
            'year:10-20',
        ])
    })

    it('reads no age inside "average" or "stage"', () => {
        expect(read('The average stage 2 result').stray).toEqual(['2'])
    })
})

describe('extractFigures: nights', () => {
    it.each([
        ['Plan on 3 nights in Miami', 'night:3-3'],
        ['Plan on three nights in Miami', 'night:3-3'],
        ['Stay 5 to 7 nights', 'night:5-7'],
        ['Stay five to seven nights', 'night:5-7'],
        ['One night in the surgery center', 'night:1-1'],
        ['Someone stays with you the first night', 'night:1-1'],
    ])('%s', (text, key) => {
        expect(read(text)).toEqual({ figures: [key], stray: [] })
    })

    it('counts "how many nights" as no figure', () => {
        expect(read('Your surgeon tells you how many nights to stay')).toEqual({
            figures: [],
            stray: [],
        })
    })
})

describe('extractFigures: inches', () => {
    it.each([
        ['A 2-inch incision', 'inch:2-2'],
        ['A two-inch incision', 'inch:2-2'],
        ['An incision 1 to 2 inches long', 'inch:1-2'],
        ['about 1.5 inches', 'inch:1.5-1.5'],
        ['1 inch above the crease', 'inch:1-1'],
    ])('%s', (text, key) => {
        expect(read(text)).toEqual({ figures: [key], stray: [] })
    })

    it('reads no inch inside another word', () => {
        expect(read('Expect a 2 pinch test').stray).toEqual(['2'])
    })
})

describe('extractFigures: existing units are unchanged', () => {
    it.each([
        ['Most people return to work 10 to 14 days after', ['day:10-14']],
        [
            'Starting at $5,500, most pay $5,500–$10,000',
            ['usd:5500-5500', 'usd:5500-10000'],
        ],
        ['minor complications in 3.58% of patients', ['percent:3.58-3.58']],
        ['wear it 23 hours a day for 6 weeks', ['hour:23-23', 'week:6-6']],
        ['the second month', ['month:2-2']],
        ['a BMI of 30', ['bmi:30-30']],
        ['25 deaths in 38 studies', ['death:25-25', 'study:38-38']],
    ])('%s', (text, keys) => {
        expect(read(text)).toEqual({ figures: keys, stray: [] })
    })

    it('treats page identifiers and "Lipo 360" as names, not figures', () => {
        const identifiers = [[/§\s*458\.328/g, ' statute ']] as const
        expect(
            read('Florida Statutes §458.328 and Lipo 360', identifiers)
        ).toEqual({
            figures: [],
            stray: [],
        })
    })

    it('still fails a number with no unit', () => {
        expect(read('Choose from 4 options').stray).toEqual(['4'])
    })
})

describe('formatProcedureFigure: the new units', () => {
    it.each([
        [{ value: 3, unit: 'night' } as const, '3 nights'],
        [{ value: 1, unit: 'night' } as const, '1 night'],
        [{ min: 5, max: 7, unit: 'night' } as const, '5–7 nights'],
        [{ value: 2, unit: 'inch' } as const, '2 inches'],
        [{ value: 1, unit: 'inch' } as const, '1 inch'],
        [{ value: 22, unit: 'age' } as const, 'age 22'],
        [{ min: 18, max: 22, unit: 'age' } as const, 'ages 18–22'],
        [{ value: 300, unit: 'cc' } as const, '300 cc'],
    ])('%j', (figure, text) => {
        expect(formatProcedureFigure(figure)).toBe(text)
    })

    it('formats each new unit so the sweep reads it back as the same figure', () => {
        for (const figure of [
            { value: 3, unit: 'night' },
            { min: 5, max: 7, unit: 'night' },
            { value: 2, unit: 'inch' },
            { value: 22, unit: 'age' },
            { min: 18, max: 22, unit: 'age' },
            { min: 300, max: 400, unit: 'cc' },
        ] as const) {
            const { figures, stray } = extractFigures(
                formatProcedureFigure(figure)
            )
            const [min, max] =
                'value' in figure
                    ? [figure.value, figure.value]
                    : [figure.min, figure.max]
            expect({
                figures: figures.map((f) => `${f.unit}:${f.min}-${f.max}`),
                stray,
            }).toEqual({
                figures: [`${figure.unit}:${min}-${max}`],
                stray: [],
            })
        }
    })
})

describe("BBL's volume rule", () => {
    const rule = procedureCopyConfigs[
        'brazilian-butt-lift-bbl-miami'
    ]!.rules!.find((r) => r.rule === 'volume-figure')!

    it.each([
        '300 cc',
        '350 ccs',
        '500 ml',
        'in cubic centimeters',
        'a bmi of 30',
    ])('still fails "%s" on the BBL page', (text) => {
        expect(rule.re.test(text)).toBe(true)
    })

    it('leaves words that contain the letters alone', () => {
        expect(rule.re.test('accent, accurate, html')).toBe(false)
    })
})
