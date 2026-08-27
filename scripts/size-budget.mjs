#!/usr/bin/env node
/**
 * First-load JavaScript budget (issue #202, epic #197)
 *
 * Phase 2 cut the homepage from 688.6 KB of wire JavaScript to under 300 KB.
 * Nothing measured bundle size, so nothing would have noticed it climbing back.
 * This is that gate.
 *
 * ## Why it reads HTML instead of a manifest
 *
 * Next 16 stopped printing the "First Load JS" table, and a Turbopack build
 * emits no per-route `app-build-manifest.json` — the per-route
 * `.next/server/app/<route>/page/build-manifest.json` files carry only the
 * shared entries, with no route chunks of their own.
 *
 * What does exist is the prerendered HTML. Its `<script src>` tags are exactly
 * the JavaScript a browser downloads before the page is interactive, which is
 * the number worth defending. So: read every prerendered document, collect its
 * script set, and size it.
 *
 * Sizes are brotli, because that is what Vercel serves. They will not match the
 * raw byte counts on disk, and they are not meant to.
 *
 * ## What it enforces
 *
 * - `sharedKb`   — the floor every route pays, computed as the intersection of
 *                  every route's script set. The metric that matters most:
 *                  anything added to the root layout multiplies across all
 *                  300-plus routes. NOT `rootMainFiles` from
 *                  `build-manifest.json` — that set is one chunk short here (it
 *                  omits the app-router client runtime, which also carries
 *                  `IconMark` from the root layout's `<IconSprite/>`), so it
 *                  under-reports the real floor by ~6 KB and would miss exactly
 *                  the kind of root-layout growth this is meant to catch.
 * - `maxRouteKb` — the heaviest single route, whichever it happens to be. Keeps
 *                  a new page from quietly becoming the worst one.
 * - `routes`     — optional pins for routes worth naming individually. A pin
 *                  that no longer matches a prerendered route is itself a
 *                  failure, so a route going dynamic cannot silently leave the
 *                  measured set.
 * - `ciRoutes`   — pins enforced only when `CI` is set, for routes that exist
 *                  only in the CI database (see .github/fixtures). Skipped
 *                  locally, where those routes are absent and a normal pin
 *                  would fail for the wrong reason.
 *
 * ## Known blind spots
 *
 * - Chunks behind `next/dynamic` are excluded by design (not first-load), so
 *   growth inside them is invisible here.
 * - Third-party tags loaded via `next/script afterInteractive` never appear as
 *   script tags in the HTML.
 * - Dynamic (non-prerendered) routes emit no HTML and cannot be measured. In CI
 *   the database is empty, so DB-driven templates fall into this category.
 *   `.github/fixtures/size-budget-seed.sql` seeds one post to bring the blog
 *   template — 104 live routes, the most actively developed surface — back into
 *   the measured set. The gallery templates (`/gallery/[slug]`,
 *   `/gallery/media/[slug]`, ~102 routes) are still unmeasured in CI: they need
 *   a multi-table fixture, which has not been written.
 *
 * Usage:
 *   pnpm size:check              # after a build
 *   node scripts/size-budget.mjs --json
 *
 * @module scripts/size-budget
 */
import { appendFileSync, existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { brotliCompressSync, constants } from 'node:zlib'

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const NEXT_DIR = join(REPO_ROOT, 'apps/web/.next')
const APP_DIR = join(NEXT_DIR, 'server/app')
const BUDGET_FILE = join(REPO_ROOT, 'apps/web/size-budget.json')

const asJson = process.argv.includes('--json')

/**
 * Script tags only. Not `<link rel="preload">`, and not the bare chunk paths
 * that appear inside the flight payload — those include chunks for routes the
 * user has not navigated to, which is not first-load cost.
 *
 * The optional query string matters: an `assetPrefix` or a Vercel
 * `deploymentId` appends `?dpl=…`, and a pattern anchored on `.js"` would then
 * match nothing at all — every route would measure near zero and the gate would
 * report success. `minSharedKb` is the backstop if this ever slips anyway.
 */
const SCRIPT_TAG =
    /<script[^>]+src="(\/_next\/static\/[^"?]+\.js(?:\?[^"]*)?)"/g

function fail(message) {
    if (asJson) {
        console.log(JSON.stringify({ ok: false, error: message }, null, 2))
    } else {
        console.error(`\n✖ ${message}\n`)
    }
    process.exit(1)
}

function htmlFiles(dir, found = []) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name)
        if (entry.isDirectory()) htmlFiles(path, found)
        else if (entry.name.endsWith('.html')) found.push(path)
    }
    return found
}

/** Brotli size in bytes, memoised — chunks are shared across hundreds of routes. */
const sizeCache = new Map()
const missingAssets = new Set()
function brotliBytes(assetPath) {
    const cached = sizeCache.get(assetPath)
    if (cached !== undefined) return cached

    // Strip any `?dpl=…` before touching the filesystem.
    const onDisk = join(
        NEXT_DIR,
        assetPath.replace(/^\/_next\//, '').replace(/\?.*$/, '')
    )
    // Counting a missing chunk as zero would quietly shrink every route that
    // references it, which is the one way this gate could report success while
    // measuring nothing. A referenced chunk that is not on disk is a broken
    // build, so say so.
    if (!existsSync(onDisk)) missingAssets.add(assetPath)

    const bytes = missingAssets.has(assetPath)
        ? 0
        : brotliCompressSync(readFileSync(onDisk), {
              params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
          }).length

    sizeCache.set(assetPath, bytes)
    return bytes
}

const kb = (bytes) => bytes / 1024
const fmt = (value) => value.toFixed(1)

/** `.next/server/app/blog/index.html` → `/blog`, `index.html` → `/`. */
function routeFor(file) {
    const path = relative(APP_DIR, file).replace(/\.html$/, '')
    if (path === 'index') return '/'
    return '/' + path.split(sep).join('/')
}

// --- measure -----------------------------------------------------------------

if (!existsSync(APP_DIR)) {
    fail(
        `No build found at ${relative(REPO_ROOT, NEXT_DIR)}.\n` +
            '  Run `pnpm build` first — this reads the prerendered output.'
    )
}

const routes = []
/** Chunks present on every single route — the floor, by construction. */
let sharedChunks = null

for (const file of htmlFiles(APP_DIR)) {
    const scripts = new Set()
    for (const match of readFileSync(file, 'utf8').matchAll(SCRIPT_TAG)) {
        scripts.add(match[1])
    }
    if (scripts.size === 0) continue

    let bytes = 0
    for (const script of scripts) bytes += brotliBytes(script)
    routes.push({ route: routeFor(file), chunks: scripts.size, kb: kb(bytes) })

    sharedChunks =
        sharedChunks === null
            ? scripts
            : new Set([...sharedChunks].filter((c) => scripts.has(c)))
}

if (routes.length === 0) {
    fail(
        'The build produced no prerendered HTML, so there is nothing to measure.\n' +
            '  A build that failed partway can still leave a `.next` directory behind.'
    )
}

if (missingAssets.size > 0) {
    fail(
        `${missingAssets.size} referenced chunk(s) are not on disk, so these numbers ` +
            'would be too low to mean anything:\n' +
            [...missingAssets].map((asset) => `  ${asset}`).join('\n') +
            '\n  Rebuild from clean — a stale or partial `.next` does this.'
    )
}

routes.sort((a, b) => b.kb - a.kb)

const sharedKb = kb(
    [...sharedChunks].reduce((total, chunk) => total + brotliBytes(chunk), 0)
)

const heaviest = routes[0]
const median = routes[Math.floor(routes.length / 2)]

// --- compare -----------------------------------------------------------------

const budget = JSON.parse(readFileSync(BUDGET_FILE, 'utf8'))

// A budget with a missing or misspelled key compares against `undefined`, which
// is false for every `>` — the gate would pass everything and look healthy.
for (const key of ['sharedKb', 'maxRouteKb', 'minSharedKb']) {
    if (typeof budget[key] !== 'number') {
        fail(
            `${relative(REPO_ROOT, BUDGET_FILE)} is missing a numeric \`${key}\`. ` +
                'Without it nothing is enforced.'
        )
    }
}
/**
 * `ciRoutes` cover routes that only exist when the CI fixtures are loaded, so
 * they are skipped locally — pinning them everywhere would fail on every
 * developer machine for a reason that has nothing to do with bundle size.
 */
const pins = {
    ...(budget.routes ?? {}),
    ...(process.env.CI ? (budget.ciRoutes ?? {}) : {}),
}

for (const [route, limit] of Object.entries(pins)) {
    if (typeof limit !== 'number') {
        fail(
            `${relative(REPO_ROOT, BUDGET_FILE)} pins \`${route}\` to a non-number ` +
                `(${JSON.stringify(limit)}). Comparing against it yields NaN, which is ` +
                'never over budget — the pin would silently enforce nothing.'
        )
    }
}

// Every failure mode above is about measuring too little. This catches the rest:
// if the shared floor collapses, the measurement broke, and a number far BELOW
// the budget is not good news.
if (sharedKb < budget.minSharedKb) {
    fail(
        `The shared floor measured ${fmt(sharedKb)} KB, below the ${budget.minSharedKb} KB ` +
            'sanity floor. That is not a win — it means the measurement broke.\n' +
            '  Most likely the script-tag pattern stopped matching (an assetPrefix or\n' +
            '  deploymentId on asset URLs, or a change in how Next emits script tags).\n' +
            `  Measured ${routes.length} routes, ${sharedChunks.size} shared chunks.`
    )
}

const breaches = []

if (sharedKb > budget.sharedKb) {
    breaches.push({
        what: 'shared floor',
        actual: sharedKb,
        budget: budget.sharedKb,
    })
}
if (heaviest.kb > budget.maxRouteKb) {
    breaches.push({
        what: `heaviest route (${heaviest.route})`,
        actual: heaviest.kb,
        budget: budget.maxRouteKb,
    })
}
for (const [route, limit] of Object.entries(pins)) {
    const measured = routes.find((entry) => entry.route === route)
    if (!measured) {
        // A pin that no longer matches a route is a stale budget, not a
        // regression — but it silently stops enforcing, so it has to be loud.
        // It is also the only thing standing between a route going dynamic and
        // leaving the measured set unnoticed.
        breaches.push({
            what: `${route} is pinned in the budget but was not prerendered — remove the pin or fix the path`,
            budget: limit,
        })
        continue
    }
    if (measured.kb > limit) {
        breaches.push({ what: route, actual: measured.kb, budget: limit })
    }
}

// --- report ------------------------------------------------------------------

if (asJson) {
    console.log(
        JSON.stringify(
            {
                ok: breaches.length === 0,
                sharedKb,
                sharedChunks: [...sharedChunks],
                heaviest,
                median,
                routes,
                breaches,
                budget,
            },
            null,
            2
        )
    )
    process.exit(breaches.length === 0 ? 0 : 1)
}

const summary = [
    '| Metric | Measured | Budget |',
    '| --- | ---: | ---: |',
    `| Shared floor (${sharedChunks.size} chunks) | ${fmt(sharedKb)} KB | ${budget.sharedKb} KB |`,
    `| Heaviest route \`${heaviest.route}\` | ${fmt(heaviest.kb)} KB | ${budget.maxRouteKb} KB |`,
    ...Object.entries(pins).map(([route, limit]) => {
        const measured = routes.find((entry) => entry.route === route)
        const cell = measured ? `${fmt(measured.kb)} KB` : '—'
        return `| \`${route}\` | ${cell} | ${limit} KB |`
    }),
    // Informational. Unlike the gates above, this one moves with content: a CI
    // build against an empty database prerenders no blog posts, so the middle
    // of the distribution lands somewhere else entirely.
    `| Median of ${routes.length} routes _(informational)_ | ${fmt(median.kb)} KB | — |`,
].join('\n')

console.log(`\nFirst-load JavaScript (brotli)\n\n${summary}\n`)

if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(
        process.env.GITHUB_STEP_SUMMARY,
        `## First-load JavaScript (brotli)\n\n${summary}\n\n` +
            (breaches.length === 0
                ? '✅ Within budget.\n'
                : `❌ ${breaches.length} over budget.\n`)
    )
}

if (breaches.length > 0) {
    console.error('Over budget:\n')
    for (const breach of breaches) {
        if (breach.actual === undefined) {
            console.error(`  ${breach.what}`)
            continue
        }
        console.error(
            `  ${breach.what}: ${fmt(breach.actual)} KB against a ${breach.budget} KB budget` +
                ` (+${fmt(breach.actual - breach.budget)} KB)`
        )
    }
    console.error(
        '\nEither bring the bundle back down, or raise the budget in' +
            ` ${relative(REPO_ROOT, BUDGET_FILE)} and say why in the PR.` +
            '\n`pnpm analyze` writes per-route module graphs to' +
            ' apps/web/.next/diagnostics/analyze/.\n'
    )
    process.exit(1)
}

console.log('✓ Within budget.\n')
