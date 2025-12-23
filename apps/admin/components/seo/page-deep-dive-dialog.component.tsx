'use client'

import { AlertCircle, ExternalLink, RefreshCw, Search } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'

import { usePageQueries } from '@/hooks/use-search-console.hook'

type PageDeepDiveDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    pageUrl: string
}

/**
 * Page Deep Dive Dialog
 *
 * Shows all search queries driving traffic to a specific page.
 */
export function PageDeepDiveDialog({
    open,
    onOpenChange,
    pageUrl,
}: PageDeepDiveDialogProps) {
    const { data, isLoading, error, refetch } = usePageQueries(
        pageUrl,
        28,
        open
    )

    // Extract path from URL for display
    const displayPath = (() => {
        try {
            const url = new URL(pageUrl)
            return url.pathname || '/'
        } catch {
            return pageUrl
        }
    })()

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='flex max-h-[80vh] max-w-3xl flex-col overflow-hidden'>
                <DialogHeader>
                    <DialogTitle className='flex items-center gap-2'>
                        <Search className='h-5 w-5' />
                        Page Deep Dive
                    </DialogTitle>
                    <DialogDescription className='flex items-center gap-2'>
                        <span className='max-w-[400px] truncate'>
                            {displayPath}
                        </span>
                        <a
                            href={pageUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-blue-500 hover:text-blue-600'
                        >
                            <ExternalLink className='h-4 w-4' />
                        </a>
                    </DialogDescription>
                </DialogHeader>

                <div className='flex-1 overflow-auto'>
                    {isLoading ? (
                        <TableSkeleton />
                    ) : error ? (
                        <div className='flex h-[300px] flex-col items-center justify-center gap-3'>
                            <AlertCircle className='h-5 w-5 text-red-500' />
                            <p className='text-muted-foreground text-sm'>
                                Failed to load page queries
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
                    ) : data?.data && data.data.length > 0 ? (
                        <>
                            <div className='mb-4 flex items-center gap-2'>
                                <Badge variant='secondary'>
                                    {data.data.length} queries
                                </Badge>
                                <Badge variant='outline'>
                                    {data.data
                                        .reduce((sum, q) => sum + q.clicks, 0)
                                        .toLocaleString()}{' '}
                                    clicks
                                </Badge>
                                <Badge variant='outline'>
                                    {data.data
                                        .reduce(
                                            (sum, q) => sum + q.impressions,
                                            0
                                        )
                                        .toLocaleString()}{' '}
                                    impressions
                                </Badge>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Query</TableHead>
                                        <TableHead className='w-[80px] text-right'>
                                            Clicks
                                        </TableHead>
                                        <TableHead className='w-[100px] text-right'>
                                            Impressions
                                        </TableHead>
                                        <TableHead className='w-[80px] text-right'>
                                            CTR
                                        </TableHead>
                                        <TableHead className='w-[80px] text-right'>
                                            Position
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.data.map((query) => (
                                        <TableRow key={query.query}>
                                            <TableCell className='max-w-[300px] truncate font-medium'>
                                                {query.query}
                                            </TableCell>
                                            <TableCell className='text-right'>
                                                {query.clicks.toLocaleString()}
                                            </TableCell>
                                            <TableCell className='text-right'>
                                                {query.impressions.toLocaleString()}
                                            </TableCell>
                                            <TableCell className='text-right'>
                                                {(query.ctr * 100).toFixed(1)}%
                                            </TableCell>
                                            <TableCell className='text-right'>
                                                {query.position.toFixed(1)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </>
                    ) : (
                        <div className='flex h-[300px] flex-col items-center justify-center gap-2'>
                            <Search className='text-muted-foreground h-8 w-8' />
                            <p className='text-muted-foreground text-sm'>
                                No search queries found for this page
                            </p>
                            <p className='text-muted-foreground text-xs'>
                                This page may not appear in search results yet
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

function TableSkeleton() {
    return (
        <div className='space-y-3'>
            <div className='mb-4 flex gap-2'>
                <Skeleton className='h-6 w-24' />
                <Skeleton className='h-6 w-24' />
                <Skeleton className='h-6 w-28' />
            </div>
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className='flex items-center gap-4'>
                    <Skeleton className='h-4 flex-1' />
                    <Skeleton className='h-4 w-16' />
                    <Skeleton className='h-4 w-20' />
                    <Skeleton className='h-4 w-16' />
                    <Skeleton className='h-4 w-16' />
                </div>
            ))}
        </div>
    )
}
