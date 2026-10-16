/**
 * Monthly SEO readout: what moved in Google Search since a date.
 *
 *   TSX=$(ls -d node_modules/.pnpm/tsx@*\/node_modules/tsx/dist/cli.mjs | tail -1)
 *   node $TSX blog/tools/readout.mts <since YYYY-MM-DD> (--urls FILE | --cluster NAME | --all) [options]
 *
 * Site level: last 28 days vs the 28 before (totals + top query), the
 * monthly performance trend (16 months), and daily averages before/after
 * <since>. Per URL: the daily page trend and the queries for the page,
 * before/after averages around <since> over equal windows, the losers and
 * gainers, snippet problems (page or page×query, last 28 days, impressions
 * > 1000 and CTR < 0.5%) and push candidates (position 4–12, impressions
 * > 500). Prints the markdown and writes blog/readouts/<stem>.md and .json.
 *
 * Search Console: property sc-domain:alluringplasticsurgery.com, dataState
 * "all", www-host page URLs, service account GOOGLE_CLIENT_EMAIL /
 * GOOGLE_PRIVATE_KEY from the environment, else apps/admin/.env.local, else
 * apps/admin/.env (last line wins inside a file, like dotenv). googleapis
 * resolves through packages/seo, so the script runs from any directory.
 * Read-only: it never writes to Search Console or any database.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const require = createRequire(path.join(REPO, 'packages/seo/package.json'))
const { google } = require('googleapis')

const ORIGIN = 'https://www.alluringplasticsurgery.com'
const BLOG_SITEMAP = `${ORIGIN}/sitemap/blog.xml`
const DEFAULT_PROPERTY = 'sc-domain:alluringplasticsurgery.com'

/** --cluster names: a path regex for the blog posts plus the cluster's procedure page. */
const CLUSTERS: Record<string, { rx: RegExp; page?: string }> = {
    bbl: {
        rx: /bbl|brazilian|butt/,
        page: '/procedures/brazilian-butt-lift-bbl-miami',
    },
    lipo: {
        rx: /lipo|liposuction|j-plasma/,
        page: '/procedures/liposuction-miami',
    },
    'tummy-tuck': {
        rx: /tummy|abdominoplast/,
        page: '/procedures/tummy-tuck-miami',
    },
    'mommy-makeover': { rx: /mommy/, page: '/procedures/mommy-makeover-miami' },
    'breast-augmentation': {
        rx: /breast-aug|implant|breast-size|saline|silicone/,
        page: '/procedures/breast-augmentation-miami',
    },
    'breast-lift': {
        rx: /breast-lift|mastopexy/,
        page: '/procedures/breast-lift-miami',
    },
    'breast-reduction': {
        rx: /breast-reduction|reduction/,
        page: '/procedures/breast-reduction-miami',
    },
    facelift: {
        rx: /face-?lift|neck-lift/,
        page: '/procedures/facelift-miami',
    },
    blepharoplasty: {
        rx: /bleph|eyelid/,
        page: '/procedures/blepharoplasty-miami',
    },
}

const USAGE = `usage: readout.mts <since YYYY-MM-DD> (--urls FILE | --cluster NAME | --all) [options]

  --urls FILE        one URL per line: full URL, /path, or a bare blog slug (resolved
                     against the live blog sitemap); blank lines and # comments ignored
  --cluster NAME     ${Object.keys(CLUSTERS).join(', ')}
                     (any other NAME is used as a regex on the path of sitemap posts)
  --all              every live blog post in ${BLOG_SITEMAP}
  --end YYYY-MM-DD   last day of data (default: today − 3 days, Search Console's lag)
  --window N         days on each side of <since> (default: all days from <since> to
                     --end, at most 90; the before window has the same length)
  --out-dir DIR      default blog/readouts
  --name STEM        output file stem (default: <today>, or <today>-<cluster|urls file name>)
  --no-write         print only
  --concurrency N    parallel per-URL pulls (default 4)
  --snippet-impr N   snippet problem threshold, impressions in 28 days (default 1000)
  --snippet-ctr X    snippet problem threshold, CTR as a fraction (default 0.005)
  --push-impr N      push candidate threshold, impressions in 28 days (default 500)
  --push-pos A-B     push candidate position band (default 4-12)
  --top N            rows in the losers/gainers/candidate tables (default 15)`

// ── args ──────────────────────────────────────────────────────────────────

type Args = {
    since: string
    urlsFile?: string
    cluster?: string
    all: boolean
    end?: string
    window?: number
    outDir: string
    name?: string
    write: boolean
    concurrency: number
    snippetImpr: number
    snippetCtr: number
    pushImpr: number
    pushMin: number
    pushMax: number
    top: number
}

function die(msg: string): never {
    console.error(msg)
    process.exit(1)
}

function parseArgs(argv: string[]): Args {
    const a: Args = {
        since: '',
        all: false,
        outDir: path.join(REPO, 'blog/readouts'),
        write: true,
        concurrency: 4,
        snippetImpr: 1000,
        snippetCtr: 0.005,
        pushImpr: 500,
        pushMin: 4,
        pushMax: 12,
        top: 15,
    }
    const need = (i: number) =>
        argv[i + 1] ?? die(`${argv[i]} needs a value\n\n${USAGE}`)
    for (let i = 0; i < argv.length; i++) {
        const k = argv[i]!
        switch (k) {
            case '--urls':
                a.urlsFile = need(i)
                i++
                break
            case '--cluster':
                a.cluster = need(i)
                i++
                break
            case '--all':
                a.all = true
                break
            case '--end':
                a.end = need(i)
                i++
                break
            case '--window':
                a.window = Number(need(i))
                i++
                break
            case '--out-dir':
                a.outDir = path.resolve(need(i))
                i++
                break
            case '--name':
                a.name = need(i)
                i++
                break
            case '--no-write':
                a.write = false
                break
            case '--concurrency':
                a.concurrency = Math.max(1, Number(need(i)))
                i++
                break
            case '--snippet-impr':
                a.snippetImpr = Number(need(i))
                i++
                break
            case '--snippet-ctr':
                a.snippetCtr = Number(need(i))
                i++
                break
            case '--push-impr':
                a.pushImpr = Number(need(i))
                i++
                break
            case '--push-pos': {
                const [lo, hi] = need(i).split('-').map(Number)
                a.pushMin = lo!
                a.pushMax = hi!
                i++
                break
            }
            case '--top':
                a.top = Number(need(i))
                i++
                break
            case '-h':
            case '--help':
                console.log(USAGE)
                process.exit(0)
            default:
                if (k.startsWith('--')) die(`unknown option ${k}\n\n${USAGE}`)
                if (a.since) die(`unexpected argument ${k}\n\n${USAGE}`)
                a.since = k
        }
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(a.since))
        die(`<since> must be YYYY-MM-DD\n\n${USAGE}`)
    if (
        [a.urlsFile, a.cluster, a.all || undefined].filter(Boolean).length !== 1
    )
        die(`choose exactly one of --urls, --cluster, --all\n\n${USAGE}`)
    if (a.end && !/^\d{4}-\d{2}-\d{2}$/.test(a.end))
        die('--end must be YYYY-MM-DD')
    return a
}

// ── dates ─────────────────────────────────────────────────────────────────

const addDays = (d: string, n: number) => {
    const t = new Date(`${d}T00:00:00Z`)
    t.setUTCDate(t.getUTCDate() + n)
    return t.toISOString().slice(0, 10)
}
const daysBetween = (a: string, b: string) =>
    Math.round(
        (Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 864e5
    ) + 1
const todayMiami = () =>
    new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
type Range = { start: string; end: string; days: number }
const range = (start: string, end: string): Range => ({
    start,
    end,
    days: daysBetween(start, end),
})
const inRange = (d: string, r: Range) => d >= r.start && d <= r.end

// ── env + client ──────────────────────────────────────────────────────────

function readEnv(): Record<string, string> {
    const out: Record<string, string> = {}
    for (const file of ['apps/admin/.env', 'apps/admin/.env.local']) {
        // later file wins over earlier (.env.local over .env), last line wins within a file
        const p = path.join(REPO, file)
        if (!existsSync(p)) continue
        for (const line of readFileSync(p, 'utf8').split('\n')) {
            const m = line.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*)$/)
            if (!m) continue
            let v = m[2]!.trim()
            if (
                (v.startsWith('"') && v.endsWith('"')) ||
                (v.startsWith("'") && v.endsWith("'"))
            )
                v = v.slice(1, -1)
            out[m[1]!] = v
        }
    }
    for (const k of [
        'GOOGLE_CLIENT_EMAIL',
        'GOOGLE_PRIVATE_KEY',
        'GOOGLE_SEARCH_CONSOLE_SITE_URL',
    ])
        if (process.env[k]) out[k] = process.env[k]!
    return out
}

type Row = {
    keys?: string[]
    clicks?: number
    impressions?: number
    ctr?: number
    position?: number
}
type Body = {
    startDate: string
    endDate: string
    dimensions: string[]
    dimensionFilterGroups?: unknown[]
    rowLimit?: number
    startRow?: number
}

let apiCalls = 0

function makeClient() {
    const env = readEnv()
    if (!env.GOOGLE_CLIENT_EMAIL || !env.GOOGLE_PRIVATE_KEY)
        die(
            'GOOGLE_CLIENT_EMAIL / GOOGLE_PRIVATE_KEY missing (apps/admin/.env)'
        )
    const siteUrl = env.GOOGLE_SEARCH_CONSOLE_SITE_URL || DEFAULT_PROPERTY
    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: env.GOOGLE_CLIENT_EMAIL,
            private_key: env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    })
    const sc = google.searchconsole({ version: 'v1', auth })
    async function query(body: Body): Promise<Row[]> {
        for (let attempt = 0; ; attempt++) {
            try {
                apiCalls++
                const res = await sc.searchanalytics.query({
                    siteUrl,
                    requestBody: { ...body, dataState: 'all' },
                })
                return (res.data.rows ?? []) as Row[]
            } catch (e: any) {
                const code = e?.code ?? e?.response?.status
                if (
                    attempt < 3 &&
                    (code === 429 ||
                        code >= 500 ||
                        code === 'ECONNRESET' ||
                        code === 'ETIMEDOUT')
                ) {
                    await new Promise((r) => setTimeout(r, 2000 * 2 ** attempt))
                    continue
                }
                throw new Error(
                    `Search Console query failed (${code}): ${e?.message ?? e}`
                )
            }
        }
    }
    async function queryAll(body: Body, max = 100000): Promise<Row[]> {
        const rows: Row[] = []
        for (let startRow = 0; ; ) {
            const page = await query({ ...body, rowLimit: 25000, startRow })
            rows.push(...page)
            if (page.length < 25000 || rows.length >= max) return rows
            startRow += page.length
        }
    }
    return { siteUrl, query, queryAll }
}

const pageFilter = (url: string) => [
    { filters: [{ dimension: 'page', operator: 'equals', expression: url }] },
]

// ── sitemap + URL set ─────────────────────────────────────────────────────

async function blogSitemapPaths(): Promise<string[]> {
    const res = await fetch(BLOG_SITEMAP)
    if (!res.ok) die(`blog sitemap ${BLOG_SITEMAP} returned ${res.status}`)
    const xml = await res.text()
    const paths: string[] = []
    for (const block of xml.match(/<url>[\s\S]*?<\/url>/g) ?? []) {
        const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1]?.trim()
        if (!loc) continue
        const p = new URL(loc).pathname.replace(/\/$/, '') || '/'
        if (p !== '/blog') paths.push(p)
    }
    return paths
}

function normalizePath(line: string): string | null {
    const s = line.trim()
    if (/^https?:\/\//i.test(s))
        return new URL(s).pathname.replace(/\/$/, '') || '/'
    if (s.startsWith('/')) return s.replace(/\/$/, '') || '/'
    return null // bare slug
}

async function selectUrls(
    a: Args
): Promise<{ label: string; paths: string[]; notes: string[] }> {
    const notes: string[] = []
    if (a.all)
        return {
            label: 'all live blog posts',
            paths: await blogSitemapPaths(),
            notes,
        }
    if (a.cluster) {
        const posts = await blogSitemapPaths()
        const c = CLUSTERS[a.cluster]
        const rx = c?.rx ?? new RegExp(a.cluster, 'i')
        if (!c)
            notes.push(
                `"${a.cluster}" is not a named cluster; used as a path regex`
            )
        const paths = posts.filter((p) => rx.test(p))
        if (c?.page) paths.unshift(c.page)
        return { label: `cluster ${a.cluster}`, paths, notes }
    }
    const lines = readFileSync(path.resolve(a.urlsFile!), 'utf8')
        .split('\n')
        .map((l) => l.replace(/#.*$/, '').trim())
        .filter(Boolean)
    const paths: string[] = []
    let posts: string[] | null = null
    for (const l of lines) {
        const p = normalizePath(l)
        if (p) {
            paths.push(p)
            continue
        }
        posts ??= await blogSitemapPaths()
        const hit = posts.find((x) => x === `/${l}` || x === `/blog/${l}`)
        if (!hit)
            die(
                `slug "${l}" is not in the live blog sitemap; give its path instead`
            )
        paths.push(hit)
    }
    return {
        label: `URLs from ${path.basename(a.urlsFile!)}`,
        paths: [...new Set(paths)],
        notes,
    }
}

// ── metrics ───────────────────────────────────────────────────────────────

type Agg = {
    clicks: number
    impressions: number
    ctr: number
    position: number | null
    clicksPerDay: number
    imprPerDay: number
    days: number
}

function aggregate(rows: Row[], days: number): Agg {
    let clicks = 0,
        impressions = 0,
        posW = 0
    for (const r of rows) {
        clicks += r.clicks ?? 0
        impressions += r.impressions ?? 0
        posW += (r.position ?? 0) * (r.impressions ?? 0)
    }
    return {
        clicks,
        impressions,
        days,
        ctr: impressions ? clicks / impressions : 0,
        position: impressions ? posW / impressions : null,
        clicksPerDay: clicks / days,
        imprPerDay: impressions / days,
    }
}

const pct = (x: number, d = 2) => `${(x * 100).toFixed(d)}%`
const num = (x: number, d = 0) =>
    x.toLocaleString('en-US', {
        maximumFractionDigits: d,
        minimumFractionDigits: d,
    })
const pos = (x: number | null) => (x == null ? '—' : x.toFixed(1))
const signed = (x: number, d = 1) => `${x >= 0 ? '+' : ''}${x.toFixed(d)}`
const change = (a: number, b: number) =>
    a ? `${signed(((b - a) / a) * 100, 0)}%` : b ? 'new' : '—'

async function pool<T, R>(
    items: T[],
    n: number,
    fn: (t: T, i: number) => Promise<R>
): Promise<R[]> {
    const out: R[] = new Array(items.length)
    let next = 0
    await Promise.all(
        Array.from({ length: Math.min(n, items.length) }, async () => {
            while (next < items.length) {
                const i = next++
                out[i] = await fn(items[i]!, i)
            }
        })
    )
    return out
}

// ── main ──────────────────────────────────────────────────────────────────

const args = parseArgs(process.argv.slice(2))
const gsc = makeClient()
const end = args.end ?? addDays(todayMiami(), -3)
if (args.since > end)
    die(`<since> ${args.since} is after the last data day ${end}`)
const available = daysBetween(args.since, end)
const W = Math.min(args.window ?? available, available, 90)
const after = range(args.since, addDays(args.since, W - 1))
const before = range(addDays(args.since, -W), addDays(args.since, -1))
const last28 = range(addDays(end, -27), end)
const prev28 = range(addDays(end, -55), addDays(end, -28))
// first day of the month 15 months before end's month: 16 calendar months, Search Console's retention
const monthsBack = (() => {
    const [y, m] = end.split('-').map(Number) as [number, number]
    const d = new Date(Date.UTC(y, m - 1 - 15, 1))
    return d.toISOString().slice(0, 10)
})()
const notes: string[] = []
if (W < 14)
    notes.push(
        `Short window: ${W} days on each side of ${args.since}. Read the changes as direction, not size.`
    )
if (args.window && args.window > available)
    notes.push(
        `--window ${args.window} capped at the ${available} days available since ${args.since}.`
    )

const sel = await selectUrls(args)
notes.push(...sel.notes)
if (!sel.paths.length) die('no URLs selected')
const urls = sel.paths.map((p) => ORIGIN + (p === '/' ? '' : p))
console.error(
    `readout: ${urls.length} URLs, before ${before.start}..${before.end}, after ${after.start}..${after.end}, data to ${end}`
)

// site level
const [siteNow, sitePrev, siteTopQ, siteDaily] = await Promise.all([
    gsc.query({ startDate: last28.start, endDate: last28.end, dimensions: [] }),
    gsc.query({ startDate: prev28.start, endDate: prev28.end, dimensions: [] }),
    gsc.query({
        startDate: last28.start,
        endDate: last28.end,
        dimensions: ['query'],
        rowLimit: 10,
    }),
    gsc.queryAll({ startDate: monthsBack, endDate: end, dimensions: ['date'] }),
])
const summary = {
    last28: { ...last28, ...aggregate(siteNow, 28) },
    prev28: { ...prev28, ...aggregate(sitePrev, 28) },
    topQueries: siteTopQ.map((r) => ({
        query: r.keys![0],
        clicks: r.clicks,
        impressions: r.impressions,
        position: r.position,
    })),
}
const byMonth = new Map<string, Row[]>()
for (const r of siteDaily) {
    const m = r.keys![0]!.slice(0, 7)
    byMonth.set(m, [...(byMonth.get(m) ?? []), r])
}
const monthly = [...byMonth.entries()].sort().map(([month, rows]) => {
    const [y, mo] = month.split('-').map(Number) as [number, number]
    const calDays = new Date(Date.UTC(y, mo, 0)).getUTCDate()
    const agg = aggregate(rows, rows.length)
    return {
        month,
        daysWithData: rows.length,
        partial: rows.length < calDays,
        ...agg,
    }
})
const siteAround = {
    before: aggregate(
        siteDaily.filter((r) => inRange(r.keys![0]!, before)),
        before.days
    ),
    after: aggregate(
        siteDaily.filter((r) => inRange(r.keys![0]!, after)),
        after.days
    ),
}

// per URL
const sameAs28 = after.start === last28.start && after.end === last28.end
type QRow = {
    query: string
    clicks: number
    impressions: number
    ctr: number
    position: number
}
const toQ = (rows: Row[]): QRow[] =>
    rows.map((r) => ({
        query: r.keys![0]!,
        clicks: r.clicks ?? 0,
        impressions: r.impressions ?? 0,
        ctr: r.ctr ?? 0,
        position: r.position ?? 0,
    }))

const perUrl = await pool(urls, args.concurrency, async (url, i) => {
    const trendFrom = before.start < last28.start ? before.start : last28.start
    const [trend, qBefore, qAfter, q28] = await Promise.all([
        gsc.query({
            startDate: trendFrom,
            endDate: end,
            dimensions: ['date'],
            dimensionFilterGroups: pageFilter(url),
            rowLimit: 1000,
        }),
        gsc.query({
            startDate: before.start,
            endDate: before.end,
            dimensions: ['query'],
            dimensionFilterGroups: pageFilter(url),
            rowLimit: 1000,
        }),
        gsc.query({
            startDate: after.start,
            endDate: after.end,
            dimensions: ['query'],
            dimensionFilterGroups: pageFilter(url),
            rowLimit: 1000,
        }),
        sameAs28
            ? Promise.resolve(null)
            : gsc.query({
                  startDate: last28.start,
                  endDate: last28.end,
                  dimensions: ['query'],
                  dimensionFilterGroups: pageFilter(url),
                  rowLimit: 1000,
              }),
    ])
    if ((i + 1) % 10 === 0) console.error(`  ${i + 1}/${urls.length}`)
    const b = aggregate(
        trend.filter((r) => inRange(r.keys![0]!, before)),
        before.days
    )
    const a = aggregate(
        trend.filter((r) => inRange(r.keys![0]!, after)),
        after.days
    )
    const l28 = aggregate(
        trend.filter((r) => inRange(r.keys![0]!, last28)),
        28
    )
    const qb = new Map(toQ(qBefore).map((q) => [q.query, q]))
    const qa = toQ(qAfter)
    const movers = [...new Set([...qb.keys(), ...qa.map((q) => q.query)])].map(
        (q) => {
            const x = qb.get(q),
                y = qa.find((z) => z.query === q)
            return {
                query: q,
                clicksBefore: x?.clicks ?? 0,
                clicksAfter: y?.clicks ?? 0,
                imprBefore: x?.impressions ?? 0,
                imprAfter: y?.impressions ?? 0,
                posBefore: x?.position ?? null,
                posAfter: y?.position ?? null,
            }
        }
    )
    // a mover needs a click change or at least 10 impressions of change, so 1 → 3 impressions is not news
    const real = movers.filter(
        (m) =>
            m.clicksAfter !== m.clicksBefore ||
            Math.abs(m.imprAfter - m.imprBefore) >= 10
    )
    const queries28 = toQ(q28 ?? qAfter).sort(
        (x, y) => y.impressions - x.impressions
    )
    return {
        url,
        path: new URL(url).pathname,
        before: b,
        after: a,
        last28: l28,
        delta: {
            clicksPerDay: a.clicksPerDay - b.clicksPerDay,
            imprPerDay: a.imprPerDay - b.imprPerDay,
            position:
                a.position != null && b.position != null
                    ? a.position - b.position
                    : null,
            ctrPoints: (a.ctr - b.ctr) * 100,
        },
        topQueries28: queries28.slice(0, 10),
        queryGainers: real
            .filter(
                (m) =>
                    m.clicksAfter > m.clicksBefore ||
                    m.imprAfter > m.imprBefore * 1.5
            )
            .sort(
                (x, y) =>
                    y.clicksAfter -
                        y.clicksBefore -
                        (x.clicksAfter - x.clicksBefore) ||
                    y.imprAfter - y.imprBefore - (x.imprAfter - x.imprBefore)
            )
            .slice(0, 5),
        queryLosers: real
            .filter(
                (m) =>
                    m.clicksAfter < m.clicksBefore ||
                    m.imprAfter < m.imprBefore / 1.5
            )
            .sort(
                (x, y) =>
                    x.clicksAfter -
                        x.clicksBefore -
                        (y.clicksAfter - y.clicksBefore) ||
                    x.imprAfter - x.imprBefore - (y.imprAfter - y.imprBefore)
            )
            .slice(0, 5),
        queries28,
    }
})

// rollups
const total = (k: 'before' | 'after') =>
    aggregate(
        perUrl.map((u) => ({
            clicks: u[k].clicks,
            impressions: u[k].impressions,
            position: u[k].position ?? 0,
        })),
        k === 'before' ? before.days : after.days
    )
const setBefore = total('before'),
    setAfter = total('after')
const active = perUrl.filter(
    (u) => u.before.impressions + u.after.impressions > 0
)
const byClickDelta = [...active].sort(
    (x, y) =>
        x.delta.clicksPerDay - y.delta.clicksPerDay ||
        x.delta.imprPerDay - y.delta.imprPerDay
)
const losers = byClickDelta
    .filter(
        (u) =>
            u.delta.clicksPerDay < 0 ||
            (u.delta.clicksPerDay === 0 && u.delta.imprPerDay < 0)
    )
    .slice(0, args.top)
const gainers = [...byClickDelta]
    .reverse()
    .filter(
        (u) =>
            u.delta.clicksPerDay > 0 ||
            (u.delta.clicksPerDay === 0 && u.delta.imprPerDay > 0)
    )
    .slice(0, args.top)

const snippetPages = perUrl
    .filter(
        (u) =>
            u.last28.impressions > args.snippetImpr &&
            u.last28.ctr < args.snippetCtr
    )
    .sort((x, y) => y.last28.impressions - x.last28.impressions)
const snippetQueries = perUrl
    .flatMap((u) =>
        u.queries28
            .filter(
                (q) =>
                    q.impressions > args.snippetImpr && q.ctr < args.snippetCtr
            )
            .map((q) => ({ path: u.path, ...q }))
    )
    .sort((x, y) => y.impressions - x.impressions)
const inBand = (p: number | null) =>
    p != null && p >= args.pushMin && p <= args.pushMax
const pushPages = perUrl
    .filter(
        (u) => u.last28.impressions > args.pushImpr && inBand(u.last28.position)
    )
    .sort((x, y) => y.last28.impressions - x.last28.impressions)
const pushQueries = perUrl
    .flatMap((u) =>
        u.queries28
            .filter((q) => q.impressions > args.pushImpr && inBand(q.position))
            .map((q) => ({ path: u.path, ...q }))
    )
    .sort((x, y) => y.impressions - x.impressions)

// ── report ────────────────────────────────────────────────────────────────

const L: string[] = []
const runDate = todayMiami()
L.push(`# SEO readout since ${args.since}`, '')
L.push(
    `Run ${runDate}. Search Console \`${gsc.siteUrl}\`, dataState all, data to ${end}. ${sel.label}: ${urls.length} URLs.`
)
L.push(
    `Before ${before.start} → ${before.end} (${before.days} d) vs after ${after.start} → ${after.end} (${after.days} d). Per-day averages; position is impression-weighted.`,
    ''
)
for (const n of notes) L.push(`> ${n}`)
if (notes.length) L.push('')

L.push(
    '## Site',
    '',
    '| | Clicks | Impressions | CTR | Position |',
    '| --- | --- | --- | --- | --- |'
)
const s1 = summary.last28,
    s0 = summary.prev28
L.push(
    `| Last 28 d (${s1.start} → ${s1.end}) | ${num(s1.clicks)} | ${num(s1.impressions)} | ${pct(s1.ctr)} | ${pos(s1.position)} |`
)
L.push(
    `| Previous 28 d (${s0.start} → ${s0.end}) | ${num(s0.clicks)} | ${num(s0.impressions)} | ${pct(s0.ctr)} | ${pos(s0.position)} |`
)
L.push(
    `| Change | ${change(s0.clicks, s1.clicks)} | ${change(s0.impressions, s1.impressions)} | ${signed((s1.ctr - s0.ctr) * 100, 2)} pp | ${s1.position != null && s0.position != null ? signed(s1.position - s0.position) : '—'} |`
)
const sb = siteAround.before,
    sa = siteAround.after
L.push(
    `| Per day before ${args.since} | ${num(sb.clicksPerDay, 1)} | ${num(sb.imprPerDay)} | ${pct(sb.ctr)} | ${pos(sb.position)} |`
)
L.push(
    `| Per day after | ${num(sa.clicksPerDay, 1)} | ${num(sa.imprPerDay)} | ${pct(sa.ctr)} | ${pos(sa.position)} |`,
    ''
)
L.push(
    `Top queries, last 28 d: ${summary.topQueries.map((q) => `${q.query} (${q.clicks}c / ${num(q.impressions ?? 0)}i)`).join('; ')}`,
    ''
)

L.push(
    '### Monthly trend',
    '',
    '| Month | Clicks | Impressions | CTR | Position | Days |',
    '| --- | --- | --- | --- | --- | --- |'
)
for (const m of monthly)
    L.push(
        `| ${m.month}${m.partial ? ' (partial)' : ''} | ${num(m.clicks)} | ${num(m.impressions)} | ${pct(m.ctr)} | ${pos(m.position)} | ${m.daysWithData} |`
    )
L.push('')

L.push(
    `## Selected URLs (${urls.length})`,
    '',
    '| | Clicks/day | Impr/day | CTR | Position |',
    '| --- | --- | --- | --- | --- |'
)
L.push(
    `| Before | ${num(setBefore.clicksPerDay, 1)} | ${num(setBefore.imprPerDay)} | ${pct(setBefore.ctr)} | ${pos(setBefore.position)} |`
)
L.push(
    `| After | ${num(setAfter.clicksPerDay, 1)} | ${num(setAfter.imprPerDay)} | ${pct(setAfter.ctr)} | ${pos(setAfter.position)} |`
)
L.push(
    `| Change | ${change(setBefore.clicksPerDay, setAfter.clicksPerDay)} | ${change(setBefore.imprPerDay, setAfter.imprPerDay)} | ${signed((setAfter.ctr - setBefore.ctr) * 100, 2)} pp | ${setAfter.position != null && setBefore.position != null ? signed(setAfter.position - setBefore.position) : '—'} |`,
    ''
)

const urlRow = (u: (typeof perUrl)[number]) =>
    `| ${u.path} | ${num(u.before.clicksPerDay, 2)} → ${num(u.after.clicksPerDay, 2)} (${signed(u.delta.clicksPerDay, 2)}) | ${num(u.before.imprPerDay, 1)} → ${num(u.after.imprPerDay, 1)} | ${pct(u.before.ctr)} → ${pct(u.after.ctr)} | ${pos(u.before.position)} → ${pos(u.after.position)} | ${u.topQueries28[0]?.query ?? '—'} |`
const urlHead = [
    '| URL | Clicks/day | Impr/day | CTR | Position | Top query (28 d) |',
    '| --- | --- | --- | --- | --- | --- |',
]
L.push(
    '## Losers',
    '',
    ...(losers.length ? [...urlHead, ...losers.map(urlRow)] : ['None.']),
    ''
)
L.push(
    '## Gainers',
    '',
    ...(gainers.length ? [...urlHead, ...gainers.map(urlRow)] : ['None.']),
    ''
)

L.push(
    `## Snippet problems (last 28 d, impressions > ${num(args.snippetImpr)}, CTR < ${pct(args.snippetCtr, 1)})`,
    ''
)
if (!snippetPages.length && !snippetQueries.length) L.push('None.')
if (snippetPages.length) {
    L.push(
        '| Page | Impressions | Clicks | CTR | Position |',
        '| --- | --- | --- | --- | --- |'
    )
    for (const u of snippetPages.slice(0, args.top))
        L.push(
            `| ${u.path} | ${num(u.last28.impressions)} | ${u.last28.clicks} | ${pct(u.last28.ctr)} | ${pos(u.last28.position)} |`
        )
    L.push('')
}
if (snippetQueries.length) {
    L.push(
        '| Page | Query | Impressions | Clicks | CTR | Position |',
        '| --- | --- | --- | --- | --- | --- |'
    )
    for (const q of snippetQueries.slice(0, args.top))
        L.push(
            `| ${q.path} | ${q.query} | ${num(q.impressions)} | ${q.clicks} | ${pct(q.ctr)} | ${pos(q.position)} |`
        )
}
L.push('')

L.push(
    `## Push candidates (last 28 d, position ${args.pushMin}–${args.pushMax}, impressions > ${num(args.pushImpr)})`,
    ''
)
if (!pushPages.length && !pushQueries.length) L.push('None.')
if (pushQueries.length) {
    L.push(
        '| Page | Query | Impressions | Clicks | CTR | Position |',
        '| --- | --- | --- | --- | --- | --- |'
    )
    for (const q of pushQueries.slice(0, args.top))
        L.push(
            `| ${q.path} | ${q.query} | ${num(q.impressions)} | ${q.clicks} | ${pct(q.ctr)} | ${pos(q.position)} |`
        )
    L.push('')
}
if (pushPages.length) {
    L.push(
        '| Page (all queries) | Impressions | Clicks | CTR | Position |',
        '| --- | --- | --- | --- | --- |'
    )
    for (const u of pushPages.slice(0, args.top))
        L.push(
            `| ${u.path} | ${num(u.last28.impressions)} | ${u.last28.clicks} | ${pct(u.last28.ctr)} | ${pos(u.last28.position)} |`
        )
}
L.push('')

L.push('## Every URL', '', ...urlHead)
for (const u of [...perUrl].sort(
    (x, y) => y.last28.impressions - x.last28.impressions
))
    L.push(urlRow(u))
L.push('')
L.push('### Query movers per URL (before → after clicks, impressions)', '')
for (const u of perUrl) {
    if (!u.queryGainers.length && !u.queryLosers.length) continue
    const f = (m: (typeof u.queryGainers)[number]) =>
        `${m.query} ${m.clicksBefore}→${m.clicksAfter}c, ${m.imprBefore}→${m.imprAfter}i, pos ${pos(m.posBefore)}→${pos(m.posAfter)}`
    L.push(
        `- **${u.path}**: up: ${u.queryGainers.map(f).join('; ') || '—'} | down: ${u.queryLosers.map(f).join('; ') || '—'}`
    )
}
L.push(
    '',
    `Search Console API calls: ${apiCalls}. Query rows exclude anonymized queries, so query sums run below page totals. Data for the last 2–3 days is incomplete (dataState all includes it).`,
    ''
)

const md = L.join('\n')
console.log(md)

if (args.write) {
    const label = args.all
        ? ''
        : args.cluster
          ? `-${args.cluster.replace(/[^a-z0-9-]+/gi, '_')}`
          : `-${path
                .basename(args.urlsFile!)
                .replace(/\.[^.]+$/, '')
                .replace(/[^a-z0-9-]+/gi, '_')}`
    const stem = args.name ?? `${runDate}${label}`
    mkdirSync(args.outDir, { recursive: true })
    const json = {
        run: {
            date: runDate,
            since: args.since,
            end,
            property: gsc.siteUrl,
            dataState: 'all',
            selection: sel.label,
            urls: urls.length,
            apiCalls,
            thresholds: {
                snippetImpr: args.snippetImpr,
                snippetCtr: args.snippetCtr,
                pushImpr: args.pushImpr,
                pushPos: [args.pushMin, args.pushMax],
            },
        },
        windows: { before, after, last28, prev28, trendFrom: monthsBack },
        notes,
        site: { summary, monthly, aroundSince: siteAround },
        selected: { before: setBefore, after: setAfter },
        losers: losers.map((u) => u.path),
        gainers: gainers.map((u) => u.path),
        snippetProblems: {
            pages: snippetPages.map((u) => ({ path: u.path, ...u.last28 })),
            queries: snippetQueries,
        },
        pushCandidates: {
            pages: pushPages.map((u) => ({ path: u.path, ...u.last28 })),
            queries: pushQueries,
        },
        urls: perUrl.map(({ queries28, ...u }) => u),
    }
    writeFileSync(
        path.join(args.outDir, `${stem}.json`),
        JSON.stringify(json, null, 1) + '\n'
    )
    writeFileSync(path.join(args.outDir, `${stem}.md`), md + '\n')
    console.error(`wrote ${path.join(args.outDir, stem)}.md and .json`)
}
