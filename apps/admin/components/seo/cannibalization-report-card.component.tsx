'use client'

import { AlertCircle, RefreshCw, Split } from 'lucide-react'
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
import { TableSkeleton } from '@/components/shared/skeletons/table-skeleton.component'

import {
    useCannibalizationReport,
    useRunCannibalizationReport,
} from '@/hooks/use-seo-health.hook'

/** Path of a full URL, for compact display. */
function pathOf(pageUrl: string): string {
    try {
        return new URL(pageUrl).pathname
    } catch {
        return pageUrl
    }
}

/**
 * Weekly cannibalization report (issue #146): queries where two or more of
 * our own pages split the impressions, or the top URL keeps flip-flopping.
 */
export function CannibalizationReportCard() {
    const { data, isLoading, error, refetch } = useCannibalizationReport()
    const runReport = useRunCannibalizationReport()

    const report = data?.data

    return (
        <Card>
            <CardHeader>
                <div className='flex items-start justify-between gap-4'>
                    <div>
                        <CardTitle className='flex items-center gap-2 text-lg'>
                            <Split className='h-5 w-5 text-amber-600' />
                            Keyword Cannibalization
                        </CardTitle>
                        <CardDescription>
                            {report
                                ? `Week of ${report.weekStart} — queries where our own pages compete`
                                : 'Queries where our own pages compete against each other'}
                        </CardDescription>
                    </div>
                    <Button
                        variant='outline'
                        size='sm'
                        disabled={runReport.isPending}
                        onClick={() => runReport.mutate()}
                    >
                        <RefreshCw
                            className={`mr-2 h-4 w-4 ${runReport.isPending ? 'animate-spin' : ''}`}
                        />
                        {runReport.isPending ? 'Running…' : 'Run report'}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <TableSkeleton />
                ) : error ? (
                    <div className='flex h-[200px] flex-col items-center justify-center gap-3'>
                        <AlertCircle className='h-5 w-5 text-red-500' />
                        <p className='text-muted-foreground text-sm'>
                            Failed to load the report
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
                ) : !report ? (
                    <div className='flex h-[200px] flex-col items-center justify-center gap-2'>
                        <p className='text-muted-foreground text-sm'>
                            No report yet
                        </p>
                        <p className='text-muted-foreground text-xs'>
                            Needs 14 days of snapshots — run the backfill, then
                            run the report
                        </p>
                    </div>
                ) : report.findings.length === 0 ? (
                    <div className='flex h-[200px] flex-col items-center justify-center gap-2'>
                        <p className='text-muted-foreground text-sm'>
                            No cannibalization found this week
                        </p>
                        <p className='text-muted-foreground text-xs'>
                            Every analyzed query has one clear owning page.
                        </p>
                    </div>
                ) : (
                    <div className='max-h-[450px] overflow-auto'>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Query</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className='text-right'>
                                        Impressions
                                    </TableHead>
                                    <TableHead>Competing pages</TableHead>
                                    <TableHead>Owner</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {report.findings.map((finding) => (
                                    <TableRow key={finding.query}>
                                        <TableCell className='max-w-[180px] truncate font-medium'>
                                            {finding.query}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant='secondary'
                                                className='text-xs whitespace-nowrap'
                                            >
                                                {finding.kind ===
                                                'shared-impressions'
                                                    ? 'Split impressions'
                                                    : 'Flip-flop'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className='text-right'>
                                            {finding.totalImpressions.toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <div className='flex flex-col gap-1'>
                                                {finding.pages
                                                    .filter(
                                                        (page) =>
                                                            page.share >= 0.1
                                                    )
                                                    .slice(0, 3)
                                                    .map((page) => (
                                                        <span
                                                            key={page.page}
                                                            className='max-w-[280px] truncate text-xs'
                                                        >
                                                            <span className='text-muted-foreground'>
                                                                {Math.round(
                                                                    page.share *
                                                                        100
                                                                )}
                                                                % ·{' '}
                                                            </span>
                                                            {pathOf(page.page)}
                                                        </span>
                                                    ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className='max-w-[200px]'>
                                            {finding.owner ? (
                                                <div className='flex flex-col gap-0.5'>
                                                    <span className='truncate text-xs'>
                                                        {finding.owner.url}
                                                    </span>
                                                    <span className='text-muted-foreground text-[10px] tracking-wide uppercase'>
                                                        {finding.owner
                                                            .source ===
                                                        'registry'
                                                            ? 'registry'
                                                            : 'top performer'}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className='text-muted-foreground text-xs'>
                                                    —
                                                </span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
