/**
 * The admin Pricing page's form model (issue #354): what the page edits,
 * how it turns into a `PricingSnapshot` for the live preview, and the rules
 * a save must pass. Pure, so the page, the server action and the tests run
 * the same checks.
 *
 * What the page edits: each line's label, list price and active flag; each
 * procedure's starting line, discount and (BBL only) the top of its "most
 * patients pay" range; the site-wide default discount, the Fla. Stat.
 * 456.062 statement and the combination discounts. Line keys are never
 * edited: posts name them in claim tokens.
 *
 * @module lib/utils/pricing-form
 */
import { z } from 'zod'

import {
    CLAIM_PROCEDURES,
    buildPricingSnapshot,
    buildPricingSnapshotFromRows,
    TYPICAL_RANGE_PROCEDURES,
    type PricingRows,
} from '@workspace/shared/claims/prices'
import {
    MAX_DISCOUNT_PERCENT,
    PRICE_UNITS,
    type PricingSnapshot,
} from '@workspace/shared/claims/pricing'

/** The highest list price the form accepts, a guard against a typo. */
export const MAX_LINE_USD = 1_000_000

/** The longest 456.062 statement the form accepts. */
export const MAX_STATEMENT_LENGTH = 2000

const integer = z.number().int()

export const pricingFormLineSchema = z.object({
    key: z.string().regex(/^[a-z0-9][a-z0-9-]*$/),
    label: z.string(),
    usd: z.number(),
    unit: z.enum(PRICE_UNITS),
    addOn: z.boolean(),
    sort: integer,
    active: z.boolean(),
})

export const pricingFormProcedureSchema = z.object({
    procedure: z.string().regex(/^[a-z0-9][a-z0-9-]*$/),
    name: z.string(),
    startingLineKey: z.string().nullable(),
    discountPercent: z.number().nullable(),
    discountLabel: z.string(),
    notes: z.string(),
    typicalMaxUsd: z.number().nullable(),
    lines: z.array(pricingFormLineSchema),
})

/** The form's shape. The server action parses its input with this first. */
export const pricingFormSchema = z.object({
    defaultDiscountPercent: z.number(),
    discountStatement: z.string(),
    comboDiscountTwoUsd: z.number(),
    comboDiscountThreeUsd: z.number(),
    procedures: z.array(pricingFormProcedureSchema),
})

export type PricingFormLine = z.infer<typeof pricingFormLineSchema>
export type PricingFormProcedure = z.infer<typeof pricingFormProcedureSchema>
export type PricingFormValues = z.infer<typeof pricingFormSchema>

/** One problem that blocks a save, with the field it belongs to. */
export type PricingFormError = { path: string; message: string }

const PROCEDURE_NAMES = new Map<string, string>(
    CLAIM_PROCEDURES.map((procedure) => [procedure.key, procedure.name])
)

/** Claim procedures first, in page order; anything else after, by key. */
function procedureOrder(key: string): number {
    const index = CLAIM_PROCEDURES.findIndex(
        (procedure) => procedure.key === key
    )
    return index === -1 ? CLAIM_PROCEDURES.length : index
}

/**
 * The form's starting values from the pricing tables' rows. Empty tables
 * give the 2026-09-15 sheet, as the site itself would show.
 */
export function toPricingFormValues(
    rows: PricingRows & { notes?: Record<string, string | null> }
): PricingFormValues {
    const snapshot = buildPricingSnapshotFromRows(rows)
    const keys = [
        ...new Set([
            ...snapshot.lines.map((line) => line.procedure),
            ...Object.keys(snapshot.procedures),
        ]),
    ].sort(
        (a, b) => procedureOrder(a) - procedureOrder(b) || a.localeCompare(b)
    )

    return {
        defaultDiscountPercent: snapshot.defaultDiscountPercent,
        discountStatement: snapshot.discountStatement ?? '',
        comboDiscountTwoUsd: snapshot.comboDiscounts.two,
        comboDiscountThreeUsd: snapshot.comboDiscounts.three,
        procedures: keys.map((key) => {
            const settings = snapshot.procedures[key]
            return {
                procedure: key,
                name: PROCEDURE_NAMES.get(key) ?? key,
                startingLineKey: settings?.startingLineKey ?? null,
                discountPercent: settings?.discountPercent ?? null,
                discountLabel: settings?.discountLabel ?? '',
                notes: rows.notes?.[key] ?? '',
                typicalMaxUsd: settings?.typicalMaxUsd ?? null,
                lines: snapshot.lines
                    .filter((line) => line.procedure === key)
                    .map((line) => ({
                        key: line.key,
                        label: line.label,
                        usd: line.usd,
                        unit: line.unit,
                        addOn: line.addOn,
                        sort: line.sort,
                        active: line.active,
                    })),
            }
        }),
    }
}

/**
 * The snapshot the form's values would publish, for the live preview and
 * the warnings. Invalid numbers are clamped the way the resolver would read
 * them, so the preview never throws while someone is typing.
 */
export function toPricingSnapshot(values: PricingFormValues): PricingSnapshot {
    return buildPricingSnapshot({
        source: 'db',
        lines: values.procedures.flatMap((procedure) =>
            procedure.lines.map((line) => ({
                procedure: procedure.procedure,
                key: line.key,
                label: line.label,
                usd: Number.isFinite(line.usd) ? Math.max(0, line.usd) : 0,
                unit: line.unit,
                addOn: line.addOn,
                sort: line.sort,
                active: line.active,
            }))
        ),
        procedures: values.procedures.map((procedure) => ({
            procedure: procedure.procedure,
            startingLineKey: procedure.startingLineKey,
            discountPercent: procedure.discountPercent,
            discountLabel: procedure.discountLabel,
            typicalMaxUsd: procedure.typicalMaxUsd,
        })),
        settings: {
            defaultDiscountPercent: values.defaultDiscountPercent,
            discountStatement: values.discountStatement,
            comboDiscountTwoUsd: values.comboDiscountTwoUsd,
            comboDiscountThreeUsd: values.comboDiscountThreeUsd,
            updatedAt: null,
        },
    })
}

function isPercent(value: number): boolean {
    return (
        Number.isInteger(value) && value >= 0 && value <= MAX_DISCOUNT_PERCENT
    )
}

function isWholeDollars(value: number, { min }: { min: number }): boolean {
    return Number.isInteger(value) && value >= min && value <= MAX_LINE_USD
}

/**
 * Every rule a save must pass. An empty list means the values can be saved;
 * the warnings (`getPricingWarnings`) are separate and never block a save.
 */
export function validatePricingForm(
    values: PricingFormValues
): PricingFormError[] {
    const errors: PricingFormError[] = []
    const percentMessage = `Use a whole number from 0 to ${MAX_DISCOUNT_PERCENT}.`

    if (!isPercent(values.defaultDiscountPercent)) {
        errors.push({ path: 'defaultDiscountPercent', message: percentMessage })
    }
    if (values.discountStatement.length > MAX_STATEMENT_LENGTH) {
        errors.push({
            path: 'discountStatement',
            message: `Keep the statement under ${MAX_STATEMENT_LENGTH} characters.`,
        })
    }
    for (const field of [
        'comboDiscountTwoUsd',
        'comboDiscountThreeUsd',
    ] as const) {
        if (!isWholeDollars(values[field], { min: 0 })) {
            errors.push({
                path: field,
                message: 'Use whole dollars, 0 or more.',
            })
        }
    }

    for (const procedure of values.procedures) {
        const at = `procedures.${procedure.procedure}`

        if (
            procedure.discountPercent !== null &&
            !isPercent(procedure.discountPercent)
        ) {
            errors.push({
                path: `${at}.discountPercent`,
                message: `${percentMessage} Leave it empty to use the site-wide default.`,
            })
        }
        if (procedure.discountLabel.length > 80) {
            errors.push({
                path: `${at}.discountLabel`,
                message: 'Keep the offer name under 80 characters.',
            })
        }

        for (const line of procedure.lines) {
            const lineAt = `${at}.lines.${line.key}`
            if (!isWholeDollars(line.usd, { min: 1 })) {
                errors.push({
                    path: `${lineAt}.usd`,
                    message: 'Use a whole-dollar price above 0.',
                })
            }
            const label = line.label.trim()
            if (!label || label.length > 160) {
                errors.push({
                    path: `${lineAt}.label`,
                    message: 'Give the line a name, up to 160 characters.',
                })
            } else if (/\[\[|\]\]|[{}<>"\n\r]/.test(label)) {
                // Posts and JSX attributes print the name as text: a quote
                // would end an attribute and a newline would break a table
                // row (#354).
                errors.push({
                    path: `${lineAt}.label`,
                    message:
                        'A line name cannot contain [[, ]], braces, angle brackets, double quotes or line breaks: posts print it as text.',
                })
            }
        }

        if (procedure.startingLineKey !== null) {
            const starting = procedure.lines.find(
                (line) => line.key === procedure.startingLineKey
            )
            if (!starting) {
                errors.push({
                    path: `${at}.startingLineKey`,
                    message: `"${procedure.startingLineKey}" is not a line of ${procedure.name}.`,
                })
            } else if (!starting.active) {
                errors.push({
                    path: `${at}.startingLineKey`,
                    message:
                        'The starting line is inactive. Choose an active line, or none.',
                })
            } else if (starting.addOn) {
                errors.push({
                    path: `${at}.startingLineKey`,
                    message:
                        'An add-on is never priced as a surgery on its own. Choose a standard line.',
                })
            }
        }

        if (procedure.typicalMaxUsd !== null) {
            const starting = procedure.lines.find(
                (line) => line.key === procedure.startingLineKey
            )
            if (!TYPICAL_RANGE_PROCEDURES.includes(procedure.procedure)) {
                errors.push({
                    path: `${at}.typicalMaxUsd`,
                    message:
                        'Only BBL publishes a "most patients pay" range. Leave it empty.',
                })
            } else if (!isWholeDollars(procedure.typicalMaxUsd, { min: 1 })) {
                errors.push({
                    path: `${at}.typicalMaxUsd`,
                    message: 'Use a whole-dollar price above 0.',
                })
            } else if (starting && procedure.typicalMaxUsd <= starting.usd) {
                errors.push({
                    path: `${at}.typicalMaxUsd`,
                    message:
                        'The top of the range must be above the starting price.',
                })
            }
        }
    }

    return errors
}

/** The errors for one field, for the form to show under it. */
export function errorFor(
    errors: readonly PricingFormError[],
    path: string
): string | undefined {
    return errors.find((error) => error.path === path)?.message
}
