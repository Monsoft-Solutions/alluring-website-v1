'use client'

import { Button } from '@workspace/ui/components/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { AlertCircle } from 'lucide-react'
import { useEffect } from 'react'

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log error to error reporting service
        console.error('Dashboard error:', error)
    }, [error])

    return (
        <div className='flex min-h-[50vh] items-center justify-center p-4'>
            <Card className='w-full max-w-md'>
                <CardHeader>
                    <div className='flex items-center gap-2'>
                        <AlertCircle className='h-5 w-5 text-red-600' />
                        <CardTitle>Something went wrong</CardTitle>
                    </div>
                    <CardDescription>
                        An error occurred while loading the dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div className='rounded-lg border border-red-200 bg-red-50 p-3'>
                        <p className='text-sm text-red-800'>
                            {error.message || 'An unexpected error occurred'}
                        </p>
                        {error.digest && (
                            <p className='text-muted-foreground mt-1 text-xs'>
                                Error ID: {error.digest}
                            </p>
                        )}
                    </div>
                    <div className='flex gap-2'>
                        <Button onClick={reset} className='flex-1'>
                            Try again
                        </Button>
                        <Button
                            variant='outline'
                            onClick={() => (window.location.href = '/')}
                            className='flex-1'
                        >
                            Go to dashboard
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
