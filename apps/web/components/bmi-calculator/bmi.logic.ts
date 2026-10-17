/**
 * The BMI calculator's arithmetic: BMI from either unit system, the CDC
 * category, where a BMI stands against each procedure's recommended range,
 * the weight that reaches it, and the `calculator_use` event's parameters.
 *
 * Formulas from the CDC (`cdc-bmi-formula` in `bmi.facts.ts`): kg / m², or
 * lb / in² × 703. The weekly pace in `weeksAtCdcPace` is the CDC's "about 1
 * to 2 pounds a week" (`cdc-losing-weight`).
 *
 * Pure: no React, no page state, so a unit test can read it and the client
 * component stays small.
 *
 * @module
 */

export type UnitSystem = 'imperial' | 'metric'

/** The fields the calculator needs from `BMI_PROCEDURES`. */
export type CalculatorProcedure = {
    id: string
    name: string
    href: string
    chat: string
    limit: number
    bound: 'under' | 'atMost'
}

const CM_PER_INCH = 2.54
const KG_PER_LB = 0.45359237

/** Heights and weights outside these are typos, not people. */
const HEIGHT_CM = { min: 120, max: 230 } as const
const WEIGHT_KG = { min: 30, max: 320 } as const

/** The CDC's underweight line. */
export const UNDERWEIGHT_BELOW = 18.5

/** Parse a field: blank, negative or non-numeric is "not entered". */
export function readNumber(raw: string): number | null {
    if (raw.trim() === '') return null
    const value = Number(raw.replace(',', '.'))
    return Number.isFinite(value) && value >= 0 ? value : null
}

export type Measurements = {
    /** Height in centimeters. */
    heightCm: number
    /** Weight in kilograms. */
    weightKg: number
}

export type CalculatorInput =
    | { unit: 'imperial'; feet: string; inches: string; pounds: string }
    | { unit: 'metric'; centimeters: string; kilograms: string }

/**
 * The entered height and weight in metric, or `null` while a field is empty
 * or the values can't belong to an adult.
 */
export function toMeasurements(input: CalculatorInput): Measurements | null {
    let heightCm: number
    let weightKg: number

    if (input.unit === 'imperial') {
        const feet = readNumber(input.feet)
        const inches = readNumber(input.inches) ?? 0
        const pounds = readNumber(input.pounds)
        if (feet === null || pounds === null) return null
        heightCm = (feet * 12 + inches) * CM_PER_INCH
        weightKg = pounds * KG_PER_LB
    } else {
        const centimeters = readNumber(input.centimeters)
        const kilograms = readNumber(input.kilograms)
        if (centimeters === null || kilograms === null) return null
        heightCm = centimeters
        weightKg = kilograms
    }

    if (heightCm < HEIGHT_CM.min || heightCm > HEIGHT_CM.max) return null
    if (weightKg < WEIGHT_KG.min || weightKg > WEIGHT_KG.max) return null
    return { heightCm, weightKg }
}

/** BMI to one decimal, the way the page prints and compares it. */
export function bmiOf({ heightCm, weightKg }: Measurements): number {
    const meters = heightCm / 100
    return Math.round((weightKg / (meters * meters)) * 10) / 10
}

export type BmiCategory = {
    key: 'underweight' | 'healthy' | 'overweight' | 'obesity' | 'severe'
    label: string
}

/** The CDC's adult category (`cdc-bmi-categories`). */
export function bmiCategory(bmi: number): BmiCategory {
    if (bmi < UNDERWEIGHT_BELOW)
        return { key: 'underweight', label: 'Underweight' }
    if (bmi < 25) return { key: 'healthy', label: 'Healthy weight' }
    if (bmi < 30) return { key: 'overweight', label: 'Overweight' }
    if (bmi < 40) return { key: 'obesity', label: 'Obesity' }
    return { key: 'severe', label: 'Severe obesity' }
}

/** The highest BMI, to one decimal, still inside a procedure's range. */
export function targetBmi(procedure: CalculatorProcedure): number {
    return procedure.bound === 'under'
        ? Math.round((procedure.limit - 0.1) * 10) / 10
        : procedure.limit
}

export function isWithinRange(
    bmi: number,
    procedure: CalculatorProcedure
): boolean {
    return procedure.bound === 'under'
        ? bmi < procedure.limit
        : bmi <= procedure.limit
}

export type ProcedureStanding =
    | { status: 'low' }
    | { status: 'in' }
    | {
          status: 'above'
          /** BMI points above the range's top. */
          points: number
          /** Weight to lose to reach `targetBmi`, in kilograms. */
          toLoseKg: number
      }

/**
 * Where a BMI stands for one procedure. Under 18.5 is its own case: the
 * question becomes whether there is enough tissue (or fat to move), which
 * only an exam answers.
 */
export function procedureStanding(
    measurements: Measurements,
    procedure: CalculatorProcedure
): ProcedureStanding {
    const bmi = bmiOf(measurements)
    if (bmi < UNDERWEIGHT_BELOW) return { status: 'low' }
    if (isWithinRange(bmi, procedure)) return { status: 'in' }

    const target = targetBmi(procedure)
    const meters = measurements.heightCm / 100
    const targetKg = target * meters * meters
    return {
        status: 'above',
        points: Math.round((bmi - target) * 10) / 10,
        toLoseKg: Math.max(0, measurements.weightKg - targetKg),
    }
}

/** A procedure's name mid-sentence: "your tummy tuck", "your BBL". */
export function nameInSentence(name: string): string {
    return /^[A-Z]{2,}\b/.test(name) ? name : name.toLowerCase()
}

/** A weight as the visitor entered weights: whole pounds or kilograms. */
export function formatWeight(kg: number, unit: UnitSystem): string {
    return unit === 'imperial'
        ? `${Math.max(1, Math.round(kg / KG_PER_LB))} lbs`
        : `${Math.max(1, Math.round(kg))} kg`
}

/** Weeks to lose `kg` at the CDC's 1–2 lb a week, as [fastest, slowest]. */
export function weeksAtCdcPace(kg: number): [number, number] {
    // From the whole pounds the row prints, so the two always agree.
    const pounds = Math.max(1, Math.round(kg / KG_PER_LB))
    return [Math.max(1, Math.ceil(pounds / 2)), pounds]
}

/** The scale under the number runs from BMI 15 to 45. */
export const SCALE = { min: 15, max: 45 } as const

/** The marker's position on the scale, 0–100. */
export function scalePosition(bmi: number): number {
    const clamped = Math.min(SCALE.max, Math.max(SCALE.min, bmi))
    return ((clamped - SCALE.min) / (SCALE.max - SCALE.min)) * 100
}

/** The CDC band a BMI falls in, for the event: never the BMI itself. */
export function bmiBand(bmi: number): string {
    if (bmi < UNDERWEIGHT_BELOW) return 'under-18.5'
    if (bmi < 25) return '18.5-24.9'
    if (bmi < 30) return '25-29.9'
    if (bmi < 35) return '30-34.9'
    if (bmi < 40) return '35-39.9'
    return '40-plus'
}

/**
 * The `calculator_use` event's parameters: the band and how many of the
 * procedures it falls inside, never a height, a weight or the exact BMI.
 */
export function calculatorEventParams(
    measurements: Measurements,
    unit: UnitSystem,
    procedures: readonly CalculatorProcedure[]
): Record<string, string | number> {
    const bmi = bmiOf(measurements)
    return {
        calculator: 'bmi',
        unit_system: unit,
        bmi_band: bmiBand(bmi),
        procedures_in_range: procedures.filter(
            (procedure) =>
                procedureStanding(measurements, procedure).status === 'in'
        ).length,
    }
}
