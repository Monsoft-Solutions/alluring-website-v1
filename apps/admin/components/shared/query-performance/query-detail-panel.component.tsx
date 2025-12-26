'use client'

import { useState } from 'react'
import {
    ExternalLink,
    TrendingUp,
    FileText,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    X,
} from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Badge } from '@workspace/ui/components/badge'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@workspace/ui/components/collapsible'

import { useQueryPages } from '@/hooks/use-search-console.hook'
import { QueryTrendChart } from './query-trend-chart.component'

type QueryDetailPanelProps = {
    /** The selected query to show details for */
    query: string
    /** Number of days for the analysis */
    days?: number
    /** Callback to close the panel */
    onClose?: () => void
    /** Whether this query has a content gap */
    hasContentGap?: boolean
}

/**
 * Detail panel for a selected query.
 * Shows historical trend, ranking pages, and content gap status.
 * Used as a slide-out panel or expandable section.
 */
export function QueryDetailPanel({
    query,
    days = 28,
    onClose,
    hasContentGap = false,
}: QueryDetailPanelProps) {
    const [isTrendOpen, setIsTrendOpen] = useState(true)
    const [isPagesOpen, setIsPagesOpen] = useState(true)

    const { data: pagesData, isLoading: isPagesLoading } = useQueryPages(
        query,
        days
    )

    return (
        <div className='bg-muted/30 space-y-4 rounded-lg border p-4'>
            {/* Header */}
            <div className='flex items-start justify-between gap-4'>
                <div className='min-w-0 flex-1'>
                    <h3 className='truncate font-medium' title={query}>
                        {query}
                    </h3>
                    {hasContentGap && (
                        <Badge
                            variant='outline'
                            className='mt-1 border-amber-500 text-amber-600'
                        >
                            <AlertTriangle className='mr-1 h-3 w-3' />
                            Content Gap
                        </Badge>
                    )}
                </div>
                {onClose && (
                    <Button
                        variant='ghost'
                        size='sm'
                        onClick={onClose}
                        className='h-8 w-8 p-0'
                    >
                        <X className='h-4 w-4' />
                        <span className='sr-only'>Close</span>
                    </Button>
                )}
            </div>

            {/* Trend Section */}
            <Collapsible open={isTrendOpen} onOpenChange={setIsTrendOpen}>
                <CollapsibleTrigger asChild>
                    <Button
                        variant='ghost'
                        size='sm'
                        className='flex w-full items-center justify-between p-2'
                    >
                        <span className='flex items-center gap-2 text-sm font-medium'>
                            <TrendingUp className='h-4 w-4' />
                            Performance Trend
                        </span>
                        {isTrendOpen ? (
                            <ChevronUp className='h-4 w-4' />
                        ) : (
                            <ChevronDown className='h-4 w-4' />
                        )}
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className='pt-2'>
                    <QueryTrendChart query={query} days={days} height={180} />
                </CollapsibleContent>
            </Collapsible>

            {/* Pages Section */}
            <Collapsible open={isPagesOpen} onOpenChange={setIsPagesOpen}>
                <CollapsibleTrigger asChild>
                    <Button
                        variant='ghost'
                        size='sm'
                        className='flex w-full items-center justify-between p-2'
                    >
                        <span className='flex items-center gap-2 text-sm font-medium'>
                            <FileText className='h-4 w-4' />
                            Ranking Pages
                            {pagesData?.data && (
                                <Badge variant='secondary' className='ml-1'>
                                    {pagesData.data.length}
                                </Badge>
                            )}
                        </span>
                        {isPagesOpen ? (
                            <ChevronUp className='h-4 w-4' />
                        ) : (
                            <ChevronDown className='h-4 w-4' />
                        )}
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className='pt-2'>
                    {isPagesLoading ? (
                        <div className='space-y-2'>
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className='h-12 w-full' />
                            ))}
                        </div>
                    ) : pagesData?.data && pagesData.data.length > 0 ? (
                        <div className='space-y-2'>
                            {pagesData.data.map((page, index) => (
                                <div
                                    key={page.page}
                                    className='flex items-center gap-3 rounded-md border bg-white p-3'
                                >
                                    <span className='text-muted-foreground flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-stone-100 text-xs font-medium'>
                                        {index + 1}
                                    </span>
                                    <div className='min-w-0 flex-1'>
                                        <a
                                            href={page.page}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='flex items-center gap-1 text-sm font-medium text-stone-900 hover:underline'
                                        >
                                            <span className='truncate'>
                                                {new URL(page.page).pathname ||
                                                    '/'}
                                            </span>
                                            <ExternalLink className='h-3 w-3 flex-shrink-0' />
                                        </a>
                                        <div className='text-muted-foreground mt-0.5 flex gap-3 text-xs'>
                                            <span>
                                                {page.clicks.toLocaleString()}{' '}
                                                clicks
                                            </span>
                                            <span>
                                                {page.impressions.toLocaleString()}{' '}
                                                impr
                                            </span>
                                            <span>
                                                Pos: {page.position.toFixed(1)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className='text-muted-foreground py-4 text-center text-sm'>
                            No ranking pages found
                        </p>
                    )}
                </CollapsibleContent>
            </Collapsible>
        </div>
    )
}
