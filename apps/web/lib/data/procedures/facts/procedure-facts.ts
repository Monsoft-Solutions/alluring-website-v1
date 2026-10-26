/**
 * The shape of a procedure's facts file: every figure a procedure page may
 * publish, stated once, with its sources and the attribution the copy must
 * use.
 *
 * A page module reads its figures from its facts file (`bbl.facts.ts` is the
 * first), and `scripts/check-procedure-copy.ts` fails any copy on the built
 * page that states a %, $, time, count, volume, length or age figure the
 * file does not declare, or uses a declared figure in a sentence about
 * something else.
 *
 * Pure data: no imports from `@/env`, Next or React, so a tsx script can read
 * it.
 *
 * Alluring's own prices are not typed in the facts files (issue #354): their
 * price facts read the 2026-09-15 sheet in `@workspace/shared/claims/prices`
 * through {@link sheetUsd}, so a fact and the sheet can't drift. That sheet is
 * the list-price fallback; pages print the live price, with any discount the
 * admin sets, through the pricing resolver. The ASPS national averages are
 * not Alluring prices and stay typed, with their attribution.
 *
 * @module
 */
import {
    DEFAULT_BBL_TYPICAL_MAX_USD,
    DEFAULT_COMBO_DISCOUNTS,
    PRICE_SHEET,
} from '@workspace/shared/claims/prices'
import { formatUsd } from '@workspace/shared/claims/pricing'

/**
 * The list price of one price-sheet line, e.g. `sheetUsd('tummy-tuck',
 * 'mini')` → 3000. Throws on an unknown line, so a renamed key fails the
 * build instead of publishing a stale figure.
 */
export function sheetUsd(procedure: string, key: string): number {
    const line = PRICE_SHEET.find(
        (candidate) =>
            candidate.procedure === procedure && candidate.key === key
    )
    if (!line) throw new Error(`No price-sheet line ${procedure}:${key}`)
    return line.usd
}

/** The lowest and highest list price of a set of price-sheet lines. */
export function sheetUsdRange(
    procedure: string,
    keep: (key: string) => boolean
): { min: number; max: number } {
    const prices = PRICE_SHEET.filter(
        (line) => line.procedure === procedure && keep(line.key)
    ).map((line) => line.usd)
    if (prices.length === 0)
        throw new Error(`No price-sheet lines for ${procedure}`)
    return { min: Math.min(...prices), max: Math.max(...prices) }
}

/** "$5,500", the way the sheet's figures are written in a fact's statement. */
export const formatSheetUsd = formatUsd

/** The top of BBL's "most patients pay" range, and the combination discounts. */
export { DEFAULT_BBL_TYPICAL_MAX_USD, DEFAULT_COMBO_DISCOUNTS }

export type FigureUnit =
    | 'percent'
    | 'usd'
    | 'minute'
    | 'hour'
    | 'day'
    /** Nights of a stay, e.g. how long to stay in Miami. */
    | 'night'
    | 'week'
    | 'month'
    | 'year'
    | 'death'
    | 'study'
    | 'patient'
    /** A volume: fat removed or transferred, an implant's size. */
    | 'cc'
    | 'bmi'
    /** A length, e.g. an incision. */
    | 'inch'
    /** A minimum or maximum age, e.g. "22 or older". */
    | 'age'
    /** A temperature, e.g. a fever threshold: "101°F". */
    | 'fahrenheit'

/** One figure: a single value or an inclusive range, in one unit. */
export type ProcedureFigure =
    | { value: number; unit: FigureUnit }
    | { min: number; max: number; unit: FigureUnit }

export type FactTopic =
    | 'recovery'
    | 'results'
    | 'safety'
    | 'law'
    | 'procedure'
    | 'price'

/** One published source a page's figures rest on. */
export interface ProcedureSource<SourceId extends string = string> {
    id: SourceId
    /** Who published it, as the page names it inline. */
    publisher: string
    /** Title of the page or article, when verified. */
    title?: string
    /** Authors, for journal articles. */
    authors?: string
    /** Publication or review date (ISO, or a year when that is all we have). */
    date?: string
    url?: string
    /** How the copy must attribute figures from this source. */
    attribution: string
}

export interface ProcedureFact<SourceId extends string = string> {
    id: string
    topic: FactTopic
    /**
     * Every figure the fact licenses the copy to state, in every form the copy
     * uses. "Day 2" and "days 1–2" are different figures, so both are listed.
     */
    figures: readonly ProcedureFigure[]
    /**
     * Words a sentence must contain for one of these figures to be read as
     * this fact. "3–5 days" is licensed next to "infection", not next to
     * "swelling". Lowercase stems, matched as substrings.
     */
    concepts: readonly string[]
    /** Calendar years the statement names (study windows, report years). */
    years?: readonly number[]
    /** The sentence as it may be published, with its attribution. */
    statement: string
    sourceIds: readonly SourceId[]
    /** What the copy must not say, or the caveat it must carry. */
    caveat?: string
}

const UNIT_LABELS: Record<FigureUnit, [singular: string, plural: string]> = {
    percent: ['%', '%'],
    usd: ['', ''],
    minute: ['minute', 'minutes'],
    hour: ['hour', 'hours'],
    day: ['day', 'days'],
    night: ['night', 'nights'],
    week: ['week', 'weeks'],
    month: ['month', 'months'],
    year: ['year', 'years'],
    death: ['death', 'deaths'],
    study: ['study', 'studies'],
    patient: ['patient', 'patients'],
    cc: ['cc', 'cc'],
    bmi: ['BMI', 'BMI'],
    inch: ['inch', 'inches'],
    age: ['age', 'ages'],
    fahrenheit: ['°F', '°F'],
}

function formatNumber(value: number, unit: FigureUnit): string {
    const text = value.toLocaleString('en-US', { maximumFractionDigits: 2 })
    return unit === 'usd' ? `$${text}` : text
}

/**
 * A figure as copy writes it: "$5,500", "$5,500–$10,000", "10–14 days",
 * "50–80%", "8 weeks", "300 cc", "BMI 30", "3 nights", "2 inches",
 * "age 22". The copy sweep also reads an age as "22 or older" or "22 years
 * old", and an inch as "2-inch".
 */
export function formatProcedureFigure(figure: ProcedureFigure): string {
    const [singular, plural] = UNIT_LABELS[figure.unit]
    const range = (min: number, max: number) =>
        `${formatNumber(min, figure.unit)}–${formatNumber(max, figure.unit)}`

    if (figure.unit === 'percent') {
        return 'value' in figure
            ? `${formatNumber(figure.value, 'percent')}%`
            : `${range(figure.min, figure.max)}%`
    }
    if (figure.unit === 'usd') {
        return 'value' in figure
            ? formatNumber(figure.value, 'usd')
            : `${formatNumber(figure.min, 'usd')}–${formatNumber(figure.max, 'usd')}`
    }
    if (figure.unit === 'bmi') {
        return 'value' in figure
            ? `BMI ${formatNumber(figure.value, 'bmi')}`
            : `BMI ${range(figure.min, figure.max)}`
    }
    if (figure.unit === 'fahrenheit') {
        return 'value' in figure
            ? `${formatNumber(figure.value, 'fahrenheit')}°F`
            : `${range(figure.min, figure.max)}°F`
    }
    if (figure.unit === 'age') {
        return 'value' in figure
            ? `${singular} ${formatNumber(figure.value, 'age')}`
            : `${plural} ${range(figure.min, figure.max)}`
    }
    if ('value' in figure) {
        return `${formatNumber(figure.value, figure.unit)} ${figure.value === 1 ? singular : plural}`
    }
    return `${range(figure.min, figure.max)} ${plural}`
}

/**
 * The lookups a page module uses on its facts: `fact(id)` and `figure(id)`,
 * the first (or `index`th) figure of a fact, formatted. Typed by the facts
 * array, so an unknown id fails the build.
 */
export function createFactLookups<const Facts extends readonly ProcedureFact[]>(
    facts: Facts,
    label: string
) {
    type FactId = Facts[number]['id']

    function fact(id: FactId): Facts[number] {
        const found = facts.find((candidate) => candidate.id === id)
        if (!found) throw new Error(`Unknown ${label} fact: ${id}`)
        return found
    }

    function figure(id: FactId, index = 0): string {
        const found = fact(id).figures[index]
        if (!found)
            throw new Error(`${label} fact ${id} has no figure ${index}`)
        return formatProcedureFigure(found)
    }

    return { fact, figure }
}
