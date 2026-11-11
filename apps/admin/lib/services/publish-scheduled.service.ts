/**
 * Publish Scheduled Posts
 *
 * Turns `scheduled` blog posts live once their `scheduled_at` has passed, so
 * posts written ahead go out one a day without anyone running SQL (#374).
 *
 * Runs hourly from the cron dispatch. The publish is one conditional UPDATE
 * … RETURNING: two overlapping runs cannot publish a post twice, because the
 * second one's WHERE no longer matches a row the first already flipped.
 *
 * Times follow the admin's convention: `scheduled_at` and `published_at` are
 * `timestamp without time zone` holding UTC wall time, written and compared
 * with a JS Date (drizzle sends `toISOString()`). Never compare them with the
 * database's `now()`, which is Miami wall time.
 *
 * @module @admin/lib/services/publish-scheduled
 */
import { revalidatePath, revalidateTag } from 'next/cache'
import {
    and,
    eq,
    isNotNull,
    isNull,
    lte,
    ne,
    or,
    sql,
    type SQL,
} from 'drizzle-orm'
import { db } from '@workspace/db/client'
import { blogPost } from '@workspace/db/schema/blog'

import {
    CACHE_TAGS,
    revalidateWebAppCache,
} from '@/lib/utils/revalidate-web.util'

export type PublishedScheduledPost = {
    id: string
    slug: string
}

export type PublishScheduledResult = {
    /**
     * - `published`: posts went live and the website confirmed the cache clear
     * - `published-revalidation-failed`: posts went live but the website did
     *   not confirm; it may serve the old blog index / a cached 404 until the
     *   tags are cleared by hand (the log line has the command)
     * - `nothing-due`: no scheduled post was due
     */
    outcome: 'published' | 'published-revalidation-failed' | 'nothing-due'
    published: number
    slugs: string[]
    /**
     * Due `scheduled` rows the job left alone: no slug, no content, a refresh
     * working copy, or mid-pipeline. Counted so a post that silently never
     * goes live shows up in the cron log.
     */
    held: number
    /**
     * `scheduled` rows with no `scheduled_at`: they never publish. The Kanban
     * can still drag a post to 'scheduled' without a time, so these are
     * reported rather than guessed at.
     */
    noScheduledAt: number
}

/** The website's /api/revalidate accepts at most 10 tags per request. */
export const REVALIDATE_TAGS_PER_REQUEST = 10

/** A `scheduled` row whose time has come. A null scheduled_at never matches. */
function dueCondition(now: Date): SQL {
    return and(
        eq(blogPost.status, 'scheduled'),
        isNotNull(blogPost.scheduledAt),
        lte(blogPost.scheduledAt, now)
    )!
}

/**
 * Everything a due row must also satisfy to go live — the same rules the
 * Kanban's manual publish enforces (`updatePipelineStatus`), plus content:
 * the website's post page assumes a published post has a body.
 */
export function publishableScheduledCondition(now: Date): SQL {
    return and(
        dueCondition(now),
        isNotNull(blogPost.slug),
        isNotNull(blogPost.content),
        isNull(blogPost.refreshOfPostId),
        or(
            isNull(blogPost.pipelineProcessingStatus),
            ne(blogPost.pipelineProcessingStatus, 'processing')
        )
    )!
}

/**
 * Publish every due scheduled post, then clear the caches a manual publish
 * clears: the website's blog list, each post's tag and the sitemap URL
 * registry, plus the admin's own sitemap registry copy and blog screens.
 */
export async function runPublishScheduledJob(
    now: Date = new Date()
): Promise<PublishScheduledResult> {
    const rows = await db
        .update(blogPost)
        .set({ status: 'published', publishedAt: now })
        .where(publishableScheduledCondition(now))
        .returning({ id: blogPost.id, slug: blogPost.slug })

    // The WHERE requires a slug; the filter only narrows the type.
    const published = rows.filter(
        (row): row is PublishedScheduledPost => row.slug !== null
    )

    const { held, noScheduledAt } = await countStuckScheduledPosts(now)
    if (held > 0) {
        console.warn(
            `[publish-scheduled] ${held} due scheduled post(s) held back (no slug, no content, a refresh working copy, or processing)`
        )
    }
    if (noScheduledAt > 0) {
        console.warn(
            `[publish-scheduled] ${noScheduledAt} scheduled post(s) have no scheduled_at and will never publish`
        )
    }
    const counts = { held, noScheduledAt }

    if (published.length === 0) {
        return { outcome: 'nothing-due', published: 0, slugs: [], ...counts }
    }

    const slugs = published.map((post) => post.slug)
    console.log(
        `[publish-scheduled] published ${slugs.length} post(s) at ${now.toISOString()}: ${published
            .map((post) => `${post.slug} (${post.id})`)
            .join(', ')}`
    )

    revalidatePath('/blog/pipeline')
    revalidatePath('/blog/posts')
    revalidatePath('/')

    const tags = [
        CACHE_TAGS.BLOG_POSTS,
        CACHE_TAGS.SITEMAP_URLS,
        ...slugs.map((slug) => CACHE_TAGS.blogPostBySlug(slug)),
    ]
    const revalidated = await revalidateInBatches(tags)
    revalidateTag(CACHE_TAGS.SITEMAP_URLS as string, { expire: 0 })

    if (!revalidated) {
        // The rows are no longer 'scheduled', so the next run will not retry.
        // revalidate.sh splits the tags into requests of 10 itself.
        console.error(
            `[publish-scheduled] published ${slugs.join(', ')} but the website did not confirm the cache clear; run: bash blog/tools/revalidate.sh ${tags.join(' ')}`
        )
        return {
            outcome: 'published-revalidation-failed',
            published: slugs.length,
            slugs,
            ...counts,
        }
    }

    return { outcome: 'published', published: slugs.length, slugs, ...counts }
}

/**
 * Send the tags in requests of at most 10, retrying a failed request once.
 * True only when every request was confirmed.
 */
async function revalidateInBatches(tags: string[]): Promise<boolean> {
    let ok = true
    for (let i = 0; i < tags.length; i += REVALIDATE_TAGS_PER_REQUEST) {
        const batch = tags.slice(i, i + REVALIDATE_TAGS_PER_REQUEST)
        const confirmed =
            (await revalidateWebAppCache(batch)) ||
            (await revalidateWebAppCache(batch))
        ok = ok && confirmed
    }
    return ok
}

/**
 * After the publish: due rows still 'scheduled' (held back), and 'scheduled'
 * rows with no time at all (never due).
 */
async function countStuckScheduledPosts(
    now: Date
): Promise<{ held: number; noScheduledAt: number }> {
    const [row] = await db
        .select({
            held: sql<number>`count(*) filter (where ${and(isNotNull(blogPost.scheduledAt), lte(blogPost.scheduledAt, now))})`.mapWith(
                Number
            ),
            noScheduledAt:
                sql<number>`count(*) filter (where ${isNull(blogPost.scheduledAt)})`.mapWith(
                    Number
                ),
        })
        .from(blogPost)
        .where(eq(blogPost.status, 'scheduled'))
    return { held: row?.held ?? 0, noScheduledAt: row?.noScheduledAt ?? 0 }
}
