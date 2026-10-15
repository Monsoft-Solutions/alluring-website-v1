#!/usr/bin/env node
// Is this slug free for a new blog post?
//
//   node blog/tools/slug_check.mjs <slug> [--db URL|local] [--quiet] [--json] [--help]
//
// Exit 0 when it is free, 1 on any collision, 2 on a usage error (an unknown
// flag included). A collision is:
//   - not lowercase words joined by single hyphens (format)
//   - blog_post.slug already taken, any status (with --db; the column is UNIQUE)
//   - a redirect source in apps/web/next.config.mjs, as /slug or /blog/slug
//     (the redirect wins over the page, so the post would be unreachable)
//   - a top-level route under apps/web/app or a top-level entry of apps/web/public
//     (a pre-2026 post with such a slug makes the build exit(1); a 2026 post
//     loses its /slug alias)
//   - a /blog subroute: authors, categories, tags (and blog itself)
//   - a surgeon slug (apps/web/lib/data/surgeons/surgeons-data.ts)
//   - a keyword-registry entry: a blog slug (live or retired) or a marketing
//     page URL /slug (packages/shared/src/seo/keyword-ownership*.constant.ts)
// Without --db the database check is skipped and says so.
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import {
    REPO,
    describeDb,
    parseArgs,
    psqlJson,
    resolveDb,
} from './lib/repo.mjs'

const { positional, flags } = parseArgs(process.argv.slice(2), {
    booleans: ['quiet', 'json'],
    values: ['db'],
    help: import.meta.url,
    usageExit: 2,
})
const slug = positional[0]
if (!slug || positional.length > 1) {
    console.error(
        'usage: node blog/tools/slug_check.mjs <slug> [--db URL|local] [--quiet] [--json]'
    )
    process.exit(2)
}
const db = resolveDb(flags.db)
const read = (rel) => readFileSync(join(REPO, rel), 'utf8')
const checks = []
const add = (name, collision, detail) =>
    checks.push({ name, collision, detail })

// Format
add(
    'format',
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug),
    'lowercase letters and digits, single hyphens'
)
if (slug.length > 75)
    add(
        'length',
        false,
        `${slug.length} characters; shorter slugs read better (warning only)`
    )

// Database
if (db) {
    const row = psqlJson(
        db,
        `SELECT json_build_object('status', status, 'id', id) FROM blog_post WHERE slug = '${slug.replace(/'/g, "''")}'`
    )
    add(
        'blog_post.slug',
        Boolean(row),
        row
            ? `taken by ${row.id} (status ${row.status}) in ${describeDb(db)}`
            : `free in ${describeDb(db)}`
    )
} else {
    add(
        'blog_post.slug',
        false,
        'NOT CHECKED: pass --db local (or a URL) to check the database'
    )
}

// Redirect sources
const config = read('apps/web/next.config.mjs')
const block = config.slice(config.indexOf('async redirects()'))
const sources = [
    ...block.matchAll(/source:\s*'([^']+)'[^{}]*?destination:\s*'([^']+)'/gs),
].map((m) => [m[1], m[2]])
const hits = sources.filter(([s]) => s === `/${slug}` || s === `/blog/${slug}`)
add(
    'next.config.mjs redirects',
    hits.length > 0,
    hits.length
        ? hits.map(([s, d]) => `${s} -> ${d}`).join('; ')
        : `${sources.length} sources, none match`
)

// Static routes and public files
const appDir = join(REPO, 'apps/web/app')
const routes = readdirSync(appDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !/^[[(_@]/.test(e.name))
    .map((e) => e.name)
add(
    'apps/web/app routes',
    routes.includes(slug),
    routes.includes(slug)
        ? `/${slug} is a static route`
        : `${routes.length} top-level routes, none match`
)
const publicDir = join(REPO, 'apps/web/public')
const publicEntries = existsSync(publicDir) ? readdirSync(publicDir) : []
add(
    'apps/web/public',
    publicEntries.includes(slug),
    publicEntries.includes(slug)
        ? `/${slug} is a public file or folder`
        : 'no public entry matches'
)

// /blog subroutes
const blogSub = readdirSync(join(appDir, 'blog'), { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith('['))
    .map((e) => e.name)
const reserved = new Set([...blogSub, 'blog', 'authors', 'categories', 'tags'])
add(
    '/blog subroutes',
    reserved.has(slug),
    reserved.has(slug)
        ? `/blog/${slug} is a blog listing route`
        : `reserved: ${[...reserved].join(', ')}`
)

// Surgeons
const surgeons = [
    ...read('apps/web/lib/data/surgeons/surgeons-data.ts').matchAll(
        /slug:\s*'([^']+)'/g
    ),
].map((m) => m[1])
add(
    'surgeon pages',
    surgeons.includes(slug),
    surgeons.includes(slug)
        ? `/${slug} is a surgeon page`
        : `surgeons: ${surgeons.join(', ')}`
)

// Keyword registry
const blogRegistry = read(
    'packages/shared/src/seo/keyword-ownership-blog.constant.ts'
)
const entry = [
    ...blogRegistry.matchAll(
        /\{\s*url:\s*'([^']+)',\s*slug:\s*'([^']+)'[^}]*?status:\s*'(\w+)'/gs
    ),
].find((m) => m[2] === slug)
add(
    'keyword registry (blog)',
    Boolean(entry),
    entry
        ? `${entry[1]} is a ${entry[3]} registry entry`
        : 'no blog entry with this slug'
)
const marketing = read('packages/shared/src/seo/keyword-ownership.constant.ts')
const pageUrls = [...marketing.matchAll(/url:\s*'([^']+)'/g)].map((m) => m[1])
const pageHit = pageUrls.find((u) => u === `/${slug}` || u === `/blog/${slug}`)
add(
    'keyword registry (pages)',
    Boolean(pageHit),
    pageHit
        ? `${pageHit} is a registered page (it may be planned and 404 today)`
        : `${pageUrls.length} page URLs, none match`
)

const collisions = checks.filter((c) => c.collision)
if (flags.json) {
    console.log(
        JSON.stringify({ slug, free: collisions.length === 0, checks }, null, 1)
    )
} else {
    for (const c of checks) {
        if (flags.quiet && !c.collision) continue
        console.log(
            `${c.collision ? 'COLLISION' : 'ok       '}  ${c.name.padEnd(26)} ${c.detail}`
        )
    }
    console.log(
        collisions.length
            ? `"${slug}" is NOT free (${collisions.length} collision${collisions.length > 1 ? 's' : ''})`
            : `"${slug}" is free`
    )
}
process.exit(collisions.length ? 1 : 0)
