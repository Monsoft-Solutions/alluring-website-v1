// GA4: non-direct sessions and generate_lead events by landing page, summed
// over the pages you select. Read-only (analytics.readonly).
//
//   node .claude/skills/blog-post/scripts/ga4_landing_leads.mjs <start> <end> [blog | <path regex>]
//
// Run from the repo root. `blog` selects every path in the live blog sitemap;
// a regex selects landing pages by path; nothing selects every page.
// Property 457152980. Credentials: GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY,
// apps/admin/.env.local over apps/admin/.env, last line wins (the service
// account is a GA4 Editor: never call the Admin API from here).
// generate_lead is counted with eventCount (keyEvents:generate_lead reads 0
// before late September 2026). GA4 is a cross-check: count leads from the
// database (blog_leads.sql), since a reopened thank-you tab fires generate_lead again.
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'

const REPO = process.cwd()
const require = createRequire(join(REPO, 'packages/seo/package.json'))
const { google } = require('googleapis')

const env = {}
for (const f of ['apps/admin/.env', 'apps/admin/.env.local']) {
    let text = ''
    try {
        text = readFileSync(join(REPO, f), 'utf8')
    } catch {
        continue
    }
    for (const line of text.split('\n')) {
        const m = /^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line)
        if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
    }
}

const [start, end, select] = process.argv.slice(2)
if (
    !/^\d{4}-\d{2}-\d{2}$/.test(start ?? '') ||
    !/^\d{4}-\d{2}-\d{2}$/.test(end ?? '')
) {
    console.error(
        'usage: ga4_landing_leads.mjs <start YYYY-MM-DD> <end YYYY-MM-DD> [blog | <path regex>]'
    )
    process.exit(2)
}
if (!env.GOOGLE_CLIENT_EMAIL || !env.GOOGLE_PRIVATE_KEY) {
    console.error(
        'GOOGLE_CLIENT_EMAIL / GOOGLE_PRIVATE_KEY not found in apps/admin/.env(.local)'
    )
    process.exit(1)
}

let match = () => true
if (select === 'blog') {
    const xml = await (
        await fetch('https://www.alluringplasticsurgery.com/sitemap/blog.xml')
    ).text()
    const paths = new Set(
        [
            ...xml.matchAll(
                /<loc>https:\/\/www\.alluringplasticsurgery\.com([^<]*)<\/loc>/g
            ),
        ]
            .map((m) => m[1].replace(/\/$/, ''))
            .filter((p) => p && p !== '/blog')
    )
    if (!paths.size) {
        console.error('the blog sitemap returned no posts')
        process.exit(1)
    }
    match = (p) => paths.has(p.split('?')[0].replace(/\/$/, ''))
} else if (select) {
    const rx = new RegExp(select)
    match = (p) => rx.test(p)
}

const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: env.GOOGLE_CLIENT_EMAIL,
        private_key: env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
})
const ga = google.analyticsdata({ version: 'v1beta', auth })

async function byLandingPage(metric, dimensionFilter) {
    const { data } = await ga.properties.runReport({
        property: 'properties/457152980',
        requestBody: {
            dateRanges: [{ startDate: start, endDate: end }],
            dimensions: [{ name: 'landingPage' }],
            metrics: [{ name: metric }],
            dimensionFilter,
            limit: 100000,
        },
    })
    return new Map(
        (data.rows ?? []).map((r) => [
            r.dimensionValues[0].value,
            Number(r.metricValues[0].value),
        ])
    )
}

const sessions = await byLandingPage('sessions', {
    notExpression: {
        filter: {
            fieldName: 'sessionDefaultChannelGroup',
            stringFilter: { value: 'Direct' },
        },
    },
})
const leads = await byLandingPage('eventCount', {
    filter: {
        fieldName: 'eventName',
        stringFilter: { value: 'generate_lead' },
    },
})

let pages = 0
let s = 0
let l = 0
for (const [page, n] of sessions) {
    if (!match(page)) continue
    pages += 1
    s += n
    l += leads.get(page) ?? 0
}
console.log(
    JSON.stringify({
        start,
        end,
        select: select ?? 'all',
        landingPages: pages,
        nonDirectSessions: s,
        generateLeadEvents: l,
        perHundredSessions: s ? Number(((l / s) * 100).toFixed(2)) : null,
    })
)
