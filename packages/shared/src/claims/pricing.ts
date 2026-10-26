/**
 * Price math and formatting (claims canon §5 and the Decisions of 2026-10-25).
 *
 * Prices are DRY: the price-sheet lines, each procedure's "starting at" line
 * and its discount live in the database (admin → Pricing), and every surface
 * reads a {@link PricingSnapshot} from the resolver. The 2026-09-15 sheet in
 * `./prices` is the code fallback. This module holds the snapshot's types
 * and the pure functions over it. It imports no data, so a client island can
 * use the formatters without pulling the sheet into its bundle; client
 * components receive resolved values as props.
 *
 * **Discounts.** A procedure's `discountPercent` wins when set (0 included:
 * an explicit 0 switches the site-wide default off for that procedure);
 * `null` inherits `defaultDiscountPercent`. The discount applies to every
 * line of the procedure, add-ons included. A discounted price shows the list
 * price struck through, then the discounted price; plain-text surfaces give
 * "$4,400 (20% off $5,500)". A discount is a discounted-fee advertisement
 * under Fla. Stat. 456.062, so it travels with `discountStatement`
 * ({@link getPricingWarnings} flags a discount without one).
 *
 * **Rounding.** A discounted price is rounded *down* to whole dollars, so it
 * is never above list × (1 − percent): the advertised percentage is never
 * larger than the reduction the patient gets (Fla. Stat. 456.062, FDUTPA).
 * Percentages are whole numbers and sheet prices whole hundreds, so on the
 * sheet the figure is exact ("$4,185 (7% off $4,500)"). List prices are
 * never rounded.
 *
 * @module @workspace/shared/claims/pricing
 */

/** How a line's price is counted. */
export const PRICE_UNITS = [
    'each',
    'per-breast',
    'first-area',
    'additional-area',
] as const

export type PriceUnit = (typeof PRICE_UNITS)[number]

/** What follows the figure in copy: "$500 per breast". */
export const PRICE_UNIT_SUFFIX: Record<PriceUnit, string> = {
    each: '',
    'per-breast': 'per breast',
    'first-area': 'for the first area',
    'additional-area': 'for each additional area',
}

export function isPriceUnit(value: unknown): value is PriceUnit {
    return (PRICE_UNITS as readonly unknown[]).includes(value)
}

/** One line of the price sheet. */
export interface PriceLine {
    /** Claim procedure key, e.g. `bbl`, `tummy-tuck` (see `CLAIM_PROCEDURES`). */
    procedure: string
    /** Stable key, unique within the procedure, e.g. `mini`. */
    key: string
    /** How the line reads in a sentence: "mini tummy tuck (no muscle repair)". */
    label: string
    /** List price in whole US dollars. */
    usd: number
    unit: PriceUnit
    /** Priced on top of another procedure, never as a surgery on its own. */
    addOn: boolean
    sort: number
    /** Inactive lines are kept for the admin but never published. */
    active: boolean
}

/** A procedure's pricing choices. */
export interface ProcedurePriceSettings {
    procedure: string
    /** The line quoted as "starting at"; `null` publishes no starting price. */
    startingLineKey: string | null
    /** 0–90; `null` inherits the site-wide default. */
    discountPercent: number | null
    /** Optional short name for the offer, for components that show one. */
    discountLabel: string | null
    /**
     * Top of the "most patients pay" range. The canon publishes a range for
     * BBL only, so the snapshot builder drops it for every other procedure.
     */
    typicalMaxUsd: number | null
}

/** Everything a surface needs to print a price. Plain and serializable. */
export interface PricingSnapshot {
    /** `db` when read from the pricing tables, `fallback` for the code sheet. */
    source: 'db' | 'fallback'
    lines: readonly PriceLine[]
    procedures: Readonly<Record<string, ProcedurePriceSettings>>
    /** Applies to every procedure whose own `discountPercent` is `null`. */
    defaultDiscountPercent: number
    /** The Fla. Stat. 456.062 statement shown next to discounted prices. */
    discountStatement: string | null
    /** The fixed combination discount, in dollars off the total. */
    comboDiscounts: { two: number; three: number }
    /** ISO timestamp of the newest pricing edit, when known. */
    updatedAt: string | null
}

export const MAX_DISCOUNT_PERCENT = 90

/** Discounted prices are rounded down to this many dollars. */
export const PRICE_ROUNDING_USD = 1

/**
 * Procedures whose price is only ever quoted as a named line, never as
 * "starting at" (canon D2): there is no facelift-alone price, so the
 * facelift is quoted only as "A face and neck lift is $15,000". The
 * starting line still picks the line that is quoted, but the bare
 * `[[price:facelift]]` token is invalid, and every surface phrases the
 * figure with {@link formatNamedLineText}, never "from" or "starting at".
 */
export const NAMED_LINE_ONLY_PROCEDURES: readonly string[] = ['facelift']

/** Whether a procedure's price may only be quoted as its named line (D2). */
export function quotesAsNamedLine(procedure: string): boolean {
    return NAMED_LINE_ONLY_PROCEDURES.includes(procedure)
}

/**
 * Lines that price the same thing in two places on the sheet and must stay
 * equal: male breast reduction is printed under Breast and under Male.
 * {@link getPricingWarnings} flags them when an edit splits them.
 */
export const MIRRORED_PRICE_LINES: readonly (readonly [string, string])[] = [
    ['breast-reduction:male', 'mens:breast-reduction'],
]

/** `procedure:key`, the id tokens and logs use for a line. */
export function priceLineId(procedure: string, key: string): string {
    return `${procedure}:${key}`
}

/**
 * A whole-number percentage between 0 and {@link MAX_DISCOUNT_PERCENT}.
 * Anything that isn't a finite number becomes 0.
 */
export function normalizeDiscountPercent(value: unknown): number {
    const number = typeof value === 'string' ? Number(value) : value
    if (typeof number !== 'number' || !Number.isFinite(number)) return 0
    return Math.min(MAX_DISCOUNT_PERCENT, Math.max(0, Math.round(number)))
}

/**
 * Rounds down to whole dollars ({@link PRICE_ROUNDING_USD}), never up: a
 * rounded discounted price is never above the exact one. Works in cents, and
 * absorbs float noise (4185.0000000001) before flooring.
 */
export function roundPrice(usd: number): number {
    const cents = Math.round(usd * 100)
    const step = PRICE_ROUNDING_USD * 100
    return (Math.floor(cents / step) * step) / 100
}

/**
 * The discounted price of a list price. A 0% discount returns the list price
 * unrounded; any other percentage is applied, then rounded down by
 * {@link roundPrice}, so the result is never above list × (1 − percent).
 */
export function applyDiscount(listUsd: number, percent: number): number {
    const pct = normalizeDiscountPercent(percent)
    if (pct === 0) return listUsd
    return Math.max(0, roundPrice((listUsd * (100 - pct)) / 100))
}

/** "$5,500". Whole dollars, US grouping, independent of the runtime's ICU. */
export function formatUsd(usd: number): string {
    const whole = Math.round(usd)
    const sign = whole < 0 ? '-' : ''
    const digits = Math.abs(whole)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return `${sign}$${digits}`
}

/** The discount a procedure's prices carry: its own, else the site default. */
export function resolveDiscountPercent(
    pricing: PricingSnapshot,
    procedure: string
): number {
    const own = pricing.procedures[procedure]?.discountPercent
    return normalizeDiscountPercent(
        own === null || own === undefined ? pricing.defaultDiscountPercent : own
    )
}

/** Active lines of a procedure, in sheet order. */
export function getProcedureLines(
    pricing: PricingSnapshot,
    procedure: string,
    { includeInactive = false }: { includeInactive?: boolean } = {}
): PriceLine[] {
    return pricing.lines
        .filter(
            (line) =>
                line.procedure === procedure && (includeInactive || line.active)
        )
        .sort((a, b) => a.sort - b.sort)
}

/** A line by procedure and key; inactive lines are not found. */
export function findPriceLine(
    pricing: PricingSnapshot,
    procedure: string,
    key: string
): PriceLine | null {
    return (
        pricing.lines.find(
            (line) =>
                line.procedure === procedure && line.key === key && line.active
        ) ?? null
    )
}

/**
 * The procedure's "starting at" line, or `null` when it publishes none
 * (mommy makeover, D3) or the chosen line is missing or inactive. Never
 * falls back to another line: no figure beats a wrong one.
 */
export function getStartingLine(
    pricing: PricingSnapshot,
    procedure: string
): PriceLine | null {
    const key = pricing.procedures[procedure]?.startingLineKey
    return key ? findPriceLine(pricing, procedure, key) : null
}

/** A line's price, resolved and formatted for display. */
export interface PriceDisplay {
    procedure: string
    lineKey: string
    label: string
    unit: PriceUnit
    addOn: boolean
    listUsd: number
    finalUsd: number
    /** The discount applied; 0 when none. */
    percent: number
    discounted: boolean
    /** "$5,500" */
    list: string
    /** "$4,400", or the list price when not discounted. */
    final: string
    /** "per breast", or "". */
    suffix: string
    discountLabel: string | null
}

export function toPriceDisplay(
    pricing: PricingSnapshot,
    line: PriceLine
): PriceDisplay {
    const percent = resolveDiscountPercent(pricing, line.procedure)
    const finalUsd = applyDiscount(line.usd, percent)
    const discounted = percent > 0 && finalUsd < line.usd
    return {
        procedure: line.procedure,
        lineKey: line.key,
        label: line.label,
        unit: line.unit,
        addOn: line.addOn,
        listUsd: line.usd,
        finalUsd,
        percent: discounted ? percent : 0,
        discounted,
        list: formatUsd(line.usd),
        final: formatUsd(finalUsd),
        suffix: PRICE_UNIT_SUFFIX[line.unit],
        discountLabel: discounted
            ? (pricing.procedures[line.procedure]?.discountLabel ?? null)
            : null,
    }
}

/**
 * A procedure's price for display: the given line, or its starting line when
 * `lineKey` is omitted. `null` when there is nothing to publish.
 */
export function getPriceDisplay(
    pricing: PricingSnapshot,
    procedure: string,
    lineKey?: string
): PriceDisplay | null {
    const line = lineKey
        ? findPriceLine(pricing, procedure, lineKey)
        : getStartingLine(pricing, procedure)
    return line ? toPriceDisplay(pricing, line) : null
}

function withSuffix(figure: string, suffix: string): string {
    return suffix ? `${figure} ${suffix}` : figure
}

/**
 * Plain text: "$5,500", or "$4,400 (20% off $5,500)" when discounted. For
 * meta descriptions, JSON-LD, `llms.txt` and the chat prompt.
 */
export function formatPriceText(display: PriceDisplay): string {
    const figure = withSuffix(display.final, display.suffix)
    return display.discounted
        ? `${figure} (${display.percent}% off ${display.list})`
        : figure
}

/**
 * Markdown: "$5,500", or "~~$5,500~~ $4,400" when discounted, which
 * remark-gfm renders as `<del>`. Safe inside MDX: no braces or angle
 * brackets.
 */
export function formatPriceMarkdown(display: PriceDisplay): string {
    return display.discounted
        ? withSuffix(`~~${display.list}~~ ${display.final}`, display.suffix)
        : withSuffix(display.final, display.suffix)
}

/** "a face and neck lift", "an upper eyelid surgery". */
export function withIndefiniteArticle(label: string): string {
    return `${/^[aeiou]/i.test(label) ? 'an' : 'a'} ${label}`
}

function capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * A line's name for a tight slot (a chip, a rail, a card): the label
 * without its parenthetical, "mini tummy tuck (no muscle repair)" → "mini
 * tummy tuck", optionally capitalized. Copy beside a starting price names
 * the variant through this, never a typed "Mini" or "Lipo 360", so it stays
 * true when the admin picks another starting line.
 */
export function formatLineName(
    label: string,
    {
        short = false,
        capitalized = false,
    }: { short?: boolean; capitalized?: boolean } = {}
): string {
    const name = short ? label.replace(/\s*\([^)]*\)/g, '').trim() : label
    return capitalized ? capitalize(name) : name
}

/**
 * A named line as a sentence, in plain text: "A face and neck lift is
 * $15,000". The only way a {@link quotesAsNamedLine} procedure's price is
 * phrased (D2), and the canon's "a mini tummy tuck is $3,000" form.
 */
export function formatNamedLineText(display: PriceDisplay): string {
    return `${capitalize(withIndefiniteArticle(display.label))} is ${formatPriceText(display)}`
}

/**
 * The cheapest and dearest of a procedure's single add-ons (lines that are
 * add-ons priced `each`), by list price: liposuction's "$500 to $1,500,
 * depending on the area". `null` when the procedure has fewer than two.
 */
export function getAddOnSpan(
    pricing: PricingSnapshot,
    procedure: string
): { min: PriceDisplay; max: PriceDisplay } | null {
    const lines = getProcedureLines(pricing, procedure)
        .filter((line) => line.addOn && line.unit === 'each')
        .sort((a, b) => a.usd - b.usd)
    const min = lines[0]
    const max = lines.at(-1)
    if (!min || !max || min.usd === max.usd) return null
    return {
        min: toPriceDisplay(pricing, min),
        max: toPriceDisplay(pricing, max),
    }
}

/** "$500 to $1,500", or "$400 to $1,200 (20% off $500 to $1,500)". */
export function formatAddOnSpanText(span: {
    min: PriceDisplay
    max: PriceDisplay
}): string {
    const base = `${span.min.final} to ${span.max.final}`
    return span.min.discounted || span.max.discounted
        ? `${base} (${span.min.percent || span.max.percent}% off ${span.min.list} to ${span.max.list})`
        : base
}

/** Markdown form of {@link formatAddOnSpanText}, list prices struck through. */
export function formatAddOnSpanMarkdown(span: {
    min: PriceDisplay
    max: PriceDisplay
}): string {
    return `${formatPriceMarkdown(span.min)} to ${formatPriceMarkdown(span.max)}`
}

/** The "most patients pay" range (BBL only). */
export interface TypicalRange {
    procedure: string
    min: { listUsd: number; finalUsd: number; list: string; final: string }
    max: { listUsd: number; finalUsd: number; list: string; final: string }
    percent: number
    discounted: boolean
}

/**
 * The procedure's typical range: from its starting price to
 * `typicalMaxUsd`, both discounted alike. `null` when it publishes none.
 */
export function getTypicalRange(
    pricing: PricingSnapshot,
    procedure: string
): TypicalRange | null {
    const start = getPriceDisplay(pricing, procedure)
    const maxUsd = pricing.procedures[procedure]?.typicalMaxUsd
    if (!start || !maxUsd || maxUsd <= start.listUsd) return null
    const maxFinal = applyDiscount(maxUsd, start.percent)
    return {
        procedure,
        min: {
            listUsd: start.listUsd,
            finalUsd: start.finalUsd,
            list: start.list,
            final: start.final,
        },
        max: {
            listUsd: maxUsd,
            finalUsd: maxFinal,
            list: formatUsd(maxUsd),
            final: formatUsd(maxFinal),
        },
        percent: start.percent,
        discounted: start.discounted,
    }
}

/**
 * "most patients pay between $5,500 and $10,000" — a fragment, so copy reads
 * "A BBL at Alluring starts at $5,500, and most patients pay between …".
 * Discounted: "… between $4,400 and $8,000 (20% off $5,500 and $10,000)".
 * The range is typical, never a maximum: never "up to".
 */
export function formatTypicalRangeText(range: TypicalRange): string {
    const base = `most patients pay between ${range.min.final} and ${range.max.final}`
    return range.discounted
        ? `${base} (${range.percent}% off ${range.min.list} and ${range.max.list})`
        : base
}

/** Markdown form of {@link formatTypicalRangeText}, list prices struck through. */
export function formatTypicalRangeMarkdown(range: TypicalRange): string {
    if (!range.discounted) return formatTypicalRangeText(range)
    return `most patients pay between ~~${range.min.list}~~ ${range.min.final} and ~~${range.max.list}~~ ${range.max.final}`
}

/**
 * The combination discount sentence (canon §5). A fixed amount off the
 * total, never a percentage and never "save up to".
 */
export function formatComboDiscountSentence(pricing: PricingSnapshot): string {
    const { two, three } = pricing.comboDiscounts
    return `When procedures are combined in one surgery, ${formatUsd(two)} comes off the total for two procedures and ${formatUsd(three)} for three.`
}

/**
 * The same prices with every discount off: list prices only. For surfaces
 * that cannot carry the 456.062 statement next to a price (post cards,
 * search results, related-procedure cards), so a discounted fee is never
 * advertised without it (#354). The statement itself is dropped too.
 */
export function withoutDiscounts(pricing: PricingSnapshot): PricingSnapshot {
    return {
        ...pricing,
        defaultDiscountPercent: 0,
        discountStatement: null,
        procedures: Object.fromEntries(
            Object.entries(pricing.procedures).map(([key, settings]) => [
                key,
                { ...settings, discountPercent: 0, discountLabel: null },
            ])
        ),
    }
}

/** Whether any procedure's prices currently carry a discount. */
export function hasActiveDiscount(pricing: PricingSnapshot): boolean {
    const procedures = new Set(pricing.lines.map((line) => line.procedure))
    for (const procedure of procedures) {
        if (resolveDiscountPercent(pricing, procedure) > 0) return true
    }
    return false
}

/** The 456.062 statement, or `null` when no discount is on or none is set. */
export function getDiscountStatement(pricing: PricingSnapshot): string | null {
    const statement = pricing.discountStatement?.trim()
    return statement && hasActiveDiscount(pricing) ? statement : null
}

export type PricingWarningCode =
    | 'discount-without-statement'
    | 'starting-line-missing'
    | 'starting-line-add-on'
    | 'mirrored-lines-differ'

export interface PricingWarning {
    code: PricingWarningCode
    procedure: string | null
    message: string
}

/**
 * What the admin Pricing page shows above the form: a discount without the
 * 456.062 statement, starting lines that publish nothing or an add-on, and
 * {@link MIRRORED_PRICE_LINES} that an edit has split.
 */
export function getPricingWarnings(pricing: PricingSnapshot): PricingWarning[] {
    const warnings: PricingWarning[] = []

    if (hasActiveDiscount(pricing) && !pricing.discountStatement?.trim()) {
        warnings.push({
            code: 'discount-without-statement',
            procedure: null,
            message:
                'A discount is on, but the Fla. Stat. 456.062 statement is empty. A discounted fee is an advertisement that must carry it.',
        })
    }

    for (const settings of Object.values(pricing.procedures)) {
        const key = settings.startingLineKey
        if (!key) continue
        const line = findPriceLine(pricing, settings.procedure, key)
        if (!line) {
            warnings.push({
                code: 'starting-line-missing',
                procedure: settings.procedure,
                message: `The starting line "${priceLineId(settings.procedure, key)}" is missing or inactive, so no starting price is published.`,
            })
        } else if (line.addOn) {
            warnings.push({
                code: 'starting-line-add-on',
                procedure: settings.procedure,
                message: `The starting line "${priceLineId(settings.procedure, key)}" is an add-on, which is never priced as a surgery on its own.`,
            })
        }
    }

    for (const [a, b] of MIRRORED_PRICE_LINES) {
        const [lineA, lineB] = [a, b].map((id) => {
            const [procedure = '', key = ''] = id.split(':')
            return findPriceLine(pricing, procedure, key)
        })
        if (lineA && lineB && lineA.usd !== lineB.usd) {
            warnings.push({
                code: 'mirrored-lines-differ',
                procedure: lineA.procedure,
                message: `"${a}" (${formatUsd(lineA.usd)}) and "${b}" (${formatUsd(lineB.usd)}) price the same procedure on two pages. Set them to the same price.`,
            })
        }
    }

    return warnings
}
