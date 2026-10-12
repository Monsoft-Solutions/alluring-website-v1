import { describe, expect, it } from 'vitest'

import {
    BAND_SIZES,
    CC_PER_CUP_NARROW,
    CC_PER_CUP_WIDE,
    CURRENT_CUPS,
    DESIRED_CUPS,
} from '@/components/calculators/implant-size/implant-size.facts'
import {
    calculatorEventParams,
    ccPerCupForBand,
    cupsBetween,
    estimateImplantSize,
} from '@/components/calculators/implant-size/implant-size.logic'

/**
 * The breast implant size calculator's estimate. The per-cup figures are King
 * et al. 2017 (Plast Reconstr Surg 139:1084): 130 cc on narrower bands, 150 cc
 * on wider ones. The range is ±15 cc per cup, rounded outward to 10 cc.
 */
describe('ccPerCupForBand', () => {
    it('uses the narrow-band figure at band 32 and below', () => {
        expect(ccPerCupForBand(30)).toBe(CC_PER_CUP_NARROW)
        expect(ccPerCupForBand(32)).toBe(130)
    })

    it('uses the wide-band figure at band 38 and above', () => {
        expect(ccPerCupForBand(38)).toBe(CC_PER_CUP_WIDE)
        expect(ccPerCupForBand(42)).toBe(150)
    })

    it('rises in a straight line between them', () => {
        expect(ccPerCupForBand(34)).toBeCloseTo(136.67, 2)
        expect(ccPerCupForBand(36)).toBeCloseTo(143.33, 2)
    })

    it('never falls as the band grows', () => {
        const figures = BAND_SIZES.map(ccPerCupForBand)
        for (let i = 1; i < figures.length; i++) {
            expect(figures[i]).toBeGreaterThanOrEqual(figures[i - 1] ?? 0)
        }
    })
})

describe('cupsBetween', () => {
    it('counts US cup steps, DD and DDD included', () => {
        expect(cupsBetween('A', 'C')).toBe(2)
        expect(cupsBetween('D', 'DD')).toBe(1)
        expect(cupsBetween('AA', 'DDD')).toBe(6)
        expect(cupsBetween('C', 'B')).toBe(-1)
    })
})

describe('estimateImplantSize', () => {
    it('gives 34B → 34D as 240–310 cc', () => {
        // 2 × (136.67 ± 15) = 243.3–303.3, rounded outward.
        const estimate = estimateImplantSize({
            band: 34,
            currentCup: 'B',
            desiredCup: 'D',
        })
        expect(estimate).toMatchObject({
            cupsAdded: 2,
            lowCc: 240,
            highCc: 310,
            beyondStudy: false,
        })
        expect(estimate?.ccPerCup).toBeCloseTo(136.67, 2)
    })

    it('gives one cup on a narrow band as 110–150 cc', () => {
        const estimate = estimateImplantSize({
            band: 32,
            currentCup: 'A',
            desiredCup: 'B',
        })
        expect(estimate).toMatchObject({ lowCc: 110, highCc: 150 })
    })

    it('gives one cup on a wide band as 130–170 cc', () => {
        const estimate = estimateImplantSize({
            band: 40,
            currentCup: 'C',
            desiredCup: 'D',
        })
        expect(estimate).toMatchObject({ lowCc: 130, highCc: 170 })
    })

    it('always keeps the published 130–150 cc per cup inside the range', () => {
        for (const band of BAND_SIZES) {
            const estimate = estimateImplantSize({
                band,
                currentCup: 'A',
                desiredCup: 'B',
            })
            expect(estimate?.lowCc).toBeLessThanOrEqual(130)
            expect(estimate?.highCc).toBeGreaterThanOrEqual(150)
        }
    })

    it('returns ranges in whole 10 cc steps, low below high', () => {
        for (const band of BAND_SIZES) {
            for (const currentCup of CURRENT_CUPS) {
                for (const desiredCup of DESIRED_CUPS) {
                    const estimate = estimateImplantSize({
                        band,
                        currentCup,
                        desiredCup,
                    })
                    if (!estimate) continue
                    expect(estimate.lowCc % 10).toBe(0)
                    expect(estimate.highCc % 10).toBe(0)
                    expect(estimate.lowCc).toBeLessThan(estimate.highCc)
                }
            }
        }
    })

    it('grows with the cups added at a fixed band', () => {
        const one = estimateImplantSize({
            band: 36,
            currentCup: 'A',
            desiredCup: 'B',
        })
        const three = estimateImplantSize({
            band: 36,
            currentCup: 'A',
            desiredCup: 'D',
        })
        expect(three!.lowCc).toBeGreaterThan(one!.highCc)
    })

    it('returns null when the wish is not an increase', () => {
        expect(
            estimateImplantSize({ band: 34, currentCup: 'C', desiredCup: 'C' })
        ).toBeNull()
        expect(
            estimateImplantSize({ band: 34, currentCup: 'D', desiredCup: 'B' })
        ).toBeNull()
    })

    it('flags more cups than the study measured as rough', () => {
        expect(
            estimateImplantSize({ band: 34, currentCup: 'A', desiredCup: 'DD' })
                ?.beyondStudy
        ).toBe(false)
        expect(
            estimateImplantSize({
                band: 34,
                currentCup: 'AA',
                desiredCup: 'DDD',
            })?.beyondStudy
        ).toBe(true)
    })
})

describe('calculatorEventParams', () => {
    it('sends buckets and letters only', () => {
        const input = { band: 36, currentCup: 'A', desiredCup: 'C' } as const
        const estimate = estimateImplantSize(input)!
        expect(calculatorEventParams(input, estimate)).toEqual({
            calculator: 'breast_implant_size',
            band_bucket: '34-36',
            current_cup: 'A',
            desired_cup: 'C',
            cups_added: 2,
            estimate_bucket_cc: 300,
        })
    })

    it('buckets the narrow and wide bands', () => {
        const narrow = { band: 30, currentCup: 'A', desiredCup: 'B' } as const
        const wide = { band: 42, currentCup: 'A', desiredCup: 'B' } as const
        expect(
            calculatorEventParams(narrow, estimateImplantSize(narrow)!)
                .band_bucket
        ).toBe('30-32')
        expect(
            calculatorEventParams(wide, estimateImplantSize(wide)!).band_bucket
        ).toBe('38+')
    })
})
