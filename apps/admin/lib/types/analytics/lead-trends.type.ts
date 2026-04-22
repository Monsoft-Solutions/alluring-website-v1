/**
 * Types for the admin lead-source-trends analytics feature.
 */

export type LeadClassification =
    | 'utm'
    | 'click-id'
    | 'referrer'
    | 'source-field'
    | 'direct'

/** Subset of ContactSubmission fields the classifier reads. */
export type LeadAttributionInput = {
    utmSource: string | null
    utmMedium: string | null
    source: string | null
    referrer: string | null
    gclid: string | null
    fbclid: string | null
    ttclid: string | null
}

export type LeadAttribution = {
    source: string
    medium: string
    classification: LeadClassification
}

/** One classified lead as returned by the API and consumed by the client pipeline. */
export type ClassifiedLead = {
    ts: string // ISO timestamp
    source: string
    medium: string
    classification: LeadClassification
}

export type LeadTrendsResponse = {
    leads: ClassifiedLead[]
    totalCount: number
    rangeStart: string
    rangeEnd: string
}

export type Granularity = 'hour' | 'day' | 'week'

export type BreakdownBy = 'source' | 'medium' | 'sourceMedium'

export type LeadTrendsFilters = {
    sources: string[]
    mediums: string[]
}

export type TrendBucket = {
    ts: string
    series: Record<string, number>
}

export type TrendPipelineOutput = {
    buckets: TrendBucket[]
    seriesKeys: string[]
    totals: Record<string, number>
    overallTotal: number
    topSeries: { key: string; count: number } | null
}

export type LeadTrendsSummary = {
    total: number
    topSeries: { key: string; count: number } | null
    priorDelta: {
        count: number
        percent: number | null
    }
    unclassifiedCount: number
    unclassifiedRatio: number
}

export type ChartMode = 'stacked' | 'line'
