'use client'

import Link from 'next/link'
import { Clock, AlertCircle, RefreshCw } from 'lucide-react'

import { formatRelativeTime } from '@/lib/utils/format-date.util'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Button } from '@workspace/ui/components/button'

import { useDateRange } from '@/components/analytics/date-range-context.component'
import { useRecentContacts } from '@/hooks/use-dashboard.hook'

/**
 * Recent contacts card component that fetches its own data via TanStack Query.
 * Uses the date range context to filter data.
 */
export function RecentContactsCard() {
    const { days } = useDateRange()
    const {
        data: contacts,
        isLoading,
        error,
        refetch,
    } = useRecentContacts(days, 5)

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
