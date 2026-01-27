/**
 * Workflow Status API Route
 *
 * Provides status polling endpoint for Vercel Workflow runs.
 * Used by the UI to track progress of long-running workflows.
 *
 * @module @admin/app/api/workflow/[runId]
 */

import { getRun } from 'workflow/api'
import { NextResponse } from 'next/server'

import { requireAuth, UnauthorizedError } from '@/lib/utils/auth.util'
import type { BulkInlineImagesWorkflowResult } from '@/app/workflows/inline-image-generation/bulk-inline-images.workflow'
import type { BulkSeoTitlesWorkflowResult } from '@/app/workflows/seo-title-generation/bulk-seo-titles.workflow'

export type WorkflowStatusResponse = {
    id: string
    status: 'pending' | 'running' | 'completed' | 'failed'
    output?: BulkInlineImagesWorkflowResult | BulkSeoTitlesWorkflowResult
    error?: string
}

/**
 * GET /api/workflow/[runId]
 *
 * Get the status of a workflow run by its ID.
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ runId: string }> }
): Promise<NextResponse<WorkflowStatusResponse | { error: string }>> {
    try {
        await requireAuth()
        const { runId } = await params

        if (!runId || typeof runId !== 'string') {
            return NextResponse.json(
                { error: 'Invalid run ID' },
                { status: 400 }
            )
        }

        const run = getRun<
            BulkInlineImagesWorkflowResult | BulkSeoTitlesWorkflowResult
        >(runId)

        // Get status - returns a Promise
        const status = await run.status

        // Map workflow status to our response status
        let responseStatus: WorkflowStatusResponse['status']
        let output:
            | BulkInlineImagesWorkflowResult
            | BulkSeoTitlesWorkflowResult
            | undefined
        let error: string | undefined

        if (status === 'completed') {
            responseStatus = 'completed'
            try {
                output = await run.returnValue
            } catch (e) {
                // returnValue throws if workflow failed
                error = e instanceof Error ? e.message : 'Unknown error'
                responseStatus = 'failed'
            }
        } else if (status === 'failed' || status === 'cancelled') {
            responseStatus = 'failed'
            try {
                await run.returnValue
            } catch (e) {
                error = e instanceof Error ? e.message : 'Workflow failed'
            }
        } else if (status === 'running') {
            responseStatus = 'running'
        } else {
            responseStatus = 'pending'
        }

        return NextResponse.json({
            id: run.runId,
            status: responseStatus,
            output,
            error,
        })
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        console.error('[Workflow API] Error getting workflow status:', error)

        return NextResponse.json(
            { error: 'Failed to get workflow status' },
            { status: 500 }
        )
    }
}
