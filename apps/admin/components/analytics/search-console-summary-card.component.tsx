'use client'

import Link from 'next/link'
import {
    Search,
    MousePointerClick,
    Eye,
    TrendingUp,
    Target,
    AlertCircle,
    RefreshCw,
    Settings,
    ArrowRight,
} from 'lucide-react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Button } from '@workspace/ui/components/button'

import { useSearchConsoleSummary } from '@/hooks/use-search-console.hook'

/**
 * Search Console summary card for the Analytics page.
 * Shows key metrics from Google Search Console and links to the full SEO Insights page.
 */
export function SearchConsoleSummaryCard() {
    const { data, isLoading, error, refetch } = useSearchConsoleSummary()

    if (isLoading) {
        return <SearchConsoleSummarySkeleton />
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2 text-lg'>
                        <Search className='h-5 w-5' />
                        Google Search Console
                    </CardTitle>
                </CardHeader>
                <CardContent className='flex items-center justify-center gap-4 py-8'>
                    <AlertCircle className='h-5 w-5 text-red-500' />
                    <p className='text-muted-foreground text-sm'>
                        Failed to load Search Console data
                    </p>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={() => refetch()}
                    >
                        <RefreshCw className='mr-2 h-4 w-4' />
                        Retry
                    </Button>
                </CardContent>
            </Card>
        )
    }

    // Not configured state
    if (!data?.configured) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2 text-lg'>
                        <Search className='h-5 w-5' />
                        Google Search Console
                    </CardTitle>
                    <CardDescription>
                        Track your search performance and discover content
                        opportunities
                    </CardDescription>
                </CardHeader>
                <CardContent className='flex flex-col items-center justify-center gap-4 py-8'>
                    <Settings className='text-muted-foreground h-10 w-10' />
                    <div className='text-center'>
                        <p className='text-muted-foreground text-sm'>
                            Search Console is not configured
                        </p>
                        <p className='text-muted-foreground mt-1 text-xs'>
                            Add GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY to
                            enable
                        </p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const summary = data.data
    if (!summary) {
        return null
    }

    // Format CTR as percentage
    const ctrPercent = (summary.avgCtr * 100).toFixed(1)

    return (
        <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
                <div>
                    <CardTitle className='flex items-center gap-2 text-lg'>
                        <Search className='h-5 w-5' />
                        Google Search Console
                    </CardTitle>
                    <CardDescription>
                        Last {summary.periodDays} days
                    </CardDescription>
                </div>
                <Link href='/seo'>
                    <Button variant='ghost' size='sm'>
                        View Details
                        <ArrowRight className='ml-2 h-4 w-4' />
                    </Button>
                </Link>
            </CardHeader>
            <CardContent>
                <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                    <MetricItem
                        icon={MousePointerClick}
                        label='Clicks'
                        value={summary.totalClicks.toLocaleString()}
                    />
                    <MetricItem
                        icon={Eye}
                        label='Impressions'
                        value={summary.totalImpressions.toLocaleString()}
                    />
                    <MetricItem
                        icon={TrendingUp}
                        label='Avg CTR'
                        value={`${ctrPercent}%`}
                    />
                    <MetricItem
                        icon={Target}
                        label='Avg Position'
                        value={summary.avgPosition.toFixed(1)}
                    />
                </div>
                {summary.topQuery && (
                    <div className='mt-4 rounded-lg bg-stone-50 p-3'>
                        <p className='text-muted-foreground text-xs font-medium'>
                            Top Search Query
                        </p>
                        <p className='mt-1 truncate font-medium'>
                            {summary.topQuery}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

type MetricItemProps = {
    icon: React.ComponentType<{ className?: string }>
    label: string
    value: string
}

function MetricItem({ icon: Icon, label, value }: MetricItemProps) {
    return (
        <div className='flex items-center gap-3'>
            <div className='rounded-lg bg-stone-100 p-2'>
                <Icon className='h-4 w-4 text-stone-600' />
            </div>
            <div>
                <p className='text-muted-foreground text-xs'>{label}</p>
                <p className='text-lg font-semibold'>{value}</p>
            </div>
        </div>
    )
}

function SearchConsoleSummarySkeleton() {
    return (
        <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
                <div>
                    <Skeleton className='h-6 w-48' />
                    <Skeleton className='mt-2 h-4 w-24' />
                </div>
                <Skeleton className='h-9 w-28' />
            </CardHeader>
            <CardContent>
                <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className='flex items-center gap-3'>
                            <Skeleton className='h-10 w-10 rounded-lg' />
                            <div>
                                <Skeleton className='h-3 w-16' />
                                <Skeleton className='mt-1 h-6 w-12' />
                            </div>
                        </div>
                    ))}
                </div>
                <Skeleton className='mt-4 h-16 w-full rounded-lg' />
            </CardContent>
        </Card>
    )
}
