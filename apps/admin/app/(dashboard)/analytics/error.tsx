'use client'

import { Button } from '@workspace/ui/components/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { BarChart3, AlertCircle } from 'lucide-react'
import { useEffect } from 'react'

export default function AnalyticsError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Analytics error:', error)
    }, [error])

    return (
        <div className='flex min-h-[50vh] items-center justify-center p-4'>
            <Card className='w-full max-w-md'>
                <CardHeader>
                    <div className='flex items-center gap-2'>
                        <AlertCircle className='h-5 w-5 text-red-600' />
                        <CardTitle>Analytics Error</CardTitle>
                    </div>
                    <CardDescription>
                        Failed to load analytics data
                    </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div className='flex justify-center py-4'>
                        <BarChart3 className='text-muted-foreground h-12 w-12' />
                    </div>
                    <div className='rounded-lg border border-red-200 bg-red-50 p-3'>
                        <p className='text-sm text-red-800'>
                            {error.message ||
                                'Unable to fetch analytics data. Please try again.'}
                        </p>
                    </div>
                    <div className='flex gap-2'>
                        <Button onClick={reset} className='flex-1'>
                            Retry
                        </Button>
                        <Button
                            variant='outline'
                            onClick={() => (window.location.href = '/')}
                            className='flex-1'
                        >
                            Back to dashboard
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
