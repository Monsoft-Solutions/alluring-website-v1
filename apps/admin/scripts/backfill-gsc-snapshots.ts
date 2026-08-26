/**
 * GSC Snapshot Backfill
 *
 * One-time (resumable) pull of Search Console history into
 * gsc_query_page_daily, up to GSC's 16-month retention wall — so YoY
 * baselines exist from day one instead of accruing over a year (epic #144).
 *
 * Newest-first: the recent months the decay rules need arrive first, so an
 * interrupted run is still immediately useful. Dates already present are
 * skipped, which is what makes re-running safe.
 *
 * Runs against whatever database the local env points at, with the same
 * pull path the daily cron uses. ~200ms between days keeps the request rate
 * far under GSC's per-site quota.
 *
 * Usage:
 *   pnpm --filter admin backfill:gsc                  # 16 months
 *   pnpm --filter admin backfill:gsc -- --months 3    # shorter window
 *   pnpm --filter admin backfill:gsc -- --dry-run     # list dates only
 */
import { config } from 'dotenv'

config({ path: ['.env.local', '.env'] })

async function main() {
    // Imported after dotenv so @workspace/db reads the right POSTGRES_URL.
    const { sql: drizzleSql } = await import('drizzle-orm')
    const { db } = await import('@workspace/db/client')
    const { gscQueryPageDaily, gscSyncRun } = await import(
        '@workspace/db/schema/gsc'
    )
    const {
        isSearchConsoleConfigured,
        fetchAllSearchAnalytics,
        GSC_MAX_ROW_LIMIT,
        withGscRetry,
    } = await import('@workspace/seo/search-console')
    const { createBlogPostUrlResolver } = await import(
        '../lib/services/blog-post-resolver.service'
    )
    const { addDays, gscFinalDate } = await import(
        '../lib/utils/gsc-snapshot.util'
    )

    const args = process.argv.slice(2)
    const monthsArg = args.indexOf('--months')
    const months = monthsArg >= 0 ? Number(args[monthsArg + 1] ?? '16') : 16
    const dryRun = args.includes('--dry-run')

    if (!isSearchConsoleConfigured()) {
        console.error(
            'Search Console env vars missing (GOOGLE_CLIENT_EMAIL / GOOGLE_PRIVATE_KEY / GOOGLE_SEARCH_CONSOLE_SITE_URL).'
        )
        process.exit(1)
    }

    const newest = gscFinalDate(new Date())
    const oldest = addDays(newest, -Math.round(months * 30.44))

    const existing = await db
        .select({ date: gscQueryPageDaily.date })
        .from(gscQueryPageDaily)
        .groupBy(gscQueryPageDaily.date)
    const existingDates = new Set(existing.map((row) => row.date))

    const targetDates: string[] = []
    for (let date = newest; date >= oldest; date = addDays(date, -1)) {
        if (!existingDates.has(date)) targetDates.push(date)
    }

    console.log(
        `Backfill window ${oldest} → ${newest}: ${targetDates.length} missing dates (${existingDates.size} already stored).`
    )
    if (dryRun || targetDates.length === 0) return

    const [run] = await db
        .insert(gscSyncRun)
        .values({ trigger: 'backfill', status: 'running' })
        .returning({ id: gscSyncRun.id })
        .catch(() => {
            console.error(
                'Another sync is running (lock held). Wait for it or fail the stale row first.'
            )
            process.exit(1)
        })

    const resolvePost = await createBlogPostUrlResolver()
    const datesPulled: string[] = []
    let rowsUpserted = 0

    try {
        for (const [index, date] of targetDates.entries()) {
            const rows = await withGscRetry(() =>
                fetchAllSearchAnalytics({
                    dimensions: ['query', 'page'],
                    startDate: date,
                    endDate: date,
                    rowLimit: GSC_MAX_ROW_LIMIT,
                })
            )

            const values = rows.flatMap((row) => {
                const query = row.keys?.[0]
                const page = row.keys?.[1]
                if (!query || !page) return []
                return [
                    {
                        date,
                        query,
                        page,
                        blogPostId: resolvePost(page),
                        clicks: row.clicks ?? 0,
                        impressions: row.impressions ?? 0,
                        ctr: row.ctr ?? 0,
                        position: row.position ?? 0,
                    },
                ]
            })

            for (let i = 0; i < values.length; i += 500) {
                const chunk = values.slice(i, i + 500)
                if (chunk.length === 0) continue
                await db
                    .insert(gscQueryPageDaily)
                    .values(chunk)
                    .onConflictDoUpdate({
                        target: [
                            gscQueryPageDaily.date,
                            gscQueryPageDaily.query,
                            gscQueryPageDaily.page,
                        ],
                        set: {
                            blogPostId: drizzleSql`excluded.blog_post_id`,
                            clicks: drizzleSql`excluded.clicks`,
                            impressions: drizzleSql`excluded.impressions`,
                            ctr: drizzleSql`excluded.ctr`,
                            position: drizzleSql`excluded.position`,
                        },
                    })
            }

            datesPulled.push(date)
            rowsUpserted += values.length
            console.log(
                `[${index + 1}/${targetDates.length}] ${date}: ${values.length} rows`
            )

            await new Promise((resolve) => setTimeout(resolve, 200))
        }

        await db
            .update(gscSyncRun)
            .set({
                status: 'completed',
                datesPulled,
                rowsUpserted,
                finishedAt: new Date(),
            })
            .where(drizzleSql`${gscSyncRun.id} = ${run!.id}`)

        console.log(
            `Done: ${datesPulled.length} dates, ${rowsUpserted} rows upserted.`
        )
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        await db
            .update(gscSyncRun)
            .set({
                status: 'failed',
                datesPulled,
                rowsUpserted,
                error: message,
                finishedAt: new Date(),
            })
            .where(drizzleSql`${gscSyncRun.id} = ${run!.id}`)
        console.error(
            `Failed after ${datesPulled.length} dates: ${message}. Re-run to resume.`
        )
        process.exit(1)
    }

    process.exit(0)
}

void main()
