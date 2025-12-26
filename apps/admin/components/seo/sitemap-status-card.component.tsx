'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
    Map,
    AlertCircle,
    RefreshCw,
    CheckCircle2,
    Clock,
    AlertTriangle,
    FileText,
    ExternalLink,
    Loader2,
    Send,
} from 'lucide-react'
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
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip'
import { Progress } from '@workspace/ui/components/progress'

import { useSitemaps, useSubmitSitemap } from '@/hooks/use-search-console.hook'
import { TableSkeleton } from '@/components/shared/skeletons/table-skeleton.component'

/**
 * Format date for display
 */
function formatDate(date: string | null): string {
    if (!date) return 'Never'
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

/**
 * Extract sitemap name from path
 */
function getSitemapName(path: string): string {
    try {
        const url = new URL(path)
        const pathname = url.pathname
        return pathname.split('/').pop() || pathname
    } catch {
        return path
    }
}

/**
 * Sitemap Status Card
 *
 * Shows submitted sitemaps and their indexing status.
 */
export function SitemapStatusCard() {
    const { data, isLoading, error, refetch } = useSitemaps()
    const submitSitemap = useSubmitSitemap()
    const [submittingPath, setSubmittingPath] = useState<string | null>(null)

    const handleResubmit = async (sitemapPath: string) => {
        setSubmittingPath(sitemapPath)
        try {
            const result = await submitSitemap.mutateAsync(sitemapPath)
            if (result.success) {
                toast.success('Sitemap submitted', {
                    description: `Successfully resubmitted sitemap to Google Search Console`,
                })
            } else {
                toast.error('Failed to submit sitemap', {
                    description: result.error ?? 'Unknown error occurred',
                })
            }
        } catch (err) {
            toast.error('Failed to submit sitemap', {
                description:
                    err instanceof Error
                        ? err.message
                        : 'An unexpected error occurred',
            })
        } finally {
            setSubmittingPath(null)
        }
    }

    // Calculate totals
    const totals = data?.data?.reduce(
        (acc, sitemap) => {
            // Guard against missing or non-array contents
            const contents = Array.isArray(sitemap.contents)
                ? sitemap.contents
                : []

            for (const content of contents) {
                // Coerce numeric fields safely to avoid NaN
                acc.submitted += Number(content.submitted ?? 0)
                acc.indexed += Number(content.indexed ?? 0)
            }

            // Still accumulate errors and warnings even if contents is empty
            acc.errors += Number(sitemap.errors ?? 0)
            acc.warnings += Number(sitemap.warnings ?? 0)

            return acc
        },
        { submitted: 0, indexed: 0, errors: 0, warnings: 0 }
    ) ?? { submitted: 0, indexed: 0, errors: 0, warnings: 0 }

    const indexRate =
        totals.submitted > 0
            ? Math.round((totals.indexed / totals.submitted) * 100)
            : 0

    return (
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2 text-lg'>
                    <Map className='h-5 w-5' />
                    Sitemap Status
                </CardTitle>
                <CardDescription>
                    Submitted sitemaps and indexing status
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <TableSkeleton />
                ) : error ? (
                    <div className='flex h-[200px] flex-col items-center justify-center gap-3'>
                        <AlertCircle className='h-5 w-5 text-red-500' />
                        <p className='text-muted-foreground text-sm'>
                            Failed to load sitemap status
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
                        {/* Summary Stats */}
                        <div className='mb-4 grid grid-cols-2 gap-4 md:grid-cols-4'>
                            <div className='bg-muted/50 rounded-lg p-3'>
                                <p className='text-muted-foreground text-xs'>
                                    Sitemaps
                                </p>
                                <p className='text-2xl font-bold'>
                                    {data.data.length}
                                </p>
                            </div>
                            <div className='bg-muted/50 rounded-lg p-3'>
                                <p className='text-muted-foreground text-xs'>
                                    Submitted URLs
                                </p>
                                <p className='text-2xl font-bold'>
                                    {totals.submitted.toLocaleString()}
                                </p>
                            </div>
                            <div className='bg-muted/50 rounded-lg p-3'>
                                <p className='text-muted-foreground text-xs'>
                                    Indexed URLs
                                </p>
                                <p className='text-2xl font-bold text-green-600'>
                                    {totals.indexed.toLocaleString()}
                                </p>
                            </div>
                            <div className='bg-muted/50 rounded-lg p-3'>
                                <p className='text-muted-foreground text-xs'>
                                    Index Rate
                                </p>
                                <div className='flex items-center gap-2'>
                                    <p className='text-2xl font-bold'>
                                        {indexRate}%
                                    </p>
                                    <Progress
                                        value={indexRate}
                                        className='h-2 flex-1'
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Issues Summary */}
                        {(totals.errors > 0 || totals.warnings > 0) && (
                            <div className='mb-4 flex gap-2'>
                                {totals.errors > 0 && (
                                    <Badge
                                        variant='destructive'
                                        className='flex items-center gap-1'
                                    >
                                        <AlertCircle className='h-3 w-3' />
                                        {totals.errors} errors
                                    </Badge>
                                )}
                                {totals.warnings > 0 && (
                                    <Badge
                                        variant='secondary'
                                        className='flex items-center gap-1 bg-yellow-100 text-yellow-800'
                                    >
                                        <AlertTriangle className='h-3 w-3' />
                                        {totals.warnings} warnings
                                    </Badge>
                                )}
                            </div>
                        )}

                        {/* Sitemaps Table */}
                        <div className='max-h-[300px] overflow-auto'>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Sitemap</TableHead>
                                        <TableHead className='w-[100px] text-right'>
                                            Submitted
                                        </TableHead>
                                        <TableHead className='w-[100px] text-right'>
                                            Indexed
                                        </TableHead>
                                        <TableHead className='w-[100px]'>
                                            Status
                                        </TableHead>
                                        <TableHead className='w-[100px]'>
                                            Last Submitted
                                        </TableHead>
                                        <TableHead className='w-[100px]'>
                                            Last Read
                                        </TableHead>
                                        <TableHead className='w-[60px]'>
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.data.map((sitemap) => {
                                        const contents = Array.isArray(
                                            sitemap.contents
                                        )
                                            ? sitemap.contents
                                            : []

                                        const sitemapSubmitted =
                                            contents.reduce(
                                                (sum, c) =>
                                                    sum +
                                                    Number(c.submitted ?? 0),
                                                0
                                            )
                                        const sitemapIndexed = contents.reduce(
                                            (sum, c) =>
                                                sum + Number(c.indexed ?? 0),
                                            0
                                        )
                                        const hasIssues =
                                            Number(sitemap.errors ?? 0) > 0 ||
                                            Number(sitemap.warnings ?? 0) > 0

                                        return (
                                            <TableRow key={sitemap.path}>
                                                <TableCell>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <a
                                                                    href={
                                                                        sitemap.path
                                                                    }
                                                                    target='_blank'
                                                                    rel='noopener noreferrer'
                                                                    className='flex items-center gap-1.5 hover:underline'
                                                                >
                                                                    {sitemap.isSitemapsIndex ? (
                                                                        <Map className='h-4 w-4 text-blue-500' />
                                                                    ) : (
                                                                        <FileText className='text-muted-foreground h-4 w-4' />
                                                                    )}
                                                                    <span className='max-w-[150px] truncate font-medium'>
                                                                        {getSitemapName(
                                                                            sitemap.path
                                                                        )}
                                                                    </span>
                                                                    <ExternalLink className='h-3 w-3 opacity-50' />
                                                                </a>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p className='max-w-[300px] break-all'>
                                                                    {
                                                                        sitemap.path
                                                                    }
                                                                </p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </TableCell>
                                                <TableCell className='text-right'>
                                                    {sitemapSubmitted.toLocaleString()}
                                                </TableCell>
                                                <TableCell className='text-right text-green-600'>
                                                    {sitemapIndexed.toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    {sitemap.isPending ? (
                                                        <Badge
                                                            variant='secondary'
                                                            className='bg-blue-100 text-blue-700'
                                                        >
                                                            <Clock className='mr-1 h-3 w-3' />
                                                            Pending
                                                        </Badge>
                                                    ) : hasIssues ? (
                                                        <Badge variant='destructive'>
                                                            <AlertCircle className='mr-1 h-3 w-3' />
                                                            Issues
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            variant='outline'
                                                            className='border-green-200 bg-green-50 text-green-700'
                                                        >
                                                            <CheckCircle2 className='mr-1 h-3 w-3' />
                                                            OK
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className='text-muted-foreground text-xs'>
                                                    {formatDate(
                                                        sitemap.lastSubmitted
                                                    )}
                                                </TableCell>
                                                <TableCell className='text-muted-foreground text-xs'>
                                                    {formatDate(
                                                        sitemap.lastDownloaded
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    variant='ghost'
                                                                    size='icon'
                                                                    className='h-8 w-8'
                                                                    onClick={() =>
                                                                        handleResubmit(
                                                                            sitemap.path
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        submittingPath !==
                                                                        null
                                                                    }
                                                                >
                                                                    {submittingPath ===
                                                                    sitemap.path ? (
                                                                        <Loader2 className='h-4 w-4 animate-spin' />
                                                                    ) : (
                                                                        <Send className='h-4 w-4' />
                                                                    )}
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>
                                                                    Resubmit
                                                                    sitemap to
                                                                    Google
                                                                </p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </>
                ) : (
                    <div className='flex h-[200px] flex-col items-center justify-center gap-2'>
                        <Map className='text-muted-foreground h-8 w-8' />
                        <p className='text-muted-foreground text-sm'>
                            No sitemaps submitted yet
                        </p>
                        <p className='text-muted-foreground text-xs'>
                            Submit your sitemap in Google Search Console
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
