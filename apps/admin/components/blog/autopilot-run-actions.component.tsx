'use client'

/**
 * Autopilot Run Actions
 *
 * Client buttons for the autopilot status card: manual "Run now" triggers
 * and failure acknowledgment. Server work happens in autopilot.action.ts;
 * the page re-renders via revalidatePath.
 *
 * @module components/blog/autopilot-run-actions
 */
import { useTransition } from 'react'
import { CheckCircle2, Lightbulb, Loader2, PenLine } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@workspace/ui/components/button'

import {
    acknowledgeAutopilotRun,
    runAutopilotJobNow,
} from '@/lib/actions/autopilot.action'

export function RunNowButtons() {
    const [isPending, startTransition] = useTransition()

    const trigger = (kind: 'ideation' | 'content') => {
        startTransition(async () => {
            const result = await runAutopilotJobNow(kind)
            if (result.success) {
                const skipReason =
                    typeof result.detail?.reason === 'string'
                        ? result.detail.reason
                        : 'skipped'
                const reason =
                    result.outcome === 'skipped' ? ` (${skipReason})` : ''
                toast.success(
                    kind === 'ideation'
                        ? `Ideation run: ${result.outcome}${reason}`
                        : `Content run: ${result.outcome}${reason}`
                )
            } else {
                toast.error(result.error ?? 'Run failed')
            }
        })
    }

    return (
        <div className='flex flex-wrap gap-2'>
            <Button
                size='sm'
                variant='outline'
                disabled={isPending}
                onClick={() => trigger('ideation')}
            >
                {isPending ? (
                    <Loader2 className='h-3.5 w-3.5 animate-spin' />
                ) : (
                    <Lightbulb className='h-3.5 w-3.5' />
                )}
                Generate ideas now
            </Button>
            <Button
                size='sm'
                variant='outline'
                disabled={isPending}
                onClick={() => trigger('content')}
            >
                {isPending ? (
                    <Loader2 className='h-3.5 w-3.5 animate-spin' />
                ) : (
                    <PenLine className='h-3.5 w-3.5' />
                )}
                Write next post now
            </Button>
        </div>
    )
}

export function AcknowledgeButton({ runId }: { runId: string }) {
    const [isPending, startTransition] = useTransition()

    return (
        <Button
            size='sm'
            variant='outline'
            disabled={isPending}
            onClick={() =>
                startTransition(async () => {
                    const result = await acknowledgeAutopilotRun(runId)
                    if (result.success) {
                        toast.success(
                            'Failure acknowledged — autopilot resumes'
                        )
                    } else {
                        toast.error(result.error ?? 'Failed to acknowledge')
                    }
                })
            }
        >
            {isPending ? (
                <Loader2 className='h-3.5 w-3.5 animate-spin' />
            ) : (
                <CheckCircle2 className='h-3.5 w-3.5' />
            )}
            Acknowledge
        </Button>
    )
}
