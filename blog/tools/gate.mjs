#!/usr/bin/env node
// The keyword-ownership gate, from the command line: may this topic be a new
// post, or does an existing page own it?
//
//   node blog/tools/gate.mjs "<title>" "<primary keyword>" [secondary ...] [--db URL|local] [--json] [--strict]
//   node blog/tools/gate.mjs --from <slug> [--db URL|local] [--save] [--json] [--strict]
//
// Runs evaluateTopicCandidate (packages/shared/src/seo/topic-gate.util.ts) the
// way the admin does before any post enters the pipeline
// (apps/admin/lib/services/ideation-gate.service.ts): against the checked-in
// registry plus a live overlay of published/scheduled posts that are not in
// the registry yet. The overlay needs --db; without it the gate runs on the
// registry alone and says so. Verdicts:
//   new      the cluster is unclaimed: write the post
//   refresh  an existing blog post owns it: rewrite that post (owningUrl)
//   reject   a money page owns it, it was retired, or it would cannibalize
//
// --from <slug>  read title, primary and secondary keywords from blog/posts/<slug>/meta.json
// --save         with --from: write the verdict into that meta.json as "gate"
//                (build_sql.py needs gate.verdict "new" for a new post)
// --json         print only the verdict JSON
// --strict       exit 2 on refresh, 3 on reject (default: exit 0 whenever the gate ran)
// --help         this text
// Any other flag is an error (exit 1), so a typo never runs a different gate.
//
// `warnings` lists every keyword this post would take from another page:
//   new      evaluateTopicCandidate checks the secondary keywords; this tool
//            adds, with --from, every owns_queries entry another page owns
//            (a procedure page's head or cost query, another post's query,
//            or a retired post's)
//   refresh  the secondary keywords and, with --from, owns_queries, against
//            every owner but the post itself (evaluateTopicCandidate stops
//            at the primary keyword on a refresh)
// A new post needs verdict new and no warnings; a rewrite needs refresh with
// owningSlug = the post and no warnings. check_post.py and build_sql.py run
// this and fail otherwise.
//
// No build step: the TypeScript source is imported through the repo's tsx, so
// a registry edit counts immediately (no stale packages/shared/dist).
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

import {
    POSTS,
    describeDb,
    fail,
    importRepo,
    parseArgs,
    psqlJson,
    readMeta,
    registerTsx,
    resolveDb,
} from './lib/repo.mjs'

const { positional, flags } = parseArgs(process.argv.slice(2), {
    booleans: ['json', 'save', 'strict'],
    values: ['db', 'from'],
    help: import.meta.url,
})
const db = resolveDb(flags.db)

let candidate
let meta
if (flags.from) {
    meta = readMeta(flags.from)
    candidate = {
        title: meta.title,
        primaryKeyword: meta.primary_keyword,
        secondaryKeywords: meta.secondary_keywords ?? [],
    }
} else {
    const [title, primaryKeyword, ...secondaryKeywords] = positional
    if (!title) {
        console.error(
            'usage: node blog/tools/gate.mjs "<title>" "<primary keyword>" [secondary ...] [--db URL|local] [--json] [--strict]\n' +
                '       node blog/tools/gate.mjs --from <slug> [--db URL|local] [--save] [--json] [--strict]'
        )
        process.exit(1)
    }
    candidate = {
        title,
        primaryKeyword: primaryKeyword ?? null,
        secondaryKeywords,
    }
}
if (flags.save && !flags.from) fail('--save needs --from <slug>')

await registerTsx()
const seo = await importRepo('packages/shared/src/seo/index.ts')
const { getBlogPostUrl } = await importRepo(
    'packages/shared/src/utils/blog-url.util.ts'
)

// The live overlay, as getLiveOverlayEntries() builds it.
let extraEntries = []
if (db) {
    const known = new Set(
        seo.BLOG_POST_ENTRIES.map((e) => e.slug).filter(Boolean)
    )
    const rows = psqlJson(
        db,
        `SELECT coalesce(json_agg(json_build_object(
        'slug', slug, 'title', title, 'primaryKeyword', primary_keyword,
        'secondaryKeywords', secondary_keywords, 'publishedAt', published_at)), '[]')
        FROM blog_post WHERE status IN ('published', 'scheduled') AND slug IS NOT NULL`
    )
    extraEntries = rows
        .filter((p) => p.slug && !known.has(p.slug))
        // On a fold or a rewrite the post being gated may itself be live: it owns its own cluster.
        .filter(
            (p) =>
                !(flags.from && p.slug === flags.from && meta?.mode === 'new')
        )
        .map((p) => {
            const slugQuery = p.slug.replace(/-/g, ' ')
            const primaryKeyword = p.primaryKeyword?.trim() || slugQuery
            const owns = new Set()
            if (slugQuery !== primaryKeyword) owns.add(slugQuery)
            for (const kw of p.secondaryKeywords ?? []) {
                const cleaned = String(kw).trim().toLowerCase()
                if (cleaned && cleaned !== primaryKeyword) owns.add(cleaned)
            }
            return {
                // timestamp without time zone holds UTC wall time (drizzle writes toISOString)
                url: p.publishedAt
                    ? getBlogPostUrl(p.slug, new Date(`${p.publishedAt}Z`))
                    : `/blog/${p.slug}`,
                slug: p.slug,
                kind: 'blog',
                intent: 'informational',
                status: 'live',
                primaryKeyword,
                ownsQueries: [...owns],
            }
        })
}

const verdict = seo.evaluateTopicCandidate(candidate, { extraEntries })

// evaluateTopicCandidate returns on a refresh verdict before it looks at the
// secondary keywords, and never sees owns_queries at all. Check them here:
// any query another page owns is cannibalization and goes in `warnings`.
//   refresh  secondary keywords and owns_queries, against every owner but
//            owningUrl (the post being rewritten)
//   new      owns_queries only (the gate already warned on the secondaries),
//            against every owner but the post itself
// owns_queries becomes the registry entry's ownsQueries after a new post goes
// live, so an unchecked one would claim another page's queries there; and
// getRegistryIntegrityIssues lets a blog entry share a query with a page.
if (verdict.verdict === 'refresh' || verdict.verdict === 'new') {
    const isNew = verdict.verdict === 'new'
    const seen = new Set()
    if (isNew)
        for (const q of [
            candidate.primaryKeyword,
            ...(candidate.secondaryKeywords ?? []),
        ])
            seen.add(seo.normalizeQuery(String(q ?? '')))
    const check = (raw, label) => {
        const query = seo.normalizeQuery(String(raw ?? ''))
        if (!query || seen.has(query)) return
        seen.add(query)
        const owned = seo.resolveQueryOwner(query, extraEntries)
        if (!owned) return
        const owner = owned.canonicalOwner
        const own = isNew
            ? Boolean(flags.from) && owner.slug === flags.from
            : owner.url === verdict.owningUrl
        if (own) return
        const how =
            owner.status === 'retired'
                ? ` (retired; it redirects to ${owner.redirectsTo ?? '?'})`
                : owner.kind !== 'blog'
                  ? ` (a ${owner.kind} page)`
                  : ''
        verdict.warnings.push(
            `${label} "${query}" is owned by ${owner.url}${how} — drop it from this post`
        )
    }
    if (!isNew)
        for (const kw of candidate.secondaryKeywords ?? [])
            check(kw, 'Secondary keyword')
    for (const q of (flags.from ? meta?.owns_queries : null) ?? [])
        check(q, 'Owned query')
}
const result = {
    candidate,
    ...verdict,
    checkedAt: new Date().toISOString(),
    registry: {
        entries:
            seo.BLOG_POST_ENTRIES.length + seo.MARKETING_PAGE_ENTRIES.length,
        overlay: db ? extraEntries.length : null,
        database: db ? describeDb(db) : null,
    },
}

if (flags.save) {
    const file = join(POSTS, flags.from, 'meta.json')
    meta.gate = {
        verdict: verdict.verdict,
        reason: verdict.reason,
        owningUrl: verdict.owningUrl ?? null,
        owningSlug: verdict.owningSlug ?? null,
        matchedQuery: verdict.matchedQuery ?? null,
        similarityScore: verdict.similarityScore ?? null,
        claimedQueries: verdict.claimedQueries,
        warnings: verdict.warnings,
        checkedAt: result.checkedAt,
        overlay: result.registry.overlay,
        database: result.registry.database,
    }
    writeFileSync(file, JSON.stringify(meta, null, 2) + '\n')
}

if (flags.json) {
    console.log(JSON.stringify(result, null, 1))
} else {
    console.log(JSON.stringify(result, null, 1))
    console.error(
        `\n${verdict.verdict.toUpperCase()}: ${verdict.reason}` +
            (db
                ? `\n(registry + live overlay of ${extraEntries.length} posts from ${describeDb(db)})`
                : '\n(registry only: pass --db local or a URL for the live overlay)') +
            (flags.save
                ? `\nsaved to blog/posts/${flags.from}/meta.json "gate"`
                : '')
    )
}
if (flags.strict)
    process.exit({ new: 0, refresh: 2, reject: 3 }[verdict.verdict] ?? 1)
