/**
 * The practice's price sheet of 2026-09-15 as typed data: the code fallback
 * behind the admin Pricing page (claims canon §5 and the Decisions of
 * 2026-10-25).
 *
 * The live prices are the `price_line`, `procedure_pricing` and
 * `pricing_settings` tables, seeded from this file by migration 0060. Every
 * surface reads a `PricingSnapshot` from the resolver (`getPricing()` in the
 * web app), which uses {@link FALLBACK_PRICING} when the tables are empty or
 * unreachable. **No Alluring price is typed anywhere else**: code reads the
 * resolver, and DB text (posts, FAQs, the chat prompt) uses claim tokens
 * (`./tokens`).
 *
 * `sheetSection` and `sheetName` keep the sheet's own wording and spelling,
 * so `price-sheet.test.ts` can check every line against
 * `docs/pricing/practice-price-list.md`.
 *
 * National averages (`NATIONAL_AVERAGES`) are ASPS figures, not Alluring
 * prices, and stay typed with their attribution.
 *
 * @module @workspace/shared/claims/prices
 */
import {
    isPriceUnit,
    normalizeDiscountPercent,
    type PriceLine,
    type PriceUnit,
    type PricingSnapshot,
    type ProcedurePriceSettings,
} from './pricing'
import { KARLINSKY_SHORT_NAME } from './surgeon'

/** The date the printed sheet was photographed. */
export const PRICE_SHEET_DATE = '2026-09-15'

/**
 * Every procedure the sheet prices, keyed by a short, stable claim key. That
 * key is what the database, tokens and line ids use; `pageSlug` is the web
 * app's slug for the procedure's page (accepted as an alias by the tokens).
 */
export const CLAIM_PROCEDURES = [
    {
        key: 'bbl',
        name: 'BBL',
        pageSlug: 'brazilian-butt-lift-bbl-miami',
        path: '/procedures/brazilian-butt-lift-bbl-miami',
    },
    {
        key: 'lipo',
        name: 'liposuction',
        pageSlug: 'liposuction-miami',
        path: '/procedures/liposuction-miami',
    },
    {
        key: 'tummy-tuck',
        name: 'tummy tuck',
        pageSlug: 'tummy-tuck-miami',
        path: '/procedures/tummy-tuck-miami',
    },
    {
        key: 'breast-augmentation',
        name: 'breast augmentation',
        pageSlug: 'breast-augmentation-miami',
        path: '/procedures/breast-augmentation-miami',
    },
    {
        key: 'breast-lift',
        name: 'breast lift',
        pageSlug: 'breast-lift-miami',
        path: '/procedures/breast-lift-miami',
    },
    {
        key: 'breast-reduction',
        name: 'breast reduction',
        pageSlug: 'breast-reduction-miami',
        path: '/procedures/breast-reduction-miami',
    },
    {
        key: 'facelift',
        name: 'facelift',
        pageSlug: 'facelift-miami',
        path: '/procedures/facelift-miami',
    },
    {
        key: 'blepharoplasty',
        name: 'eyelid surgery',
        pageSlug: 'blepharoplasty-miami',
        path: '/procedures/blepharoplasty-miami',
    },
    {
        key: 'mommy-makeover',
        name: 'mommy makeover',
        pageSlug: 'mommy-makeover-miami',
        path: '/procedures/mommy-makeover-miami',
    },
    {
        key: 'mens',
        name: "men's procedures",
        pageSlug: 'mens-plastic-surgery-miami',
        path: '/mens-plastic-surgery-miami',
    },
    // No page: quote these exactly or not at all.
    { key: 'otoplasty', name: 'otoplasty', pageSlug: null, path: null },
    { key: 'back-lift', name: 'back lift', pageSlug: null, path: null },
    { key: 'arm-lift', name: 'arm lift', pageSlug: null, path: null },
    { key: 'thigh-lift', name: 'thigh lift', pageSlug: null, path: null },
] as const

export type ClaimProcedure = (typeof CLAIM_PROCEDURES)[number]
export type ClaimProcedureKey = ClaimProcedure['key']

const PROCEDURE_KEY_BY_ALIAS = new Map<string, ClaimProcedureKey>(
    CLAIM_PROCEDURES.flatMap((procedure) => {
        const aliases: [string, ClaimProcedureKey][] = [
            [procedure.key, procedure.key],
        ]
        if (procedure.pageSlug)
            aliases.push([procedure.pageSlug, procedure.key])
        return aliases
    })
)

/**
 * The claim key for a claim key or a web page slug
 * (`brazilian-butt-lift-bbl-miami` → `bbl`), or `null`.
 */
export function toClaimProcedureKey(
    keyOrPageSlug: string
): ClaimProcedureKey | null {
    return PROCEDURE_KEY_BY_ALIAS.get(keyOrPageSlug) ?? null
}

export function getClaimProcedure(
    keyOrPageSlug: string
): ClaimProcedure | null {
    const key = toClaimProcedureKey(keyOrPageSlug)
    return CLAIM_PROCEDURES.find((procedure) => procedure.key === key) ?? null
}

/** The section headings of `docs/pricing/practice-price-list.md`. */
export type PriceSheetSection = 'Face' | 'Breast' | 'Body' | 'Male' | 'Add-ons'

/** A fallback line, with the sheet's own wording kept for the doc check. */
export interface PriceSheetLine extends PriceLine {
    procedure: ClaimProcedureKey
    sheetSection: PriceSheetSection
    /** The row's name on the sheet, verbatim (typos included). */
    sheetName: string
}

type SheetRow = [
    procedure: ClaimProcedureKey,
    key: string,
    label: string,
    usd: number,
    sheetSection: PriceSheetSection,
    sheetName: string,
    options?: { unit?: PriceUnit; addOn?: boolean },
]

/**
 * Grouped by procedure in page order; within one, in the order quoted. Kept
 * one row per line, like the sheet, so a price change is a one-line diff.
 */
// prettier-ignore
const SHEET_ROWS: readonly SheetRow[] = [
    ['bbl', 'lipo360-bbl', 'Lipo 360 + BBL', 5500, 'Body', 'Lipo 360 + BBL'],

    ['lipo', 'lipo360', 'Lipo 360', 4000, 'Body', 'Lipo 360'],
    ['lipo', 'abdomen-flanks', 'abdomen and flanks liposuction', 1500, 'Add-ons', 'Lipo Abdomen/Flanks', { addOn: true }],
    ['lipo', 'full-back-flanks', 'full back and flanks liposuction', 1500, 'Add-ons', 'Lipo Full Back/Flanks', { addOn: true }],
    ['lipo', 'arms', 'arm liposuction', 1000, 'Add-ons', 'Lipo Arms', { addOn: true }],
    ['lipo', 'inner-thighs', 'inner thigh liposuction', 800, 'Add-ons', 'Lipo Inner Thighs', { addOn: true }],
    ['lipo', 'outer-thighs', 'outer thigh liposuction', 800, 'Add-ons', 'Lipo Outer Thighs', { addOn: true }],
    ['lipo', 'hips', 'hip liposuction', 800, 'Add-ons', 'Lipo Hips', { addOn: true }],
    ['lipo', 'axillary', 'underarm (axillary) liposuction', 600, 'Add-ons', 'Lipo Axillary', { addOn: true }],
    ['lipo', 'chin', 'chin liposuction', 500, 'Add-ons', 'Lipo Chin', { addOn: true }],
    ['lipo', 'pubic', 'pubic liposuction', 500, 'Add-ons', 'Lipo Pubic', { addOn: true }],
    ['lipo', 'buffalo-hump', 'buffalo hump liposuction (with back procedures only)', 500, 'Add-ons', 'Lipo Buffalo Hump (only add to back procedures)', { addOn: true }],
    ['lipo', 'banana-rolls', 'banana roll liposuction (with back procedures only)', 500, 'Add-ons', 'Lipo Banana Rolls (only add to back procedures)', { addOn: true }],
    ['lipo', 'j-plasma-first-area', 'J-Plasma, first area', 1000, 'Add-ons', 'J-plasma', { addOn: true, unit: 'first-area' }],
    ['lipo', 'j-plasma-additional-area', 'J-Plasma, each additional area', 500, 'Add-ons', 'J-plasma', { addOn: true, unit: 'additional-area' }],

    ['tummy-tuck', 'mini', 'mini tummy tuck (no muscle repair)', 3000, 'Body', 'Tummy Tuck - Mini (no muscle repair)'],
    ['tummy-tuck', 'extended-mini', 'extended mini tummy tuck (no muscle repair, hip-to-hip incision)', 4000, 'Body', 'Tummy Tuck - Extended Mini (no muscle repair, hip to hip incision)'],
    ['tummy-tuck', 'full', "full tummy tuck (loose skin that doesn't extend to the hips)", 4500, 'Body', "Tummy Tuck - Regular (loose skin doesn't extend to the hips)"],
    ['tummy-tuck', 'extended', 'extended tummy tuck (hip-to-hip incision)', 5500, 'Body', 'Tummy Tuck - Extended (hip to hip incision)'],
    ['tummy-tuck', 'fleur-de-lis', 'fleur-de-lis tummy tuck', 10000, 'Body', 'Fleur de Lis Tummy Tuck'],

    ['breast-augmentation', 'saline', 'breast augmentation with saline implants', 3500, 'Breast', 'Breast Augmentation - Saline'],
    ['breast-augmentation', 'silicone', 'breast augmentation with silicone implants', 4500, 'Breast', 'Breast Augmentation - Silicone'],
    ['breast-augmentation', 'fat-grafting-breasts', 'fat grafting to the breasts', 1500, 'Breast', 'Fat Grafting to Breasts', { addOn: true }],
    ['breast-augmentation', 'implant-exchange-saline', 'implant exchange with saline implants', 3500, 'Breast', 'Implant Exchange - Saline'],
    ['breast-augmentation', 'implant-exchange-silicone', 'implant exchange with silicone implants', 4500, 'Breast', 'Implant Exchange - Silicone'],
    ['breast-augmentation', 'implant-removal', 'implant removal as its own procedure (rare)', 3000, 'Breast', 'Implant Removal (stand alone procedure) - RARE'],
    ['breast-augmentation', 'implant-removal-added', 'implant removal added to another breast procedure', 500, 'Breast', 'Implant Removal (added to another breast procedure)', { addOn: true, unit: 'per-breast' }],
    ['breast-augmentation', 'capsulectomy', 'capsulectomy or capsulorrhaphy', 500, 'Breast', 'Capsulectomy/Capsulorophy', { unit: 'per-breast' }],
    ['breast-augmentation', 'axillary-skin-excision', 'underarm (axillary) skin excision', 1500, 'Breast', 'Axillary Skin Excision (add on)', { addOn: true }],
    ['breast-augmentation', 'inframammary-crease-repair', 'inframammary crease repair', 500, 'Breast', 'Inframmamory Crease Repair (add on)', { addOn: true, unit: 'per-breast' }],
    ['breast-augmentation', 'double-bubble-repair', 'double bubble repair', 500, 'Breast', 'Double Bubble Repair (add on)', { addOn: true, unit: 'per-breast' }],

    ['breast-lift', 'modified', 'modified breast lift (skin below the areola only)', 4000, 'Breast', 'Breast Lift - Modified (only skin from below areola)'],
    ['breast-lift', 'no-implants', 'breast lift without implants', 5000, 'Breast', 'Breast Lift - NO IMPLANTS'],
    ['breast-lift', 'saline', 'breast lift with saline implants', 6000, 'Breast', 'Breast Lift - Saline'],
    ['breast-lift', 'silicone', 'breast lift with silicone implants', 7000, 'Breast', 'Breast Lift - Silicone'],

    ['breast-reduction', 'small-medium', 'breast reduction, small to medium', 6000, 'Breast', 'Reduction - SM-MED'],
    ['breast-reduction', 'large', 'breast reduction, large', 8000, 'Breast', 'Reduction - LG'],
    ['breast-reduction', 'extra-large', 'breast reduction, extra large', 9000, 'Breast', 'Reduction - Ex LG'],
    ['breast-reduction', 'male', 'male breast reduction', 6000, 'Breast', 'Reduction - Male Patient'],

    ['facelift', 'face-neck-lift', 'face and neck lift', 15000, 'Face', 'Face & Neck Lift'],
    ['facelift', 'fat-grafting-face', 'fat grafting to the face', 1500, 'Face', 'Fat Grafting to Face'],
    ['facelift', 'brow-lift', 'brow lift', 8500, 'Face', 'Brow Lift'],
    ['facelift', 'lip-lift', 'lip lift', 1500, 'Face', 'Lip Lift'],
    ['facelift', 'tca-peel', 'TCA peel', 1000, 'Face', 'TCA Peel'],

    ['blepharoplasty', 'upper', 'upper eyelid surgery', 3500, 'Face', 'Blepharoplasty Upper'],
    ['blepharoplasty', 'lower', 'lower eyelid surgery', 3500, 'Face', 'Blepharoplasty Lower'],
    ['blepharoplasty', 'both', 'upper and lower eyelid surgery', 6500, 'Face', 'Blepharoplasty BOTH'],

    ['mens', 'gynecomastia', 'gynecomastia surgery (gland excision and chest liposuction)', 4500, 'Male', 'Gynecomastia (excision of gland and chest lipo)'],
    ['mens', 'breast-lift-gynecomastia', 'breast lift with gynecomastia surgery', 5500, 'Male', 'Breast Lift w/ Gynecomastia'],
    ['mens', 'breast-reduction', 'male breast reduction', 6000, 'Male', 'Breast Reduction'],
    ['mens', 'chest-lipo', 'chest liposuction (with another procedure only)', 1000, 'Male', 'Chest Lipo (combined w/ another procedure)', { addOn: true }],

    ['otoplasty', 'otoplasty', 'otoplasty (ear surgery)', 4500, 'Face', 'Otoplasty'],
    ['back-lift', 'with-back-lipo', 'back lift with back liposuction', 8000, 'Body', 'Back Lift w/ Back Lipo (all patients need lipo back with back lift)'],
    ['arm-lift', 'without-lipo', 'arm lift without liposuction', 5000, 'Body', 'Arm Lift w/o Lipo (all loose, empty skin)'],
    ['arm-lift', 'with-lipo', 'arm lift with arm liposuction', 6000, 'Body', 'Arm Lift w/ Arm Lipo'],
    ['thigh-lift', 'medial', 'medial thigh lift', 8000, 'Body', 'Thigh Lift - Medial w/o Lipo'],
    ['thigh-lift', 'medial-with-lipo', 'medial thigh lift with inner thigh liposuction', 8800, 'Body', 'Thigh Lift - Medial w/ Lipo Inner Thighs'],
    ['thigh-lift', 'medial-vertical', 'medial and vertical thigh lift', 10000, 'Body', 'Thigh Lift Medial & Vertical w/o Lipo'],
    ['thigh-lift', 'medial-vertical-with-lipo', 'medial and vertical thigh lift with inner thigh liposuction', 10800, 'Body', 'Thigh Lift Medial & Vertical w/ Lipo Inner Thighs'],
]

/** Every line of the 2026-09-15 sheet, with a stable `procedure:key` id. */
export const PRICE_SHEET: readonly PriceSheetLine[] = SHEET_ROWS.map(
    (
        [procedure, key, label, usd, sheetSection, sheetName, options],
        index
    ) => ({
        procedure,
        key,
        label,
        usd,
        unit: options?.unit ?? 'each',
        addOn: options?.addOn ?? false,
        // Gaps of 10 leave room for the admin to slot a line in between.
        sort: (index + 1) * 10,
        active: true,
        sheetSection,
        sheetName,
    })
)

/**
 * The default "starting at" line per procedure (canon §5, D2, D3, D8): the
 * lowest standard line, with the variant named where it isn't the standard
 * version. `null` publishes no starting price.
 */
export const DEFAULT_STARTING_LINES: Readonly<
    Record<ClaimProcedureKey, string | null>
> = {
    bbl: 'lipo360-bbl',
    lipo: 'lipo360',
    'tummy-tuck': 'mini',
    'breast-augmentation': 'saline',
    // D8: the modified lift, with the variant named.
    'breast-lift': 'modified',
    'breast-reduction': 'small-medium',
    // D2: no facelift-alone price; only the face and neck lift is quoted.
    facelift: 'face-neck-lift',
    blepharoplasty: 'upper',
    // D3: no total; a mommy makeover is priced part by part.
    'mommy-makeover': null,
    mens: 'gynecomastia',
    otoplasty: 'otoplasty',
    'back-lift': 'with-back-lipo',
    'arm-lift': 'without-lipo',
    'thigh-lift': 'medial',
}

/**
 * Procedures that publish a "most patients pay" range. BBL only (canon §5,
 * `pricing.upTo`); no other procedure gets one.
 */
export const TYPICAL_RANGE_PROCEDURES: readonly string[] = ['bbl']

/** Top of the BBL range: "most patients pay between $5,500 and $10,000". */
export const DEFAULT_BBL_TYPICAL_MAX_USD = 10000

/** The sheet's combination discounts, in dollars off the total. */
export const DEFAULT_COMBO_DISCOUNTS = { two: 500, three: 1000 } as const

/**
 * The required caveat, short form (Florida Rule 64B8-11.001(1)(g)): an
 * advertised fee discloses what changes it. Every published price sits in a
 * block that carries this, or the long form.
 */
export const PRICE_CAVEAT_SHORT =
    'Starting prices. Yours depends on the areas treated, your body and any procedures combined, and your surgeon confirms it at consultation.'

/** The required caveat, long form (FAQs, posts, `llms-full.txt`). */
export const PRICE_CAVEAT_LONG = `These are starting prices from the practice's price list. Your price is set for you after an exam, estimates may change, and ${KARLINSKY_SHORT_NAME} confirms your price at consultation.`

/** How every price is framed (canon §5). */
export const PRICE_FRAMING_RULES = [
    'Every published price is "starting at" or "from". The single exception is a named line from the price list, quoted at that line\'s own price: "a mini tummy tuck is …".',
    'The starting figure is the procedure\'s chosen starting line, with the variant named next to it ("from … for a mini tummy tuck (no muscle repair)"). Never round, average or invent a range.',
    'The BBL range is typical, not a maximum: "most patients pay between …". Never "up to", and no other procedure gets a range.',
    'A mommy makeover has no total: it is priced part by part, minus the combination discount.',
    'There is no facelift-alone price: only "a face and neck lift is …".',
    'Single-area liposuction is an add-on only, priced on top of another procedure; never a standalone single-area price.',
    'No "all-inclusive", "no hidden fees" or "everything included". No deposit amount.',
    'A reduced price appears only when a discount is set in the admin. Never type a discounted figure or a "% off".',
    'Every price sits in a paragraph, list or table that carries the price caveat ("confirm" and "consultation").',
] as const

/**
 * The ASPS national surgeon-fee averages the facts files clear (read
 * 2026-09-22 and 2026-09-28). Not Alluring prices: always attributed, always
 * with what they leave out, never with a year, never placed so they read as
 * the practice's price.
 */
export const NATIONAL_AVERAGES = {
    bbl: {
        usd: 7264,
        procedure: 'buttock augmentation with fat grafting (BBL)',
    },
    lipo: { usd: 4711, procedure: 'liposuction' },
    'tummy-tuck': { usd: 8174, procedure: 'tummy tuck' },
} as const satisfies Partial<
    Record<ClaimProcedureKey, { usd: number; procedure: string }>
>

/** What each national average leaves out, as the copy must say it. */
export const NATIONAL_AVERAGE_EXCLUSION =
    "a surgeon's fee that does not include anesthesia, operating room facilities or other related expenses"

/** The default settings row of each procedure. */
export const DEFAULT_PROCEDURE_SETTINGS: readonly ProcedurePriceSettings[] =
    CLAIM_PROCEDURES.map(({ key }) => ({
        procedure: key,
        startingLineKey: DEFAULT_STARTING_LINES[key],
        discountPercent: null,
        discountLabel: null,
        typicalMaxUsd: key === 'bbl' ? DEFAULT_BBL_TYPICAL_MAX_USD : null,
    }))

/** Input for {@link buildPricingSnapshot}. */
export interface PricingSnapshotInput {
    source: PricingSnapshot['source']
    lines: readonly PriceLine[]
    procedures: readonly ProcedurePriceSettings[]
    settings: {
        defaultDiscountPercent: number | null
        discountStatement: string | null
        comboDiscountTwoUsd: number | null
        comboDiscountThreeUsd: number | null
        updatedAt: string | null
    } | null
}

/**
 * Normalizes pricing data into a snapshot: discount percents clamped to
 * 0–90, a procedure without a settings row given its default starting line,
 * and the typical range kept for {@link TYPICAL_RANGE_PROCEDURES} only.
 */
export function buildPricingSnapshot(
    input: PricingSnapshotInput
): PricingSnapshot {
    const procedures: Record<string, ProcedurePriceSettings> = {}

    for (const defaults of DEFAULT_PROCEDURE_SETTINGS) {
        procedures[defaults.procedure] = { ...defaults }
    }
    for (const row of input.procedures) {
        procedures[row.procedure] = {
            procedure: row.procedure,
            startingLineKey: row.startingLineKey || null,
            discountPercent:
                row.discountPercent === null
                    ? null
                    : normalizeDiscountPercent(row.discountPercent),
            discountLabel: row.discountLabel?.trim() || null,
            typicalMaxUsd: TYPICAL_RANGE_PROCEDURES.includes(row.procedure)
                ? row.typicalMaxUsd
                : null,
        }
    }

    const lines = [...input.lines].sort(
        (a, b) =>
            a.procedure.localeCompare(b.procedure) ||
            a.sort - b.sort ||
            a.key.localeCompare(b.key)
    )

    return {
        source: input.source,
        lines,
        procedures,
        defaultDiscountPercent: normalizeDiscountPercent(
            input.settings?.defaultDiscountPercent ?? 0
        ),
        discountStatement: input.settings?.discountStatement?.trim() || null,
        comboDiscounts: {
            two:
                input.settings?.comboDiscountTwoUsd ??
                DEFAULT_COMBO_DISCOUNTS.two,
            three:
                input.settings?.comboDiscountThreeUsd ??
                DEFAULT_COMBO_DISCOUNTS.three,
        },
        updatedAt: input.settings?.updatedAt ?? null,
    }
}

/** The shape of the pricing tables' rows, as Drizzle selects them. */
export interface PricingRows {
    lines: readonly {
        procedureSlug: string
        lineKey: string
        label: string
        usd: number
        unit: string
        isAddOn: boolean
        sortOrder: number
        isActive: boolean
        updatedAt?: Date | string | null
    }[]
    procedures: readonly {
        procedureSlug: string
        startingLineKey: string | null
        discountPercent: number | null
        discountLabel: string | null
        typicalMaxUsd: number | null
        updatedAt?: Date | string | null
    }[]
    settings: {
        defaultDiscountPercent: number
        discountStatement: string | null
        comboDiscountTwoUsd: number
        comboDiscountThreeUsd: number
        updatedAt?: Date | string | null
    } | null
}

function toIso(value: Date | string | null | undefined): string | null {
    if (!value) return null
    const date = value instanceof Date ? value : new Date(value)
    return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

/**
 * A snapshot from the pricing tables' rows (web resolver and admin alike).
 * Returns {@link FALLBACK_PRICING} when there are no price lines at all, so
 * an unseeded database never publishes an empty price list.
 */
export function buildPricingSnapshotFromRows(
    rows: PricingRows
): PricingSnapshot {
    if (rows.lines.length === 0) return FALLBACK_PRICING

    const stamps = [
        ...rows.lines.map((row) => toIso(row.updatedAt)),
        ...rows.procedures.map((row) => toIso(row.updatedAt)),
        toIso(rows.settings?.updatedAt),
    ].filter((stamp): stamp is string => stamp !== null)

    return buildPricingSnapshot({
        source: 'db',
        lines: rows.lines.map((row) => ({
            procedure: row.procedureSlug,
            key: row.lineKey,
            label: row.label,
            usd: row.usd,
            unit: isPriceUnit(row.unit) ? row.unit : 'each',
            addOn: row.isAddOn,
            sort: row.sortOrder,
            active: row.isActive,
        })),
        procedures: rows.procedures.map((row) => ({
            procedure: row.procedureSlug,
            startingLineKey: row.startingLineKey,
            discountPercent: row.discountPercent,
            discountLabel: row.discountLabel,
            typicalMaxUsd: row.typicalMaxUsd,
        })),
        settings: {
            defaultDiscountPercent: rows.settings?.defaultDiscountPercent ?? 0,
            discountStatement: rows.settings?.discountStatement ?? null,
            comboDiscountTwoUsd: rows.settings?.comboDiscountTwoUsd ?? null,
            comboDiscountThreeUsd: rows.settings?.comboDiscountThreeUsd ?? null,
            updatedAt: stamps.sort().at(-1) ?? null,
        },
    })
}

/** The 2026-09-15 sheet as a snapshot: no discount, no statement. */
export const FALLBACK_PRICING: PricingSnapshot = buildPricingSnapshot({
    source: 'fallback',
    lines: PRICE_SHEET.map((line) => ({
        procedure: line.procedure,
        key: line.key,
        label: line.label,
        usd: line.usd,
        unit: line.unit,
        addOn: line.addOn,
        sort: line.sort,
        active: line.active,
    })),
    procedures: DEFAULT_PROCEDURE_SETTINGS,
    settings: null,
})
