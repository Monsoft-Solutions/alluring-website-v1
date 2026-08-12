/**
 * Quick Answer Backfill
 *
 * Writes `blog_post.quick_answer` for posts that already exist.
 *
 * Why this and not a full restructure: phases 1–4 of the epic improve the
 * ~2–4 posts written each month. This improves all 154 at once, and it is the
 * safe half — it reads existing content, writes one nullable column, and never
 * touches an article body. Rewriting live, ranking pages to add tables and
 * question headings is a different risk profile and belongs in the refresh
 * flow, one cluster at a time with Search Console evidence.
 *
 * Dry run by default. Nothing is written until `--write` is passed, and even
 * then the result lands in a column the post editor exposes, so a human sees
 * every value before it reaches a reader.
 *
 * One thing to watch when reviewing: a handful of existing posts open with
 * their own "## Quick Summary" section, which the writer prompt no longer
 * produces. On those the backfilled Quick Answer sits directly above a section
 * covering the same ground. Not wrong, but redundant — worth deleting the old
 * section by hand when it comes up.
 *
 * Usage:
 *   pnpm --filter @workspace/admin geo:backfill                    # dry run, 5 posts
 *   pnpm --filter @workspace/admin geo:backfill -- --limit 20
 *   pnpm --filter @workspace/admin geo:backfill -- --limit 20 --write
 *   pnpm --filter @workspace/admin geo:backfill -- --slug bbl-cost-miami --write
 *   pnpm --filter @workspace/admin geo:backfill -- --overwrite --write   # redo existing
 */
import { config } from 'dotenv'

config({ path: ['.env.local', '.env'] })

import { and, desc, eq, isNotNull, isNull, sql } from 'drizzle-orm'

import { db } from '@workspace/db/client'
import { blogPost } from '@workspace/db/schema/blog'
import { extractQuickAnswer } from '@workspace/ai/functions'
import { serializeQuickAnswer } from '@workspace/shared/content'

/**
 * Sequential rather than parallel, deliberately.
 *
 * This is a one-off catch-up over a corpus that took two years to accumulate;
 * there is no deadline worth a rate-limit storm or a half-applied batch.
 */
const DELAY_BETWEEN_POSTS_MS = 500

type Args = {
    limit: number
    write: boolean
    overwrite: boolean
    slug: string | null
}

function parseArgs(argv: string[]): Args {
    const limitFlag = argv.indexOf('--limit')
    const slugFlag = argv.indexOf('--slug')

    return {
        limit: limitFlag >= 0 ? Number(argv[limitFlag + 1] ?? 5) : 5,
        write: argv.includes('--write'),
        overwrite: argv.includes('--overwrite'),
        slug: slugFlag >= 0 ? (argv[slugFlag + 1] ?? null) : null,
    }
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
    const args = parseArgs(process.argv.slice(2))

    const filters = [
        eq(blogPost.status, 'published'),
        isNotNull(blogPost.content),
    ]
    if (args.slug) filters.push(eq(blogPost.slug, args.slug))
    if (!args.overwrite) filters.push(isNull(blogPost.quickAnswer))

    const posts = await db
        .select({
            id: blogPost.id,
            slug: blogPost.slug,
            title: blogPost.title,
            content: blogPost.content,
            primaryKeyword: blogPost.primaryKeyword,
        })
        .from(blogPost)
        .where(and(...filters))
        .orderBy(desc(blogPost.publishedAt))
        .limit(args.slug ? 1 : args.limit)

    const [{ remaining } = { remaining: 0 }] = await db
        .select({ remaining: sql<number>`count(*)::int` })
        .from(blogPost)
        .where(
            and(
                eq(blogPost.status, 'published'),
                isNotNull(blogPost.content),
                isNull(blogPost.quickAnswer)
            )
        )

    console.log(
        `\n${args.write ? 'WRITING' : 'DRY RUN — pass --write to save'}`
    )
    console.log(
        `${posts.length} post(s) in this batch · ${remaining} still without a Quick Answer\n`
    )

    if (posts.length === 0) return

    let succeeded = 0
    let failed = 0

    for (const [index, post] of posts.entries()) {
        const label = `[${index + 1}/${posts.length}] ${post.slug ?? post.id}`

        try {
            const quickAnswer = await extractQuickAnswer({
                content: post.content ?? '',
                title: post.title,
                primaryKeyword: post.primaryKeyword ?? undefined,
            })

            const serialized = serializeQuickAnswer(quickAnswer)
            const words = quickAnswer.answer.split(/\s+/).filter(Boolean).length

            console.log(`${label}`)
            console.log(`  Q: ${quickAnswer.question}`)
            console.log(`  A: ${quickAnswer.answer}`)
            console.log(`  (${words} words)\n`)

            if (args.write) {
                await db
                    .update(blogPost)
                    .set({ quickAnswer: serialized })
                    .where(eq(blogPost.id, post.id))
            }

            succeeded += 1
        } catch (error) {
            failed += 1
            console.error(
                `${label} FAILED: ${error instanceof Error ? error.message : String(error)}\n`
            )
        }

        if (index < posts.length - 1) await sleep(DELAY_BETWEEN_POSTS_MS)
    }

    console.log(
        `Done. ${succeeded} extracted, ${failed} failed${args.write ? '' : ' (nothing written)'}.`
    )
    if (args.write && succeeded > 0) {
        console.log(
            'Review them in the admin post editor (SEO tab) before they go out.'
        )
    }
}

main()
    .catch((error) => {
        console.error('backfill failed:', error)
        process.exitCode = 1
    })
    .finally(() => process.exit())
