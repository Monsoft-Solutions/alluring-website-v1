'use client'

/**
 * Refresh Queue Actions
 *
 * Client controls for the refresh queue page: dismissing candidates,
 * queueing a post manually, and running decay detection on demand. Server
 * work happens in content-refresh.action.ts; the page re-renders via
 * revalidatePath.
 *
 * @module components/blog/refresh/refresh-queue-actions
 */
import { useState, useTransition } from 'react'
import { Loader2, Plus, Radar, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@workspace/ui/components/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select'

import {
    dismissRefreshCandidateAction,
    queuePostForRefreshAction,
    runDecayDetectionNowAction,
} from '@/lib/actions/content-refresh.action'

export function DismissCandidateButton({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition()

    return (
        <Button
            size='sm'
            variant='ghost'
            disabled={isPending}
            onClick={() =>
                startTransition(async () => {
                    const result = await dismissRefreshCandidateAction(id)
                    if (result.success) {
                        toast.success('Candidate dismissed — cooldown started')
                    } else {
                        toast.error(result.error ?? 'Failed to dismiss')
                    }
                })
            }
        >
            {isPending ? (
                <Loader2 className='h-3.5 w-3.5 animate-spin' />
            ) : (
                <X className='h-3.5 w-3.5' />
            )}
            Dismiss
        </Button>
    )
}

export function RunDetectionButton({ disabled }: { disabled?: boolean }) {
    const [isPending, startTransition] = useTransition()

    return (
        <Button
            size='sm'
            variant='outline'
            disabled={disabled || isPending}
            onClick={() =>
                startTransition(async () => {
                    const response = await runDecayDetectionNowAction()
                    if (!response.success || !response.result) {
                        toast.error(response.error ?? 'Detection failed')
                        return
                    }
                    const { result } = response
                    if (result.outcome !== 'detected') {
                        toast.info(`Detection skipped (${result.outcome})`)
                        return
                    }
                    toast.success(
                        `Detection ran: ${result.signalsDetected} signal${
                            result.signalsDetected === 1 ? '' : 's'
                        } — ${result.created} new, ${result.merged} merged, ${result.skipped} skipped`
                    )
                })
            }
        >
            {isPending ? (
                <Loader2 className='h-3.5 w-3.5 animate-spin' />
            ) : (
                <Radar className='h-3.5 w-3.5' />
            )}
            {isPending ? 'Detecting…' : 'Detect decay now'}
        </Button>
    )
}

const QUEUE_OUTCOME_MESSAGES: Record<string, string> = {
    created: 'Post queued for refresh',
    merged: 'Added to the post’s existing candidate',
    'skipped-active-run': 'A refresh is already running for this post',
    'skipped-cooldown': 'Post is in its post-refresh cooldown',
    'skipped-not-eligible': 'Only published posts can be queued',
}

export function QueuePostForm({
    posts,
}: {
    posts: Array<{ id: string; title: string }>
}) {
    const [selectedId, setSelectedId] = useState('')
    const [isPending, startTransition] = useTransition()

    if (posts.length === 0) return null

    return (
        <div className='flex items-center gap-2'>
            <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger className='w-72' aria-label='Post to queue'>
                    <SelectValue placeholder='Queue a post manually…' />
                </SelectTrigger>
                <SelectContent>
                    {posts.map((post) => (
                        <SelectItem key={post.id} value={post.id}>
                            {post.title}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button
                size='sm'
                variant='outline'
                disabled={!selectedId || isPending}
                onClick={() =>
                    startTransition(async () => {
                        const result =
                            await queuePostForRefreshAction(selectedId)
                        if (!result.success) {
                            toast.error(result.error ?? 'Failed to queue')
                            return
                        }
                        const message =
                            QUEUE_OUTCOME_MESSAGES[result.outcome ?? ''] ??
                            'Queued'
                        if (
                            result.outcome === 'created' ||
                            result.outcome === 'merged'
                        ) {
                            toast.success(message)
                            setSelectedId('')
                        } else {
                            toast.info(message)
                        }
                    })
                }
            >
                {isPending ? (
                    <Loader2 className='h-3.5 w-3.5 animate-spin' />
                ) : (
                    <Plus className='h-3.5 w-3.5' />
                )}
                Queue
            </Button>
        </div>
    )
}
