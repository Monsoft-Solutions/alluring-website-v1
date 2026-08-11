/**
 * Check Draft Cap Step
 *
 * Durable workflow step re-checking the draft cap between posts of a
 * multi-post content run.
 *
 * @module @admin/app/workflows/autopilot/check-draft-cap.step
 */
import { getBlogAiConfig } from '@/lib/queries/blog-ai-config.query'
import { countDraftsAwaitingReview } from '@/lib/services/autopilot.service'

export async function checkDraftCapStep(): Promise<{
    ok: boolean
    draftCount: number
    cap: number
}> {
    'use step'

    const config = await getBlogAiConfig()
    const draftCount = await countDraftsAwaitingReview()
    return {
        ok: draftCount < config.autopilotDraftCap,
        draftCount,
        cap: config.autopilotDraftCap,
    }
}
