/**
 * Display helpers for the Ads console. Pure, so the tables, KPI tiles and
 * CSV agree on how a number reads.
 *
 * @module @/lib/utils/ads/ads-format.util
 */

const usd = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})

const usdWhole = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
})

const integer = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

const decimal = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 })

/** `$2,064.81`. */
export function formatMoney(value: number | null | undefined): string {
    return value === null || value === undefined ? '—' : usd.format(value)
}

/** `$159` — for cost per lead, where cents are noise. */
export function formatMoneyWhole(value: number | null | undefined): string {
    return value === null || value === undefined ? '—' : usdWhole.format(value)
}

export function formatCount(value: number | null | undefined): string {
    return value === null || value === undefined ? '—' : integer.format(value)
}

/** Google's fractional conversions: `12`, `7.5`. */
export function formatConversions(value: number | null | undefined): string {
    return value === null || value === undefined ? '—' : decimal.format(value)
}

export function formatPercent(value: number | null | undefined): string {
    return value === null || value === undefined
        ? '—'
        : `${Math.round(value * 100)}%`
}

const MONTHS = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
]

/** `2026-09-14` → `14 Sep`. */
export function formatDay(date: string | null | undefined): string {
    if (!date) return '—'
    const [, month, day] = date.split('-').map(Number)
    return `${day} ${MONTHS[(month ?? 1) - 1]}`
}

/** `2026-09-11`…`2026-09-23` → `11 Sep – 23 Sep 2026`. */
export function formatRange(from: string, to: string): string {
    const year = to.slice(0, 4)
    return from === to
        ? `${formatDay(from)} ${year}`
        : `${formatDay(from)} – ${formatDay(to)} ${year}`
}

/** A naive wall-clock ISO string → `21 Sep · 10:42`. */
export function formatWallTime(value: string | null | undefined): string {
    if (!value) return '—'
    const [date, time] = value.split('T')
    return `${formatDay(date)} · ${(time ?? '').slice(0, 5)}`
}

/** A naive wall-clock ISO string → `06:31`. */
export function formatClock(value: string | null | undefined): string {
    if (!value) return '—'
    return (value.split('T')[1] ?? '').slice(0, 5)
}

/** `SEARCH_PARTNERS` → `Search partners`. */
export function humanizeEnum(value: string | null | undefined): string {
    if (!value) return '—'
    const words = value.toLowerCase().replace(/_/g, ' ')
    return words.charAt(0).toUpperCase() + words.slice(1)
}

export type CplTone = 'good' | 'bad' | 'neutral'

/**
 * Colour a cost per lead against the account's trailing figure: good at or
 * under it, bad at twice or more, neutral between. No baseline, no colour.
 */
export function costPerLeadTone(
    cpl: number | null,
    baseline: number | null,
    leads: number,
    cost: number
): CplTone {
    if (baseline === null || baseline <= 0) return 'neutral'
    if (cpl === null) return cost >= baseline * 2 ? 'bad' : 'neutral'
    if (leads > 0 && cpl <= baseline) return 'good'
    if (cpl >= baseline * 2) return 'bad'
    return 'neutral'
}

/** A `YYYY-MM-DD` as a local Date at midnight (for date pickers). */
export function isoToLocalDate(value: string): Date {
    const [year, month, day] = value.split('-').map(Number)
    return new Date(year!, (month ?? 1) - 1, day ?? 1)
}

/** A local Date as `YYYY-MM-DD`. */
export function localDateToIso(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${date.getFullYear()}-${month}-${day}`
}

/** Add days to a `YYYY-MM-DD`. */
export function shiftIsoDate(value: string, days: number): string {
    const date = isoToLocalDate(value)
    date.setDate(date.getDate() + days)
    return localDateToIso(date)
}
