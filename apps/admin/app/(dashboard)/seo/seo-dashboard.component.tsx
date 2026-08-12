'use client'

import { useState } from 'react'

import { useSearchConsoleSummary } from '@/hooks/use-search-console.hook'
import { SearchConsoleNotConfigured } from '@/components/seo/search-console-not-configured.component'
import { Skeleton } from '@workspace/ui/components/skeleton'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@workspace/ui/components/tabs'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select'
import { BarChart3, TrendingUp, FileText, Globe, Calendar } from 'lucide-react'

/**
 * Time frame options for the SEO dashboard
 */
const TIME_FRAME_OPTIONS = [
    { value: '7', label: 'Last 7 days' },
    { value: '28', label: 'Last 28 days' },
    { value: '90', label: 'Last 3 months' },
] as const

// Overview tab components
import { SeoStatsGrid } from '@/components/seo/seo-stats-grid.component'
import { SearchTrendsChartCard } from '@/components/seo/search-trends-chart.component'
import { SearchQueriesCard } from '@/components/seo/search-queries-card.component'
import { SearchPagesCard } from '@/components/seo/search-pages-card.component'
import { ContentOpportunitiesCard } from '@/components/seo/content-opportunities-card.component'
import { GscSnapshotStatusCard } from '@/components/seo/gsc-snapshot-status-card.component'
import { CannibalizationReportCard } from '@/components/seo/cannibalization-report-card.component'
import { RefreshQueueCard } from '@/components/seo/refresh-queue-card.component'

// Position Tracking tab components
import { PositionChangesCard } from '@/components/seo/position-changes-card.component'

// Blog Audit tab components
import { BlogSeoAuditCard } from '@/components/seo/blog-seo-audit-card.component'

// Index Status tab components
import { SitemapStatusCard } from '@/components/seo/sitemap-status-card.component'
import { IndexCoverageCard } from '@/components/seo/index-coverage-card.component'

/**
 * SEO Dashboard with tabbed interface
 *
 * Features:
 * - Overview: Stats, trends, opportunities, queries, pages
 * - Position Tracking: Keyword ranking changes (winners/losers)
 * - Blog Audit: SEO health for all blog posts
 * - Index Status: Sitemap and URL indexing status
 */
export function SeoDashboard() {
    const [days, setDays] = useState(28)
    const { data, isLoading } = useSearchConsoleSummary(days)

    if (isLoading) {
        return (
            <div className='space-y-6'>
                <div>
                    <Skeleton className='h-8 w-48' />
                    <Skeleton className='mt-2 h-4 w-96' />
                </div>
                <Skeleton className='h-12 w-full' />
                <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className='h-28' />
                    ))}
                </div>
                <Skeleton className='h-80' />
            </div>
        )
    }

    // If not configured, show setup instructions
    if (!data?.configured) {
        return (
            <div className='space-y-8'>
                <div>
                    <h1 className='text-2xl font-bold tracking-tight'>
                        SEO Insights
                    </h1>
                    <p className='text-muted-foreground'>
                        Search performance data from Google Search Console
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
                <div>
                    <h1 className='text-2xl font-bold tracking-tight'>
                        SEO Insights
                    </h1>
                    <p className='text-muted-foreground'>
                        Search performance data from Google Search Console
                    </p>
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

            {/* Tabbed Dashboard */}
            <Tabs defaultValue='overview' className='space-y-6'>
                <TabsList className='grid w-full grid-cols-4 lg:inline-grid lg:w-auto'>
                    <TabsTrigger
                        value='overview'
                        className='flex items-center gap-2'
                    >
                        <BarChart3 className='h-4 w-4' />
                        <span className='hidden sm:inline'>Overview</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value='position'
                        className='flex items-center gap-2'
                    >
                        <TrendingUp className='h-4 w-4' />
                        <span className='hidden sm:inline'>Rankings</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value='blog-audit'
                        className='flex items-center gap-2'
                    >
                        <FileText className='h-4 w-4' />
                        <span className='hidden sm:inline'>Blog Audit</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value='index'
                        className='flex items-center gap-2'
                    >
                        <Globe className='h-4 w-4' />
                        <span className='hidden sm:inline'>Index Status</span>
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value='overview' className='space-y-6'>
                    {/* Summary Stats */}
                    <SeoStatsGrid days={days} />

                    {/* Performance Trend Chart */}
                    <SearchTrendsChartCard days={days} />

                    {/* Content Opportunities */}
                    <ContentOpportunitiesCard days={days} />

                    {/* Refresh loop (epic #144): snapshot health + cannibalization */}
                    <GscSnapshotStatusCard />
                    <div className='grid gap-6 lg:grid-cols-2'>
                        <CannibalizationReportCard />
                        <RefreshQueueCard />
                    </div>

                    {/* Queries & Pages Tables */}
                    <div className='grid gap-6 lg:grid-cols-2'>
                        <SearchQueriesCard days={days} />
                        <SearchPagesCard days={days} />
                    </div>
                </TabsContent>

                {/* Position Tracking Tab */}
                <TabsContent value='position' className='space-y-6'>
                    <PositionChangesCard />
                </TabsContent>

                {/* Blog Audit Tab */}
                <TabsContent value='blog-audit' className='space-y-6'>
                    <BlogSeoAuditCard />
                </TabsContent>

                {/* Index Status Tab */}
                <TabsContent value='index' className='space-y-6'>
                    <div className='grid gap-6 lg:grid-cols-2'>
                        <SitemapStatusCard />
                        <IndexCoverageCard />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
