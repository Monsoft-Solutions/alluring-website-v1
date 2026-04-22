import { describe, it, expect } from 'vitest'
import {
    applyFilters,
    deriveGranularity,
    bucketLeads,
    groupByBreakdown,
    computeSummary,
} from '@/lib/analytics/lead-trends-pipeline'
import type { ClassifiedLead } from '@/lib/types/analytics/lead-trends.type'

const lead = (
    ts: string,
    source: string,
    medium: string,
    classification: ClassifiedLead['classification'] = 'utm'
): ClassifiedLead => ({ ts, source, medium, classification })

describe('deriveGranularity', () => {
    it('returns hour for ranges ≤ 2 days', () => {
        expect(
            deriveGranularity({
                startDate: new Date('2026-04-22T00:00:00Z'),
                endDate: new Date('2026-04-22T23:59:59Z'),
            })
        ).toBe('hour')
        expect(
            deriveGranularity({
                startDate: new Date('2026-04-21T00:00:00Z'),
                endDate: new Date('2026-04-22T23:59:59Z'),
            })
        ).toBe('hour')
    })

    it('returns day for ranges between 3 and 31 days', () => {
        expect(
            deriveGranularity({
                startDate: new Date('2026-04-01T00:00:00Z'),
                endDate: new Date('2026-04-28T23:59:59Z'),
            })
        ).toBe('day')
    })

    it('returns week for ranges > 31 days', () => {
        expect(
            deriveGranularity({
                startDate: new Date('2026-01-01T00:00:00Z'),
                endDate: new Date('2026-04-01T23:59:59Z'),
            })
        ).toBe('week')
    })
})

describe('applyFilters', () => {
    const leads = [
        lead('2026-04-01T00:00:00Z', 'google', 'cpc'),
        lead('2026-04-01T00:00:00Z', 'facebook', 'paid'),
        lead('2026-04-01T00:00:00Z', 'google', 'organic'),
    ]

    it('returns all leads when both filters are empty', () => {
        expect(applyFilters(leads, { sources: [], mediums: [] })).toHaveLength(
            3
        )
    })

    it('filters by sources only', () => {
        const result = applyFilters(leads, { sources: ['google'], mediums: [] })
        expect(result).toHaveLength(2)
        expect(result.every((l) => l.source === 'google')).toBe(true)
    })

    it('filters by mediums only', () => {
        const result = applyFilters(leads, { sources: [], mediums: ['paid'] })
        expect(result).toHaveLength(1)
        expect(result[0]!.source).toBe('facebook')
    })

    it('intersects source + medium filters', () => {
        const result = applyFilters(leads, {
            sources: ['google'],
            mediums: ['cpc'],
        })
        expect(result).toHaveLength(1)
    })

    it('returns empty when nothing matches', () => {
        expect(
            applyFilters(leads, { sources: ['bing'], mediums: [] })
        ).toHaveLength(0)
    })
})

describe('bucketLeads', () => {
    it('seeds empty buckets across the full range at day granularity', () => {
        const leads = [lead('2026-04-03T12:00:00Z', 'google', 'cpc')]
        const result = bucketLeads(leads, 'day', {
            startDate: new Date('2026-04-01T00:00:00Z'),
            endDate: new Date('2026-04-05T23:59:59Z'),
        })
        expect(result.size).toBe(5)
        // Every bucket key is an ISO date at 00:00 local
        const keys = [...result.keys()]
        expect(keys[0]!.startsWith('2026-04-01')).toBe(true)
        expect(keys[4]!.startsWith('2026-04-05')).toBe(true)
        // The lead falls in the Apr 3 bucket
        const apr3Entries = result.get(keys[2]!)
        expect(apr3Entries).toHaveLength(1)
    })

    it('buckets by hour', () => {
        const leads = [
            lead('2026-04-01T10:15:00Z', 'google', 'cpc'),
            lead('2026-04-01T10:45:00Z', 'google', 'cpc'),
            lead('2026-04-01T11:00:00Z', 'facebook', 'paid'),
        ]
        const result = bucketLeads(leads, 'hour', {
            startDate: new Date('2026-04-01T10:00:00Z'),
            endDate: new Date('2026-04-01T12:00:00Z'),
        })
        // 3 one-hour buckets (10, 11, 12)
        expect(result.size).toBe(3)
        // Two leads in the first bucket, one in the second
        const keys = [...result.keys()]
        expect(result.get(keys[0]!)).toHaveLength(2)
        expect(result.get(keys[1]!)).toHaveLength(1)
    })

    it('buckets by ISO week (Monday start)', () => {
        const leads = [
            lead('2026-04-06T00:00:00Z', 'google', 'cpc'), // Mon wk15
            lead('2026-04-09T00:00:00Z', 'google', 'cpc'), // Thu wk15
            lead('2026-04-13T00:00:00Z', 'facebook', 'paid'), // Mon wk16
        ]
        const result = bucketLeads(leads, 'week', {
            startDate: new Date('2026-04-06T00:00:00Z'),
            endDate: new Date('2026-04-20T23:59:59Z'),
        })
        expect(result.size).toBe(3)
        const firstBucket = [...result.values()][0]!
        expect(firstBucket).toHaveLength(2)
    })
})

describe('groupByBreakdown', () => {
    const sample: ClassifiedLead[] = [
        lead('2026-04-01T00:00:00Z', 'google', 'cpc'),
        lead('2026-04-01T00:00:00Z', 'google', 'organic'),
        lead('2026-04-01T00:00:00Z', 'facebook', 'paid'),
    ]
    const bucketMap = new Map<string, ClassifiedLead[]>([
        ['2026-04-01', sample],
    ])

    it('groups by source', () => {
        const result = groupByBreakdown(bucketMap, 'source')
        expect(result.buckets).toHaveLength(1)
        expect(result.buckets[0]!.series).toEqual({ google: 2, facebook: 1 })
        expect(result.seriesKeys.sort()).toEqual(['facebook', 'google'])
        expect(result.totals).toEqual({ google: 2, facebook: 1 })
        expect(result.overallTotal).toBe(3)
        expect(result.topSeries).toEqual({ key: 'google', count: 2 })
    })

    it('groups by medium', () => {
        const result = groupByBreakdown(bucketMap, 'medium')
        expect(result.buckets[0]!.series).toEqual({
            cpc: 1,
            organic: 1,
            paid: 1,
        })
    })

    it('groups by sourceMedium pair', () => {
        const result = groupByBreakdown(bucketMap, 'sourceMedium')
        expect(result.buckets[0]!.series).toEqual({
            'google / cpc': 1,
            'google / organic': 1,
            'facebook / paid': 1,
        })
    })

    it('returns topSeries null for empty input', () => {
        const result = groupByBreakdown(new Map(), 'source')
        expect(result.topSeries).toBeNull()
        expect(result.overallTotal).toBe(0)
    })
})

describe('computeSummary', () => {
    const filtered: ClassifiedLead[] = [
        lead('2026-04-01T00:00:00Z', 'google', 'cpc', 'utm'),
        lead('2026-04-02T00:00:00Z', 'google', 'cpc', 'utm'),
        lead('2026-04-03T00:00:00Z', 'direct', 'direct', 'direct'),
    ]
    const prior: ClassifiedLead[] = [
        lead('2026-03-01T00:00:00Z', 'google', 'cpc', 'utm'),
        lead('2026-03-02T00:00:00Z', 'facebook', 'paid', 'click-id'),
    ]

    it('computes total and top series', () => {
        const summary = computeSummary(filtered, prior, 'source')
        expect(summary.total).toBe(3)
        expect(summary.topSeries).toEqual({ key: 'google', count: 2 })
    })

    it('computes prior-period delta percent', () => {
        const summary = computeSummary(filtered, prior, 'source')
        // 3 vs 2 => +50%
        expect(summary.priorDelta.count).toBe(1)
        expect(summary.priorDelta.percent).toBeCloseTo(0.5)
    })

    it('returns null percent when prior is empty', () => {
        const summary = computeSummary(filtered, [], 'source')
        expect(summary.priorDelta.percent).toBeNull()
    })

    it('counts unclassified by classification === direct', () => {
        const summary = computeSummary(filtered, [], 'source')
        expect(summary.unclassifiedCount).toBe(1)
        expect(summary.unclassifiedRatio).toBeCloseTo(1 / 3)
    })

    it('returns empty summary on zero leads', () => {
        const summary = computeSummary([], [], 'source')
        expect(summary.total).toBe(0)
        expect(summary.topSeries).toBeNull()
        expect(summary.unclassifiedRatio).toBe(0)
    })
})
