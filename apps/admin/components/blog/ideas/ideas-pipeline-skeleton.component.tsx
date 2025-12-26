'use client'

import { Card, CardContent, CardHeader } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'

/**
 * Skeleton loader for the ideas pipeline
 */
export function IdeasPipelineSkeleton() {
    return (
        <div className='space-y-6'>
            {/* Stats bar skeleton */}
            <div className='flex items-center gap-4'>
                {Array.from({ length: 5 }).map((_, i) => (
                    <div
                        key={i}
                        className='flex items-center gap-2 rounded-lg border bg-white px-4 py-2'
                    >
                        <Skeleton className='h-4 w-16' />
                        <Skeleton className='h-6 w-6 rounded-full' />
                    </div>
                ))}
            </div>

            {/* Action bar skeleton */}
            <div className='flex items-center justify-between'>
                <Skeleton className='h-10 w-64' />
                <div className='flex gap-2'>
                    <Skeleton className='h-10 w-32' />
                    <Skeleton className='h-10 w-40' />
                </div>
            </div>

            {/* Kanban columns skeleton */}
            <div className='flex gap-4 overflow-x-auto pb-4'>
                {Array.from({ length: 5 }).map((_, colIdx) => (
                    <div key={colIdx} className='w-[300px] flex-shrink-0'>
                        <Card className='bg-stone-50'>
                            <CardHeader className='py-3'>
                                <div className='flex items-center justify-between'>
                                    <Skeleton className='h-5 w-24' />
                                    <Skeleton className='h-5 w-6 rounded-full' />
                                </div>
                            </CardHeader>
                            <CardContent className='space-y-3 p-3 pt-0'>
                                {Array.from({ length: 3 }).map((_, cardIdx) => (
                                    <Card key={cardIdx} className='bg-white'>
                                        <CardContent className='p-3'>
                                            <Skeleton className='mb-2 h-4 w-full' />
                                            <Skeleton className='mb-3 h-3 w-2/3' />
                                            <div className='flex items-center gap-2'>
                                                <Skeleton className='h-5 w-16 rounded-full' />
                                                <Skeleton className='h-5 w-12 rounded-full' />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    )
}
