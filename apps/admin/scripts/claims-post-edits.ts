/**
 * Claims Canon Post Edits (issue #354)
 *
 * The blog half of the claims sweep works from one edit file per post:
 * exact find-and-replace pairs on the body plus whole-field replacements
 * for the other reader-facing fields. This script is the only thing that
 * reads or writes those files against a database, so the rewrite agents,
 * the local rehearsal and the production run all apply the same edits the
 * same way.
 *
 * Edit file (JSON):
 *   {
 *     "slug": "how-to-sleep-after-bbl",
 *     "content_edits": [{ "old": "exact text, once", "new": "replacement" }],
 *     "fields": { "title", "meta_title", "meta_description", "excerpt",
 *                 "quick_answer", "faqs": [{ "question", "answer" }] },
 *     "notes": ["anything a person should know"],
 *     "base_sha": "set by check; apply refuses a post that changed since"
 *   }
 * Only the fields present are replaced.
 *
 * Usage (from apps/admin):
 *   pnpm exec tsx scripts/claims-post-edits.ts check <file.json>
 *       Applies in memory, then reports pairs that don't match exactly once,
 *       content the renderer would change (validateGeneratedMdx), invalid
 *       tokens or typed prices, and canon pattern hits per field. Writes
 *       base_sha back into the file. Exit 1 on any blocking problem.
 *   pnpm exec tsx scripts/claims-post-edits.ts apply <dir> [--write] [--replay]
 *       Checks every file in <dir> again, then (with --write) saves, per post
 *       in one transaction, a `blog_post_revision` (reason `claims-canon`)
 *       and the new fields, and dismisses the post's open refresh
 *       candidates. Without --write it is a dry run. Runs against whatever
 *       POSTGRES_URL the env gives it: rehearse on a `--db clone` worktree.
 *       After writing it revalidates the web app's blog cache (`blog-posts`
 *       and each post's `blog-post-<slug>`, through POST /api/revalidate with
 *       NEXT_PUBLIC_WEB_URL and REVALIDATION_SECRET from the env): the post
 *       detail sits in Vercel's data cache for 24 hours and survives
 *       deploys, so without it readers keep the old text. With either
 *       variable missing it prints what to revalidate instead.
 *
 * A post the AI pipeline is processing, a refresh working copy, and a post
 * whose automatic refresh is running (`in_progress`) are refused, as the
 * admin MCP refuses them: the running job would overwrite the edit.
 */
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { config } from 'dotenv'

import type { OpenRefreshStatus } from '../lib/mcp/post-guards.util'

config({ path: ['.env.local', '.env'] })

type Faq = { question: string; answer: string }

type EditFile = {
    slug: string
    content_edits?: { old: string; new: string }[]
    fields?: {
        title?: string
        meta_title?: string | null
        meta_description?: string
        excerpt?: string | null
        quick_answer?: string | null
        faqs?: Faq[] | null
    }
    notes?: string[]
    base_sha?: string
}

type PostFields = {
    title: string
    content: string
    metaTitle: string | null
    metaDescription: string | null
    excerpt: string | null
    quickAnswer: string | null
    faqs: Faq[] | null
}

/** The fields an edit file can change, hashed to detect drift. */
function fieldsSha(post: PostFields): string {
    return createHash('sha256')
        .update(
            JSON.stringify([
                post.title,
                post.content,
                post.metaTitle,
                post.metaDescription,
                post.excerpt,
                post.quickAnswer,
                post.faqs,
            ])
        )
        .digest('hex')
}

async function main() {
    // Imported after dotenv so @workspace/db reads the right POSTGRES_URL.
    const { and, eq, inArray } = await import('drizzle-orm')
    const { db } = await import('@workspace/db/client')
    const { blogPost, blogPostRevision, contentRefresh } = await import(
        '@workspace/db/schema/blog'
    )
    const { priceLine, pricingSettings, procedurePricing } = await import(
        '@workspace/db/schema/pricing'
    )
    const { buildPricingSnapshotFromRows } = await import(
        '@workspace/shared/claims/prices'
    )
    const { findClaimHits } = await import('@workspace/shared/claims/patterns')
    const { validateGeneratedMdx } = await import(
        '@workspace/ai/functions/validate-generated-mdx.function'
    )
    const { findClaimTokenErrors } = await import(
        '../lib/utils/claim-token-fields.util'
    )
    const { buildRevisionValues } = await import(
        '../lib/utils/refresh-merge.util'
    )
    const { getWriteBlocker } = await import('../lib/mcp/post-guards.util')
    const { CACHE_TAGS } = await import('@workspace/shared/cache')

    const [mode, target, ...rest] = process.argv.slice(2)

    // --replay: the edit restores an earlier state (e.g. the token conversion),

    // so canon hits in it are reported, not blocking. Renderer and token

    // checks still block.

    const replay = rest.includes('--replay')
    if ((mode !== 'check' && mode !== 'apply') || !target) {
        console.error(
            'usage: claims-post-edits.ts check <file> | apply <dir> [--write]'
        )
        process.exit(2)
    }

    const [lines, procedures, settings] = await Promise.all([
        db.select().from(priceLine),
        db.select().from(procedurePricing),
        db.select().from(pricingSettings).limit(1),
    ])
    const pricing = buildPricingSnapshotFromRows({
        lines,
        procedures,
        settings: settings[0] ?? null,
    })

    /** Applies one edit file in memory and lists everything wrong with it. */
    async function evaluate(file: string) {
        const edit = JSON.parse(readFileSync(file, 'utf8')) as EditFile
        const [post] = await db
            .select()
            .from(blogPost)
            .where(eq(blogPost.slug, edit.slug))
            .limit(1)
        if (!post)
            return {
                edit,
                post: null,
                next: null,
                blocking: [`no post with slug ${edit.slug}`],
                review: [],
            }

        const before: PostFields = {
            title: post.title,
            content: post.content ?? '',
            metaTitle: post.metaTitle,
            metaDescription: post.metaDescription,
            excerpt: post.excerpt,
            quickAnswer: post.quickAnswer,
            faqs: (post.faqs as Faq[] | null) ?? null,
        }
        const blocking: string[] = []
        const review: string[] = []

        // The same guard as the MCP: a running pipeline phase or refresh
        // would overwrite the edit when it finishes.
        const [openRefresh] = await db
            .select({ status: contentRefresh.status })
            .from(contentRefresh)
            .where(
                and(
                    eq(contentRefresh.blogPostId, post.id),
                    inArray(contentRefresh.status, [
                        'pending',
                        'in_progress',
                        'ready_for_review',
                    ])
                )
            )
            .limit(1)
        const blocker = getWriteBlocker(
            post,
            (openRefresh?.status as OpenRefreshStatus | undefined) ?? null
        )
        if (blocker) blocking.push(blocker)

        const sha = fieldsSha(before)
        if (edit.base_sha && edit.base_sha !== sha) {
            blocking.push(
                'the post changed since this file was checked (base_sha mismatch)'
            )
        }

        let content = before.content
        for (const [index, pair] of (edit.content_edits ?? []).entries()) {
            // JSON can carry null; replace() would then write the word "null"
            // into the post. A deletion is an empty string.
            if (typeof pair.old !== 'string' || typeof pair.new !== 'string') {
                blocking.push(
                    `content_edits[${index}]: "old" and "new" must be strings (use "" to delete)`
                )
                continue
            }
            const count = pair.old ? content.split(pair.old).length - 1 : 0
            if (count !== 1) {
                blocking.push(
                    `content_edits[${index}] matches ${count} times (needs exactly 1): ${pair.old.slice(0, 120)}`
                )
                continue
            }
            content = content.replace(pair.old, () => pair.new)
        }

        const f = edit.fields ?? {}
        const next: PostFields = {
            title: f.title ?? before.title,
            content,
            metaTitle:
                f.meta_title !== undefined ? f.meta_title : before.metaTitle,
            metaDescription: f.meta_description ?? before.metaDescription,
            excerpt: f.excerpt !== undefined ? f.excerpt : before.excerpt,
            quickAnswer:
                f.quick_answer !== undefined
                    ? f.quick_answer
                    : before.quickAnswer,
            faqs: f.faqs !== undefined ? f.faqs : before.faqs,
        }

        // A replayed earlier state can still hold typed prices the later
        // edits remove, so those are reported; every other renderer or token
        // problem still blocks.
        const typedPrice = (problem: string) =>
            replay && /typed[- ]price|typed Alluring price/i.test(problem)
        const mdx = validateGeneratedMdx(next.content, { pricing })
        if (!mdx.clean) {
            for (const action of mdx.actions) {
                const line = `renderer: ${action.kind}: ${action.detail}`
                ;(typedPrice(line) ? review : blocking).push(line)
            }
        }
        for (const problem of findClaimTokenErrors(next, pricing)) {
            const line = `tokens: ${problem}`
            ;(typedPrice(line) ? review : blocking).push(line)
        }

        const texts: [string, string | null, 'text' | 'title'][] = [
            ['title', next.title, 'title'],
            ['meta_title', next.metaTitle, 'title'],
            ['meta_description', next.metaDescription, 'text'],
            ['excerpt', next.excerpt, 'text'],
            ['quick_answer', next.quickAnswer, 'text'],
            ['content', next.content, 'text'],
            ...(next.faqs ?? []).flatMap(
                (faq, i): [string, string, 'text'][] => [
                    [`faqs[${i}].question`, faq.question, 'text'],
                    [`faqs[${i}].answer`, faq.answer, 'text'],
                ]
            ),
        ]
        for (const [field, text, scope] of texts) {
            if (!text) continue
            const hits = [
                ...findClaimHits(text, { scope: 'text' }),
                ...(scope === 'title'
                    ? findClaimHits(text, { scope: 'title' })
                    : []),
            ]
            for (const hit of hits) {
                if (hit.id === 'PR17' || hit.id === 'MD10') continue // allowed-set checks: judged by the rewriter
                const at = text.toLowerCase().indexOf(hit.match.toLowerCase())
                const ctx =
                    at >= 0
                        ? text
                              .slice(
                                  Math.max(0, at - 70),
                                  at + hit.match.length + 70
                              )
                              .replace(/\s+/g, ' ')
                        : hit.match
                const line = `${field} ${hit.id} [${hit.severity}] "${hit.match}" … ${ctx}`
                ;(hit.severity === 'fail' && !replay ? blocking : review).push(
                    line
                )
            }
        }
        return { edit, post, before, next, sha, blocking, review }
    }

    /**
     * The web app keeps each post in `unstable_cache` (tags `blog-posts`
     * and `blog-post-<slug>`, 24 h) and Vercel keeps that across deploys,
     * so a database write alone never reaches readers. The route takes ten
     * tags a request.
     */
    async function revalidateBlog(slugs: string[]) {
        const tags = [
            CACHE_TAGS.BLOG_POSTS,
            ...slugs.map((slug) => CACHE_TAGS.blogPostBySlug(slug)),
        ]
        // The admin env module would demand every admin variable; this
        // script only needs these two, read after dotenv above.
        /* eslint-disable no-restricted-properties */
        const webUrl = process.env.NEXT_PUBLIC_WEB_URL
        const secret = process.env.REVALIDATION_SECRET
        /* eslint-enable no-restricted-properties */
        if (!webUrl || !secret) {
            console.log(
                `Not revalidated (NEXT_PUBLIC_WEB_URL or REVALIDATION_SECRET is unset). POST ${webUrl ?? '<web url>'}/api/revalidate, ten tags at a time: ${tags.join(', ')}`
            )
            return
        }
        for (let at = 0; at < tags.length; at += 10) {
            const batch = tags.slice(at, at + 10)
            try {
                const response = await fetch(`${webUrl}/api/revalidate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ secret, tags: batch }),
                })
                console.log(
                    response.ok
                        ? `revalidated ${batch.join(', ')}`
                        : `revalidation failed (${response.status}) for ${batch.join(', ')}: retry them by hand`
                )
            } catch (error) {
                console.log(
                    `revalidation failed for ${batch.join(', ')}: ${error instanceof Error ? error.message : String(error)}`
                )
            }
        }
    }

    if (mode === 'check') {
        const result = await evaluate(target)
        if (result.post && result.sha && !result.edit.base_sha) {
            writeFileSync(
                target,
                JSON.stringify(
                    { ...result.edit, base_sha: result.sha },
                    null,
                    1
                )
            )
        }
        console.log(
            JSON.stringify(
                {
                    slug: result.edit.slug,
                    ok: result.blocking.length === 0,
                    blocking: result.blocking,
                    review: result.review,
                },
                null,
                1
            )
        )
        process.exit(result.blocking.length ? 1 : 0)
    }

    const write = rest.includes('--write')
    const files = readdirSync(target)
        .filter((name) => name.endsWith('.json'))
        .sort()
    let failed = 0
    let written = 0
    const writtenSlugs: string[] = []
    for (const name of files) {
        const result = await evaluate(join(target, name))
        if (result.blocking.length || !result.post || !result.next) {
            failed += 1
            console.log(`FAIL ${name}\n  ${result.blocking.join('\n  ')}`)
            continue
        }
        if (!write) continue
        const { post, next } = result
        await db.transaction(async (tx) => {
            await tx
                .insert(blogPostRevision)
                .values(buildRevisionValues(post, 'claims-canon'))
            await tx.update(blogPost).set(next).where(eq(blogPost.id, post.id))
        })
        const dismissed = await db
            .update(contentRefresh)
            .set({ status: 'dismissed' })
            .where(
                and(
                    eq(contentRefresh.blogPostId, post.id),
                    inArray(contentRefresh.status, [
                        'pending',
                        'ready_for_review',
                    ])
                )
            )
            .returning({
                id: contentRefresh.id,
                workingPostId: contentRefresh.workingPostId,
            })
        for (const row of dismissed) {
            if (row.workingPostId)
                await db
                    .delete(blogPost)
                    .where(eq(blogPost.id, row.workingPostId))
        }
        written += 1
        if (post.slug) writtenSlugs.push(post.slug)
    }
    console.log(
        `${files.length} file(s): ${failed} failing, ${write ? `${written} written` : 'dry run'}.`
    )
    if (written > 0) await revalidateBlog(writtenSlugs)
    process.exit(failed ? 1 : 0)
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})
