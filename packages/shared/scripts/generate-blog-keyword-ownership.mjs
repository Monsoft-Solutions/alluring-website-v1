/**
 * Generates src/seo/keyword-ownership-blog.constant.ts from a JSON export
 * of the live blog_post table.
 *
 * Usage:
 *   psql "$POSTGRES_URL" -t -A -c "SELECT json_agg(row_to_json(t)) FROM (
 *     SELECT slug, title, meta_title, primary_keyword, secondary_keywords,
 *            published_at::date AS published_at
 *     FROM blog_post WHERE status IN ('published','scheduled')
 *     ORDER BY published_at NULLS LAST, slug) t" > /tmp/published-posts.json
 *   node scripts/generate-blog-keyword-ownership.mjs /tmp/published-posts.json
 *
 * The duplicate-cluster map below encodes the consolidation decisions of
 * implementation-plans/2026-08-11-blog-content-pipeline-v2.md §6: each
 * merge candidate points at its cluster's proposed owner via duplicateOf.
 * Retired slugs mirror the blog-related 301s in apps/web/next.config.mjs.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const BLOG_PREFIX_CUTOFF = new Date('2026-01-01T00:00:00Z')

/** slug -> proposed owner URL (plan doc §6). */
const DUPLICATE_OF = {
    // BBL recovery — owner /blog/bbl-recovery-time-miami
    'miami-bbl-recovery-guide': '/blog/bbl-recovery-time-miami',
    'bbl-miami-recovery-faq': '/blog/bbl-recovery-time-miami',
    'bbl-recovery-mistakes-miami': '/blog/bbl-recovery-time-miami',
    'bbl-recovery-miami-moms-guide': '/blog/bbl-recovery-time-miami',
    'how-long-to-recover-from-bbl': '/blog/bbl-recovery-time-miami',
    // Surgeon selection — how-to intent owner
    'choose-plastic-surgeons-miami':
        '/how-to-choose-the-best-plastic-surgeon-in-miami-10-things-to-look-for',
    // Surgeon selection — credential intent owner
    'best-board-certified-plastic-surgeons-miami':
        '/blog/board-certified-plastic-surgeon-miami',
    // BBL post-pregnancy — owner /blog/bbl-miami-post-pregnancy-guide
    'bbl-miami-post-pregnancy-quiz': '/blog/bbl-miami-post-pregnancy-guide',
    'bbl-before-after-miami-mom': '/blog/bbl-miami-post-pregnancy-guide',
    // Tummy tuck × Ozempic
    'ozempic-tummy-tuck-myths-miami': '/blog/tummy-tuck-recovery-ozempic-miami',
    // Tummy tuck myths
    'tummy-tuck-recovery-myths-miami-moms': '/blog/tummy-tuck-myths-miami-moms',
    // Mommy makeover recovery — owner /blog/mommy-makeover-recovery-timeline-miami
    'mommy-makeover-recovery-miami':
        '/blog/mommy-makeover-recovery-timeline-miami',
    'mommy-makeover-recovery-signs':
        '/blog/mommy-makeover-recovery-timeline-miami',
    'how-long-to-recover-from-mommy-makeover':
        '/blog/mommy-makeover-recovery-timeline-miami',
    // Breast reduction × weight loss
    'breast-reduction-weight-loss-quiz':
        '/blog/breast-reduction-weight-loss-miami',
    // Facelift results
    'facelift-results-miami-tips': '/blog/facelift-results-longevity-miami',
    // Tummy tuck vs liposuction — owner is the 2026 post
    'what-is-the-difference-between-tummy-tuck-and-liposuction':
        '/blog/tummy-tuck-vs-liposuction',
    // Commercial-intent query owned by the planned cost hub (intent split:
    // blog owns informational long-tail only)
    'affordable-plastic-surgery-miami': '/plastic-surgery-cost-miami',
}

/**
 * Secondary keywords stripped from specific posts because another post owns
 * that query as its primary (cannibalization found while seeding: three
 * 2026-08-11 pipeline posts all claimed "5 weeks post op breast augmentation").
 */
const STRIP_QUERIES = {
    'when-can-you-work-out-after-breast-augmentation': [
        '5 weeks post op breast augmentation',
    ],
    'swelling-and-asymmetry-after-breast-augmentation-faq': [
        '5 weeks post op breast augmentation',
    ],
}

/** Legacy root posts in a duplicate cluster: GSC evidence required before any 301. */
const GSC_CHECK_FIRST = new Set([
    'how-long-to-recover-from-bbl',
    'how-long-to-recover-from-mommy-makeover',
    'what-is-the-difference-between-tummy-tuck-and-liposuction',
])

/** Retired blog slugs (301 sources in apps/web/next.config.mjs). */
const RETIRED = {
    'mommy-makeover-miami-guide': '/procedures/mommy-makeover-miami',
    'prepare-mommy-makeover-miami': '/procedures/mommy-makeover-miami',
    'mommy-makeover-myths-miami': '/procedures/mommy-makeover-miami',
    'mommy-makeover-recovery-timeline':
        '/blog/mommy-makeover-recovery-timeline-miami',
    'mommy-makeover-recovery-guide':
        '/blog/mommy-makeover-recovery-timeline-miami',
    'mommy-makeover-recovery-time-miami':
        '/blog/mommy-makeover-recovery-timeline-miami',
    'mommy-makeover-recovery-pain-management':
        '/blog/mommy-makeover-recovery-timeline-miami',
    'mommy-makeover-recovery-pain-guide':
        '/blog/mommy-makeover-recovery-timeline-miami',
    'miami-liposuction-cost': '/blog/liposuction-cost-miami',
    'blepharoplasty-candidate-checklist':
        '/blog/blepharoplasty-candidate-miami-checklist',
    'blepharoplasty-miami-candidate':
        '/blog/blepharoplasty-candidate-miami-checklist',
    'best-blepharoplasty-age-miami':
        '/blog/best-blepharoplasty-age-miami-checklist',
    'liposuction-candidate-checklist-miami':
        '/blog/liposuction-candidate-miami',
    'liposuction-miami-moms-faq': '/blog/liposuction-miami-moms-tips',
    'breast-reduction-miami-recovery-candidates':
        '/blog/breast-reduction-candidate-miami',
    'what-is-the-mommy-makeover-procedure': '/procedures/mommy-makeover-miami',
    // NOTE: 'liposuction-cost-miami' (301 → /procedures/liposuction-miami) is
    // deliberately NOT listed: the same URL is the planned cost page in
    // keyword-ownership.constant.ts, whose entry documents the conflict.
    'breast-reduction-cost-miami': '/procedures/breast-reduction-miami',
    'miami-breast-reduction-cost-weight-loss':
        '/procedures/breast-reduction-miami',
    'facelift-cost-miami': '/procedures/facelift-miami',
    'breast-reduction-surgeons-miami': '/procedures/breast-reduction-miami',
    'best-breast-lift-surgeons-miami': '/procedures/breast-lift-miami',
}

const inputPath = process.argv[2]
if (!inputPath) {
    console.error(
        'Usage: node generate-blog-keyword-ownership.mjs <posts.json>'
    )
    process.exit(1)
}

const posts = JSON.parse(readFileSync(inputPath, 'utf8'))

function blogUrl(slug, publishedAt) {
    // Scheduled posts (no publish date yet) will publish post-cutoff
    if (!publishedAt) return `/blog/${slug}`
    return new Date(publishedAt) >= BLOG_PREFIX_CUTOFF
        ? `/blog/${slug}`
        : `/${slug}`
}

const q = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`

const entries = []

for (const post of posts) {
    const slugQuery = post.slug.replace(/-/g, ' ')
    const primaryKeyword = post.primary_keyword?.trim() || slugQuery
    const stripped = new Set(STRIP_QUERIES[post.slug] ?? [])
    const owns = new Set()
    if (slugQuery !== primaryKeyword) owns.add(slugQuery)
    for (const kw of post.secondary_keywords ?? []) {
        const cleaned = String(kw).trim().toLowerCase()
        if (cleaned && cleaned !== primaryKeyword && !stripped.has(cleaned)) {
            owns.add(cleaned)
        }
    }
    // Title vocabulary: a post can rank for words its slug never carries
    // ("BBL Smell Explained: Why Do BBL Stink…" at /why-do-bbl-stink). The
    // normalized title enters ownsQueries so the gate's similarity check
    // sees that vocabulary; without it, synonym-titled candidates score
    // as unclaimed clusters.
    const titleQuery = String(post.title ?? '')
        .toLowerCase()
        .replace(/[^a-z0-9áéíóúñü\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    if (
        titleQuery &&
        titleQuery !== primaryKeyword &&
        titleQuery !== slugQuery
    ) {
        owns.add(titleQuery)
    }

    const duplicateOf = DUPLICATE_OF[post.slug]
    const notes = []
    if (!post.published_at) notes.push('Scheduled, not yet published.')
    if (GSC_CHECK_FIRST.has(post.slug))
        notes.push(
            'Legacy root URL may hold rankings — GSC evidence required before any 301.'
        )

    const lines = [
        `    {`,
        `        url: ${q(blogUrl(post.slug, post.published_at))},`,
        `        slug: ${q(post.slug)},`,
        `        kind: 'blog',`,
        `        intent: 'informational',`,
        `        status: 'live',`,
        `        primaryKeyword: ${q(primaryKeyword)},`,
        `        ownsQueries: [${[...owns].map(q).join(', ')}],`,
    ]
    if (duplicateOf) lines.push(`        duplicateOf: ${q(duplicateOf)},`)
    if (notes.length) lines.push(`        notes: ${q(notes.join(' '))},`)
    lines.push(`    },`)
    entries.push(lines.join('\n'))
}

for (const [slug, redirectsTo] of Object.entries(RETIRED)) {
    entries.push(
        [
            `    {`,
            `        url: ${q('/' + slug)},`,
            `        slug: ${q(slug)},`,
            `        kind: 'blog',`,
            `        intent: 'informational',`,
            `        status: 'retired',`,
            `        primaryKeyword: ${q(slug.replace(/-/g, ' '))},`,
            `        ownsQueries: [],`,
            `        redirectsTo: ${q(redirectsTo)},`,
            `    },`,
        ].join('\n')
    )
}

const header = `/**
 * Keyword Ownership Registry — blog posts
 *
 * GENERATED FILE — regenerate with scripts/generate-blog-keyword-ownership.mjs
 * (see its header for the psql export command). Hand-edits are allowed for
 * cluster corrections but will be overwritten on the next regeneration, so
 * fold them into the generator's maps instead.
 *
 * Seeded from the live blog_post table on ${new Date().toISOString().slice(0, 10)}:
 * every published/scheduled post appears exactly once. Posts in a known
 * duplicate cluster (plan doc §6) carry duplicateOf pointing at the
 * cluster's proposed owner. Retired slugs mirror next.config.mjs 301s so
 * ideation never re-proposes them.
 *
 * @module @workspace/shared/seo/keyword-ownership-blog.constant
 */
import type { OwnedPage } from './keyword-ownership.type'

/** All blog registry entries (live, scheduled and retired) */
export const BLOG_POST_ENTRIES: OwnedPage[] = [
`

const outPath = join(
    dirname(fileURLToPath(import.meta.url)),
    '../src/seo/keyword-ownership-blog.constant.ts'
)
writeFileSync(outPath, header + entries.join('\n') + '\n]\n')
console.log(`Wrote ${entries.length} entries to ${outPath}`)
