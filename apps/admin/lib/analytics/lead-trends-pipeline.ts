import type {
    BreakdownBy,
    ClassifiedLead,
    Granularity,
    LeadTrendsFilters,
    LeadTrendsSummary,
    TrendBucket,
    TrendPipelineOutput,
} from '@/lib/types/analytics/lead-trends.type'

const MS_PER_HOUR = 60 * 60 * 1000
const MS_PER_DAY = 24 * MS_PER_HOUR

/**
 * Filter a classified-lead list by source and medium sets.
 * An empty array for a dimension means "no filter on this dimension".
 */
export function applyFilters(
    leads: ClassifiedLead[],
    filters: LeadTrendsFilters
): ClassifiedLead[] {
    const sourceSet = filters.sources.length ? new Set(filters.sources) : null
    const mediumSet = filters.mediums.length ? new Set(filters.mediums) : null
    if (!sourceSet && !mediumSet) return leads
    return leads.filter(
        (lead) =>
            (!sourceSet || sourceSet.has(lead.source)) &&
            (!mediumSet || mediumSet.has(lead.medium))
    )
}

/**
 * Pick the bucket granularity for a given date range.
 * Thresholds are computed in UTC calendar days so the result is
 * timezone-independent.
 *   ≤ 2 UTC days  → 'hour'
 *   ≤ 30 UTC days → 'day'
 *   > 30 UTC days → 'week'
 */
export function deriveGranularity(range: {
    startDate: Date
    endDate: Date
}): Granularity {
    const startUtcDay = Math.floor(range.startDate.getTime() / MS_PER_DAY)
    const endUtcDay = Math.floor(range.endDate.getTime() / MS_PER_DAY)
    const days = endUtcDay - startUtcDay
    if (days <= 1) return 'hour'
    if (days <= 30) return 'day'
    return 'week'
}

// ---------------------------------------------------------------------------
// UTC-based bucket helpers — all math done in epoch milliseconds so the
// pipeline produces identical results regardless of the host machine timezone.
// ---------------------------------------------------------------------------

/** Round down to the start of the UTC hour containing `date`. */
function utcStartOfHour(date: Date): Date {
    const t = date.getTime()
    return new Date(t - (t % MS_PER_HOUR))
}

/** Round down to the start of the UTC day (00:00:00.000 UTC) containing `date`. */
function utcStartOfDay(date: Date): Date {
    const t = date.getTime()
    return new Date(t - (t % MS_PER_DAY))
}

/**
 * Round down to the start of the ISO week (Monday 00:00:00.000 UTC) that
 * contains `date`. ISO weeks start on Monday (day-of-week index 1).
 */
function utcStartOfISOWeek(date: Date): Date {
    const dayOfWeek = date.getUTCDay() // 0=Sun, 1=Mon, ..., 6=Sat
    // Distance back to Monday: Mon=0, Tue=1, ... Sun=6
    const distToMonday = (dayOfWeek + 6) % 7
    const startOfThisDay = utcStartOfDay(date)
    return new Date(startOfThisDay.getTime() - distToMonday * MS_PER_DAY)
}

function bucketStart(date: Date, granularity: Granularity): Date {
    switch (granularity) {
        case 'hour':
            return utcStartOfHour(date)
        case 'day':
            return utcStartOfDay(date)
        case 'week':
            return utcStartOfISOWeek(date)
    }
}

function advance(date: Date, granularity: Granularity): Date {
    switch (granularity) {
        case 'hour':
            return new Date(date.getTime() + MS_PER_HOUR)
        case 'day':
            return new Date(date.getTime() + MS_PER_DAY)
        case 'week':
            return new Date(date.getTime() + 7 * MS_PER_DAY)
    }
}

/**
 * Bucket leads into a Map<bucketStartISO, Lead[]>. Pre-seeds every bucket
 * across the range so consumers render a continuous x-axis.
 */
export function bucketLeads(
    leads: ClassifiedLead[],
    granularity: Granularity,
    range: { startDate: Date; endDate: Date }
): Map<string, ClassifiedLead[]> {
    const buckets = new Map<string, ClassifiedLead[]>()

    let cursor = bucketStart(range.startDate, granularity)
    const endBucket = bucketStart(range.endDate, granularity)
    while (cursor.getTime() <= endBucket.getTime()) {
        buckets.set(cursor.toISOString(), [])
        cursor = advance(cursor, granularity)
    }

    for (const lead of leads) {
        const leadDate = new Date(lead.ts)
        const key = bucketStart(leadDate, granularity).toISOString()
        const existing = buckets.get(key)
        if (existing) existing.push(lead)
    }

    return buckets
}

function seriesKeyFor(lead: ClassifiedLead, breakdownBy: BreakdownBy): string {
    switch (breakdownBy) {
        case 'source':
            return lead.source
        case 'medium':
            return lead.medium
        case 'sourceMedium':
            return `${lead.source} / ${lead.medium}`
    }
}

/**
 * Transform the bucket map into a per-bucket record of seriesKey → count,
 * plus global aggregates.
 */
export function groupByBreakdown(
    bucketMap: Map<string, ClassifiedLead[]>,
    breakdownBy: BreakdownBy
): TrendPipelineOutput {
    const keySet = new Set<string>()
    const totals: Record<string, number> = {}
    const buckets: TrendBucket[] = []
    let overallTotal = 0

    for (const [ts, leadsInBucket] of bucketMap) {
        const series: Record<string, number> = {}
        for (const lead of leadsInBucket) {
            const key = seriesKeyFor(lead, breakdownBy)
            series[key] = (series[key] ?? 0) + 1
            totals[key] = (totals[key] ?? 0) + 1
            keySet.add(key)
            overallTotal += 1
        }
        buckets.push({ ts, series })
    }

    const seriesKeys = [...keySet].sort(
        (a, b) => (totals[b] ?? 0) - (totals[a] ?? 0)
    )
    const topSeries =
        seriesKeys.length > 0
            ? { key: seriesKeys[0]!, count: totals[seriesKeys[0]!] ?? 0 }
            : null

    return { buckets, seriesKeys, totals, overallTotal, topSeries }
}

/**
 * Compute headline metrics for the summary strip.
 */
export function computeSummary(
    filtered: ClassifiedLead[],
    priorFiltered: ClassifiedLead[],
    breakdownBy: BreakdownBy
): LeadTrendsSummary {
    const total = filtered.length
    const priorTotal = priorFiltered.length

    const totalsByKey = new Map<string, number>()
    for (const lead of filtered) {
        const key = seriesKeyFor(lead, breakdownBy)
        totalsByKey.set(key, (totalsByKey.get(key) ?? 0) + 1)
    }
    let topSeries: { key: string; count: number } | null = null
    for (const [key, count] of totalsByKey) {
        if (!topSeries || count > topSeries.count) {
            topSeries = { key, count }
        }
    }

    const unclassifiedCount = filtered.reduce(
        (acc, l) => acc + (l.classification === 'direct' ? 1 : 0),
        0
    )

    return {
        total,
        topSeries,
        priorDelta: {
            count: total - priorTotal,
            percent: priorTotal > 0 ? (total - priorTotal) / priorTotal : null,
        },
        unclassifiedCount,
        unclassifiedRatio: total > 0 ? unclassifiedCount / total : 0,
    }
}
