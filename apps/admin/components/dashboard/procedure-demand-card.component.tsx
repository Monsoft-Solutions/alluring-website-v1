'use client'

import dynamicImport from 'next/dynamic'
import { Activity, AlertCircle, RefreshCw } from 'lucide-react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Button } from '@workspace/ui/components/button'

import { useProcedureDemand } from '@/hooks/use-dashboard.hook'

// Lazy load chart
const ProcedureDemandChart = dynamicImport(
    () =>
        import('@/components/charts/dashboard-charts.component').then(
            (mod) => mod.ProcedureDemandChart
        ),
    {
        loading: () => <Skeleton className='h-[300px] w-full' />,
    }
)

/**
 * Procedure demand card showing which procedures are most requested.
 */
export function ProcedureDemandCard() {
    const { data, isLoading, error, refetch } = useProcedureDemand(8)

    return (
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2 text-lg'>
                    <Activity className='h-5 w-5' />
                    Procedure Demand
                </CardTitle>
                <CardDescription>
                    Most requested procedures from contact forms
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className='h-[300px] w-full' />
                ) : error ? (
                    <div className='flex h-[300px] flex-col items-center justify-center gap-3'>
                        <AlertCircle className='h-5 w-5 text-red-500' />
                        <p className='text-muted-foreground text-sm'>
                            Failed to load procedure data
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
                ) : data && data.length > 0 ? (
                    <ProcedureDemandChart data={data} />
                ) : (
                    <div className='flex h-[300px] items-center justify-center'>
                        <p className='text-muted-foreground text-sm'>
                            No procedure data available
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
