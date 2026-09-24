/**
 * Lead click-id + landing-param backfill (epic #288, phase 0)
 *
 * From May to September 2026 the landing URL carried Google's click ids
 * while their columns stayed empty (#276), and the ValueTrack params
 * (keyword, matchtype, device…) never had a column at all. This reads each
 * lead's stored `landing_page` with the same parser the website now uses at
 * capture time and fills only what is missing: `gclid`, `gbraid`, `wbraid`,
 * `gad_campaign_id` and `landing_params`. Values already present are never
 * overwritten, and `updated_at` is left alone.
 *
 * Dry run by default: prints what would change. Runs against whatever
 * database the local env points at — for production, point POSTGRES_URL at
 * it explicitly and run the dry run first.
 *
 * Usage:
 *   pnpm --filter admin backfill:lead-params             # dry run
 *   pnpm --filter admin backfill:lead-params -- --apply  # write
 */
import { config } from 'dotenv'

config({ path: ['.env.local', '.env'] })

async function main() {
    const { and, eq, isNotNull, sql } = await import('drizzle-orm')
    const { db } = await import('@workspace/db/client')
    const { contactSubmission } = await import('@workspace/db/schema/contact')
    const { env } = await import('../env')
    const { parseLandingUrl } = await import('@workspace/shared/attribution')

    const apply = process.argv.includes('--apply')
    const host = env.POSTGRES_URL.replace(/^.*@/, '')
    console.log(`${apply ? 'APPLYING to' : 'Dry run on'} ${host}`)

    const leads = await db
        .select({
            id: contactSubmission.id,
            landingPage: contactSubmission.landingPage,
            gclid: contactSubmission.gclid,
            gbraid: contactSubmission.gbraid,
            wbraid: contactSubmission.wbraid,
            gadCampaignId: contactSubmission.gadCampaignId,
            landingParams: contactSubmission.landingParams,
        })
        .from(contactSubmission)
        .where(
            and(
                isNotNull(contactSubmission.landingPage),
                sql`${contactSubmission.landingPage} LIKE '%?%'`
            )
        )

    const filled = {
        gclid: 0,
        gbraid: 0,
        wbraid: 0,
        gadCampaignId: 0,
        landingParams: 0,
    }
    let changedLeads = 0

    for (const lead of leads) {
        const { clickIds, params } = parseLandingUrl(lead.landingPage)
        const patch: Record<string, unknown> = {}

        if (!lead.gclid && clickIds.gclid) patch.gclid = clickIds.gclid
        if (!lead.gbraid && clickIds.gbraid) patch.gbraid = clickIds.gbraid
        if (!lead.wbraid && clickIds.wbraid) patch.wbraid = clickIds.wbraid
        if (!lead.gadCampaignId && clickIds.gadCampaignId) {
            patch.gadCampaignId = clickIds.gadCampaignId
        }
        if (!lead.landingParams && Object.keys(params).length > 0) {
            patch.landingParams = params
        }

        const keys = Object.keys(patch) as (keyof typeof filled)[]
        if (keys.length === 0) continue
        changedLeads += 1
        for (const key of keys) filled[key] += 1

        if (apply) {
            await db
                .update(contactSubmission)
                .set({
                    ...patch,
                    // Bookkeeping, not a change to the lead.
                    updatedAt: sql`${contactSubmission.updatedAt}`,
                })
                .where(eq(contactSubmission.id, lead.id))
        }
    }

    console.log(
        `${leads.length} leads with a query string; ${changedLeads} ${apply ? 'updated' : 'would change'}:`
    )
    console.table(filled)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
