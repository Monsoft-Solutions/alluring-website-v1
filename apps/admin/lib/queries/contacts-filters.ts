import { classifyLeadAttribution } from '@/lib/analytics/classify-lead-attribution'
import { getContactsInDateRange } from '@/lib/queries/contacts.query'
import {
    DATE_RANGE_OPTIONS,
    getDateRangeFromPreset,
    type DateRangePreset,
} from '@/lib/types/analytics/date-range.type'
import type {
    ClassifiedContactListItem,
    ContactListItem,
} from '@/lib/types/contacts/contacts.type'

const DEFAULT_PRESET: DateRangePreset = '28d'

/**
 * Parsed + normalized filter state for the contacts page.
 *
 * `dateRangePreset === 'custom'` means `startDate` and `endDate` came from
 * the `startDate`/`endDate` search params rather than a preset calculation.
 */
export type ContactFilters = {
    dateRangePreset: DateRangePreset
    startDate: Date
    endDate: Date
    sources: string[]
    mediums: string[]
}

/**
 * Accept either the already-resolved plain object from Next.js server
 * `searchParams`, or a `URLSearchParams` instance (used in route handlers).
 */
type SearchParamsInput =
    | URLSearchParams
    | Record<string, string | string[] | undefined>

function readParam(input: SearchParamsInput, key: string): string | null {
    if (input instanceof URLSearchParams) {
        return input.get(key)
    }
    const raw = input[key]
    if (Array.isArray(raw)) return raw[0] ?? null
    return raw ?? null
}

function readParamList(input: SearchParamsInput, key: string): string[] {
    if (input instanceof URLSearchParams) {
        // Support both ?k=a&k=b and ?k=a,b.
        const many = input.getAll(key)
        if (many.length > 1) return many.flatMap(splitCsv).filter(Boolean)
        if (many.length === 1) return splitCsv(many[0]!)
        return []
    }
    const raw = input[key]
    if (Array.isArray(raw)) return raw.flatMap(splitCsv).filter(Boolean)
    if (typeof raw === 'string') return splitCsv(raw)
    return []
}

function splitCsv(value: string): string[] {
    return value
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
}

function isValidPreset(value: string): value is DateRangePreset {
    return DATE_RANGE_OPTIONS.some((opt) => opt.value === value)
}

function parseDateParam(raw: string | null): Date | null {
    if (!raw) return null
    const parsed = new Date(raw)
    if (Number.isNaN(parsed.getTime())) return null
    return parsed
}

/**
 * Parse URL search params into a validated `ContactFilters`. Invalid or
 * missing values fall back to the `28d` preset (matching the leads page
 * default) so broken bookmarks never render a blank admin screen.
 */
export function parseContactFilters(input: SearchParamsInput): ContactFilters {
    const presetRaw = readParam(input, 'dateRange')
    const preset: DateRangePreset =
        presetRaw && isValidPreset(presetRaw) ? presetRaw : DEFAULT_PRESET

    const sources = readParamList(input, 'sources')
    const mediums = readParamList(input, 'mediums')

    if (preset === 'custom') {
        const customStart = parseDateParam(readParam(input, 'startDate'))
        const customEnd = parseDateParam(readParam(input, 'endDate'))
        if (customStart && customEnd && customStart <= customEnd) {
            return {
                dateRangePreset: 'custom',
                startDate: customStart,
                endDate: customEnd,
                sources,
                mediums,
            }
        }
        // Malformed custom range → fall back to default preset.
        const fallback = getDateRangeFromPreset(DEFAULT_PRESET)
        return {
            dateRangePreset: DEFAULT_PRESET,
            startDate: fallback.startDate,
            endDate: fallback.endDate,
            sources,
            mediums,
        }
    }

    const range = getDateRangeFromPreset(preset)
    return {
        dateRangePreset: preset,
        startDate: range.startDate,
        endDate: range.endDate,
        sources,
        mediums,
    }
}

function classifyContact(contact: ContactListItem): ClassifiedContactListItem {
    const attribution = classifyLeadAttribution({
        utmSource: contact.utmSource,
        utmMedium: contact.utmMedium,
        source: contact.source,
        referrer: contact.referrer,
        gclid: contact.gclid,
        fbclid: contact.fbclid,
        ttclid: contact.ttclid,
    })
    return { ...contact, attribution }
}

function matchesFilters(
    row: ClassifiedContactListItem,
    sources: string[],
    mediums: string[]
): boolean {
    if (sources.length && !sources.includes(row.attribution.source))
        return false
    if (mediums.length && !mediums.includes(row.attribution.medium))
        return false
    return true
}

/**
 * Fetch + classify the full windowed set. Shared primitive used by both the
 * filtered-only helper and the page-data helper so the DB is only hit once
 * per request even when both the row set and the option lists are needed.
 */
async function fetchAndClassify(
    filters: ContactFilters
): Promise<ClassifiedContactListItem[]> {
    const rows = await getContactsInDateRange(
        filters.startDate,
        filters.endDate
    )
    return rows.map(classifyContact)
}

/**
 * Return only the contacts that match the filter set. Used by the CSV export
 * route, which doesn't need the dropdown option lists.
 */
export async function getFilteredClassifiedContacts(
    filters: ContactFilters
): Promise<{ contacts: ClassifiedContactListItem[]; total: number }> {
    const classified = await fetchAndClassify(filters)
    const filtered = classified.filter((row) =>
        matchesFilters(row, filters.sources, filters.mediums)
    )
    return { contacts: filtered, total: filtered.length }
}

/**
 * Return the filtered rows *and* the dropdown option lists in a single DB
 * round-trip. Option lists are derived from the unfiltered windowed set and
 * always union in the user's current selections so active chips remain
 * removable even after narrowing the range.
 */
export async function getContactsPageData(filters: ContactFilters): Promise<{
    contacts: ClassifiedContactListItem[]
    total: number
    sourceOptions: string[]
    mediumOptions: string[]
}> {
    const classified = await fetchAndClassify(filters)

    const sourceSet = new Set<string>(filters.sources)
    const mediumSet = new Set<string>(filters.mediums)
    for (const row of classified) {
        sourceSet.add(row.attribution.source)
        mediumSet.add(row.attribution.medium)
    }

    const filtered = classified.filter((row) =>
        matchesFilters(row, filters.sources, filters.mediums)
    )

    const sortLocale = (a: string, b: string) => a.localeCompare(b)
    return {
        contacts: filtered,
        total: filtered.length,
        sourceOptions: [...sourceSet].sort(sortLocale),
        mediumOptions: [...mediumSet].sort(sortLocale),
    }
}
