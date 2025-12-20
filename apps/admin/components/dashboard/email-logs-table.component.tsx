'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
    CheckCircle2,
    XCircle,
    Clock,
    AlertTriangle,
    Mail,
    ExternalLink,
    Eye,
    AlertCircle,
    RefreshCw,
} from 'lucide-react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@workspace/ui/components/dialog'
import { Skeleton } from '@workspace/ui/components/skeleton'

import { useEmailLogs } from '@/hooks/use-emails.hook'
import type { EmailLogListItem } from '@/lib/types/emails.type'

/**
 * Email logs table component that manages its own pagination and filtering.
 */
export function EmailLogsTable() {
    const [page, setPage] = useState(1)
    const [status, setStatus] = useState<'sent' | 'failed' | 'pending' | 'all'>(
        'all'
    )
    const pageSize = 15

    const { data, isLoading, error, refetch } = useEmailLogs(
        page,
        pageSize,
        status
    )

    const emails = data?.emails ?? []
    const total = data?.total ?? 0
    const totalPages = Math.ceil(total / pageSize)

    const handleStatusChange = (value: string) => {
        setStatus(value as typeof status)
        setPage(1) // Reset to first page on filter change
    }

    return (
        <div className='space-y-4'>
            <Card>
                <CardHeader className='pb-3'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <CardTitle className='text-lg'>
                                Email History
                            </CardTitle>
                            <CardDescription>
                                {isLoading ? (
                                    <Skeleton className='h-4 w-24' />
                                ) : (
                                    `${total} total emails`
                                )}
                            </CardDescription>
                        </div>
                        <div className='flex items-center gap-2'>
                            <Select
                                value={status}
                                onValueChange={handleStatusChange}
                            >
                                <SelectTrigger className='w-[140px]'>
                                    <SelectValue placeholder='Filter status' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='all'>
                                        All Status
                                    </SelectItem>
                                    <SelectItem value='sent'>Sent</SelectItem>
                                    <SelectItem value='failed'>
                                        Failed
                                    </SelectItem>
                                    <SelectItem value='pending'>
                                        Pending
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className='p-0'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Recipient</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Sent At</TableHead>
                                <TableHead className='w-[80px]'>
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: pageSize }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell>
                                            <Skeleton className='h-10 w-full' />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className='h-5 w-full' />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className='h-6 w-20' />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className='h-5 w-24' />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className='h-5 w-32' />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className='h-8 w-8' />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : error ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className='py-8 text-center'
                                    >
                                        <div className='flex flex-col items-center gap-2'>
                                            <AlertCircle className='h-8 w-8 text-red-500' />
                                            <p className='text-muted-foreground text-sm'>
                                                Failed to load email logs
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
                                    </TableCell>
                                </TableRow>
                            ) : emails.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className='text-muted-foreground py-8 text-center'
                                    >
                                        No emails found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                emails.map((email) => (
                                    <TableRow key={email.id}>
                                        <TableCell>
                                            <div className='space-y-1'>
                                                <p className='font-medium'>
                                                    {email.to}
                                                </p>
                                                <p className='text-muted-foreground text-xs'>
                                                    From: {email.from}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <p className='max-w-[250px] truncate text-sm'>
                                                {email.subject}
                                            </p>
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge
                                                status={email.status}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {email.contactName ? (
                                                <Link
                                                    href={`/contacts?search=${encodeURIComponent(email.contactEmail ?? '')}`}
                                                    className='text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm'
                                                >
                                                    {email.contactName}
                                                    <ExternalLink className='h-3 w-3' />
                                                </Link>
                                            ) : (
                                                <span className='text-muted-foreground text-sm'>
                                                    —
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className='text-muted-foreground text-sm'>
                                                {formatDate(email.sentAt)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <EmailDetailDialog email={email} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pagination */}
            {!isLoading && !error && totalPages > 1 && (
                <div className='flex items-center justify-center gap-2'>
                    <Button
                        variant='outline'
                        size='sm'
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                    >
                        Previous
                    </Button>
                    <span className='text-muted-foreground text-sm'>
                        Page {page} of {totalPages}
                    </span>
                    <Button
                        variant='outline'
                        size='sm'
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    )
}

function StatusBadge({ status }: { status: 'sent' | 'failed' | 'pending' }) {
    const config = {
        sent: {
            variant: 'default' as const,
            icon: CheckCircle2,
            label: 'Sent',
        },
        failed: {
            variant: 'destructive' as const,
            icon: XCircle,
            label: 'Failed',
        },
        pending: {
            variant: 'secondary' as const,
            icon: Clock,
            label: 'Pending',
        },
    }

    const statusConfig = config[status] ?? config.pending
    const Icon = statusConfig.icon

    return (
        <Badge variant={statusConfig.variant} className='gap-1'>
            <Icon className='h-3 w-3' />
            {statusConfig.label}
        </Badge>
    )
}

function EmailDetailDialog({ email }: { email: EmailLogListItem }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant='ghost' size='sm'>
                    <Eye className='h-4 w-4' />
                </Button>
            </DialogTrigger>
            <DialogContent className='max-w-lg'>
                <DialogHeader>
                    <DialogTitle className='flex items-center gap-2'>
                        <Mail className='h-5 w-5' />
                        Email Details
                    </DialogTitle>
                    <DialogDescription>
                        Sent {formatDate(email.sentAt)}
                    </DialogDescription>
                </DialogHeader>
                <div className='space-y-4'>
                    <div className='grid gap-4'>
                        <div className='grid grid-cols-4 items-center gap-4'>
                            <span className='text-muted-foreground text-sm font-medium'>
                                To:
                            </span>
                            <span className='col-span-3 text-sm'>
                                {email.to}
                            </span>
                        </div>
                        <div className='grid grid-cols-4 items-center gap-4'>
                            <span className='text-muted-foreground text-sm font-medium'>
                                From:
                            </span>
                            <span className='col-span-3 text-sm'>
                                {email.from}
                            </span>
                        </div>
                        <div className='grid grid-cols-4 items-center gap-4'>
                            <span className='text-muted-foreground text-sm font-medium'>
                                Subject:
                            </span>
                            <span className='col-span-3 text-sm'>
                                {email.subject}
                            </span>
                        </div>
                        <div className='grid grid-cols-4 items-center gap-4'>
                            <span className='text-muted-foreground text-sm font-medium'>
                                Status:
                            </span>
                            <span className='col-span-3'>
                                <StatusBadge status={email.status} />
                            </span>
                        </div>
                        {email.resendEmailId && (
                            <div className='grid grid-cols-4 items-center gap-4'>
                                <span className='text-muted-foreground text-sm font-medium'>
                                    Resend ID:
                                </span>
                                <span className='col-span-3 font-mono text-xs'>
                                    {email.resendEmailId}
                                </span>
                            </div>
                        )}
                        {email.contactName && (
                            <div className='grid grid-cols-4 items-center gap-4'>
                                <span className='text-muted-foreground text-sm font-medium'>
                                    Contact:
                                </span>
                                <span className='col-span-3 text-sm'>
                                    {email.contactName} ({email.contactEmail})
                                </span>
                            </div>
                        )}
                    </div>

                    {email.status === 'failed' && email.error && (
                        <div className='rounded-lg border border-red-200 bg-red-50 p-4'>
                            <div className='mb-2 flex items-center gap-2 text-red-800'>
                                <AlertTriangle className='h-4 w-4' />
                                <span className='text-sm font-medium'>
                                    Error Details
                                </span>
                            </div>
                            <p className='font-mono text-xs text-red-700'>
                                {email.error}
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

function formatDate(date: Date | string): string {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(date))
}
