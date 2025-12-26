'use client'

import {
    Eye,
    Users,
    TrendingUp,
    ExternalLink,
    AlertCircle,
    RefreshCw,
} from 'lucide-react'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'

import { useAnalyticsSummary } from '@/hooks/use-analytics.hook'
import { StatsGridSkeleton } from '@/components/shared/skeletons/stats-grid-skeleton.component'

/**
 * Analytics stats grid component that fetches its own data via TanStack Query.
 * Shows total views, unique sessions, today's views, and top source.
 */
export function AnalyticsStatsGrid() {
    const { data: summary, isLoading, error, refetch } = useAnalyticsSummary()

    if (isLoading) {
        return <StatsGridSkeleton />
    }

    if (error) {
        return (
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                <Card className='col-span-full'>
                    <CardContent className='flex items-center justify-center gap-4 py-8'>
                        <AlertCircle className='h-5 w-5 text-red-500' />
                        <p className='text-muted-foreground text-sm'>
                            Failed to load analytics stats
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

    if (!summary) {
        return null
    }

    return (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <StatsCard
                title='Total Page Views'
                value={summary.totalViews.toLocaleString()}
                description='All time'
                icon={Eye}
            />
            <StatsCard
                title='Unique Sessions'
                value={summary.uniqueSessions.toLocaleString()}
                description='All time'
                icon={Users}
            />
            <StatsCard
                title="Today's Views"
                value={summary.todayViews.toLocaleString()}
                description='Since midnight'
                icon={TrendingUp}
            />
            <StatsCard
                title='Top Source'
                value={summary.topSource ?? 'N/A'}
                description='By page views'
                icon={ExternalLink}
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
