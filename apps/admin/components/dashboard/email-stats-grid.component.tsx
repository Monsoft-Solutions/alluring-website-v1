'use client'

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Button } from '@workspace/ui/components/button'
import {
    Send,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    RefreshCw,
} from 'lucide-react'

import { useEmailStats } from '@/hooks/use-emails.hook'

/**
 * Email stats grid component that fetches its own data via TanStack Query.
 * Shows total sent, delivered, failed, and pending counts.
 */
export function EmailStatsGrid() {
    const { data: stats, isLoading, error, refetch } = useEmailStats()

    if (isLoading) {
        return <EmailStatsSkeleton />
    }

    if (error) {
        return (
            <div className='grid gap-4 md:grid-cols-4'>
                <Card className='col-span-full'>
                    <CardContent className='flex items-center justify-center gap-4 py-8'>
                        <AlertCircle className='h-5 w-5 text-red-500' />
                        <p className='text-muted-foreground text-sm'>
                            Failed to load email stats
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

    if (!stats) {
        return null
    }

    return (
        <div className='grid gap-4 md:grid-cols-4'>
            <StatsCard
                title='Total Sent'
                value={stats.total}
                icon={Send}
                description='All time emails'
            />
            <StatsCard
                title='Delivered'
                value={stats.sent}
                icon={CheckCircle2}
                description={`${stats.successRate}% success rate`}
                iconColor='text-green-600'
            />
            <StatsCard
                title='Failed'
                value={stats.failed}
                icon={XCircle}
                description='Delivery failures'
                iconColor='text-red-600'
            />
            <StatsCard
                title='Pending'
                value={stats.pending}
                icon={Clock}
                description='In queue'
                iconColor='text-yellow-600'
            />
        </div>
    )
}

type StatsCardProps = {
    title: string
    value: number
    description: string
    icon: React.ComponentType<{ className?: string }>
    iconColor?: string
}

function StatsCard({
    title,
    value,
    description,
    icon: Icon,
    iconColor = 'text-muted-foreground',
}: StatsCardProps) {
    return (
        <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
                <CardTitle className='text-muted-foreground text-sm font-medium'>
                    {title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${iconColor}`} />
            </CardHeader>
            <CardContent>
                <div className='text-2xl font-bold'>{value}</div>
                <p className='text-muted-foreground mt-1 text-xs'>
                    {description}
                </p>
            </CardContent>
        </Card>
    )
}

function EmailStatsSkeleton() {
    return (
        <div className='grid gap-4 md:grid-cols-4'>
            {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader className='flex flex-row items-center justify-between pb-2'>
                        <Skeleton className='h-4 w-24' />
                        <Skeleton className='h-4 w-4' />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className='h-8 w-16' />
                        <Skeleton className='mt-1 h-3 w-32' />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
