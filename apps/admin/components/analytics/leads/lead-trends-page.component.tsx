'use client'

import { useMemo, useState } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'

import {
    DateRangeProvider,
    useDateRange,
} from '@/components/analytics/date-range-context.component'
import { LeadTrendsChart } from '@/components/analytics/leads/lead-trends-chart.component'
import { LeadTrendsFilterBar } from '@/components/analytics/leads/lead-trends-filter-bar.component'
import { LeadTrendsSummaryStrip } from '@/components/analytics/leads/lead-trends-summary-strip.component'
import { useLeadTrends } from '@/hooks/use-lead-trends.hook'
import {
    applyFilters,
    bucketLeads,
    computeSummary,
    groupByBreakdown,
} from '@/lib/analytics/lead-trends-pipeline'
import type {
    BreakdownBy,
    ClassifiedLead,
} from '@/lib/types/analytics/lead-trends.type'

export function LeadTrendsPage() {
    return (
        <DateRangeProvider defaultValue='28d'>
            <LeadTrendsView />
        </DateRangeProvider>
    )
}

function LeadTrendsView() {
    const { startDate, endDate, granularity, label } = useDateRange()
    const { current, prior } = useLeadTrends(startDate, endDate)

    const [sources, setSources] = useState<string[]>([])
    const [mediums, setMediums] = useState<string[]>([])
    const [breakdownBy, setBreakdownBy] = useState<BreakdownBy>('source')

    const allLeads = useMemo<ClassifiedLead[]>(
        () => current.data?.leads ?? [],
        [current.data]
    )
    const priorLeads = useMemo<ClassifiedLead[]>(
        () => prior.data?.leads ?? [],
        [prior.data]
    )

    const filtered = useMemo(
        () => applyFilters(allLeads, { sources, mediums }),
        [allLeads, sources, mediums]
    )
    const priorFiltered = useMemo(
        () => applyFilters(priorLeads, { sources, mediums }),
        [priorLeads, sources, mediums]
    )
    const trend = useMemo(() => {
        const bucketMap = bucketLeads(filtered, granularity, {
            startDate,
            endDate,
        })
        return groupByBreakdown(bucketMap, breakdownBy)
    }, [filtered, granularity, breakdownBy, startDate, endDate])
    const summary = useMemo(
        () => computeSummary(filtered, priorFiltered, breakdownBy),
        [filtered, priorFiltered, breakdownBy]
    )

    return (
        <div className='space-y-6'>
            <header>
                <h1 className='font-serif text-3xl'>Lead Source Trends</h1>
                <p className='text-muted-foreground'>
                    Where your consultation requests are coming from.
                </p>
            </header>

            <LeadTrendsFilterBar
                allLeads={allLeads}
                sources={sources}
                onSourcesChange={setSources}
                mediums={mediums}
                onMediumsChange={setMediums}
                breakdownBy={breakdownBy}
                onBreakdownChange={setBreakdownBy}
            />

            <ChartBody
                isLoading={current.isLoading}
                isError={Boolean(current.error)}
                onRetry={() => {
                    void current.refetch()
                    void prior.refetch()
                }}
                hasData={allLeads.length > 0}
                filteredCount={filtered.length}
            >
                <LeadTrendsSummaryStrip
                    summary={summary}
                    breakdownBy={breakdownBy}
                    priorWindowLabel={`previous ${label.toLowerCase()}`}
                />
                {filtered.length === 0 ? (
                    <EmptyState
                        title='No leads match the current filters'
                        description='Try removing a source or medium filter, or widening the date range.'
                    />
                ) : (
                    <Card>
                        <CardContent className='pt-6'>
                            <LeadTrendsChart
                                trend={trend}
                                granularity={granularity}
                            />
                        </CardContent>
                    </Card>
                )}
            </ChartBody>
        </div>
    )
}

type ChartBodyProps = {
    children: React.ReactNode
    isLoading: boolean
    isError: boolean
    hasData: boolean
    filteredCount: number
    onRetry: () => void
}

function ChartBody({
    children,
    isLoading,
    isError,
    hasData,
    onRetry,
}: ChartBodyProps) {
    if (isLoading) {
        return (
            <div className='space-y-3'>
                <div className='grid grid-cols-2 gap-3 md:grid-cols-4'>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className='h-[88px] w-full' />
                    ))}
                </div>
                <Skeleton className='h-[420px] w-full' />
            </div>
        )
    }
    if (isError) {
        return (
            <Card>
                <CardContent className='flex flex-col items-center justify-center gap-3 py-12'>
                    <AlertCircle className='h-5 w-5 text-rose-500' />
                    <p className='text-muted-foreground text-sm'>
                        Failed to load lead trends.
                    </p>
                    <Button variant='outline' size='sm' onClick={onRetry}>
                        <RefreshCw className='mr-2 h-4 w-4' />
                        Retry
                    </Button>
                </CardContent>
            </Card>
        )
    }
    if (!hasData) {
        return (
            <EmptyState
                title='No leads in this range yet'
                description='Try a wider date range, or check back once contact form submissions arrive.'
            />
        )
    }
    return <>{children}</>
}

function EmptyState({
    title,
    description,
}: {
    title: string
    description: string
}) {
    return (
        <Card>
            <CardContent className='flex flex-col items-center justify-center gap-2 py-12 text-center'>
                <p className='font-serif text-lg'>{title}</p>
                <p className='text-muted-foreground max-w-sm text-sm'>
                    {description}
                </p>
            </CardContent>
        </Card>
    )
}
