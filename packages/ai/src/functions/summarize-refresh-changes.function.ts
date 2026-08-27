/**
 * Summarize Refresh Changes Function
 *
 * Compares a post's content before and after a refresh run and produces the
 * short bullet summary shown on the diff review screen (epic #144, #148).
 *
 * @module @workspace/ai/functions/summarize-refresh-changes
 */
import { z } from 'zod'

import {
    getRefreshChangeSummaryPrompt,
    REFRESH_CHANGE_SUMMARY_SYSTEM_PROMPT,
} from '../prompts/blog/refresh-change-summary.prompt'
import { coreGenerateObject } from '../core'
import type { ReasoningEffort } from '../models/reasoning-effort.constant'

const refreshChangeSummarySchema = z.object({
    changes: z
        .array(z.string().min(10).max(300))
        .min(1)
        .max(10)
        .describe(
            'Concrete changes between the two versions, most significant first'
        ),
})

const DEFAULT_MODEL_ID = 'x-ai/grok-4.6'

export type SummarizeRefreshChangesOptions = {
    /** Post title, for context. */
    title: string
    /** The article before the refresh. */
    oldContent: string
    /** The refreshed article. */
    newContent: string
    modelId?: string
    /** How hard the model should think (default: none) */
    reasoningEffort?: ReasoningEffort
}

export type RefreshChangeSummary = z.infer<typeof refreshChangeSummarySchema>

/**
 * Summarize what a refresh changed as 5-10 concrete bullets.
 */
export async function summarizeRefreshChanges(
    options: SummarizeRefreshChangesOptions
): Promise<RefreshChangeSummary> {
    const {
        title,
        oldContent,
        newContent,
        modelId = DEFAULT_MODEL_ID,
        reasoningEffort,
    } = options

    const result = await coreGenerateObject({
        modelId,
        reasoningEffort,
        schema: refreshChangeSummarySchema,
        system: REFRESH_CHANGE_SUMMARY_SYSTEM_PROMPT,
        prompt: getRefreshChangeSummaryPrompt(title, oldContent, newContent),
    })

    return result.object
}
