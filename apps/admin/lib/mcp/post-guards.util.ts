/**
 * MCP Post Guards
 *
 * The pure rules the MCP write tools enforce before touching a post. Kept
 * DB-free so tests pin them; `mcp-post.service` loads the rows and asks.
 *
 * @module @/lib/mcp/post-guards.util
 */
import type { BlogPost } from '@workspace/db/schema/blog'
import {
    BLOG_POST_ENTRIES,
    MARKETING_PAGE_ENTRIES,
} from '@workspace/shared/seo'

/** Content-refresh statuses that hold a candidate open on a post. */
export type OpenRefreshStatus = 'pending' | 'in_progress' | 'ready_for_review'

/**
 * Why an existing post may not be written right now, or null when it may.
 *
 * - A refresh working copy reaches the site only by being merged onto its
 *   original from the admin's review screen.
 * - A post the pipeline is processing would have the edit overwritten when
 *   the phase finishes.
 * - An in-progress refresh run is rewriting the post; its apply would
 *   overwrite the edit. Pending and ready-for-review candidates are fine —
 *   the write dismisses them.
 */
export function getWriteBlocker(
    post: Pick<BlogPost, 'refreshOfPostId' | 'pipelineProcessingStatus'>,
    openRefreshStatus: OpenRefreshStatus | null
): string | null {
    if (post.refreshOfPostId) {
        return 'This is a hidden refresh working copy. Edit the original post instead (refreshOfPostId), or review the refresh in the admin.'
    }
    if (post.pipelineProcessingStatus === 'processing') {
        return 'The AI pipeline is processing this post right now; the edit would be overwritten. Try again when it finishes.'
    }
    if (openRefreshStatus === 'in_progress') {
        return 'An automatic refresh is rewriting this post right now; its result would overwrite the edit. Try again when it finishes, or cancel it in the admin.'
    }
    return null
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** `/blog/<x>` routes that are not posts. */
const RESERVED_BLOG_SEGMENTS = new Set([
    'authors',
    'categories',
    'tags',
    'page',
    'blog',
])

/**
 * Why a slug cannot be used for a new post, or null. Covers what can be
 * checked without the web app's file tree: format, `/blog` subroutes, and the
 * keyword registry (a live or retired post's slug, or a marketing page at
 * `/<slug>`). Uniqueness in `blog_post` is the caller's DB check.
 *
 * Not covered here: redirects in apps/web/next.config.mjs and top-level app
 * routes — `blog/tools/slug_check.mjs` checks those from a checkout.
 */
export function getSlugProblem(slug: string): string | null {
    if (!SLUG_PATTERN.test(slug)) {
        return 'Slug must be lowercase words joined by single hyphens (a-z, 0-9).'
    }
    if (slug.length > 120) {
        return 'Slug is longer than 120 characters.'
    }
    if (RESERVED_BLOG_SEGMENTS.has(slug)) {
        return `"${slug}" is a /blog subroute, not a post slug.`
    }
    const registered = BLOG_POST_ENTRIES.find((entry) => entry.slug === slug)
    if (registered) {
        return `"${slug}" is already in the keyword registry as a ${registered.status} post.`
    }
    if (MARKETING_PAGE_ENTRIES.some((entry) => entry.url === `/${slug}`)) {
        return `/${slug} is a marketing page.`
    }
    return null
}

/** ~200 words a minute, the pipeline's own estimate. Minimum 1. */
export function estimateReadingTime(content: string): number {
    const words = content.split(/\s+/).filter(Boolean).length
    return Math.max(1, Math.ceil(words / 200))
}

/** The house FAQ heading (`blog/tools/lib/bloglib.py` FAQ_H2). */
const FAQ_H2 = '## Frequently asked questions'

/**
 * FAQ pairs from the body's FAQ section — `### Question?` then one answer
 * paragraph — the same parse `blog/tools` uses to fill `faqs` (and with it
 * the FAQPage schema). Empty when the body has no FAQ section.
 */
export function parseFaqSection(
    content: string
): { question: string; answer: string }[] {
    const start = content.indexOf(FAQ_H2)
    if (start === -1) return []
    const section = content
        .slice(start + FAQ_H2.length)
        .split('\n## ')[0]!
        .trim()
    return [
        ...section.matchAll(
            /^### (.+?)\n\n([\s\S]+?)(?=\n\n### |$(?![\s\S]))/gm
        ),
    ].map((match) => ({
        question: match[1]!.trim(),
        answer: match[2]!.replace(/\s+/g, ' ').trim(),
    }))
}

/**
 * Whether a field's new value equals the stored one. FAQs compare by
 * question and answer: Postgres returns jsonb keys in its own order, so a
 * plain JSON.stringify would see every FAQ list as changed.
 */
export function fieldValuesEqual(
    field: string,
    next: unknown,
    stored: unknown
): boolean {
    if (field === 'faqs') {
        const normalize = (value: unknown) =>
            JSON.stringify(
                ((value ?? []) as { question: string; answer: string }[]).map(
                    (faq) => [faq.question, faq.answer]
                )
            )
        if (next === null || stored === null) return next === stored
        return normalize(next) === normalize(stored)
    }
    return JSON.stringify(next) === JSON.stringify(stored ?? null)
}
