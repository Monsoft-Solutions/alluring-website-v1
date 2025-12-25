'use client'

import { useState, useMemo } from 'react'
import type { SortingState } from '@tanstack/react-table'
import { Calendar, Search, Lightbulb, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select'
import { Button } from '@workspace/ui/components/button'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Badge } from '@workspace/ui/components/badge'

import {
    useQuerySearch,
    useSearchConsoleSummary,
} from '@/hooks/use-search-console.hook'
import { QuerySearchInput } from '@/components/shared/query-performance/query-search-input.component'
import { QueryPerformanceTable } from '@/components/shared/query-performance/query-performance-table.component'
import { SearchConsoleNotConfigured } from '@/components/seo/search-console-not-configured.component'
import type { SortDirection } from '@/lib/types/shared/sorting.type'
import type { SortField } from '@/lib/types/search-console/search-console.type'

/**
 * Time frame options for the queries page
 */
const TIME_FRAME_OPTIONS = [
    { value: '7', label: 'Last 7 days' },
    { value: '28', label: 'Last 28 days' },
    { value: '90', label: 'Last 3 months' },
] as const

/**
 * Client component for the Query Performance page.
 * Handles search, filtering, sorting, and display of query data.
 */
export function QueriesPageClient() {
    const [days, setDays] = useState(28)
    const [searchTerm, setSearchTerm] = useState('')
    const [sorting, setSorting] = useState<SortingState>([
        { id: 'clicks', desc: true },
    ])

    // Convert TanStack sorting to API params
    const orderBy = (sorting[0]?.id ?? 'clicks') as SortField
    const orderDirection: SortDirection = sorting[0]?.desc ? 'desc' : 'asc'

    // Check if Search Console is configured
    const { data: summaryData, isLoading: isSummaryLoading } =
        useSearchConsoleSummary(days)

    // Fetch queries with search term
    const {
        data: queriesData,
        isLoading: isQueriesLoading,
        error: queriesError,
        refetch,
    } = useQuerySearch(searchTerm, days, 100, orderBy, orderDirection)

    // For now, we'll compute content gaps client-side from position data
    // Queries with position > 10 that have significant impressions could be gaps
    const queries = queriesData?.data
    const contentGapQueries = useMemo(() => {
        const gaps = new Set<string>()
        if (queries) {
            for (const query of queries) {
                // Consider it a content gap if:
                // - Position > 10 (not on first page)
                // - Has significant impressions (> 100)
                // - Low CTR (< 3%)
                if (
                    query.position > 10 &&
                    query.impressions > 100 &&
                    query.ctr < 0.03
                ) {
                    gaps.add(query.query)
                }
            }
        }
        return gaps
    }, [queries])

    // Loading state for initial config check
    if (isSummaryLoading) {
        return (
            <div className='space-y-6'>
                <div>
                    <Skeleton className='h-8 w-48' />
                    <Skeleton className='mt-2 h-4 w-96' />
                </div>
                <Skeleton className='h-12 w-full' />
                <Skeleton className='h-[400px] w-full' />
            </div>
        )
    }

    // If Search Console is not configured
    if (!summaryData?.configured) {
        return (
            <div className='space-y-8'>
                <div className='flex items-center gap-4'>
                    <Button variant='ghost' size='sm' asChild>
                        <Link href='/seo'>
                            <ArrowLeft className='mr-2 h-4 w-4' />
                            Back to SEO
                        </Link>
                    </Button>
                </div>
                <div>
                    <h1 className='text-2xl font-bold tracking-tight'>
                        Query Performance
                    </h1>
                    <p className='text-muted-foreground'>
                        Search query analysis from Google Search Console
                    </p>
                </div>
                <SearchConsoleNotConfigured />
            </div>
        )
    }

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                <div className='flex items-center gap-4'>
                    <Button variant='ghost' size='sm' asChild>
                        <Link href='/seo'>
                            <ArrowLeft className='mr-2 h-4 w-4' />
                            Back
                        </Link>
                    </Button>
                    <div>
                        <h1 className='text-2xl font-bold tracking-tight'>
                            Query Performance
                        </h1>
                        <p className='text-muted-foreground'>
                            Analyze search queries and discover content
                            opportunities
                        </p>
                    </div>
                </div>
                <Select
                    value={days.toString()}
                    onValueChange={(value) => setDays(Number(value))}
                >
                    <SelectTrigger className='w-[160px]'>
                        <Calendar className='mr-2 h-4 w-4' />
                        <SelectValue placeholder='Select time frame' />
                    </SelectTrigger>
                    <SelectContent>
                        {TIME_FRAME_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Quick Stats */}
            <div className='grid gap-4 sm:grid-cols-3'>
                <Card>
                    <CardHeader className='pb-2'>
                        <CardTitle className='flex items-center gap-2 text-sm font-medium'>
                            <Search className='h-4 w-4' />
                            Total Queries
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>
                            {queriesData?.data?.length ?? 0}
                        </div>
                        <p className='text-muted-foreground text-xs'>
                            {searchTerm
                                ? `Matching "${searchTerm}"`
                                : 'All queries'}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className='pb-2'>
                        <CardTitle className='flex items-center gap-2 text-sm font-medium'>
                            <Lightbulb className='h-4 w-4 text-amber-500' />
                            Content Gaps
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>
                            {contentGapQueries.size}
                        </div>
                        <p className='text-muted-foreground text-xs'>
                            Queries needing dedicated content
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className='pb-2'>
                        <CardTitle className='text-sm font-medium'>
                            Period
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>{days} days</div>
                        <p className='text-muted-foreground text-xs'>
                            Analysis timeframe
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Table */}
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <Search className='h-5 w-5' />
                        Search Queries
                    </CardTitle>
                    <CardDescription>
                        Search and analyze queries. Click on a row to see
                        detailed performance and ranking pages.
                    </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                    {/* Search Input */}
                    <QuerySearchInput
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder='Filter queries by term...'
                        className='max-w-md'
                    />

                    {/* Content Gap Legend */}
                    {contentGapQueries.size > 0 && (
                        <div className='flex items-center gap-2 text-sm'>
                            <Badge
                                variant='outline'
                                className='border-amber-500 text-amber-600'
                            >
                                Gap
                            </Badge>
                            <span className='text-muted-foreground'>
                                = High impressions, low position, needs
                                dedicated content
                            </span>
                        </div>
                    )}

                    {/* Table */}
                    <QueryPerformanceTable
                        data={queriesData?.data ?? []}
                        isLoading={isQueriesLoading}
                        error={queriesError}
                        onRetry={() => refetch()}
                        sorting={sorting}
                        onSortingChange={setSorting}
                        days={days}
                        contentGapQueries={contentGapQueries}
                        emptyMessage={
                            searchTerm
                                ? `No queries matching "${searchTerm}"`
                                : 'No query data available'
                        }
                    />
                </CardContent>
            </Card>
        </div>
    )
}
