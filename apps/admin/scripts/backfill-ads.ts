/**
 * Google Ads Backfill (epic #288)
 *
 * One-time (re-runnable) fill of the Ads console's tables:
 *   1. daily reports for the last N months, in 30-day windows through the same
 *      path the daily cron uses — each window replaces itself, so re-running
 *      is safe
 *   2. lead → click matches for every paid Google lead in that span: leads
 *      inside Google's 90-day click report are looked up, older ones are
 *      placed on the ladder from what their URL carried
 *
 * Newest window first, so an interrupted run still leaves the recent months
 * the pages open on. Runs against whatever database the local env points at.
 *
 * Quota: ≈6 operations per window (13 months ≈ 80) plus about one per
 * lead-day with a gclid (≈90 for the last 90 days) — well under the Explorer
 * tier's 2,880 a day.
 *
 * Usage:
 *   pnpm --filter admin backfill:ads                   # 13 months
 *   pnpm --filter admin backfill:ads -- --months 3     # shorter span
 *   pnpm --filter admin backfill:ads -- --leads-only   # skip the reports
 *   pnpm --filter admin backfill:ads -- --dry-run      # list windows only
 */
import { config } from 'dotenv'

config({ path: ['.env.local', '.env'] })

const WINDOW_DAYS = 30

async function main() {
    // Imported after dotenv so @workspace/db reads the right POSTGRES_URL.
    const { addDays, getGoogleAdsConfig, isGoogleAdsConfigured, todayIn } =
        await import('@workspace/google-ads')
    const { runAdsSnapshotJob } = await import(
        '../lib/services/ads/ads-snapshot.service'
    )
    const { runResolveLeadClicksJob } = await import(
        '../lib/services/ads/lead-ad-click.service'
    )

    const args = process.argv.slice(2)
    const monthsArg = args.indexOf('--months')
    const months = monthsArg >= 0 ? Number(args[monthsArg + 1] ?? '13') : 13
    const dryRun = args.includes('--dry-run')
    const leadsOnly = args.includes('--leads-only')

    if (!isGoogleAdsConfigured()) {
        console.error(
            'Google Ads env vars missing (GOOGLE_CLIENT_EMAIL / GOOGLE_PRIVATE_KEY / GOOGLE_ADS_CUSTOMER_ID).'
        )
        process.exit(1)
    }

    const today = todayIn(getGoogleAdsConfig().timeZone)
    const oldest = addDays(today, -Math.round(months * 30.44))
    const spanDays =
        Math.round(
            (Date.parse(`${today}T12:00:00Z`) -
                Date.parse(`${oldest}T12:00:00Z`)) /
                86_400_000
        ) + 1

    const windows: { startDate: string; endDate: string }[] = []
    for (let end = today; end >= oldest; end = addDays(end, -WINDOW_DAYS)) {
        const start = addDays(end, -(WINDOW_DAYS - 1))
        windows.push({
            startDate: start < oldest ? oldest : start,
            endDate: end,
        })
    }

    console.log(
        `Backfill ${oldest} → ${today}: ${windows.length} report windows, leads from the last ${spanDays} days.`
    )
    if (dryRun) {
        for (const window of windows) {
            console.log(`  ${window.startDate} … ${window.endDate}`)
        }
        return
    }

    let operations = 0
    if (!leadsOnly) {
        for (const [index, window] of windows.entries()) {
            const result = await runAdsSnapshotJob('backfill', {
                ...window,
                // The change log only reaches 30 days back; pull it once.
                includeChanges: index === 0,
            })
            operations += result.apiOperations
            console.log(
                `  ${window.startDate} … ${window.endDate}: ${result.outcome} ${JSON.stringify(result.counts)} (${result.apiOperations} ops)${result.error ? ` — ${result.error}` : ''}`
            )
            if (result.outcome === 'skipped-locked') {
                console.error(
                    'Another snapshot is running; try again when it finishes.'
                )
                process.exit(1)
            }
        }
    }

    const leads = await runResolveLeadClicksJob('backfill', {
        lookbackDays: spanDays,
    })
    operations += leads.apiOperations
    console.log(
        `Leads: ${leads.outcome}, ${leads.written} written of ${leads.examined} examined ${JSON.stringify(leads.byMatch)}, ${leads.failedLookups} failed lookups (${leads.apiOperations} ops)${leads.error ? ` — ${leads.error}` : ''}`
    )
    console.log(`Done: ${operations} API operations.`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
