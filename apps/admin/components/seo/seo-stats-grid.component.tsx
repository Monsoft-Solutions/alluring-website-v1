'use client'

import {
    MousePointerClick,
    Eye,
    TrendingUp,
    Target,
    AlertCircle,
    RefreshCw,
} from 'lucide-react'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Button } from '@workspace/ui/components/button'

import { useSearchConsoleSummary } from '@/hooks/use-search-console.hook'

/**
 * SEO stats grid component that displays Search Console summary metrics.
 */
export function SeoStatsGrid() {
    const { data, isLoading, error, refetch } = useSearchConsoleSummary()

    if (isLoading) {
        return <SeoStatsGridSkeleton />
    }

    if (error) {
        return (
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                <Card className='col-span-full'>
                    <CardContent className='flex items-center justify-center gap-4 py-8'>
                        <AlertCircle className='h-5 w-5 text-red-500' />
                        <p className='text-muted-foreground text-sm'>
                            Failed to load Search Console stats
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
            </div>
        )
    }

    if (!data?.configured || !data.data) {
        return null
    }

    const summary = data.data
    const ctrPercent = (summary.avgCtr * 100).toFixed(2)

    return (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <StatsCard
                title='Total Clicks'
                value={summary.totalClicks.toLocaleString()}
                description={`Last ${summary.periodDays} days`}
                icon={MousePointerClick}
            />
            <StatsCard
                title='Total Impressions'
                value={summary.totalImpressions.toLocaleString()}
                description={`Last ${summary.periodDays} days`}
                icon={Eye}
            />
            <StatsCard
                title='Average CTR'
                value={`${ctrPercent}%`}
                description='Click-through rate'
                icon={TrendingUp}
            />
            <StatsCard
                title='Average Position'
                value={summary.avgPosition.toFixed(1)}
                description='In search results'
                icon={Target}
            />
        </div>
    )
}

type StatsCardProps = {
    title: string
    value: string
    description: string
    icon: React.ComponentType<{ className?: string }>
}

function StatsCard({ title, value, description, icon: Icon }: StatsCardProps) {
    return (
        <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
                <CardTitle className='text-muted-foreground text-sm font-medium'>
                    {title}
                </CardTitle>
                <Icon className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
                <div className='truncate text-2xl font-bold'>{value}</div>
                <p className='text-muted-foreground mt-1 text-xs'>
                    {description}
                </p>
            </CardContent>
        </Card>
    )
}

function SeoStatsGridSkeleton() {
    return (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader className='flex flex-row items-center justify-between pb-2'>
                        <Skeleton className='h-4 w-24' />
                        <Skeleton className='h-4 w-4' />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className='h-8 w-20' />
                        <Skeleton className='mt-1 h-3 w-16' />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
