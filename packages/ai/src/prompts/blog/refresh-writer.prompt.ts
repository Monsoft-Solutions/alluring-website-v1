/**
 * Refresh Writer Prompts
 *
 * Refresh mode for the agentic writer (epic #144, #148): instead of writing
 * a new article from a topic brief, the writer receives the EXISTING
 * article plus a data-driven refresh brief and improves the post in place.
 * The system addendum pins the invariants (base = existing content, keep
 * ranking headings, same topic/intent); the user section carries the brief.
 *
 * @module @workspace/ai/prompts/blog/refresh-writer
 */

/**
 * The refresh brief as the writer consumes it. Structurally identical to
 * `RefreshBrief` in `@workspace/db` plus the existing article — duplicated
 * here so packages/ai stays free of a db dependency.
 */
export type RefreshBriefInput = {
    /** Why this post was queued (one human sentence per signal). */
    reasons: string[]
    /** The post's top queries with their window-over-window movement. */
    topQueries: {
        query: string
        impressions: number
        position: number
        /** Positive = the post moved DOWN this many spots. */
        positionDelta: number
        ctr: number
    }[]
    /** Queries earning impressions the content doesn't cover yet. */
    risingQueriesNotCovered: string[]
    /** Queries whose rankings decayed — win these back. */
    decayedQueries: string[]
    cannibalizationContext?: string
    staleness: {
        publishedAt: string | null
        lastUpdatedAt: string | null
        ageMonths: number
    }
    /** Standing instructions built alongside the brief. */
    instructions: string[]
    /** The current article — the base the writer must improve in place. */
    existingContent: string
}

/**
 * System-prompt addendum injected when the writer runs in refresh mode.
 * Sits directly after the role section so the mode reframes everything
 * that follows.
 */
export const REFRESH_MODE_RULES = `## Refresh Mode

You are UPDATING an existing published article, not writing a new one. The current article is included in the task brief; treat it as your base.

**Non-negotiable rules:**

1. **Improve in place.** Keep the article's topic, intent, and point of view exactly as they are. You are the same author on a revision pass, not a new writer with a new angle.
2. **Preserve headings that earn rankings.** The brief lists the queries this article ranks for — the headings serving those queries keep their searcher-facing meaning. You may sharpen wording; you may not remove or repurpose them.
3. **Keep everything that works.** Sections with no reason to change are carried over as they are, lightly polished at most. A refresh that rewrites every paragraph destroys the ranking history it was meant to protect.
4. **Update what aged.** Verify dated facts, statistics, prices, and recovery timelines with the research tools and correct anything stale. Remove claims that are no longer true.
5. **Fill the gaps the data names.** Add sections or FAQ entries for the uncovered rising queries in the brief — those searchers are already arriving; give them their answer.
6. **Never expand into another page's territory.** The marketing pages in your linking list each OWN their subject — pricing hubs own cost tables, the financing page owns plan comparisons, procedure pages own procedure depth. A blog article may mention a price or a financing fact in passing, but comprehensive treatments of those subjects (comparison tables, full plan breakdowns, per-procedure cost sections) belong on the owning page: summarize in a sentence or two and link to it. An article that replicates a money page's content competes with it in search and hurts both.
7. **Same output contract.** The full MDX component vocabulary, CTA placement, and linking rules apply to the finished article exactly as they would to a new one.

Output the COMPLETE updated article — every section, not just the changed ones.` as const

/**
 * Render the refresh brief as the user-prompt task section. Replaces the
 * new-post "write from this brief" framing with the update framing.
 */
export function buildRefreshBriefSection(refresh: RefreshBriefInput): string {
    const topQueries =
        refresh.topQueries.length > 0
            ? refresh.topQueries
                  .map(
                      (q) =>
                          `- "${q.query}" — position ${q.position} (${
                              q.positionDelta > 0
                                  ? `down ${q.positionDelta}`
                                  : q.positionDelta < 0
                                    ? `up ${Math.abs(q.positionDelta)}`
                                    : 'steady'
                          }), ${q.impressions} impressions, CTR ${(q.ctr * 100).toFixed(1)}%`
                  )
                  .join('\n')
            : '- No query data available for this post.'

    const decayed =
        refresh.decayedQueries.length > 0
            ? refresh.decayedQueries.map((q) => `- "${q}"`).join('\n')
            : '- None detected.'

    const rising =
        refresh.risingQueriesNotCovered.length > 0
            ? refresh.risingQueriesNotCovered.map((q) => `- "${q}"`).join('\n')
            : '- None detected.'

    const staleness = `Published ${refresh.staleness.publishedAt ?? 'unknown'}, last updated ${refresh.staleness.lastUpdatedAt ?? 'never'} (${refresh.staleness.ageMonths} months ago).`

    return `## Refresh Brief

**Why this article is being refreshed:**
${refresh.reasons.map((reason) => `- ${reason}`).join('\n')}

**Staleness:** ${staleness}

**Top search queries (last 28 days vs the 28 before):**
${topQueries}

**Decayed queries — strengthen the sections answering these:**
${decayed}

**Rising queries the article does not cover — add sections or FAQs for these:**
${rising}
${
    refresh.cannibalizationContext
        ? `\n**Cannibalization context:** ${refresh.cannibalizationContext}\n`
        : ''
}
**Instructions:**
${refresh.instructions.map((instruction) => `- ${instruction}`).join('\n')}

## Current Article (your base — improve it in place)

<current-article>
${refresh.existingContent}
</current-article>`
}
