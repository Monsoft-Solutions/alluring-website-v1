'use client'

/**
 * Idea Approval Actions
 *
 * Approve / Reject controls rendered on pending autopilot idea cards in the
 * Ideation column, plus the ownership-gate badge every ideation card shows.
 * Approving queues the topic for the next autopilot writing run; rejecting
 * removes the card from the board and remembers the topic so ideation never
 * re-proposes it.
 *
 * @module components/blog/pipeline/idea-approval-actions
 */
import { useState } from 'react'
import { Check, Loader2, ShieldCheck, X } from 'lucide-react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog'
import { Textarea } from '@workspace/ui/components/textarea'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip'

import type { PipelinePostItem } from '@/lib/types/pipeline.type'
import { useApproveIdea, useRejectIdea } from '@/hooks/use-pipeline.hook'

/** Ownership-gate badge for an ideation card (renders nothing without a verdict). */
export function IdeaGateBadge({ post }: { post: PipelinePostItem }) {
    const gate = post.planningData?.ideationGate
    if (!gate) return null

    const claimed = gate.claimedQueries?.slice(0, 5) ?? []

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Badge
                    variant='outline'
                    className='flex items-center gap-0.5 border-emerald-300 px-1.5 py-0 text-[10px] text-emerald-700'
                >
                    <ShieldCheck className='h-2.5 w-2.5' />
                    {gate.verdict === 'new' ? 'New cluster' : gate.verdict}
                </Badge>
            </TooltipTrigger>
            <TooltipContent className='max-w-xs'>
                {claimed.length > 0 ? (
                    <span>
                        Will own: {claimed.join(', ')}
                        {gate.claimedQueries &&
                        gate.claimedQueries.length > claimed.length
                            ? '…'
                            : ''}
                    </span>
                ) : (
                    <span>{gate.reason ?? 'Passed the ownership gate'}</span>
                )}
            </TooltipContent>
        </Tooltip>
    )
}

/** Approve / Reject buttons for a pending idea card. */
export function IdeaApprovalActions({ post }: { post: PipelinePostItem }) {
    const approveMutation = useApproveIdea()
    const rejectMutation = useRejectIdea()
    const [showRejectDialog, setShowRejectDialog] = useState(false)
    const [reason, setReason] = useState('')

    if (post.status !== 'ideation' || post.ideaApproval !== 'pending') {
        return null
    }

    const busy = approveMutation.isPending || rejectMutation.isPending

    return (
        <>
            <div
                className='mt-2 flex items-center gap-2'
                onClick={(event) => event.stopPropagation()}
            >
                <Button
                    size='sm'
                    className='h-7 flex-1 bg-emerald-600 text-xs hover:bg-emerald-700'
                    disabled={busy}
                    onClick={() => approveMutation.mutate(post.id)}
                >
                    {approveMutation.isPending ? (
                        <Loader2 className='h-3 w-3 animate-spin' />
                    ) : (
                        <Check className='h-3 w-3' />
                    )}
                    Approve
                </Button>
                <Button
                    size='sm'
                    variant='outline'
                    className='h-7 flex-1 text-xs'
                    disabled={busy}
                    onClick={() => setShowRejectDialog(true)}
                >
                    <X className='h-3 w-3' />
                    Reject
                </Button>
            </div>

            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent
                    onClick={(event) => event.stopPropagation()}
                    className='sm:max-w-md'
                >
                    <DialogHeader>
                        <DialogTitle>Reject this idea?</DialogTitle>
                        <DialogDescription>
                            “{post.title}” leaves the board and will not be
                            proposed again. An optional reason helps future
                            ideation.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder='Why is this topic wrong for us? (optional)'
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        rows={3}
                    />
                    <DialogFooter>
                        <Button
                            variant='outline'
                            onClick={() => setShowRejectDialog(false)}
                            disabled={rejectMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant='destructive'
                            disabled={rejectMutation.isPending}
                            onClick={() =>
                                rejectMutation.mutate(
                                    {
                                        id: post.id,
                                        reason: reason || undefined,
                                    },
                                    {
                                        onSettled: () =>
                                            setShowRejectDialog(false),
                                    }
                                )
                            }
                        >
                            {rejectMutation.isPending ? (
                                <Loader2 className='h-4 w-4 animate-spin' />
                            ) : null}
                            Reject idea
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
