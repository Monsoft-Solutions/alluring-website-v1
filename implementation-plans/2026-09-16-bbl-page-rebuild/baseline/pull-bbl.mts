/**
 * Search Console baseline for epic #246 — the BBL page, the control series and
 * the cluster cut.
 *
 * Re-run this at day 28, 56 and 90 with a different `--end` so every cut is
 * made the same way. Writes one JSON file.
 *
 *   pnpm build   # packages/seo must be compiled; this reads dist/ directly
 *   node node_modules/.pnpm/tsx@*\/node_modules/tsx/dist/cli.mjs \
 *     implementation-plans/2026-09-16-bbl-page-rebuild/baseline/pull-bbl.mts \
 *     --end 2026-09-13 --out implementation-plans/.../baseline-2026-09-13.json
 *
 * Property: `sc-domain:alluringplasticsurgery.com`, but every page URL must be
 * the **www** host — `https://alluringplasticsurgery.com/...` returns no rows.
 *
 * @module
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(HERE, '../../..')

// ---------------------------------------------------------------- environment

/** Load the service-account credentials the same way the admin app does. */
function loadEnv(): void {
    const envPath = path.join(REPO_ROOT, 'apps/admin/.env')
    if (!fs.existsSync(envPath)) {
        throw new Error(
            `Missing ${envPath}; Search Console needs the service account.`
        )
    }
    for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
        const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
        if (!match) continue
        let value = match[2].trim()
        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1)
        }
        if (!(match[1] in process.env)) process.env[match[1]] = value
    }
}

// ----------------------------------------------------------------------- args

type Args = { start: string; end: string; out: string }

function parseArgs(argv: string[]): Args {
    const get = (flag: string): string | undefined => {
        const i = argv.indexOf(flag)
        return i === -1 ? undefined : argv[i + 1]
    }
    const end = get('--end') ?? isoDaysAgo(3)
    return {
        start: get('--start') ?? '2025-12-01',
        end,
        out: get('--out') ?? path.join(HERE, `baseline-${end}.json`),
    }
}

function isoDaysAgo(days: number): string {
    const d = new Date()
    d.setUTCDate(d.getUTCDate() - days)
    return d.toISOString().slice(0, 10)
}

/** `end` minus `days`, inclusive-window start for the 90/180-day cuts. */
function windowStart(end: string, days: number): string {
    const d = new Date(`${end}T00:00:00Z`)
    d.setUTCDate(d.getUTCDate() - (days - 1))
    return d.toISOString().slice(0, 10)
}

// -------------------------------------------------------------------- targets

const HOST = 'https://www.alluringplasticsurgery.com'
const BBL_PAGE = `${HOST}/procedures/brazilian-butt-lift-bbl-miami`
/** Redirected into the procedure page on 11 Sep 2026 (#229); series ends there. */
const BBL_LANDING_PAGE = `${HOST}/bbl-miami`
const HEAD_QUERIES = ['bbl miami', 'brazilian butt lift miami']

/** A procedure page, not a nested route. */
const PROCEDURE_PAGE = /\/procedures\/[a-z0-9-]+$/

/**
 * Collects impressions but returns 404 (#250 item 10). Kept in the series so
 * the redirect can be read later, excluded from the eight-page control.
 */
const DEAD_PAGES = new Set([`${HOST}/procedures/rhinoplasty-miami`])

/**
 * Clusters, applied to the BBL page's own query rows in order — first match
 * wins, so the order is part of the definition. Re-used verbatim at day 28,
 * 56 and 90.
 */
const CLUSTERS: Record<string, RegExp> = {
    cost: /\b(cost|price|prices|how much|average cost|payment plan|financing|affordable|cheap|specials)\b/i,
    surgeon: /\b(surgeon|surgeons|doctor|doctors|dr|best)\b/i,
    safety: /\b(safe|safety|ultrasound|risk|risks|death|bbl law)\b/i,
    skinny: /\bskinny\b/i,
    revision: /\brevision\b/i,
    head: /^(?=.*\b(miami|florida|fl|south miami|coral gables|miami beach)\b).*\b(bbl|butt lift|buttock lift|butt|brazilian lift)\b/i,
}

// ------------------------------------------------------------------- reducers

type Row = {
    keys?: string[] | null
    clicks?: number | null
    impressions?: number | null
    position?: number | null
    ctr?: number | null
}

type WeekPoint = {
    week: string
    clicks: number
    impressions: number
    position: number | null
}

/** Monday of the ISO week containing `date`. */
function weekOf(date: string): string {
    const d = new Date(`${date}T00:00:00Z`)
    d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7))
    return d.toISOString().slice(0, 10)
}

/**
 * Impression-weighted weekly averages. Weighting matters: Search Console's own
 * position is already impression-weighted, so a plain mean of daily positions
 * over-counts low-impression days.
 */
function weekly(rows: Row[], dateIndex = 0): WeekPoint[] {
    const buckets = new Map<
        string,
        { clicks: number; impressions: number; positionImpressions: number }
    >()
    for (const row of rows) {
        const date = row.keys?.[dateIndex]
        if (!date) continue
        const key = weekOf(date)
        const bucket = buckets.get(key) ?? {
            clicks: 0,
            impressions: 0,
            positionImpressions: 0,
        }
        bucket.clicks += row.clicks ?? 0
        bucket.impressions += row.impressions ?? 0
        bucket.positionImpressions +=
            (row.position ?? 0) * (row.impressions ?? 0)
        buckets.set(key, bucket)
    }
    return [...buckets.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([week, b]) => ({
            week,
            clicks: b.clicks,
            impressions: b.impressions,
            position: b.impressions
                ? Number((b.positionImpressions / b.impressions).toFixed(1))
                : null,
        }))
}

type Totals = {
    clicks: number
    impressions: number
    position: number | null
    ctr: number | null
}

function totals(rows: Row[]): Totals {
    let clicks = 0
    let impressions = 0
    let positionImpressions = 0
    for (const row of rows) {
        clicks += row.clicks ?? 0
        impressions += row.impressions ?? 0
        positionImpressions += (row.position ?? 0) * (row.impressions ?? 0)
    }
    return {
        clicks,
        impressions,
        position: impressions
            ? Number((positionImpressions / impressions).toFixed(1))
            : null,
        ctr: impressions
            ? Number(((clicks / impressions) * 100).toFixed(2))
            : null,
    }
}

function clusterOf(query: string): string {
    for (const [name, pattern] of Object.entries(CLUSTERS)) {
        if (pattern.test(query)) return name
    }
    return 'other'
}

type ClusterSummary = Totals & { queries: number; topQueries: string[] }

function clusterQueries(rows: Row[]): Record<string, ClusterSummary> {
    const grouped = new Map<string, Row[]>()
    for (const row of rows) {
        const query = row.keys?.[0]
        if (!query) continue
        const name = clusterOf(query)
        grouped.set(name, [...(grouped.get(name) ?? []), row])
    }
    return Object.fromEntries(
        [...grouped.entries()]
            .sort(
                ([, a], [, b]) => totals(b).impressions - totals(a).impressions
            )
            .map(([name, group]) => [
                name,
                {
                    ...totals(group),
                    queries: group.length,
                    topQueries: group
                        .slice()
                        .sort(
                            (a, b) =>
                                (b.impressions ?? 0) - (a.impressions ?? 0)
                        )
                        .slice(0, 15)
                        .map(
                            (r) =>
                                `${r.keys![0]} — ${r.impressions} impr, ${r.clicks} clicks, pos ${(r.position ?? 0).toFixed(1)}`
                        ),
                },
            ])
    )
}

// ------------------------------------------------------------------------ run

async function main(): Promise<void> {
    const args = parseArgs(process.argv.slice(2))
    loadEnv()

    const distEntry = path.join(
        REPO_ROOT,
        'packages/seo/dist/search-console/index.js'
    )
    if (!fs.existsSync(distEntry)) {
        throw new Error(`Missing ${distEntry}. Run \`pnpm build\` first.`)
    }
    const { fetchAllSearchAnalytics } = (await import(
        `file://${distEntry}`
    )) as typeof import('@workspace/seo/search-console')

    const pageFilter = (expression: string, operator = 'contains') => [
        { filters: [{ dimension: 'page', operator, expression }] },
    ]
    const queryFilter = (expression: string) => [
        { filters: [{ dimension: 'query', operator: 'equals', expression }] },
    ]

    const range = { startDate: args.start, endDate: args.end }
    const d90 = { startDate: windowStart(args.end, 90), endDate: args.end }
    const d180 = { startDate: windowStart(args.end, 180), endDate: args.end }

    // Daily series, full range.
    const bblDaily = await fetchAllSearchAnalytics({
        dimensions: ['date'],
        ...range,
        dimensionFilterGroups: pageFilter(BBL_PAGE, 'equals') as never,
        rowLimit: 1000,
    })
    const landingDaily = await fetchAllSearchAnalytics({
        dimensions: ['date'],
        ...range,
        dimensionFilterGroups: pageFilter(BBL_LANDING_PAGE, 'equals') as never,
        rowLimit: 1000,
    })
    const headQueryDaily = Object.fromEntries(
        await Promise.all(
            HEAD_QUERIES.map(async (q) => [
                q,
                await fetchAllSearchAnalytics({
                    dimensions: ['date'],
                    ...range,
                    dimensionFilterGroups: queryFilter(q) as never,
                    rowLimit: 1000,
                }),
            ])
        )
    )

    // Every procedure page, daily, so the control can be split per page.
    const procedureDaily = await fetchAllSearchAnalytics({
        dimensions: ['date', 'page'],
        ...range,
        dimensionFilterGroups: pageFilter('/procedures/') as never,
        rowLimit: 25000,
    })
    const procedureRows = procedureDaily.filter((r) =>
        PROCEDURE_PAGE.test(r.keys?.[1] ?? '')
    )
    const procedurePages = [
        ...new Set(procedureRows.map((r) => r.keys![1]!)),
    ].sort()
    /** The eight live procedure pages that are not the BBL page. */
    const controlPages = procedurePages.filter(
        (p) => p !== BBL_PAGE && !DEAD_PAGES.has(p)
    )
    const isControl = (page: string | undefined): boolean =>
        page !== undefined && controlPages.includes(page)
    const controlRows = procedureRows.filter((r) => isControl(r.keys?.[1]))

    // Page-level totals. These are the authoritative numbers: summing rows that
    // carry a `query` dimension undercuts them, because Search Console drops
    // queries below its anonymity threshold.
    const pageTotalsRaw = async (window: {
        startDate: string
        endDate: string
    }): Promise<Row[]> =>
        (
            await fetchAllSearchAnalytics({
                dimensions: ['page'],
                ...window,
                dimensionFilterGroups: pageFilter('/procedures/') as never,
                rowLimit: 5000,
            })
        ).filter((r) => PROCEDURE_PAGE.test(r.keys?.[0] ?? ''))
    const pageTotals90 = await pageTotalsRaw(d90)
    const pageTotals180 = await pageTotalsRaw(d180)

    // Clusters and query×page rows.
    const bblQueries90 = await fetchAllSearchAnalytics({
        dimensions: ['query'],
        ...d90,
        dimensionFilterGroups: pageFilter(BBL_PAGE, 'equals') as never,
        rowLimit: 5000,
    })
    const bblQueries180 = await fetchAllSearchAnalytics({
        dimensions: ['query'],
        ...d180,
        dimensionFilterGroups: pageFilter(BBL_PAGE, 'equals') as never,
        rowLimit: 5000,
    })
    const queryPage90 = await fetchAllSearchAnalytics({
        dimensions: ['query', 'page'],
        ...d90,
        dimensionFilterGroups: pageFilter('/procedures/') as never,
        rowLimit: 25000,
    })
    const queryPage180 = await fetchAllSearchAnalytics({
        dimensions: ['query', 'page'],
        ...d180,
        dimensionFilterGroups: pageFilter('/procedures/') as never,
        rowLimit: 25000,
    })

    /** `rows` carry the page in `keys[0]` (page-dimension pulls). */
    const byPage = (rows: Row[]): Record<string, Totals> =>
        Object.fromEntries(
            procedurePages.map((page) => [
                page,
                totals(rows.filter((r) => r.keys?.[0] === page)),
            ])
        )

    const output = {
        pulledAt: new Date().toISOString(),
        property: process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL,
        range: { start: args.start, end: args.end },
        windows: { last90: d90, last180: d180 },
        targets: {
            bblPage: BBL_PAGE,
            bblLandingPage: BBL_LANDING_PAGE,
            headQueries: HEAD_QUERIES,
            procedurePages,
            controlPages,
            deadPages: procedurePages.filter((p) => DEAD_PAGES.has(p)),
        },
        weekly: {
            bblPage: weekly(bblDaily),
            bblLandingPage: weekly(landingDaily),
            /** The control: the other eight procedure pages, combined. */
            controlPages: weekly(controlRows),
            perProcedurePage: Object.fromEntries(
                procedurePages.map((page) => [
                    page,
                    weekly(procedureRows.filter((r) => r.keys?.[1] === page)),
                ])
            ),
            headQueries: Object.fromEntries(
                HEAD_QUERIES.map((q) => [q, weekly(headQueryDaily[q] as Row[])])
            ),
        },
        totals: {
            last90: {
                bblPage: totals(
                    pageTotals90.filter((r) => r.keys?.[0] === BBL_PAGE)
                ),
                controlPages: totals(
                    pageTotals90.filter((r) => isControl(r.keys?.[0]))
                ),
                perProcedurePage: byPage(pageTotals90),
            },
            last180: {
                bblPage: totals(
                    pageTotals180.filter((r) => r.keys?.[0] === BBL_PAGE)
                ),
                controlPages: totals(
                    pageTotals180.filter((r) => isControl(r.keys?.[0]))
                ),
                perProcedurePage: byPage(pageTotals180),
            },
        },
        clusters: {
            definition: Object.fromEntries(
                Object.entries(CLUSTERS).map(([k, v]) => [k, v.source])
            ),
            /**
             * Clustered from query rows, so these sum below the page totals
             * above by whatever Search Console anonymized.
             */
            last90: clusterQueries(bblQueries90),
            last180: clusterQueries(bblQueries180),
        },
    }

    fs.mkdirSync(path.dirname(args.out), { recursive: true })
    fs.writeFileSync(args.out, `${JSON.stringify(output, null, 1)}\n`)

    // The query×page rows go to CSV: thousands of rows, and a diff of them at
    // day 28/56/90 is the point.
    const csvPath = args.out.replace(/\.json$/, '') + '-query-page.csv'
    const csvRows = [
        ['window', 'query', 'page', 'clicks', 'impressions', 'position'],
        ...(
            [
                ['90d', queryPage90],
                ['180d', queryPage180],
            ] as const
        ).flatMap(([label, rows]) =>
            rows
                .filter((r) => PROCEDURE_PAGE.test(r.keys?.[1] ?? ''))
                .sort((a, b) => (b.impressions ?? 0) - (a.impressions ?? 0))
                .map((r) => [
                    label,
                    r.keys![0]!,
                    r.keys![1]!.replace(HOST, ''),
                    String(r.clicks ?? 0),
                    String(r.impressions ?? 0),
                    (r.position ?? 0).toFixed(1),
                ])
        ),
    ]
    const escape = (v: string) =>
        /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v
    fs.writeFileSync(
        csvPath,
        csvRows.map((r) => r.map(escape).join(',')).join('\n') + '\n'
    )

    const last = <T,>(xs: T[]): T | undefined => xs[xs.length - 1]
    console.log(`wrote ${args.out}`)
    console.log(`wrote ${csvPath} (${csvRows.length - 1} rows)`)
    console.log(
        `control pages: ${controlPages.length} | weeks: ${output.weekly.bblPage.length}`
    )
    console.log(
        `90d — bbl ${output.totals.last90.bblPage.clicks} clicks / ${output.totals.last90.bblPage.impressions} impr @ ${output.totals.last90.bblPage.position} · control @ ${output.totals.last90.controlPages.position}`
    )
    console.log(
        `last week — bbl ${last(output.weekly.bblPage)?.position} · control ${last(output.weekly.controlPages)?.position}`
    )
    console.table(
        Object.entries(output.clusters.last90).map(([cluster, c]) => ({
            cluster,
            queries: c.queries,
            impressions: c.impressions,
            clicks: c.clicks,
            position: c.position,
        }))
    )
}

await main()
