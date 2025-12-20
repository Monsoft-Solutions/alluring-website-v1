'use client'

import Link from 'next/link'
import { Clock, AlertCircle, RefreshCw, Star, Phone, Mail } from 'lucide-react'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'

import { useHighValueLeads } from '@/hooks/use-dashboard.hook'

/**
 * High-value leads card showing the 5 most recent A/B grade leads from AI chat.
 */
export function HighValueLeadsCard() {
    const { data: leads, isLoading, error, refetch } = useHighValueLeads(5)

    return (
        <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
                <CardTitle className='flex items-center gap-2 text-lg font-medium'>
                    <Star className='h-5 w-5 fill-yellow-400 text-yellow-400' />
                    High-Value Leads
                </CardTitle>
                <Link
                    href='/chat/conversations'
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
                            Failed to load leads
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
                ) : leads && leads.length > 0 ? (
                    <div className='space-y-4'>
                        {leads.map((lead) => (
                            <div
                                key={lead.id}
                                className='flex items-start justify-between gap-4 rounded-lg border p-3'
                            >
                                <div className='min-w-0 flex-1'>
                                    <div className='flex items-center gap-2'>
                                        <p className='truncate font-medium'>
                                            {lead.fullName}
                                        </p>
                                        <Badge
                                            variant={
                                                lead.leadGrade === 'A'
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                            className={
                                                lead.leadGrade === 'A'
                                                    ? 'bg-green-500 hover:bg-green-600'
                                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                                            }
                                        >
                                            Grade {lead.leadGrade}
                                        </Badge>
                                    </div>
                                    <div className='mt-1 flex flex-wrap gap-x-4 gap-y-1'>
                                        <div className='text-muted-foreground flex items-center gap-1 text-xs'>
                                            <Phone className='h-3 w-3' />
                                            {lead.phone}
                                        </div>
                                        {lead.email && (
                                            <div className='text-muted-foreground flex items-center gap-1 text-xs'>
                                                <Mail className='h-3 w-3' />
                                                {lead.email}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className='text-muted-foreground flex shrink-0 items-center gap-1 text-xs'>
                                    <Clock className='h-3 w-3' />
                                    {formatRelativeTime(lead.createdAt)}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className='text-muted-foreground py-8 text-center text-sm'>
                        No high-value leads yet
                    </p>
                )}
            </CardContent>
        </Card>
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
