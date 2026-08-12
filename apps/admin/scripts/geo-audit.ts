/**
 * GEO Audit
 *
 * Turns the epic's acceptance criterion — "three consecutive posts contain
 * question H2s, a table, cited stats and an explicit CTA marker" — into a
 * command, so it stops being an eyeball check.
 *
 * Reports only what can be counted. Whether the sentence under a heading
 * actually answers it, and whether a table helps anyone decide anything, are
 * judgement calls that belong to the geo-retrievability reviewer. A post can
 * pass every gate here and still be bad; it cannot fail here and be good.
 *
 * Usage:
 *   pnpm --filter @workspace/admin geo:audit              # last 10 pipeline posts
 *   pnpm --filter @workspace/admin geo:audit -- --limit 3
 *   pnpm --filter @workspace/admin geo:audit -- --all     # every published post
 *   pnpm --filter @workspace/admin geo:audit -- --slug bbl-recovery-time-miami
 */
import { config } from 'dotenv'

config({ path: ['.env.local', '.env'] })

import { and, desc, eq, gte, isNotNull } from 'drizzle-orm'

import { db } from '@workspace/db/client'
import { blogPost } from '@workspace/db/schema/blog'
import { runGeoAuditGate } from '@workspace/shared/content'

/** Posts published on or after this date came from the current pipeline. */
const PIPELINE_ERA_START = new Date('2026-01-01')

type Args = {
    limit: number
    all: boolean
    slug: string | null
}

function parseArgs(argv: string[]): Args {
    const limitFlag = argv.indexOf('--limit')
    const slugFlag = argv.indexOf('--slug')

    return {
        limit: limitFlag >= 0 ? Number(argv[limitFlag + 1] ?? 10) : 10,
        all: argv.includes('--all'),
        slug: slugFlag >= 0 ? (argv[slugFlag + 1] ?? null) : null,
    }
}

const CHECK = '✓'
const CROSS = '✗'

function mark(ok: boolean): string {
    return ok ? CHECK : CROSS
}

async function main() {
    const args = parseArgs(process.argv.slice(2))

    const filters = [
        eq(blogPost.status, 'published'),
        isNotNull(blogPost.content),
    ]
    if (args.slug) {
        filters.push(eq(blogPost.slug, args.slug))
    } else if (!args.all) {
        filters.push(gte(blogPost.publishedAt, PIPELINE_ERA_START))
    }

    const query = db
        .select({
            slug: blogPost.slug,
            content: blogPost.content,
            quickAnswer: blogPost.quickAnswer,
            publishedAt: blogPost.publishedAt,
        })
        .from(blogPost)
        .where(and(...filters))
        .orderBy(desc(blogPost.publishedAt))

    const posts =
        args.all || args.slug ? await query : await query.limit(args.limit)

    if (posts.length === 0) {
        console.log('No posts matched.')
        return
    }

    console.log(`\n  ${'slug'.padEnd(46)} QA  tbl  Q-H2   CTA  links`)
    console.log(`  ${'-'.repeat(74)}`)

    let passing = 0

    for (const post of posts) {
        const { passed, failures, analysis } = runGeoAuditGate(
            post.content ?? '',
            { quickAnswer: post.quickAnswer }
        )
        if (passed) passing += 1

        const slug = (post.slug ?? '(no slug)').slice(0, 45).padEnd(46)
        const qa = mark(Boolean(post.quickAnswer?.trim())).padEnd(3)
        const table = mark(analysis.tableCount > 0).padEnd(4)
        const headings =
            `${analysis.questionHeadings.length}/${analysis.headings.length}`.padEnd(
                6
            )
        const cta = mark(analysis.ctaMarkers.length === 1).padEnd(4)
        const links = String(analysis.externalLinkCount).padStart(4)

        console.log(`  ${slug} ${qa} ${table} ${headings} ${cta} ${links}`)

        if (failures.length > 0) {
            console.log(`  ${' '.repeat(46)} ${failures.join('; ')}`)
        }
    }

    // Corpus-level view: one post passing is noise, a trend is the signal.
    const totals = posts.reduce(
        (acc, post) => {
            const { analysis } = runGeoAuditGate(post.content ?? '', {
                quickAnswer: post.quickAnswer,
            })
            return {
                quickAnswers:
                    acc.quickAnswers + (post.quickAnswer?.trim() ? 1 : 0),
                tables: acc.tables + (analysis.tableCount > 0 ? 1 : 0),
                ctaMarkers:
                    acc.ctaMarkers + (analysis.ctaMarkers.length === 1 ? 1 : 0),
                questionH2s: acc.questionH2s + analysis.questionHeadings.length,
                allH2s: acc.allH2s + analysis.headings.length,
            }
        },
        {
            quickAnswers: 0,
            tables: 0,
            ctaMarkers: 0,
            questionH2s: 0,
            allH2s: 0,
        }
    )

    const questionShare =
        totals.allH2s === 0
            ? 0
            : Math.round((totals.questionH2s / totals.allH2s) * 100)

    console.log(`\n  ${posts.length} post(s): ${passing} passing all gates`)
    console.log(
        `  Quick Answers ${totals.quickAnswers}/${posts.length} · tables ${totals.tables}/${posts.length} · CTA markers ${totals.ctaMarkers}/${posts.length} · question H2s ${questionShare}%`
    )
    console.log(
        `\n  Baseline before this epic (2026-08-12, 154 published posts):\n  Quick Answers 0 · tables 13 · CTA markers 0 · question H2s 34% on pipeline-era posts\n`
    )

    // Non-zero exit when nothing passes, so this is usable as a CI gate.
    if (passing === 0) process.exitCode = 1
}

main()
    .catch((error) => {
        console.error('geo-audit failed:', error)
        process.exitCode = 1
    })
    .finally(() => process.exit())
