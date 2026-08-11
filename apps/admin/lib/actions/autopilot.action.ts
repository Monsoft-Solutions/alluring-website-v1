/**
 * Autopilot Actions
 *
 * Server actions for the autopilot status card: manual triggers and
 * failure acknowledgment.
 *
 * @module lib/actions/autopilot
 */
'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

import { db } from '@workspace/db/client'
import { autopilotRun } from '@workspace/db/schema/blog'

import { requireAuth, UnauthorizedError } from '@/lib/utils/auth.util'
import {
    runAutopilotIdeationJob,
    startAutopilotContentJob,
} from '@/lib/services/autopilot.service'

type ActionResult = {
    success: boolean
    error?: string
    outcome?: string
    detail?: Record<string, unknown>
}

/**
 * Run an autopilot job now. Manual triggers bypass the cadence check but
 * respect mode, locks, caps, and unacknowledged failures.
 */
export async function runAutopilotJobNow(
    kind: 'ideation' | 'content'
): Promise<ActionResult> {
    try {
        await requireAuth()

        const result =
            kind === 'ideation'
                ? await runAutopilotIdeationJob('manual')
                : await startAutopilotContentJob('manual')

        revalidatePath('/blog/settings')
        revalidatePath('/blog/pipeline')

        return {
            success: result.outcome !== 'failed',
            outcome: result.outcome,
            detail: result.detail,
            error:
                result.outcome === 'failed'
                    ? typeof result.detail.error === 'string'
                        ? result.detail.error
                        : 'Run failed'
                    : undefined,
        }
    } catch (error) {
        console.error('Error triggering autopilot job:', error)
        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to trigger job',
        }
    }
}

/**
 * Acknowledge a failed run, releasing the failure rail so the job may run
 * again on its next tick.
 */
export async function acknowledgeAutopilotRun(
    runId: string
): Promise<ActionResult> {
    try {
        await requireAuth()

        const [run] = await db
            .select({ status: autopilotRun.status })
            .from(autopilotRun)
            .where(eq(autopilotRun.id, runId))
            .limit(1)

        if (!run) {
            return { success: false, error: 'Run not found' }
        }
        if (run.status !== 'failed') {
            return {
                success: false,
                error: 'Only failed runs need acknowledgment',
            }
        }

        await db
            .update(autopilotRun)
            .set({ acknowledgedAt: new Date() })
            .where(eq(autopilotRun.id, runId))

        revalidatePath('/blog/settings')
        return { success: true }
    } catch (error) {
        console.error('Error acknowledging run:', error)
        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to acknowledge run',
        }
    }
}
