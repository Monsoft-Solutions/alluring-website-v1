'use client'

import { useState } from 'react'
import {
    TrendingUp,
    TrendingDown,
    AlertCircle,
    RefreshCw,
    ArrowUp,
    ArrowDown,
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
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@workspace/ui/components/tabs'
import { Badge } from '@workspace/ui/components/badge'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Button } from '@workspace/ui/components/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select'

import { usePositionChanges } from '@/hooks/use-search-console.hook'
import { cn } from '@workspace/ui/lib/utils'

/**
 * Format position change with arrow indicator
 */
function formatPositionChange(delta: number): {
    text: string
    color: string
    icon: typeof ArrowUp
} {
    const absDelta = Math.abs(delta)
    if (delta < 0) {
        // Improved (moved up in rankings)
        return {
            text: `+${absDelta.toFixed(1)}`,
            color: 'text-green-600',
            icon: ArrowUp,
        }
    } else {
        // Dropped (moved down in rankings)
        return {
            text: `-${absDelta.toFixed(1)}`,
            color: 'text-red-600',
            icon: ArrowDown,
        }
    }
}

/**
 * Position Changes Card
 *
 * Shows keywords that improved or dropped in ranking.
 */
export function PositionChangesCard() {
    const [days, setDays] = useState(7)
    const { data, isLoading, error, refetch } = usePositionChanges(days)

    const hasWinners = (data?.data?.winners?.length ?? 0) > 0
    const hasLosers = (data?.data?.losers?.length ?? 0) > 0
    const hasData = hasWinners || hasLosers

    return (
        <Card>
            <CardHeader>
                <div className='flex items-center justify-between'>
                    <div>
                        <CardTitle className='flex items-center gap-2 text-lg'>
                            <TrendingUp className='h-5 w-5 text-green-500' />
                            Position Tracking
                        </CardTitle>
                        <CardDescription>
                            Keyword ranking changes vs previous{' '}
                            {days === 90 ? '3 months' : `${days} days`}
                        </CardDescription>
                    </div>
                    <Select
                        value={days.toString()}
                        onValueChange={(value) => setDays(parseInt(value))}
                    >
                        <SelectTrigger className='w-[140px]'>
                            <SelectValue placeholder='Select period' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='7'>Last 7 Days</SelectItem>
                            <SelectItem value='28'>Last 28 Days</SelectItem>
                            <SelectItem value='90'>Last 3 Months</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <TableSkeleton />
                ) : error ? (
                    <div className='flex h-[300px] flex-col items-center justify-center gap-3'>
                        <AlertCircle className='h-5 w-5 text-red-500' />
                        <p className='text-muted-foreground text-sm'>
                            Failed to load position changes
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
                ) : hasData ? (
                    <Tabs defaultValue='winners'>
                        <TabsList className='grid w-full grid-cols-2'>
                            <TabsTrigger
                                value='winners'
                                className='flex items-center gap-2'
                            >
                                <TrendingUp className='h-4 w-4 text-green-500' />
                                Winners
                                <Badge
                                    variant='secondary'
                                    className='ml-1 h-5 px-1.5 text-xs'
                                >
                                    {data?.data?.winners?.length ?? 0}
                                </Badge>
                            </TabsTrigger>
                            <TabsTrigger
                                value='losers'
                                className='flex items-center gap-2'
                            >
                                <TrendingDown className='h-4 w-4 text-red-500' />
                                Losers
                                <Badge
                                    variant='secondary'
                                    className='ml-1 h-5 px-1.5 text-xs'
                                >
                                    {data?.data?.losers?.length ?? 0}
                                </Badge>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value='winners' className='mt-4'>
                            {hasWinners ? (
                                <PositionTable
                                    data={data?.data?.winners ?? []}
                                    type='winners'
                                />
                            ) : (
                                <EmptyState
                                    icon={TrendingUp}
                                    message='No ranking improvements'
                                    description='Keep optimizing your content!'
                                />
                            )}
                        </TabsContent>

                        <TabsContent value='losers' className='mt-4'>
                            {hasLosers ? (
                                <PositionTable
                                    data={data?.data?.losers ?? []}
                                    type='losers'
                                />
                            ) : (
                                <EmptyState
                                    icon={TrendingDown}
                                    message='No ranking drops'
                                    description='Your rankings are stable!'
                                />
                            )}
                        </TabsContent>
                    </Tabs>
                ) : (
                    <div className='flex h-[300px] flex-col items-center justify-center gap-2'>
                        <TrendingUp className='text-muted-foreground h-8 w-8' />
                        <p className='text-muted-foreground text-sm'>
                            No position changes detected
                        </p>
                        <p className='text-muted-foreground text-xs'>
                            Rankings compared over two{' '}
                            {days === 90 ? '3-month' : `${days}-day`} periods
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

type PositionTableProps = {
    data: Array<{
        query: string
        currentPosition: number
        previousPosition: number
        positionDelta: number
        clicks: number
        impressions: number
    }>
    type: 'winners' | 'losers'
}

function PositionTable({ data, type }: PositionTableProps) {
    return (
        <div className='max-h-[350px] overflow-auto'>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Query</TableHead>
                        <TableHead className='w-[80px] text-right'>
                            Change
                        </TableHead>
                        <TableHead className='w-[80px] text-right'>
                            Position
                        </TableHead>
                        <TableHead className='w-[80px] text-right'>
                            Clicks
                        </TableHead>
                        <TableHead className='w-[100px] text-right'>
                            Impressions
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item) => {
                        const change = formatPositionChange(item.positionDelta)
                        const Icon = change.icon

                        return (
                            <TableRow key={item.query}>
                                <TableCell className='max-w-[200px] truncate font-medium'>
                                    {item.query}
                                </TableCell>
                                <TableCell className='text-right'>
                                    <span
                                        className={cn(
                                            'flex items-center justify-end gap-1 font-medium',
                                            change.color
                                        )}
                                    >
                                        <Icon className='h-3 w-3' />
                                        {Math.abs(item.positionDelta).toFixed(
                                            1
                                        )}
                                    </span>
                                </TableCell>
                                <TableCell className='text-right'>
                                    <div className='text-muted-foreground flex items-center justify-end gap-1 text-xs'>
                                        <span
                                            className={cn(
                                                'font-medium',
                                                type === 'winners'
                                                    ? 'text-foreground'
                                                    : 'text-foreground'
                                            )}
                                        >
                                            {item.currentPosition.toFixed(1)}
                                        </span>
                                        <span>←</span>
                                        <span>
                                            {item.previousPosition.toFixed(1)}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className='text-right'>
                                    {item.clicks.toLocaleString()}
                                </TableCell>
                                <TableCell className='text-right'>
                                    {item.impressions.toLocaleString()}
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}

function EmptyState({
    icon: Icon,
    message,
    description,
}: {
    icon: typeof TrendingUp
    message: string
    description: string
}) {
    return (
        <div className='flex h-[250px] flex-col items-center justify-center gap-2'>
            <Icon className='text-muted-foreground h-8 w-8' />
            <p className='text-muted-foreground text-sm'>{message}</p>
            <p className='text-muted-foreground text-xs'>{description}</p>
        </div>
    )
}

function TableSkeleton() {
    return (
        <div className='space-y-4'>
            <div className='flex gap-2'>
                <Skeleton className='h-10 flex-1' />
                <Skeleton className='h-10 flex-1' />
            </div>
            <div className='space-y-3'>
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className='flex items-center gap-4'>
                        <Skeleton className='h-4 flex-1' />
                        <Skeleton className='h-4 w-16' />
                        <Skeleton className='h-4 w-16' />
                        <Skeleton className='h-4 w-12' />
                        <Skeleton className='h-4 w-16' />
                    </div>
                ))}
            </div>
        </div>
    )
}
