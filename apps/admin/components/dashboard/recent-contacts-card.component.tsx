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

import { useRecentContacts } from '@/hooks/use-dashboard.hook'

/**
 * Recent contacts card component that fetches its own data via TanStack Query.
 * Shows the 5 most recent contact submissions.
 */
export function RecentContactsCard() {
    const { data: contacts, isLoading, error, refetch } = useRecentContacts(5)

    return (
        <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
                <CardTitle className='text-lg font-medium'>
                    Recent Contacts
                </CardTitle>
                <Link
                    href='/contacts'
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
                            Failed to load contacts
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
                ) : contacts && contacts.length > 0 ? (
                    <div className='space-y-4'>
                        {contacts.map((contact) => (
                            <div
                                key={contact.id}
                                className='flex items-start justify-between gap-4 rounded-lg border p-3'
                            >
                                <div className='min-w-0 flex-1'>
                                    <p className='truncate font-medium'>
                                        {contact.name}
                                    </p>
                                    <p className='text-muted-foreground truncate text-sm'>
                                        {contact.email}
                                    </p>
                                    {contact.subject && (
                                        <p className='text-muted-foreground mt-1 truncate text-sm'>
                                            {contact.subject}
                                        </p>
                                    )}
                                </div>
                                <div className='text-muted-foreground flex shrink-0 items-center gap-1 text-xs'>
                                    <Clock className='h-3 w-3' />
                                    {contact.createdAt
                                        ? formatRelativeTime(contact.createdAt)
                                        : 'N/A'}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className='text-muted-foreground py-8 text-center text-sm'>
                        No contacts yet
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
