'use client'

import dynamicImport from 'next/dynamic'
import { PieChart, AlertCircle, RefreshCw } from 'lucide-react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Button } from '@workspace/ui/components/button'

import { useLeadGradesChart } from '@/hooks/use-dashboard.hook'

// Lazy load chart
const LeadGradeChart = dynamicImport(
    () =>
        import('@/components/charts/dashboard-charts.component').then(
            (mod) => mod.LeadGradeChart
        ),
    {
        loading: () => <Skeleton className='h-[250px] w-full' />,
    }
)

/**
 * Lead grades card showing distribution of lead quality from AI chat.
 */
export function LeadGradesCard() {
    const { data, isLoading, error, refetch } = useLeadGradesChart()

    return (
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2 text-lg'>
                    <PieChart className='h-5 w-5' />
                    Lead Quality
                </CardTitle>
                <CardDescription>
                    Distribution of A/B/C/D grades from chat analysis
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className='h-[250px] w-full' />
                ) : error ? (
                    <div className='flex h-[250px] flex-col items-center justify-center gap-3'>
                        <AlertCircle className='h-5 w-5 text-red-500' />
                        <p className='text-muted-foreground text-sm'>
                            Failed to load lead data
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
                    <LeadGradeChart data={data} />
                ) : (
                    <div className='flex h-[250px] items-center justify-center'>
                        <p className='text-muted-foreground text-sm'>
                            No lead quality data yet
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
