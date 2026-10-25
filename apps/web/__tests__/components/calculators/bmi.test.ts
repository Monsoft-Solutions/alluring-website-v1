import { describe, expect, it } from 'vitest'

import {
    bmiBand,
    bmiCategory,
    bmiOf,
    calculatorEventParams,
    formatWeight,
    nameInSentence,
    procedureStanding,
    readNumber,
    scalePosition,
    targetBmi,
    toMeasurements,
    weeksAtCdcPace,
    type CalculatorProcedure,
} from '@/components/bmi-calculator/bmi.logic'
import { BMI_PROCEDURES, bmiFacts, bmiSources } from '@/lib/data/bmi/bmi.facts'

const under30: CalculatorProcedure = {
    id: 'bbl',
    name: 'BBL',
    href: '/procedures/brazilian-butt-lift-bbl-miami',
    chat: 'bbl',
    limit: 30,
    bound: 'under',
}

const atMost35: CalculatorProcedure = {
    id: 'breast-reduction',
    name: 'Breast reduction',
    href: '/procedures/breast-reduction-miami',
    chat: 'breast-reduction',
    limit: 35,
    bound: 'atMost',
}

/** Measurements for a target BMI at 5′4″ (162.56 cm). */
const at = (bmi: number) => {
    const heightCm = 162.56
    return { heightCm, weightKg: bmi * (heightCm / 100) ** 2 }
}

describe('reading the fields', () => {
    it('treats blanks, negatives and text as not entered', () => {
        expect(readNumber('')).toBeNull()
        expect(readNumber('  ')).toBeNull()
        expect(readNumber('-5')).toBeNull()
        expect(readNumber('abc')).toBeNull()
        expect(readNumber('5,5')).toBe(5.5)
    })

    it('needs feet and pounds; inches default to zero', () => {
        expect(
            toMeasurements({
                unit: 'imperial',
                feet: '',
                inches: '4',
                pounds: '150',
            })
        ).toBeNull()
        expect(
            toMeasurements({
                unit: 'imperial',
                feet: '5',
                inches: '',
                pounds: '150',
            })
        ).not.toBeNull()
    })

    it('rejects heights and weights no adult has', () => {
        expect(
            toMeasurements({
                unit: 'metric',
                centimeters: '16',
                kilograms: '60',
            })
        ).toBeNull()
        expect(
            toMeasurements({
                unit: 'metric',
                centimeters: '165',
                kilograms: '600',
            })
        ).toBeNull()
    })
})

describe('BMI', () => {
    it('matches the CDC formula in both unit systems', () => {
        // 5′4″, 150 lb → 25.7 (CDC: lb ÷ in² × 703 = 25.75).
        const imperial = toMeasurements({
            unit: 'imperial',
            feet: '5',
            inches: '4',
            pounds: '150',
        })!
        expect(bmiOf(imperial)).toBe(25.7)
        // 170 cm, 70 kg → 24.2.
        const metric = toMeasurements({
            unit: 'metric',
            centimeters: '170',
            kilograms: '70',
        })!
        expect(bmiOf(metric)).toBe(24.2)
    })

    it('names the CDC category at each edge', () => {
        expect(bmiCategory(18.4).key).toBe('underweight')
        expect(bmiCategory(18.5).key).toBe('healthy')
        expect(bmiCategory(24.9).key).toBe('healthy')
        expect(bmiCategory(25).key).toBe('overweight')
        expect(bmiCategory(30).key).toBe('obesity')
        expect(bmiCategory(40).key).toBe('severe')
    })
})

describe('where a BMI stands for a procedure', () => {
    it.each([
        [22, 'in', 'in'],
        [29, 'in', 'in'],
        [29.9, 'in', 'in'],
        [30, 'above', 'in'],
        [33, 'above', 'in'],
        [35, 'above', 'in'],
        [35.1, 'above', 'above'],
        [38, 'above', 'above'],
        [17, 'low', 'low'],
    ] as const)('BMI %s: %s under 30, %s at 35 or under', (bmi, u30, a35) => {
        expect(procedureStanding(at(bmi), under30).status).toBe(u30)
        expect(procedureStanding(at(bmi), atMost35).status).toBe(a35)
    })

    it('gives the weight to reach the top of the range', () => {
        const standing = procedureStanding(at(33), under30)
        expect(standing.status).toBe('above')
        if (standing.status !== 'above') return
        expect(standing.points).toBe(3.1)
        // 3.1 BMI points at 1.6256 m ≈ 8.2 kg ≈ 18 lb.
        expect(formatWeight(standing.toLoseKg, 'imperial')).toBe('18 lbs')
        expect(formatWeight(standing.toLoseKg, 'metric')).toBe('8 kg')
        expect(weeksAtCdcPace(standing.toLoseKg)).toEqual([9, 18])
    })

    it('targets 29.9 for "under 30" and 35 for "35 or under"', () => {
        expect(targetBmi(under30)).toBe(29.9)
        expect(targetBmi(atMost35)).toBe(35)
    })
})

describe('the calculator_use event', () => {
    it('sends the band and the count in range, never the measurements', () => {
        const params = calculatorEventParams(at(29), 'imperial', BMI_PROCEDURES)
        expect(params).toEqual({
            calculator: 'bmi',
            unit_system: 'imperial',
            bmi_band: '25-29.9',
            procedures_in_range: 7,
        })
        expect(
            calculatorEventParams(at(33), 'metric', BMI_PROCEDURES)
                .procedures_in_range
        ).toBe(1)
        expect(bmiBand(17)).toBe('under-18.5')
        expect(bmiBand(41)).toBe('40-plus')
    })
})

describe('display helpers', () => {
    it('keeps acronyms in capitals mid-sentence', () => {
        expect(nameInSentence('BBL')).toBe('BBL')
        expect(nameInSentence('Tummy tuck')).toBe('tummy tuck')
        expect(nameInSentence('Lipo 360')).toBe('lipo 360')
    })

    it('clamps the scale to BMI 15–45', () => {
        expect(scalePosition(10)).toBe(0)
        expect(scalePosition(30)).toBe(50)
        expect(scalePosition(60)).toBe(100)
    })
})

describe('the facts behind the ranges', () => {
    it('cites only sources the file lists, each with a URL', () => {
        const ids = new Set(bmiSources.map((source) => source.id))
        for (const fact of bmiFacts) {
            for (const sourceId of fact.sourceIds) {
                expect(ids.has(sourceId), `${fact.id} → ${sourceId}`).toBe(true)
            }
        }
        for (const source of bmiSources) {
            expect(source.url, source.id).toMatch(/^https:\/\//)
        }
    })

    it('declares every procedure range in the recommended-ranges fact', () => {
        const ranges = bmiFacts.find(
            (fact) => fact.id === 'recommended-ranges'
        )!
        const limits = new Set(
            ranges.figures.map((figure) =>
                'value' in figure ? figure.value : -1
            )
        )
        for (const procedure of BMI_PROCEDURES) {
            expect(limits.has(procedure.limit), procedure.id).toBe(true)
        }
    })
})
