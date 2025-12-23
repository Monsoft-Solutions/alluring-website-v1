'use client'

import { useState, useMemo } from 'react'
import type { SortingState } from '@tanstack/react-table'
import { Calendar, FileText, Stethoscope, Globe, ArrowLeft } from 'lucide-react'
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

import {
    usePageSearch,
    useSearchConsoleSummary,
} from '@/hooks/use-search-console.hook'
import { QuerySearchInput } from '@/components/shared/query-performance/query-search-input.component'
import { PagePerformanceTable } from '@/components/shared/page-performance/page-performance-table.component'
import { PageTypeFilter } from '@/components/shared/page-performance/page-type-filter.component'
import { SearchConsoleNotConfigured } from '@/components/seo/search-console-not-configured.component'
import type {
    SortField,
    SortDirection,
    PageType,
} from '@/lib/types/search-console/search-console.type'

/**
 * Time frame options for the pages page
 */
const TIME_FRAME_OPTIONS = [
    { value: '7', label: 'Last 7 days' },
    { value: '28', label: 'Last 28 days' },
    { value: '90', label: 'Last 3 months' },
] as const

/**
 * Client component for the Page Performance page.
 * Handles search, filtering, sorting, and display of page data.
 */
export function PagesPageClient() {
    const [days, setDays] = useState(28)
    const [searchTerm, setSearchTerm] = useState('')
    const [pageType, setPageType] = useState<PageType | 'all'>('all')
    const [sorting, setSorting] = useState<SortingState>([
        { id: 'clicks', desc: true },
    ])

    // Convert TanStack sorting to API params
    const orderBy = (sorting[0]?.id ?? 'clicks') as SortField
    const orderDirection: SortDirection = sorting[0]?.desc ? 'desc' : 'asc'

    // Check if Search Console is configured
    const { data: summaryData, isLoading: isSummaryLoading } =
        useSearchConsoleSummary(days)

    // Fetch pages with search term and page type filter
    const {
        data: pagesData,
        isLoading: isPagesLoading,
        error: pagesError,
        refetch,
    } = usePageSearch(searchTerm, pageType, days, 100, orderBy, orderDirection)

    // Calculate stats by page type
    const pageTypeStats = useMemo(() => {
        const pages = pagesData?.data ?? []
        return {
            total: pages.length,
            blog: pages.filter((p) => p.pageType === 'blog').length,
            procedure: pages.filter((p) => p.pageType === 'procedure').length,
            pages: pages.filter((p) => p.pageType === 'pages').length,
        }
    }, [pagesData?.data])

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
                        Page Performance
                    </h1>
                    <p className='text-muted-foreground'>
                        Page analysis from Google Search Console
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
                            Page Performance
                        </h1>
                        <p className='text-muted-foreground'>
                            Analyze pages and discover optimization
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
            <div className='grid gap-4 sm:grid-cols-4'>
                <Card>
                    <CardHeader className='pb-2'>
                        <CardTitle className='flex items-center gap-2 text-sm font-medium'>
                            <FileText className='h-4 w-4' />
                            Total Pages
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>
                            {pageTypeStats.total}
                        </div>
                        <p className='text-muted-foreground text-xs'>
                            {pageType === 'all'
                                ? 'With search visibility'
                                : `${pageType} pages`}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className='pb-2'>
                        <CardTitle className='flex items-center gap-2 text-sm font-medium'>
                            <FileText className='h-4 w-4 text-blue-500' />
                            Blog Posts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>
                            {pageTypeStats.blog}
                        </div>
                        <p className='text-muted-foreground text-xs'>
                            Content pages
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className='pb-2'>
                        <CardTitle className='flex items-center gap-2 text-sm font-medium'>
                            <Stethoscope className='h-4 w-4 text-purple-500' />
                            Procedures
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>
                            {pageTypeStats.procedure}
                        </div>
                        <p className='text-muted-foreground text-xs'>
                            Service pages
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className='pb-2'>
                        <CardTitle className='flex items-center gap-2 text-sm font-medium'>
                            <Globe className='h-4 w-4 text-green-500' />
                            Pages
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>
                            {pageTypeStats.pages}
                        </div>
                        <p className='text-muted-foreground text-xs'>
                            Static pages
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Table */}
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <FileText className='h-5 w-5' />
                        All Pages
                    </CardTitle>
                    <CardDescription>
                        Filter and analyze pages. Click on a row to see detailed
                        performance, driving queries, and SEO recommendations.
                    </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                    {/* Filters */}
                    <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
                        <QuerySearchInput
                            value={searchTerm}
                            onChange={setSearchTerm}
                            placeholder='Filter pages by path...'
                            className='max-w-md'
                        />
                        <PageTypeFilter
                            value={pageType}
                            onChange={setPageType}
                        />
                    </div>

                    {/* Table */}
                    <PagePerformanceTable
                        data={pagesData?.data ?? []}
                        isLoading={isPagesLoading}
                        error={pagesError}
                        onRetry={() => refetch()}
                        sorting={sorting}
                        onSortingChange={setSorting}
                        days={days}
                        emptyMessage={
                            searchTerm || pageType !== 'all'
                                ? `No pages matching your filters`
                                : 'No page data available'
                        }
                    />
                </CardContent>
            </Card>
        </div>
    )
}
