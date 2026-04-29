'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'

export default function LeadTrendsError({
    reset,
}: {
    error: Error
    reset: () => void
}) {
    return (
        <Card>
            <CardContent className='flex flex-col items-center justify-center gap-3 py-12'>
                <AlertCircle className='h-5 w-5 text-rose-500' />
                <p className='text-muted-foreground text-sm'>
                    Something went wrong loading lead trends.
                </p>
                <Button variant='outline' size='sm' onClick={reset}>
                    <RefreshCw className='mr-2 h-4 w-4' />
                    Try again
                </Button>
            </CardContent>
        </Card>
    )
}
