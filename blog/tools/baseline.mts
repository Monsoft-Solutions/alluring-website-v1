/**
 * Search Console baseline for the pages you are about to change: save it
 * BEFORE the change, then re-read on day 28/56/90 (readout.mts) against it.
 *
 *   TSX=$(ls -d node_modules/.pnpm/tsx@*\/node_modules/tsx/dist/cli.mjs | tail -1)
 *   node $TSX blog/tools/baseline.mts <out.csv> <url|/path|slug> [...] [--days 90] [--queries 1000]
 *
 * Per URL, through the shared data layer (packages/seo/src/search-console,
 * the same code as the search-console MCP server and the admin):
 *   - page_trend: one row per day for the last <days> days (getPageTrend)
 *   - queries_for_page: every query with impressions in the same window,
 *     up to <queries> rows (getQueriesForPage)
 *   - total: the window's clicks, impressions, CTR and impression-weighted position
 * The window ends three days ago (Search Console's data delay) and uses
 * dataState "final". Page URLs are queried on the www host
 * (https://www.alluringplasticsurgery.com/...), which is how the property
 * records them; a bare /path or slug is resolved to it (a slug through the
 * live blog sitemap). Queries Google anonymizes are absent, so query rows sum
 * to less than the total.
 *
 * Credentials: GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY and
 * GOOGLE_SEARCH_CONSOLE_SITE_URL, loaded with dotenv from apps/admin/.env.local
 * then apps/admin/.env BEFORE the seo package is imported (its env module
 * snapshots process.env when it loads). Read-only.
 *
 * CSV columns: kind,url,window_start,window_end,date,query,clicks,impressions,ctr,position
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const ORIGIN = 'https://www.alluringplasticsurgery.com'

const args = process.argv.slice(2)
const opt = (name: string, fallback: number): number => {
    const i = args.indexOf(`--${name}`)
    if (i < 0) return fallback
    const value = Number(args.splice(i, 2)[1])
    if (!Number.isFinite(value) || value <= 0)
        throw new Error(`--${name} needs a positive number`)
    return value
}
const days = opt('days', 90)
const queryLimit = opt('queries', 1000)
const [outFile, ...targets] = args
if (!outFile || !targets.length || !outFile.endsWith('.csv')) {
    console.error(
        'usage: baseline.mts <out.csv> <url|/path|slug> [...] [--days 90] [--queries 1000]'
    )
    process.exit(2)
}

// dotenv first: @workspace/seo reads process.env when its env module loads.
const require = createRequire(path.join(REPO, 'packages/mcp-gsc/package.json'))
const { config } = require('dotenv') as typeof import('dotenv')
config({
    path: [
        path.join(REPO, 'apps/admin/.env.local'),
        path.join(REPO, 'apps/admin/.env'),
    ],
    quiet: true,
})

const sc = await import(
    pathToFileURL(path.join(REPO, 'packages/seo/src/search-console/index.ts'))
        .href
)
if (!sc.isSearchConsoleConfigured()) {
    console.error(
        'Search Console credentials not found (GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SEARCH_CONSOLE_SITE_URL in apps/admin/.env)'
    )
    process.exit(1)
}

let sitemapPaths: Map<string, string> | undefined
async function resolve(target: string): Promise<string> {
    if (/^https?:\/\//.test(target)) {
        const u = new URL(target)
        return `${ORIGIN}${u.pathname.replace(/\/$/, '') || '/'}`
    }
    if (target.startsWith('/'))
        return `${ORIGIN}${target.replace(/\/$/, '') || '/'}`
    if (!sitemapPaths) {
        const xml = await (await fetch(`${ORIGIN}/sitemap/blog.xml`)).text()
        sitemapPaths = new Map()
        for (const [, loc] of xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)) {
            const p = new URL(loc).pathname
            if (!/\.(jpe?g|png|webp|gif|avif)$/.test(p))
                sitemapPaths.set(p.split('/').pop()!, p)
        }
    }
    const p = sitemapPaths.get(target)
    if (!p)
        throw new Error(
            `${target}: not a live blog slug (not in ${ORIGIN}/sitemap/blog.xml); pass the path`
        )
    return `${ORIGIN}${p}`
}

const { startDate, endDate } = sc.getDateRange(days) as {
    startDate: string
    endDate: string
}
const csv = (v: unknown) => {
    const s = v === undefined || v === null ? '' : String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}
const lines = [
    'kind,url,window_start,window_end,date,query,clicks,impressions,ctr,position',
]
const row = (
    kind: string,
    url: string,
    date: string,
    query: string,
    r: { clicks: number; impressions: number; ctr: number; position: number }
) =>
    lines.push(
        [
            kind,
            url,
            startDate,
            endDate,
            date,
            query,
            r.clicks,
            r.impressions,
            r.ctr.toFixed(4),
            r.position.toFixed(2),
        ]
            .map(csv)
            .join(',')
    )

console.log(
    `window ${startDate}..${endDate} (${days} days), property ${sc.getSiteUrl()}`
)
for (const target of targets) {
    const url = await resolve(target)
    const trend = (await sc.withGscRetry(() =>
        sc.getPageTrend(url, days)
    )) as Array<{
        date: string
        clicks: number
        impressions: number
        ctr: number
        position: number
    }>
    const queries = (await sc.withGscRetry(() =>
        sc.getQueriesForPage(url, days, queryLimit)
    )) as Array<{
        query: string
        clicks: number
        impressions: number
        ctr: number
        position: number
    }>
    const clicks = trend.reduce((a, r) => a + r.clicks, 0)
    const impressions = trend.reduce((a, r) => a + r.impressions, 0)
    const position = impressions
        ? trend.reduce((a, r) => a + r.position * r.impressions, 0) /
          impressions
        : 0
    row('total', url, '', '', {
        clicks,
        impressions,
        ctr: impressions ? clicks / impressions : 0,
        position,
    })
    for (const r of trend) row('page_trend', url, r.date, '', r)
    for (const r of queries) row('queries_for_page', url, '', r.query, r)
    console.log(
        `${url}  ${trend.length} days, ${queries.length} queries, ${clicks} clicks / ${impressions} impressions, pos ${position.toFixed(1)}` +
            (queries[0] ? `, top query "${queries[0].query}"` : '')
    )
}

mkdirSync(path.dirname(path.resolve(outFile)), { recursive: true })
writeFileSync(outFile, lines.join('\n') + '\n')
console.log(`wrote ${outFile} (${lines.length - 1} rows)`)
