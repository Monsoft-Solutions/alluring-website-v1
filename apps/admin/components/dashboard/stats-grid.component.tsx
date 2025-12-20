'use client'

import Link from 'next/link'
import { FileText, Mail, Bug, Send, AlertCircle, RefreshCw } from 'lucide-react'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Button } from '@workspace/ui/components/button'

import { useDashboardStats } from '@/hooks/use-dashboard.hook'

/**
 * Stats grid component that fetches its own data via TanStack Query.
 * Shows blog posts, contacts, emails, and bug report counts.
 */
export function StatsGrid() {
    const { data: stats, isLoading, error, refetch } = useDashboardStats()

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
                            Failed to load stats
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
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <StatsCard
                title='Total Posts'
                value={stats.blogPosts.total}
                description={`${stats.blogPosts.published} published, ${stats.blogPosts.draft} drafts`}
                icon={FileText}
                href='/blog/posts'
            />
            <StatsCard
                title='Contact Submissions'
                value={stats.contacts.total}
                description='All time submissions'
                icon={Mail}
                href='/contacts'
            />
            <StatsCard
                title='Emails Sent'
                value={stats.emails.total}
                description={`${stats.emails.successRate}% delivery rate`}
                icon={Send}
                href='/emails'
            />
            <StatsCard
                title='Bug Reports'
                value={stats.feedback.bugReports}
                description={`${stats.feedback.betaFeedback} beta feedback`}
                icon={Bug}
                href='/feedback'
            />
        </div>
    )
}

type StatsCardProps = {
    title: string
    value: number
    description: string
    icon: React.ComponentType<{ className?: string }>
    href: string
}

function StatsCard({
    title,
    value,
    description,
    icon: Icon,
    href,
}: StatsCardProps) {
    return (
        <Link href={href}>
            <Card className='transition-colors hover:bg-stone-50'>
                <CardHeader className='flex flex-row items-center justify-between pb-2'>
                    <CardTitle className='text-muted-foreground text-sm font-medium'>
                        {title}
                    </CardTitle>
                    <Icon className='text-muted-foreground h-4 w-4' />
                </CardHeader>
                <CardContent>
                    <div className='text-2xl font-bold'>{value}</div>
                    <p className='text-muted-foreground mt-1 text-xs'>
                        {description}
                    </p>
                </CardContent>
            </Card>
        </Link>
    )
}

function StatsGridSkeleton() {
    return (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
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
