/**
 * Instagram → Gallery Import
 *
 * Publishes hand-picked Instagram before/afters into the website gallery
 * (issue #321). The picking and the media prep happen outside the repo — a
 * local review page and an ffmpeg prep step that writes one file per gallery
 * item plus a `manifest.json` next to them. This script only does the part
 * that touches the site: upload to Blob, insert `gallery_media`, file each
 * item under its procedure group(s), and revalidate the web app's gallery
 * cache.
 *
 * Why not the admin's Instagram analyzer: it is image-only and pairs separate
 * before/after photos, while most results are now Reels or side-by-side
 * composites. Reels go in as `type: 'video'` with a poster, which makes
 * `/gallery/media/<slug>` a video watch page (VideoObject + video sitemap).
 *
 * Safe to re-run. Items are matched on `original_filename`
 * (`instagram-<code>-<kind>-<n>`), so a second run skips what is already
 * there; Blob paths are deterministic, so a re-upload overwrites the same
 * file instead of leaving orphans.
 *
 * Dry run by default. Nothing is uploaded or written until `--write`.
 *
 * Usage:
 *   pnpm --filter admin gallery:import-instagram -- --dir <prep dir>
 *   pnpm --filter admin gallery:import-instagram -- --dir <prep dir> --write
 *   pnpm --filter admin gallery:import-instagram -- --dir <prep dir> --write --status draft
 */
import { config } from 'dotenv'

config({ path: ['.env.local', '.env'] })

import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { put } from '@vercel/blob'
import { eq, inArray } from 'drizzle-orm'

import { db } from '@workspace/db/client'
import {
    galleryGroup,
    galleryMedia,
    galleryMediaGroup,
} from '@workspace/db/schema/gallery'

import {
    getAllGalleryTags,
    revalidateWebAppCache,
} from '@/lib/utils/revalidate-web.util'

type ManifestItem = {
    slug: string
    type: 'image' | 'video'
    file: string
    poster: string | null
    title: string
    description: string
    alt: string
    seoTitle: string
    seoDescription: string
    groupSlugs: string[]
    width: number
    height: number
    duration: number | null
    mimeType: string
    fileSize: number
    originalFilename: string
    isBeforeAfter: boolean
    publishedAt: string
    sourceCode: string
}

const BLOB_PREFIX = 'gallery/instagram'

function readArgs() {
    const args = process.argv.slice(2)
    const value = (flag: string) => {
        const i = args.indexOf(flag)
        return i >= 0 ? args[i + 1] : undefined
    }
    const dir = value('--dir')
    if (!dir) {
        throw new Error('--dir <prep dir> is required')
    }
    const status = (value('--status') ?? 'published') as 'published' | 'draft'
    if (status !== 'published' && status !== 'draft') {
        throw new Error('--status must be published or draft')
    }
    return { dir: path.resolve(dir), write: args.includes('--write'), status }
}

async function upload(file: string, pathname: string, contentType: string) {
    const body = await readFile(file)
    const blob = await put(pathname, body, {
        access: 'public',
        contentType,
        addRandomSuffix: false,
        allowOverwrite: true,
    })
    // Two Blob stores exist; the returned url is the only reliable address
    return blob.url
}

async function freeSlug(slug: string, taken: Set<string>) {
    let candidate = slug
    for (let n = 2; ; n++) {
        if (!taken.has(candidate)) {
            const [row] = await db
                .select({ id: galleryMedia.id })
                .from(galleryMedia)
                .where(eq(galleryMedia.slug, candidate))
                .limit(1)
            if (!row) {
                taken.add(candidate)
                return candidate
            }
        }
        candidate = `${slug}-${n}`
    }
}

async function main() {
    const { dir, write, status } = readArgs()
    const items = JSON.parse(
        await readFile(path.join(dir, 'manifest.json'), 'utf8')
    ) as ManifestItem[]

    const existing = await db
        .select({ originalFilename: galleryMedia.originalFilename })
        .from(galleryMedia)
        .where(
            inArray(
                galleryMedia.originalFilename,
                items.map((i) => i.originalFilename)
            )
        )
    const done = new Set(existing.map((e) => e.originalFilename))

    const groups = await db
        .select({ id: galleryGroup.id, slug: galleryGroup.slug })
        .from(galleryGroup)
    const groupId = new Map(groups.map((g) => [g.slug, g.id]))
    const missingGroups = [
        ...new Set(items.flatMap((i) => i.groupSlugs)),
    ].filter((s) => !groupId.has(s))
    if (missingGroups.length) {
        throw new Error(`Unknown gallery groups: ${missingGroups.join(', ')}`)
    }

    const todo = items.filter((i) => !done.has(i.originalFilename))
    console.log(
        `${items.length} in manifest · ${done.size} already imported · ${todo.length} to import (${write ? status : 'dry run'})`
    )

    const taken = new Set<string>()
    let imported = 0
    for (const item of todo) {
        const slug = await freeSlug(item.slug, taken)
        const ext = item.type === 'video' ? 'mp4' : 'jpg'
        const line = `${item.type.padEnd(5)} ${slug}  → ${item.groupSlugs.join(', ')}`
        if (!write) {
            console.log(`  would import ${line}`)
            continue
        }

        const url = await upload(
            path.join(dir, item.file),
            `${BLOB_PREFIX}/${slug}.${ext}`,
            item.mimeType
        )
        const thumbnailUrl = item.poster
            ? await upload(
                  path.join(dir, item.poster),
                  `${BLOB_PREFIX}/${slug}-poster.jpg`,
                  'image/jpeg'
              )
            : null

        // Dated to the Instagram post, so VideoObject.uploadDate and the
        // gallery's newest-first order reflect when the result was shared
        const publishedAt = new Date(item.publishedAt)

        await db.transaction(async (tx) => {
            const [row] = await tx
                .insert(galleryMedia)
                .values({
                    type: item.type,
                    url,
                    thumbnailUrl,
                    title: item.title,
                    description: item.description,
                    alt: item.alt,
                    seoTitle: item.seoTitle,
                    seoDescription: item.seoDescription,
                    slug,
                    width: item.width,
                    height: item.height,
                    duration: item.duration,
                    fileSize: item.fileSize,
                    mimeType: item.mimeType,
                    originalFilename: item.originalFilename,
                    isBeforeAfter: item.isBeforeAfter,
                    status,
                    publishedAt: status === 'published' ? publishedAt : null,
                    createdAt: publishedAt,
                })
                .returning({ id: galleryMedia.id })
            if (!row) {
                throw new Error(`Insert returned nothing for ${slug}`)
            }
            await tx.insert(galleryMediaGroup).values(
                item.groupSlugs.map((g) => ({
                    mediaId: row.id,
                    groupId: groupId.get(g)!,
                    displayOrder: 0,
                }))
            )
        })
        imported++
        console.log(`  imported ${line}`)
    }

    if (write && imported > 0) {
        await revalidateWebAppCache(getAllGalleryTags())
    }
    console.log(
        write ? `Done: ${imported} imported.` : 'Dry run: nothing written.'
    )
    process.exit(0)
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})
