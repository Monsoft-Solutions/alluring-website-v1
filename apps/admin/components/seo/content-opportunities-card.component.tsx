'use client'

import { useState } from 'react'
import {
    Lightbulb,
    AlertCircle,
    RefreshCw,
    ArrowUp,
    Sparkles,
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

import { useContentOpportunities } from '@/hooks/use-search-console.hook'
import { ContentBriefDialog } from './content-brief-dialog.component'
import { TableSkeleton } from '@/components/shared/skeletons/table-skeleton.component'

type SelectedOpportunity = {
    query: string
    position: number
    impressions: number
} | null

type ContentOpportunitiesCardProps = {
    days?: number
}

/**
 * Content opportunities card showing queries with high impressions but low CTR.
 * These represent potential content gaps or optimization opportunities.
 */
export function ContentOpportunitiesCard({
    days = 28,
}: ContentOpportunitiesCardProps) {
    const { data, isLoading, error, refetch } = useContentOpportunities(
        days,
        15
    )
    const [selectedOpportunity, setSelectedOpportunity] =
        useState<SelectedOpportunity>(null)

    return (
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2 text-lg'>
                    <Lightbulb className='h-5 w-5 text-amber-500' />
                    Content Opportunities
                </CardTitle>
                <CardDescription>
                    High-impression queries with low CTR — create content to
                    capture this traffic
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <TableSkeleton />
                ) : error ? (
                    <div className='flex h-[300px] flex-col items-center justify-center gap-3'>
                        <AlertCircle className='h-5 w-5 text-red-500' />
                        <p className='text-muted-foreground text-sm'>
                            Failed to load opportunities
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
                        <div className='max-h-[450px] overflow-auto'>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Query</TableHead>
                                        <TableHead className='text-right'>
                                            Impressions
                                        </TableHead>
                                        <TableHead className='text-right'>
                                            CTR
                                        </TableHead>
                                        <TableHead className='text-right'>
                                            Position
                                        </TableHead>
                                        <TableHead className='text-right'>
                                            Potential
                                        </TableHead>
                                        <TableHead>Action</TableHead>
                                        <TableHead className='w-[50px]'></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.data.map((opportunity) => (
                                        <TableRow
                                            key={opportunity.query}
                                            className='group'
                                        >
                                            <TableCell className='max-w-[180px] truncate font-medium'>
                                                {opportunity.query}
                                            </TableCell>
                                            <TableCell className='text-right'>
                                                {opportunity.impressions.toLocaleString()}
                                            </TableCell>
                                            <TableCell className='text-right'>
                                                <span className='text-red-600'>
                                                    {(
                                                        opportunity.ctr * 100
                                                    ).toFixed(1)}
                                                    %
                                                </span>
                                            </TableCell>
                                            <TableCell className='text-right'>
                                                {opportunity.position.toFixed(
                                                    1
                                                )}
                                            </TableCell>
                                            <TableCell className='text-right'>
                                                <div className='flex items-center justify-end gap-1 text-green-600'>
                                                    <ArrowUp className='h-3 w-3' />
                                                    +
                                                    {
                                                        opportunity.potentialClicks
                                                    }
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant='secondary'
                                                    className='text-xs whitespace-nowrap'
                                                >
                                                    {getSuggestionBadge(
                                                        opportunity.position
                                                    )}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant='ghost'
                                                                size='icon'
                                                                className='h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100'
                                                                onClick={() =>
                                                                    setSelectedOpportunity(
                                                                        {
                                                                            query: opportunity.query,
                                                                            position:
                                                                                opportunity.position,
                                                                            impressions:
                                                                                opportunity.impressions,
                                                                        }
                                                                    )
                                                                }
                                                            >
                                                                <Sparkles className='h-4 w-4 text-amber-500' />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            Generate AI content
                                                            brief
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Content Brief Dialog */}
                        <ContentBriefDialog
                            open={!!selectedOpportunity}
                            onOpenChange={(open) =>
                                !open && setSelectedOpportunity(null)
                            }
                            query={selectedOpportunity?.query ?? ''}
                            currentPosition={selectedOpportunity?.position}
                            impressions={selectedOpportunity?.impressions}
                        />
                    </>
                ) : (
                    <div className='flex h-[300px] flex-col items-center justify-center gap-2'>
                        <p className='text-muted-foreground text-sm'>
                            No content opportunities found
                        </p>
                        <p className='text-muted-foreground text-xs'>
                            This is good! Your content is performing well.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

/**
 * Get a short badge label based on the position
 */
function getSuggestionBadge(position: number): string {
    if (position > 10) {
        return 'Create content'
    } else if (position > 5) {
        return 'Optimize'
    } else {
        return 'Improve CTR'
    }
}
