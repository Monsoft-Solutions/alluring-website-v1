/**
 * Breast implant size calculator: the estimate.
 *
 * cc per cup grows with the band, from 130 cc at band 32 and below to 150 cc
 * at band 38 and above, straight-line in between (King et al. 2017; see
 * `implant-size.facts.ts`). The estimate is that figure times the cups added,
 * ±15 cc per cup, rounded outward to 10 cc. Per breast.
 *
 * Pure and free of React, so the unit tests and any future page (the breast
 * augmentation procedure page, a standalone tool) share it.
 *
 * @module components/calculators/implant-size/implant-size.logic
 */
import {
    BAND_SIZES,
    type BandSize,
    CC_PER_CUP_NARROW,
    CC_PER_CUP_WIDE,
    CC_SPREAD_PER_CUP,
    CUP_SIZES,
    type CupSize,
    MAX_STUDIED_CUPS,
    NARROW_BAND,
    ROUND_TO_CC,
    WIDE_BAND,
} from './implant-size.facts'

export type ImplantSizeInput = {
    band: BandSize
    currentCup: CupSize
    desiredCup: CupSize
}

export type ImplantSizeEstimate = {
    /** Cup sizes added, at least 1. */
    cupsAdded: number
    /** The per-cup figure for this band, before the spread (unrounded). */
    ccPerCup: number
    /** Low end of the range, cc per breast, rounded down to 10. */
    lowCc: number
    /** High end of the range, cc per breast, rounded up to 10. */
    highCc: number
    /** More cups than the study measured: the result says it's rough. */
    beyondStudy: boolean
}

export function isBandSize(value: unknown): value is BandSize {
    return (BAND_SIZES as readonly unknown[]).includes(value)
}

export function isCupSize(value: unknown): value is CupSize {
    return (CUP_SIZES as readonly unknown[]).includes(value)
}

/** A cup's position in `CUP_SIZES` (AA = 0). */
export function cupIndex(cup: CupSize): number {
    return CUP_SIZES.indexOf(cup)
}

/** Cup sizes between two cups; zero or negative when there is no increase. */
export function cupsBetween(current: CupSize, desired: CupSize): number {
    return cupIndex(desired) - cupIndex(current)
}

/**
 * cc for one cup size at this band: 130 at band 32 and below, 150 at 38 and
 * above, on a straight line between.
 */
export function ccPerCupForBand(band: number): number {
    if (band <= NARROW_BAND) return CC_PER_CUP_NARROW
    if (band >= WIDE_BAND) return CC_PER_CUP_WIDE
    const share = (band - NARROW_BAND) / (WIDE_BAND - NARROW_BAND)
    return CC_PER_CUP_NARROW + share * (CC_PER_CUP_WIDE - CC_PER_CUP_NARROW)
}

/**
 * The estimated implant volume range for one breast, or null when the
 * desired cup isn't larger than the current one.
 */
export function estimateImplantSize(
    input: ImplantSizeInput
): ImplantSizeEstimate | null {
    const cupsAdded = cupsBetween(input.currentCup, input.desiredCup)
    if (cupsAdded < 1) return null

    const ccPerCup = ccPerCupForBand(input.band)
    const low = cupsAdded * (ccPerCup - CC_SPREAD_PER_CUP)
    const high = cupsAdded * (ccPerCup + CC_SPREAD_PER_CUP)

    return {
        cupsAdded,
        ccPerCup,
        lowCc: Math.floor(low / ROUND_TO_CC) * ROUND_TO_CC,
        highCc: Math.ceil(high / ROUND_TO_CC) * ROUND_TO_CC,
        beyondStudy: cupsAdded > MAX_STUDIED_CUPS,
    }
}

/**
 * The `calculator_use` event's parameters: buckets and letters only, never
 * anything that identifies the reader.
 */
export function calculatorEventParams(
    input: ImplantSizeInput,
    estimate: ImplantSizeEstimate
): Record<string, string | number> {
    return {
        calculator: 'breast_implant_size',
        band_bucket:
            input.band <= NARROW_BAND
                ? '30-32'
                : input.band >= WIDE_BAND
                  ? '38+'
                  : '34-36',
        current_cup: input.currentCup,
        desired_cup: input.desiredCup,
        cups_added: estimate.cupsAdded,
        // The midpoint to the nearest 50 cc, enough to see what readers ask for.
        estimate_bucket_cc:
            Math.round((estimate.lowCc + estimate.highCc) / 2 / 50) * 50,
    }
}
