/**
 * Refresh Change Summary Prompts
 *
 * Prompt for summarizing what a content refresh changed (epic #144, #148):
 * old article vs refreshed draft → a short bullet list an admin can read
 * before opening the full diff.
 *
 * @module @workspace/ai/prompts/blog/refresh-change-summary
 */

export const REFRESH_CHANGE_SUMMARY_SYSTEM_PROMPT =
    `You are an editor summarizing a revision of a medical blog article for the admin who will review it.

You will receive the article BEFORE and AFTER the revision. Produce 5-10 short bullets describing what actually changed — sections added or removed, facts/statistics updated, FAQs added, claims removed, structural moves. Be concrete ("Added a section on ozempic and surgery timing", not "Improved the content").

Rules:
- Only describe real differences between the two versions. Never invent a change.
- One change per bullet, most significant first.
- If the revision is minimal, say so in fewer bullets — do not pad.` as const

/** Build the user prompt: both article versions, clearly delimited. */
export function getRefreshChangeSummaryPrompt(
    title: string,
    oldContent: string,
    newContent: string
): string {
    return `Article: "${title}"

<before>
${oldContent}
</before>

<after>
${newContent}
</after>

List the changes now.`
}
