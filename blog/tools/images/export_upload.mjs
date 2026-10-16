#!/usr/bin/env node
// Export the picked renders to JPEG and upload them to Vercel Blob.
//
//   node blog/tools/images/export_upload.mjs [<slug> ...] [--picks FILE] [--work DIR] [--db URL|local]
//                                            [--id <slug>=<uuid> ...] [--dry-run] [--delete-superseded] [--help]
//
// Generalized from the liposuction phase-2 kit (2026-09-23).
//
// picks (default blog/images/picks.json): { "<slug>": { "<image key>": "flare" | "sunburst" } }.
// Every image in each post's meta.json needs a pick, except one with
// "reuse_url" (an image already live, kept as it is: nothing to export or
// upload; build_sql.py links it). Processes the slugs given, else every slug
// in the picks file. A pick whose render is not in --work (renders are
// gitignored, so another machine's are never here) but whose upload is
// already in the manifest (same post, key and variant) is reported as
// "already in the manifest (job <id>), nothing to export" and keeps its
// entry; a pick with neither fails.
//
// Heroes are exported 1920 px wide, inline images 1600 px on the long edge, as
// JPEG at or under 500 KB (sips; the repo has no sharp), and uploaded with the
// app's own BLOB_READ_WRITE_TOKEN (apps/web/.env.local, last line wins; the
// .mcp.json token points at a different store) to
//   blog-images/<post id>/<slug>-<key>-<render job id, 8 chars>.jpg
// The job id in the name means a re-render gets a new URL, never a CDN-cached
// old one. blog/images/manifest.json gets one entry per image (path, url,
// size, dimensions, job id, prompt); entries for other posts are kept.
//
// The post id, for the Blob path:
//   --id <slug>=<uuid>   wins;
//   meta.json "id"       next;
//   a rewrite            the database row's id (needs --db);
//   a new post           a fresh uuid, written into meta.json "id", which
//                        build_sql.py then INSERTs, so the path exists before the row.
//
// --dry-run            export the JPEGs locally, upload nothing, leave the manifest alone
// --delete-superseded  delete earlier uploads of these posts that the manifest no longer
//                      lists, only when no images row references them (needs --db, and the
//                      database the live site reads: production, with the user's OK). A local
//                      database (a clone, the dev copy) is refused: it can lack rows production
//                      has, and the delete would break the live post's images. Without it they
//                      are listed and kept.
// Uploads are public: run it only on approved picks. Any flag not listed here is an
// error (a typo of --dry-run never uploads).
import { execFileSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import {
    existsSync,
    mkdirSync,
    readFileSync,
    statSync,
    writeFileSync,
} from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'

import {
    BLOG,
    POSTS,
    REPO,
    describeDb,
    fail,
    isLocalDb,
    parseArgs,
    psqlJson,
    readEnvValue,
    readMeta,
    resolveDb,
} from '../lib/repo.mjs'

const { positional, flags } = parseArgs(process.argv.slice(2), {
    booleans: ['dry-run', 'delete-superseded'],
    values: ['picks', 'work', 'db', 'id'],
    help: import.meta.url,
})
const picksFile = flags.picks ?? join(BLOG, 'images/picks.json')
const work = flags.work ?? join(BLOG, 'images/work')
const manifestFile = join(BLOG, 'images/manifest.json')
const db = resolveDb(flags.db)
const dryRun = Boolean(flags['dry-run'])

if (flags['delete-superseded']) {
    if (!db)
        fail(
            "--delete-superseded needs --db <production> (with the user's OK), to check that no images row still uses them"
        )
    if (isLocalDb(db)) {
        fail(
            `--delete-superseded refused: ${describeDb(db)} is a local database. Only production knows which uploads ` +
                "the live site still uses; check against it (the user's OK), or keep the files."
        )
    }
}

if (!existsSync(picksFile))
    fail(`${picksFile} not found: write the picks first`)
const picks = JSON.parse(readFileSync(picksFile, 'utf8'))
const slugs = positional.length
    ? positional
    : Object.keys(picks).filter((k) => !k.startsWith('_'))
if (!slugs.length)
    fail('no posts to export (pass slugs or fill the picks file)')

const idFlags = Object.fromEntries(
    [].concat(flags.id ?? []).map((pair) => {
        const [slug, id] = pair.split('=')
        if (!slug || !/^[0-9a-f-]{36}$/.test(id ?? ''))
            fail(`--id ${pair}: use <slug>=<uuid>`)
        return [slug, id]
    })
)

function postId(slug, meta) {
    if (idFlags[slug]) {
        if (meta.id && meta.id !== idFlags[slug])
            fail(
                `${slug}: --id ${idFlags[slug]} differs from meta.json id ${meta.id}`
            )
        return idFlags[slug]
    }
    if (meta.mode === 'rewrite') {
        if (!db) {
            if (meta.id) return meta.id
            fail(
                `${slug} is a rewrite: pass --db (local or a URL) to read its id, or --id ${slug}=<uuid>`
            )
        }
        const row = psqlJson(
            db,
            `SELECT json_build_object('id', id) FROM blog_post WHERE slug = '${slug.replace(/'/g, "''")}' AND refresh_of_post_id IS NULL`
        )
        if (!row) fail(`${slug}: no row in ${describeDb(db)}`)
        if (meta.id && meta.id !== row.id)
            fail(
                `${slug}: meta.json id ${meta.id} is not the database id ${row.id}`
            )
        return row.id
    }
    if (meta.id) return meta.id
    const id = randomUUID()
    const ordered = {}
    for (const [k, v] of Object.entries(meta)) {
        ordered[k] = v
        if (k === 'slug') ordered.id = id
    }
    ordered.id ??= id
    if (!dryRun) {
        writeFileSync(
            join(POSTS, slug, 'meta.json'),
            JSON.stringify(ordered, null, 2) + '\n'
        )
        console.log(`${slug}: new post id ${id} written to meta.json`)
    }
    return id
}

function exportJpeg(src, dst, featured) {
    const size = featured ? ['--resampleWidth', '1920'] : ['-Z', '1600']
    for (const q of [80, 74, 68, 62]) {
        execFileSync(
            'sips',
            [
                ...size,
                '-s',
                'format',
                'jpeg',
                '-s',
                'formatOptions',
                String(q),
                src,
                '--out',
                dst,
            ],
            { stdio: 'ignore' }
        )
        if (statSync(dst).size <= 500_000) return q
    }
    throw new Error(`${dst} is still over 500 KB at quality 62`)
}

function dims(file) {
    const out = execFileSync('sips', [
        '-g',
        'pixelWidth',
        '-g',
        'pixelHeight',
        file,
    ]).toString()
    return {
        width: Number(/pixelWidth: (\d+)/.exec(out)[1]),
        height: Number(/pixelHeight: (\d+)/.exec(out)[1]),
    }
}

let put, del, token
function blob() {
    // loaded on the first upload or delete, so a run with nothing to send never reads the token
    if (!token) {
        const require = createRequire(join(REPO, 'apps/web/package.json'))
        ;({ put, del } = require('@vercel/blob'))
        token = readEnvValue(
            join(REPO, 'apps/web/.env.local'),
            'BLOB_READ_WRITE_TOKEN'
        )
        if (!token)
            fail('BLOB_READ_WRITE_TOKEN not found in apps/web/.env.local')
    }
    return { put, del, token }
}

const exportDir = join(work, 'export')
mkdirSync(exportDir, { recursive: true })
const previous = existsSync(manifestFile)
    ? JSON.parse(readFileSync(manifestFile, 'utf8'))
    : []
const fresh = []
const kept = [] // picks already uploaded (their manifest entry stays), whose render is not on this machine
for (const slug of slugs) {
    const meta = readMeta(slug)
    const toExport = (meta.images ?? []).filter(
        (img) => img.reuse_url === undefined
    )
    for (const img of meta.images ?? []) {
        if (img.reuse_url !== undefined)
            console.log(
                `${slug}/${img.key}: reuse_url, kept as it is (${img.reuse_url})`
            )
    }
    if (!toExport.length) continue
    const byKey = picks[slug]
    if (!byKey) fail(`no picks for ${slug} in ${picksFile}`)
    let id // read only when something is exported (a new post's id is written into meta.json then)
    for (const img of toExport) {
        const variant = byKey[img.key]
        if (!variant) fail(`no pick for ${slug}/${img.key}`)
        const jobFile = join(work, slug, `${img.key}-${variant}.json`)
        const png = join(work, slug, `${img.key}-${variant}.png`)
        if (!existsSync(jobFile) || !existsSync(png)) {
            // Renders live in the gitignored images/work/ of the machine that made them. A pick
            // whose upload is already in the manifest (same post, key and variant) needs nothing:
            // keep that entry. A pick with neither is a render still to make.
            const entry = previous.find(
                (m) =>
                    m.slug === slug &&
                    m.key === img.key &&
                    m.variant === variant &&
                    m.url
            )
            if (!entry)
                fail(
                    `${slug}/${img.key}: render ${variant} not found in ${work} and not in the manifest (images/generate.py)`
                )
            if (meta.id && entry.post_id && entry.post_id !== meta.id) {
                fail(
                    `${slug}/${img.key}: the manifest upload is under post ${entry.post_id}, but meta.json id is ${meta.id}`
                )
            }
            console.log(
                `${slug}/${img.key}: already in the manifest (job ${entry.job_id}), nothing to export: ${entry.url}`
            )
            kept.push(entry)
            continue
        }
        id ??= postId(slug, meta)
        const job = JSON.parse(readFileSync(jobFile, 'utf8'))
        const file = `${slug}-${img.key}-${job.id.slice(0, 8)}.jpg`
        const local = join(exportDir, file)
        const quality = exportJpeg(png, local, img.type === 'featured')
        const { width, height } = dims(local)
        const path = `blog-images/${id}/${file}`
        const size = statSync(local).size
        if (dryRun) {
            console.log(
                `would upload ${path} ${width}x${height} ${Math.round(size / 1024)} KB q${quality}`
            )
            continue
        }
        const uploaded = await blob().put(path, readFileSync(local), {
            access: 'public',
            addRandomSuffix: false,
            allowOverwrite: true,
            contentType: 'image/jpeg',
            token: blob().token,
        })
        fresh.push({
            slug,
            key: img.key,
            type: img.type,
            post_id: id,
            path,
            url: uploaded.url,
            width,
            height,
            size,
            quality,
            variant,
            job_id: job.id,
            prompt: job.params?.prompt ?? img.prompt,
        })
        console.log(
            `uploaded ${path} ${width}x${height} ${Math.round(size / 1024)} KB q${quality}`
        )
    }
}
if (dryRun) process.exit(0)

const done = new Set(slugs) // their manifest entries are replaced by this run's (uploaded + kept); a reused image has none
const manifest = [
    ...previous.filter((m) => !done.has(m.slug)),
    ...kept,
    ...fresh,
].sort((a, b) => a.slug.localeCompare(b.slug) || a.key.localeCompare(b.key))
writeFileSync(manifestFile, JSON.stringify(manifest, null, 1) + '\n')
console.log(
    `${fresh.length} images uploaded, ${kept.length} already in the manifest; manifest has ${manifest.length}`
)

const keep = new Set([...fresh, ...kept].map((m) => m.url))
const stale = previous
    .filter((m) => done.has(m.slug) && m.url && !keep.has(m.url))
    .map((m) => m.url)
if (stale.length) {
    if (!flags['delete-superseded']) {
        console.log(
            `${stale.length} earlier upload(s) of these posts are no longer in the manifest (kept):\n  ${stale.join('\n  ')}`
        )
    } else {
        console.log(
            `checking ${stale.length} superseded upload(s) against ${describeDb(db)}`
        )
        const used = new Set(
            psqlJson(
                db,
                `SELECT coalesce(json_agg(url), '[]') FROM images WHERE url = ANY(ARRAY[${stale.map((u) => `'${u.replace(/'/g, "''")}'`).join(',')}])`
            )
        )
        const gone = stale.filter((u) => !used.has(u))
        if (gone.length) await blob().del(gone, { token: blob().token })
        console.log(
            `deleted ${gone.length} superseded upload(s); kept ${stale.length - gone.length} still referenced in ${describeDb(db)}`
        )
    }
}
