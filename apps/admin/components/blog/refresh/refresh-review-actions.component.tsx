'use client'

/**
 * Refresh Review Actions
 *
 * Client controls for the refresh review screen (epic #144, #148): run the
 * refresh on a pending candidate, apply a reviewed one, or dismiss. Apply
 * and dismiss are server actions; the run goes through the long-budget
 * route handler, mirroring the pipeline phase routes.
 *
 * @module components/blog/refresh/refresh-review-actions
 */
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2, Play, Undo2, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@workspace/ui/components/button'

import {
    applyRefreshAction,
    dismissRefreshCandidateAction,
    rollbackRevisionAction,
} from '@/lib/actions/content-refresh.action'

/** Kick off the refresh run for a pending candidate. */
export function RunRefreshButton({
    candidateId,
    disabled,
}: {
    candidateId: string
    disabled?: boolean
}) {
    const router = useRouter()
    const [isRunning, setIsRunning] = useState(false)

    const run = async () => {
        setIsRunning(true)
        toast.info('Refresh started — this takes a few minutes')
        try {
            const response = await fetch(
                `/api/admin/refresh/${candidateId}/run`,
                { method: 'POST' }
            )
            const payload = (await response.json()) as {
                success: boolean
                error?: string
            }
            if (payload.success) {
                toast.success('Refresh complete — the draft is ready to review')
            } else {
                toast.error(payload.error ?? 'The refresh run failed')
            }
        } catch {
            toast.error('The refresh run failed')
        } finally {
            setIsRunning(false)
            router.refresh()
        }
    }

    return (
        <Button size='sm' disabled={disabled || isRunning} onClick={run}>
            {isRunning ? (
                <Loader2 className='h-3.5 w-3.5 animate-spin' />
            ) : (
                <Play className='h-3.5 w-3.5' />
            )}
            {isRunning ? 'Refreshing…' : 'Run refresh'}
        </Button>
    )
}

/** Merge the reviewed working copy onto the live post. */
export function ApplyRefreshButton({ candidateId }: { candidateId: string }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    return (
        <Button
            size='sm'
            disabled={isPending}
            onClick={() =>
                startTransition(async () => {
                    const result = await applyRefreshAction(candidateId)
                    if (result.success) {
                        toast.success(
                            'Refresh applied — the live post is updated, same URL'
                        )
                        router.refresh()
                    } else {
                        toast.error(result.error ?? 'Failed to apply')
                    }
                })
            }
        >
            {isPending ? (
                <Loader2 className='h-3.5 w-3.5 animate-spin' />
            ) : (
                <Check className='h-3.5 w-3.5' />
            )}
            {isPending ? 'Applying…' : 'Apply to live post'}
        </Button>
    )
}

/** Undo an applied refresh: restore the pre-apply revision. */
export function RollbackRefreshButton({ revisionId }: { revisionId: string }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    return (
        <Button
            size='sm'
            variant='outline'
            disabled={isPending}
            onClick={() =>
                startTransition(async () => {
                    const result = await rollbackRevisionAction(revisionId)
                    if (result.success) {
                        toast.success(
                            'Rolled back — the pre-refresh version is live again'
                        )
                        router.refresh()
                    } else {
                        toast.error(result.error ?? 'Failed to roll back')
                    }
                })
            }
        >
            {isPending ? (
                <Loader2 className='h-3.5 w-3.5 animate-spin' />
            ) : (
                <Undo2 className='h-3.5 w-3.5' />
            )}
            {isPending ? 'Rolling back…' : 'Roll back this refresh'}
        </Button>
    )
}

/** Dismiss from the review screen (deletes the working copy). */
export function DismissFromReviewButton({
    candidateId,
}: {
    candidateId: string
}) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    return (
        <Button
            size='sm'
            variant='outline'
            disabled={isPending}
            onClick={() =>
                startTransition(async () => {
                    const result =
                        await dismissRefreshCandidateAction(candidateId)
                    if (result.success) {
                        toast.success(
                            'Dismissed — the working copy was discarded'
                        )
                        router.push('/blog/refresh')
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
