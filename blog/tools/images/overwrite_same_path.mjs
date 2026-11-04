#!/usr/bin/env node
// Replace a live Blob image in place: same URL, new bytes.
//
//   node blog/tools/images/overwrite_same_path.mjs <live blob url> <local.jpg> --backup-dir DIR [--dry-run | --apply]
//
// For an image Google already ranks at that address, where a new URL would
// lose its image-search position (the canary in the 2026-11-03 tummy tuck
// plan). Everything else goes through export_upload.mjs, whose new URL per
// render avoids a CDN-cached old copy; here the old copy can keep serving, and
// the site's image optimizer keeps its own copies, keyed by URL, for weeks. So
// after --apply, from a checkout whose apps/web is linked to the project, run
//   vercel cache invalidate --srcimg <live blob url> --yes --cwd apps/web
// then fetch /_next/image for that URL to check before calling it done.
//
// --dry-run is the default: it checks the arguments, finds the token and reads
// the live file's headers, and writes nothing.
// --apply first saves the live file to <backup dir>/<its pathname> and stops if
// that fails. An existing backup is kept, never overwritten, because the first
// one is the original. Then it puts the local file at the same pathname.
//
// Uses the token of the store that hosts the URL. A token names its store
// (vercel_blob_rw_<store id>_...), and the store id is the URL's first host
// label. The repo has two stores: apps/web/.env.local, apps/admin/.env and
// apps/web/.env.production hold one token, .mcp.json the other. Tokens are never
// printed. Any flag not listed here is an error.
import {
    existsSync,
    mkdirSync,
    readFileSync,
    statSync,
    writeFileSync,
} from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'

import { REPO, fail, parseArgs, readEnvValue } from '../lib/repo.mjs'

const { positional, flags } = parseArgs(process.argv.slice(2), {
    booleans: ['dry-run', 'apply'],
    values: ['backup-dir'],
    help: import.meta.url,
})
const usage =
    'usage: node blog/tools/images/overwrite_same_path.mjs <live blob url> <local.jpg> --backup-dir DIR [--dry-run | --apply]'
const [liveUrl, localFile] = positional
if (!liveUrl || !localFile || positional.length !== 2) fail(usage)
if (!flags['backup-dir']) fail(`--backup-dir is required\n${usage}`)
if (flags.apply && flags['dry-run']) fail('--apply and --dry-run: pick one')
const apply = Boolean(flags.apply)
const backupDir = resolve(flags['backup-dir'])

const url = new URL(liveUrl)
const storeHost = /^([a-z0-9]+)\.public\.blob\.vercel-storage\.com$/.exec(
    url.hostname
)
if (!storeHost) fail(`not a public Vercel Blob URL: ${liveUrl}`)
if (url.search) fail(`pass the URL without a query string: ${liveUrl}`)
const storeId = storeHost[1]
const pathname = decodeURIComponent(url.pathname.slice(1))
if (!/\.jpe?g$/i.test(pathname)) fail(`not a JPEG path: ${pathname}`)

if (!existsSync(localFile)) fail(`no such file: ${localFile}`)
const bytes = readFileSync(localFile)
if (bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff)
    fail(`not a JPEG: ${localFile}`)

/** The token whose store id is this URL's, and where it came from. */
function tokenForStore() {
    const candidates = [
        [
            'apps/web/.env.local',
            () =>
                readEnvValue(
                    join(REPO, 'apps/web/.env.local'),
                    'BLOB_READ_WRITE_TOKEN'
                ),
        ],
        [
            'apps/web/.env.production',
            () =>
                readEnvValue(
                    join(REPO, 'apps/web/.env.production'),
                    'BLOB_READ_WRITE_TOKEN'
                ),
        ],
        [
            'apps/admin/.env',
            () =>
                readEnvValue(
                    join(REPO, 'apps/admin/.env'),
                    'BLOB_READ_WRITE_TOKEN'
                ),
        ],
        [
            '.mcp.json',
            () => {
                const file = join(REPO, '.mcp.json')
                if (!existsSync(file)) return undefined
                return JSON.parse(readFileSync(file, 'utf8')).mcpServers?.[
                    'vercel-blob'
                ]?.env?.BLOB_READ_WRITE_TOKEN
            },
        ],
    ]
    for (const [source, read] of candidates) {
        const token = read()
        if (token?.split('_')[3]?.toLowerCase() === storeId)
            return { token, source }
    }
    return fail(
        `no token for store ${storeId} in ${candidates.map(([source]) => source).join(', ')}`
    )
}

const { token, source } = tokenForStore()
const head = await fetch(liveUrl, { method: 'HEAD' })
if (!head.ok) fail(`the live URL answers ${head.status}: ${liveUrl}`)
const backupFile = join(backupDir, pathname)

console.log(`store:   ${storeId} (token from ${source})`)
console.log(`path:    ${pathname}`)
console.log(
    `live:    ${head.headers.get('content-length')} bytes, ${head.headers.get('content-type')}`
)
console.log(`new:     ${statSync(localFile).size} bytes, ${localFile}`)
console.log(
    `backup:  ${backupFile}${existsSync(backupFile) ? ' (exists, kept)' : ''}`
)
if (!apply) {
    console.log('dry run: nothing written or uploaded. Pass --apply to act.')
    console.log(
        `after --apply: vercel cache invalidate --srcimg ${liveUrl} --yes --cwd apps/web, then fetch /_next/image for that URL to check.`
    )
    process.exit(0)
}

if (!existsSync(backupFile)) {
    const live = await fetch(liveUrl)
    if (!live.ok)
        fail(`could not read the live file for its backup: ${live.status}`)
    const old = Buffer.from(await live.arrayBuffer())
    if (old.length === 0)
        fail('the live file is empty, so there is nothing to back up')
    mkdirSync(dirname(backupFile), { recursive: true })
    writeFileSync(backupFile, old)
    console.log(`saved the old file: ${old.length} bytes`)
}

const require = createRequire(join(REPO, 'apps/web/package.json'))
const { put } = require('@vercel/blob')
const result = await put(pathname, bytes, {
    access: 'public',
    token,
    allowOverwrite: true,
    addRandomSuffix: false,
    contentType: 'image/jpeg',
})
if (result.url !== liveUrl)
    fail(
        `the upload landed at ${result.url}, not ${liveUrl}. Restore from ${backupFile}.`
    )
console.log(
    `overwritten: ${result.url}\nThe site's image optimizer keeps its own copies for weeks. From a checkout whose apps/web is linked to the project, run:\n  vercel cache invalidate --srcimg ${result.url} --yes --cwd apps/web\nthen fetch /_next/image for that URL to check before calling it done.`
)
