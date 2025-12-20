'use client'

import Link from 'next/link'
import { Clock, AlertCircle, RefreshCw } from 'lucide-react'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Button } from '@workspace/ui/components/button'

import { useRecentBugReports } from '@/hooks/use-dashboard.hook'

/**
 * Recent bug reports card component that fetches its own data via TanStack Query.
 * Shows the 5 most recent bug reports.
 */
export function RecentBugsCard() {
    const { data: reports, isLoading, error, refetch } = useRecentBugReports(5)

    return (
        <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
                <CardTitle className='text-lg font-medium'>
                    Recent Bug Reports
                </CardTitle>
                <Link
                    href='/feedback'
                    className='text-muted-foreground hover:text-foreground text-sm'
                >
                    View all
                </Link>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className='space-y-4'>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className='h-20 w-full' />
                        ))}
                    </div>
                ) : error ? (
                    <div className='flex flex-col items-center justify-center gap-3 py-8'>
                        <AlertCircle className='h-5 w-5 text-red-500' />
                        <p className='text-muted-foreground text-sm'>
                            Failed to load bug reports
                        </p>
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={() => refetch()}
                        >
                            <RefreshCw className='mr-2 h-4 w-4' />
                            Retry
                        </Button>
                    </div>
                ) : reports && reports.length > 0 ? (
                    <div className='space-y-4'>
                        {reports.map((report) => (
                            <div
                                key={report.id}
                                className='flex items-start justify-between gap-4 rounded-lg border p-3'
                            >
                                <div className='min-w-0 flex-1'>
                                    <p className='line-clamp-1 font-medium'>
                                        {report.description}
                                    </p>
                                    <p className='text-muted-foreground truncate text-sm'>
                                        {report.pageUrl}
                                    </p>
                                    <div className='mt-1 flex items-center gap-2'>
                                        <SeverityBadge
                                            severity={report.severity}
                                        />
                                        <StatusBadge status={report.status} />
                                    </div>
                                </div>
                                <div className='text-muted-foreground flex shrink-0 items-center gap-1 text-xs'>
                                    <Clock className='h-3 w-3' />
                                    {formatRelativeTime(report.createdAt)}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className='text-muted-foreground py-8 text-center text-sm'>
                        No bug reports yet
                    </p>
                )}
            </CardContent>
        </Card>
    )
}

function SeverityBadge({ severity }: { severity: string | null }) {
    const colors: Record<string, string> = {
        low: 'bg-green-100 text-green-800',
        medium: 'bg-yellow-100 text-yellow-800',
        high: 'bg-orange-100 text-orange-800',
        critical: 'bg-red-100 text-red-800',
    }

    return (
        <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                colors[severity ?? 'medium'] ?? colors.medium
            }`}
        >
            {severity ?? 'medium'}
        </span>
    )
}

function StatusBadge({ status }: { status: string | null }) {
    const colors: Record<string, string> = {
        new: 'bg-blue-100 text-blue-800',
        acknowledged: 'bg-purple-100 text-purple-800',
        'in-progress': 'bg-yellow-100 text-yellow-800',
        resolved: 'bg-green-100 text-green-800',
        'wont-fix': 'bg-stone-100 text-stone-800',
    }

    return (
        <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                colors[status ?? 'new'] ?? colors.new
            }`}
        >
            {status ?? 'new'}
        </span>
    )
}

function formatRelativeTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    const diffMs = now.getTime() - dateObj.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return dateObj.toLocaleDateString()
}
