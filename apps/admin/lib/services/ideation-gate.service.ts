/**
 * Ideation Gate Service
 *
 * Server-side wrapper around the pure topic gate in @workspace/shared/seo.
 * Adds a live-database overlay so posts published or scheduled AFTER the
 * checked-in registry was seeded still participate in ownership checks.
 *
 * Used by the generate-topics route (verdicts on idea cards) and by
 * createPipelinePost (hard enforcement — a rejected topic cannot become
 * a post).
 *
 * @module @/lib/services/ideation-gate
 */
import { and, inArray, isNotNull } from 'drizzle-orm'

import { db } from '@workspace/db/client'
import { blogPost } from '@workspace/db/schema/blog'
import { getBlogPostUrl } from '@workspace/shared'
import {
    BLOG_POST_ENTRIES,
    evaluateTopicCandidate,
    type OwnedPage,
    type TopicCandidate,
    type TopicVerdict,
} from '@workspace/shared/seo'

/**
 * Build overlay entries for published/scheduled posts that are not in the
 * checked-in registry yet (published after the last seed).
 */
async function getLiveOverlayEntries(): Promise<OwnedPage[]> {
    const knownSlugs = new Set(
        BLOG_POST_ENTRIES.map((e) => e.slug).filter(Boolean)
    )

    const posts = await db
        .select({
            slug: blogPost.slug,
            title: blogPost.title,
            primaryKeyword: blogPost.primaryKeyword,
            secondaryKeywords: blogPost.secondaryKeywords,
            publishedAt: blogPost.publishedAt,
        })
        .from(blogPost)
        .where(
            and(
                inArray(blogPost.status, ['published', 'scheduled']),
                isNotNull(blogPost.slug)
            )
        )

    return posts
        .filter((p) => p.slug && !knownSlugs.has(p.slug))
        .map((p) => {
            const slugQuery = p.slug!.replace(/-/g, ' ')
            const primaryKeyword = p.primaryKeyword?.trim() || slugQuery
            const owns = new Set<string>()
            if (slugQuery !== primaryKeyword) owns.add(slugQuery)
            for (const kw of p.secondaryKeywords ?? []) {
                const cleaned = kw.trim().toLowerCase()
                if (cleaned && cleaned !== primaryKeyword) owns.add(cleaned)
            }
            return {
                // Scheduled posts have no publishedAt yet; they publish post-cutoff
                url: p.publishedAt
                    ? getBlogPostUrl(p.slug!, p.publishedAt)
                    : `/blog/${p.slug}`,
                slug: p.slug!,
                kind: 'blog',
                intent: 'informational',
                status: 'live',
                primaryKeyword,
                ownsQueries: [...owns],
            } satisfies OwnedPage
        })
}

/** A topic candidate decorated with its gate verdict */
export type GatedTopic<T extends TopicCandidate> = T & { gate: TopicVerdict }

/**
 * Evaluate candidates against the registry + live overlay.
 * One DB round-trip regardless of candidate count.
 */
export async function evaluateTopicCandidates<T extends TopicCandidate>(
    candidates: T[]
): Promise<GatedTopic<T>[]> {
    const extraEntries = await getLiveOverlayEntries()
    return candidates.map((candidate) => ({
        ...candidate,
        gate: evaluateTopicCandidate(candidate, { extraEntries }),
    }))
}

/** Evaluate a single candidate (used by createPipelinePost enforcement) */
export async function evaluateSingleTopic(
    candidate: TopicCandidate
): Promise<TopicVerdict> {
    const [result] = await evaluateTopicCandidates([candidate])
    return result!.gate
}
