/**
 * Analyzing Progress Component
 *
 * Displays progress indicator during AI analysis of Instagram posts.
 *
 * @module components/instagram/analyzing-progress
 */
'use client'

import { Loader2 } from 'lucide-react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Progress } from '@workspace/ui/components/progress'

type AnalyzingProgressProps = {
    selectedCount: number
    progress: number
}

export function AnalyzingProgress({
    selectedCount,
    progress,
}: AnalyzingProgressProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                    <Loader2 className='h-5 w-5 animate-spin' />
                    Analyzing Posts...
                </CardTitle>
                <CardDescription>
                    AI is analyzing {selectedCount} posts. This may take a few
                    minutes.
                </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
                <Progress value={progress} />
                <p className='text-muted-foreground text-center text-sm'>
                    {progress}% complete
                </p>
            </CardContent>
        </Card>
    )
}
