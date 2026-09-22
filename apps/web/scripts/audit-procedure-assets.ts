/**
 * Procedure asset audit: what a procedure page has to show, read-only.
 *
 * For one procedure (or all of them) it reports, as markdown:
 *
 *   - the gallery group the page reads (the first visible one by display
 *     order) and every published photo and video in it, flagged when the
 *     title and alt text don't name the procedure, when the gallery's AI
 *     analysis detected another procedure, when dimensions are missing, when
 *     the Instagram import saved the same photo twice, or when the analysis
 *     rated it low quality;
 *   - candidates to add: published media detected as this procedure but
 *     filed elsewhere, and unpublished Instagram imports whose caption names
 *     the procedure, results-like posts first;
 *   - the before/after pairs the results slider can lead with;
 *   - every published review that names the procedure, with its position in
 *     the order the reviews query returns, and whether Google translated it;
 *   - how fresh the Google review sync is.
 *
 * "Names the procedure" is `procedureMentions`, the pattern the page modules
 * use, so the audit and the page agree.
 *
 * It never writes. Gallery changes go through the admin (Gallery), or as SQL
 * validated on a `--db clone` worktree before the owner runs it on
 * production.
 *
 * Usage:
 *   pnpm --filter web audit:procedure-assets --slug tummy-tuck-miami
 *   pnpm --filter web audit:procedure-assets --all --prod > assets.md
 *
 * `--prod` reads `POSTGRES_URL_PROD` from `packages/db/.env.local`; without
 * it the script reads `POSTGRES_URL` (the local database, usually a stale
 * copy). The host is printed first either way.
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import {
    mentionsProcedure,
    procedureMentions,
} from '../lib/procedures/procedure-mentions'
import { readGoogleReviewText } from '../lib/utils/google-review-text.util'

const args = process.argv.slice(2)
const flag = (name: string) => args.includes(name)
const option = (name: string) =>
    flag(name) ? args[args.indexOf(name) + 1] : undefined

const PROD = flag('--prod')
const ALL = flag('--all')
const SLUG = option('--slug')
/** How many candidates to list per kind. */
const LIST_LIMIT = Number(option('--limit') ?? 12)

const slugs = Object.keys(procedureMentions)

if (!ALL && (!SLUG || !slugs.includes(SLUG))) {
    console.error(
        `Pass --slug <slug> or --all. Slugs: ${slugs.join(', ')}. Add --prod to read production.`
    )
    process.exit(2)
}

function readProdUrl(): string {
    const file = fileURLToPath(
        new URL('../../../packages/db/.env.local', import.meta.url)
    )
    const line = readFileSync(file, 'utf8')
        .split('\n')
        .find((l) => l.startsWith('POSTGRES_URL_PROD='))
    const url = line?.slice('POSTGRES_URL_PROD='.length).trim()
    if (!url) throw new Error(`No POSTGRES_URL_PROD in ${file}`)
    return url
}

// The db client reads POSTGRES_URL when it is imported, so point it at
// production first. Without --prod it loads apps/web/.env.local itself.
/* eslint-disable no-restricted-properties -- both must precede the client import */
if (PROD) process.env.POSTGRES_URL = readProdUrl()
// Keeps dotenv's banner out of the report when it is redirected to a file.
process.env.DOTENV_CONFIG_QUIET = 'true'
/* eslint-enable no-restricted-properties */

const { db } = await import('@workspace/db/client')
const { sql } = await import('drizzle-orm')

type Query = ReturnType<typeof sql>
async function select<T>(query: Query): Promise<T[]> {
    return (await db.execute(query)) as unknown as T[]
}

// eslint-disable-next-line no-restricted-properties -- read after the client loaded the env file
const host = (process.env.POSTGRES_URL ?? '').replace(/^[a-z]+:\/\/[^@]*@/, '')

const RESULTS_LIKE =
    /before|after|antes|despu[eé]s|result|transformaci[oó]n|transformation/i

/**
 * A caption that quotes a price. Promo posts quote prices the practice no
 * longer charges ("BBL for ONLY $3,500"), and whatever the site publishes,
 * AI engines repeat as the page's price.
 */
const QUOTES_PRICE = /\$\s?\d|\bprecio\b|\bonly \d/i

/** The Instagram import saves a carousel cover twice under two names. */
const photoKey = (url: string) =>
    url.replace(/-carousel-0(\.\w+)$/, '-primary$1')

const oneLine = (text: string | null, max = 110) => {
    const flat = (text ?? '').replace(/\s+/g, ' ').trim()
    return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat
}

const cell = (text: string | null) => oneLine(text).replace(/\|/g, '\\|')

const day = (value: Date | string) => new Date(value).toISOString().slice(0, 10)

type GroupRow = {
    id: string
    slug: string
    is_visible: boolean
    images: number
    videos: number
}

type MediaRow = {
    type: 'image' | 'video'
    slug: string
    url: string
    title: string
    alt: string | null
    width: number | null
    height: number | null
    is_before_after: boolean
    detected: string | null
    quality: string | null
}

type MisfiledRow = {
    slug: string
    title: string
    alt: string | null
    before_after: boolean | null
    now_in: string
}

type DraftRow = {
    slug: string
    type: 'image' | 'video'
    analysed: boolean
    detected: string | null
    caption: string | null
    permalink: string
    taken_at: Date | string
}

type PairsRow = { pairs: number; with_timeframe: number }

type ReviewRow = {
    reviewer_name: string
    rating: number
    comment: string | null
    review_created_at: Date | string
}

type SettingsRow = {
    total_reviews_count: number | null
    average_rating: string | null
    last_sync_at: Date | string | null
}

async function auditGallery(slug: string, out: string[]) {
    const groups = await select<GroupRow>(sql`
        select g.id, g.slug, g.is_visible, g.display_order,
          count(m.id) filter (where m.status = 'published' and m.type = 'image')::int as images,
          count(m.id) filter (where m.status = 'published' and m.type = 'video')::int as videos
        from gallery_group g
        left join gallery_media_group mg on mg.group_id = g.id
        left join gallery_media m on m.id = mg.media_id
        where g.procedure_slug = ${slug}
        group by g.id
        order by g.display_order`)

    out.push('### Gallery', '')
    const readGroup = groups.find((g) => g.is_visible)
    if (!readGroup) {
        out.push(
            '**No visible gallery group for this procedure.** The page has no results rail until one exists (admin → Gallery → Groups, with this slug).',
            ''
        )
    } else {
        const others = groups
            .filter((g) => g !== readGroup)
            .map((g) => `${g.slug}${g.is_visible ? '' : ' (hidden)'}`)
        out.push(
            `The page reads **/gallery/${readGroup.slug}** (${readGroup.images} published images, ${readGroup.videos} videos).${others.length ? ` Other groups with this slug: ${others.join(', ')}.` : ''}`,
            ''
        )

        const media = await select<MediaRow>(sql`
            select m.type, m.slug, m.url, m.title, m.alt, m.width, m.height,
              m.is_before_after, m.ai_analysis->>'detectedProcedure' as detected,
              m.ai_analysis->>'imageQuality' as quality
            from gallery_media m
            join gallery_media_group mg on mg.media_id = m.id
            where mg.group_id = ${readGroup.id} and m.status = 'published'
            order by m.display_order asc, m.published_at desc`)

        const seen = new Set<string>()
        out.push('| # | Type | Media | Flags |', '| --- | --- | --- | --- |')
        media.forEach((m, index) => {
            const flags: string[] = []
            if (!mentionsProcedure(slug, `${m.title} ${m.alt ?? ''}`)) {
                flags.push('title/alt do not name the procedure')
            }
            if (m.detected && m.detected !== slug) {
                flags.push(`AI detected ${m.detected}`)
            }
            if (m.width === null || m.height === null) {
                flags.push('no dimensions')
            }
            if (m.quality === 'low') flags.push('low quality')
            const key = photoKey(m.url)
            if (seen.has(key)) flags.push('duplicate of an earlier item')
            seen.add(key)
            out.push(
                `| ${index + 1} | ${m.type}${m.is_before_after ? ', before/after' : ''} | \`${m.slug}\`: ${cell(m.alt ?? m.title)} | ${flags.join('; ') || 'ok'} |`
            )
        })
        out.push('')
    }

    const misfiled = await select<MisfiledRow>(sql`
        select m.slug, m.title, m.alt,
          (m.ai_analysis->>'isBeforeAfter')::boolean as before_after,
          coalesce(string_agg(distinct g2.slug, ', '), '(no group)') as now_in
        from gallery_media m
        left join gallery_media_group mg2 on mg2.media_id = m.id
        left join gallery_group g2 on g2.id = mg2.group_id
        where m.status = 'published'
          and m.ai_analysis->>'detectedProcedure' = ${slug}
          and not exists (
            select 1 from gallery_media_group mg
            join gallery_group g on g.id = mg.group_id
            where mg.media_id = m.id and g.procedure_slug = ${slug})
        group by m.id
        order by m.published_at desc nulls last`)
    if (misfiled.length) {
        out.push(
            `**Published elsewhere, detected as this procedure (${misfiled.length}).** Check each one by eye before adding it to this group; many are combined procedures that belong in both.`,
            '',
            '| Media | Before/after | Now in |',
            '| --- | --- | --- |',
            ...misfiled
                .slice(0, LIST_LIMIT)
                .map(
                    (m) =>
                        `| \`${m.slug}\`: ${cell(m.alt ?? m.title)} | ${m.before_after ? 'yes' : 'no'} | ${m.now_in} |`
                ),
            ''
        )
    }

    const drafts = await select<DraftRow>(sql`
        select m.slug, m.type, (m.ai_analysis is not null) as analysed,
          m.ai_analysis->>'detectedProcedure' as detected,
          p.caption, p.permalink, p.taken_at
        from instagram_post p
        join gallery_media m on m.id = p.media_id
        where m.status = 'draft'
        order by p.taken_at desc`)
    const candidates = drafts
        .filter((d) => mentionsProcedure(slug, d.caption))
        .map((d) => ({
            ...d,
            results: RESULTS_LIKE.test(d.caption ?? ''),
            price: QUOTES_PRICE.test(d.caption ?? ''),
        }))
        // Results-like posts without a price first, newest first within each.
        .sort(
            (a, b) =>
                Number(b.results && !b.price) - Number(a.results && !a.price)
        )
    const images = candidates.filter((d) => d.type === 'image')
    const videos = candidates.filter((d) => d.type === 'video')

    out.push(
        `**Unpublished Instagram imports that name the procedure:** ${images.length} images (${images.filter((d) => d.results).length} results-like), ${videos.length} videos (${videos.filter((d) => d.results).length} results-like). Open each post and keep only real patients shown with consent, and nothing that quotes a price. Then publish them and add them to the group in the admin (Gallery), which also runs the AI analysis and fills the alt text.`,
        ''
    )
    for (const [label, list] of [
        ['Images', images],
        ['Videos', videos],
    ] as const) {
        if (!list.length) continue
        out.push(
            `| ${label} | Taken | Caption | Results-like | Quotes a price | Analysed |`,
            '| --- | --- | --- | --- | --- | --- |',
            ...list
                .slice(0, LIST_LIMIT)
                .map(
                    (d) =>
                        `| [\`${d.slug}\`](${d.permalink}) | ${day(d.taken_at)} | ${cell(d.caption)} | ${d.results ? 'yes' : ''} | ${d.price ? '**yes: keep off the site**' : ''} | ${d.analysed ? (d.detected ?? 'yes') : ''} |`
                ),
            ''
        )
    }

    const [pairs] = await select<PairsRow>(sql`
        select count(*)::int as pairs,
          count(*) filter (where timeframe is not null and timeframe <> '')::int as with_timeframe
        from before_after_pair where procedure_slug = ${slug}`)
    const pairCount = pairs?.pairs ?? 0
    out.push(
        `**Before/after pairs** (the slider): ${pairCount}${pairCount > 0 ? `, ${pairs?.with_timeframe ?? 0} with a timeframe` : ''}. Create pairs in the admin (Gallery → Before/after) from published before and after photos of the same patient.`,
        ''
    )
}

function auditReviews(slug: string, out: string[], all: ReviewRow[]) {
    const withText = all.filter((review) => review.comment?.trim())
    const mentioning = all
        .map((review, index) => ({ review, position: index + 1 }))
        .filter(({ review }) => mentionsProcedure(slug, review.comment))

    out.push(
        '### Reviews',
        '',
        `${mentioning.length} of ${withText.length} published reviews with text (4★ and up) name the procedure.${mentioning.length === 0 ? ' The page must not claim procedure reviews: use a neutral heading, and ask recent patients for Google reviews.' : ''}`,
        ''
    )
    if (mentioning.length) {
        out.push(
            '| Position | Reviewer | Date | ★ | Translated | Text |',
            '| --- | --- | --- | --- | --- | --- |',
            ...mentioning.map(({ review, position }) => {
                const { text, translatedByGoogle } = readGoogleReviewText(
                    review.comment ?? ''
                )
                return `| ${position} | ${cell(review.reviewer_name)} | ${day(review.review_created_at)} | ${review.rating} | ${translatedByGoogle ? 'yes' : ''} | ${cell(text)} |`
            }),
            '',
            `Position is the order \`getPublishedGoogleReviews\` returns (featured, display order, newest), out of ${all.length}. A page must read past the last of these, or it never sees them.`,
            ''
        )
    }
}

const out: string[] = [
    '# Procedure asset audit',
    '',
    `Database: \`${host}\`${PROD ? ' (production)' : ''} · ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC`,
    '',
]

const [settings] = await select<SettingsRow>(sql`
    select total_reviews_count, average_rating, last_sync_at
    from google_reviews_settings limit 1`)
if (settings) {
    const lastSync = settings.last_sync_at
        ? new Date(settings.last_sync_at)
        : null
    const days = lastSync
        ? Math.floor((Date.now() - lastSync.getTime()) / 86_400_000)
        : null
    out.push(
        `Google profile: ${settings.average_rating ?? '?'}★ from ${settings.total_reviews_count ?? '?'} reviews. Last review sync: ${lastSync ? `${day(lastSync)} (${days} days ago)` : 'never'}.${days !== null && days > 14 ? ' **Stale: new reviews are not reaching the site.**' : ''}`,
        ''
    )
}

const reviews = await select<ReviewRow>(sql`
    select reviewer_name, rating, comment, review_created_at
    from google_review
    where is_published and rating >= 4
    order by is_featured desc, display_order asc, review_created_at desc`)

for (const slug of ALL || !SLUG ? slugs : [SLUG]) {
    out.push(`## ${slug}`, '')
    await auditGallery(slug, out)
    auditReviews(slug, out, reviews)
}

console.log(out.join('\n'))
process.exit(0)
