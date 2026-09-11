/**
 * Refresh Queue Noise Prune
 *
 * One-off cleanup for issue #221. Before the detector learned to ignore
 * search-operator and brand queries, one `site:` flip-flop finding gave
 * ~50 blog posts a `cannibalization` signal (share 0, one impression each)
 * and inflated the score of every real candidate it touched.
 *
 * Walks every PENDING candidate, drops the cannibalization signals R4 would
 * no longer produce (same predicate the rule uses), rescores the survivors
 * and deletes rows left with no signal at all. Rows with a run in flight
 * (in_progress / ready_for_review) and terminal rows are never touched.
 *
 * Dry-run by default — prints what would change. Runs against whatever
 * database the local env points at; pass POSTGRES_URL explicitly to target
 * another one.
 *
 * Usage:
 *   pnpm --filter admin refresh:prune            # dry run
 *   pnpm --filter admin refresh:prune -- --apply # write the changes
 */
import { config } from 'dotenv'

config({ path: ['.env.local', '.env'] })

async function main() {
    // Imported after dotenv so @workspace/db reads the right POSTGRES_URL.
    const { eq } = await import('drizzle-orm')
    const { db } = await import('@workspace/db/client')
    const { blogPost, contentRefresh } = await import(
        '@workspace/db/schema/blog'
    )
    const { computeRefreshScore, isActionableCannibalizationSignal } =
        await import('../lib/utils/decay-rules.util')

    const apply = process.argv.includes('--apply')

    const rows = await db
        .select({
            id: contentRefresh.id,
            slug: blogPost.slug,
            score: contentRefresh.score,
            sources: contentRefresh.sources,
        })
        .from(contentRefresh)
        .innerJoin(blogPost, eq(blogPost.id, contentRefresh.blogPostId))
        .where(eq(contentRefresh.status, 'pending'))

    const deletions: Array<{ id: string; slug: string | null }> = []
    const rescored: Array<{
        id: string
        slug: string | null
        before: number
        after: number
        dropped: number
        sources: (typeof rows)[number]['sources']
    }> = []

    for (const row of rows) {
        const kept = row.sources.filter(isActionableCannibalizationSignal)
        if (kept.length === row.sources.length) continue

        if (kept.length === 0) {
            deletions.push({ id: row.id, slug: row.slug })
            continue
        }

        rescored.push({
            id: row.id,
            slug: row.slug,
            before: row.score,
            after: computeRefreshScore(kept),
            dropped: row.sources.length - kept.length,
            sources: kept,
        })
    }

    console.log(
        `${rows.length} pending candidate(s): ${deletions.length} noise-only (delete), ${rescored.length} mixed (rescore), ${
            rows.length - deletions.length - rescored.length
        } untouched`
    )
    for (const entry of deletions) {
        console.log(`  delete   ${entry.slug ?? entry.id}`)
    }
    for (const entry of rescored) {
        console.log(
            `  rescore  ${entry.slug ?? entry.id}: ${entry.before} -> ${entry.after} (${entry.dropped} signal(s) dropped)`
        )
    }

    if (!apply) {
        console.log('\nDry run — pass --apply to write these changes.')
        return
    }

    await db.transaction(async (tx) => {
        for (const entry of deletions) {
            await tx
                .delete(contentRefresh)
                .where(eq(contentRefresh.id, entry.id))
        }
        for (const entry of rescored) {
            await tx
                .update(contentRefresh)
                .set({ sources: entry.sources, score: entry.after })
                .where(eq(contentRefresh.id, entry.id))
        }
    })
    console.log(
        `\nApplied: ${deletions.length} deleted, ${rescored.length} rescored.`
    )
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
