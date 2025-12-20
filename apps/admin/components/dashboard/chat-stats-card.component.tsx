'use client'

import {
    MessageSquare,
    Users,
    MessageCircle,
    Trophy,
    AlertCircle,
    RefreshCw,
} from 'lucide-react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Button } from '@workspace/ui/components/button'

import { useChatSummary } from '@/hooks/use-dashboard.hook'

/**
 * Chat performance stats card showing key AI chat metrics.
 */
export function ChatStatsCard() {
    const { data, isLoading, error, refetch } = useChatSummary()

    return (
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2 text-lg'>
                    <MessageSquare className='h-5 w-5' />
                    Chat Performance
                </CardTitle>
                <CardDescription>
                    AI assistant engagement and lead quality
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className='grid grid-cols-2 gap-4'>
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className='h-24 w-full' />
                        ))}
                    </div>
                ) : error ? (
                    <div className='flex h-[200px] flex-col items-center justify-center gap-3'>
                        <AlertCircle className='h-5 w-5 text-red-500' />
                        <p className='text-muted-foreground text-sm'>
                            Failed to load chat stats
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
                ) : data ? (
                    <div className='grid grid-cols-2 gap-4'>
                        <div className='rounded-lg bg-stone-50 p-4'>
                            <div className='flex items-center gap-2 text-sm font-medium text-stone-500'>
                                <Users className='h-4 w-4' />
                                Total Sessions
                            </div>
                            <div className='mt-2 text-2xl font-bold'>
                                {data.totalSessions.toLocaleString()}
                            </div>
                        </div>
                        <div className='rounded-lg bg-stone-50 p-4'>
                            <div className='flex items-center gap-2 text-sm font-medium text-stone-500'>
                                <MessageCircle className='h-4 w-4' />
                                Total Messages
                            </div>
                            <div className='mt-2 text-2xl font-bold'>
                                {data.totalMessages.toLocaleString()}
                            </div>
                        </div>
                        <div className='rounded-lg bg-stone-50 p-4'>
                            <div className='flex items-center gap-2 text-sm font-medium text-stone-500'>
                                <MessageSquare className='h-4 w-4' />
                                Avg Messages
                            </div>
                            <div className='mt-2 text-2xl font-bold'>
                                {data.avgMessagesPerSession}
                            </div>
                        </div>
                        <div className='rounded-lg bg-stone-50 p-4'>
                            <div className='flex items-center gap-2 text-sm font-medium text-stone-500'>
                                <Trophy className='h-4 w-4' />
                                Avg Lead Score
                            </div>
                            <div className='mt-2 text-2xl font-bold'>
                                {data.avgLeadScore}
                            </div>
                        </div>
                    </div>
                ) : null}
            </CardContent>
        </Card>
    )
}
