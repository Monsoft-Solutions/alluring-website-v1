/**
 * Claim tokens in DB text, resolved against the live pricing (issue #354).
 *
 * Blog posts, FAQs, quick answers, excerpts, meta fields and other DB text
 * name prices and canon sentences as tokens (`[[price:bbl]]`; the grammar is
 * in `@workspace/shared/claims/tokens`). Resolve them here, before the text
 * reaches MDX or a component:
 *
 * - `markdown` for a post body or anything rendered as Markdown: a discounted
 *   price becomes "~~$5,500~~ $4,400".
 * - `text` for titles, meta descriptions, JSON-LD and `llms*.txt`:
 *   "$4,400 (20% off $5,500)".
 *
 * A token that cannot be resolved renders as nothing and is logged with the
 * `context` you pass (a post slug), so a reader never sees raw brackets.
 *
 * @module lib/claims/resolve-claims
 */
import 'server-only'

import {
    hasClaimTokens,
    resolveClaimTokens,
    resolveClaimTokensDetailed,
    resolveClaimTokensIn,
    type ClaimTokenIssue,
    type ClaimTokenMode,
    type ResolvedClaimText,
} from '@workspace/shared/claims/tokens'

import {
    resolvePostDetailClaims,
    resolvePostTextClaims,
} from '@/lib/claims/post-claims.util'
import { getPricing } from '@/lib/queries/pricing.query'

function logIssue(context: string | undefined) {
    return (issue: ClaimTokenIssue) => {
        console.error(
            `[claims] Unresolved token ${issue.raw}${context ? ` in ${context}` : ''}: ${issue.reason}`
        )
    }
}

function logFieldIssue(context: string) {
    return (field: string, issue: ClaimTokenIssue) =>
        logIssue(`${context} ${field}`)(issue)
}

/**
 * Resolves every claim token in a text.
 *
 * @param text - DB text that may contain tokens
 * @param mode - `markdown` or `text`
 * @param context - Where the text comes from, for the log (e.g. a post slug)
 */
export async function resolveClaims(
    text: string,
    mode: ClaimTokenMode,
    context?: string
): Promise<string> {
    if (!hasClaimTokens(text)) return text
    const result = await resolveClaimsDetailed(text, mode, context)
    return result.text
}

/**
 * {@link resolveClaims}, plus whether any resolved price is discounted. A
 * surface that sees `discounted` shows the 456.062 statement
 * (`getDiscountStatementText`) next to the prices.
 */
export async function resolveClaimsDetailed(
    text: string,
    mode: ClaimTokenMode,
    context?: string
): Promise<ResolvedClaimText> {
    const pricing = await getPricing()
    const result = resolveClaimTokensDetailed(text, { mode, pricing })
    result.issues.forEach(logIssue(context))
    return result
}

/**
 * Resolves the tokens in every string of a plain value: a post's FAQ list,
 * a JSON-LD object.
 */
export async function resolveClaimsIn<T>(
    value: T,
    mode: ClaimTokenMode,
    context?: string
): Promise<T> {
    const pricing = await getPricing()
    return resolveClaimTokensIn(value, {
        mode,
        pricing,
        onIssue: logIssue(context),
    })
}

/**
 * A post detail with every token resolved (`content` as Markdown, the rest
 * as text) and the 456.062 statement the template shows when a resolved
 * price is discounted. Both post routes read posts through this, so the
 * page, its metadata and its structured data all see the same text.
 */
export async function resolvePostClaims<
    T extends Parameters<typeof resolvePostDetailClaims>[0] & { slug: string },
>(post: T): Promise<T & { discountStatement: string | null }> {
    const pricing = await getPricing()
    return resolvePostDetailClaims(
        post,
        pricing,
        logFieldIssue(`post ${post.slug}`)
    )
}

/**
 * Titles and excerpts of a list of posts (cards, search, related posts,
 * `llms*.txt`), resolved as text. One pricing read for the whole list.
 */
export async function resolvePostListClaims<
    T extends { slug: string; title: string; excerpt?: string | null },
>(posts: T[]): Promise<T[]> {
    if (
        !posts.some(
            (post) =>
                hasClaimTokens(post.title) ||
                (post.excerpt ? hasClaimTokens(post.excerpt) : false)
        )
    ) {
        return posts
    }
    const pricing = await getPricing()
    return posts.map((post) =>
        resolvePostTextClaims(post, pricing, logFieldIssue(`post ${post.slug}`))
    )
}

/**
 * A procedure's copy with every claim token resolved: `content` (compiled as
 * MDX) as Markdown, every other string (title, descriptions, meta, FAQs,
 * quick answer, benefits, steps) as text. Data files write an Alluring price
 * inside prose as a token (`[[price:tummy-tuck:full]]`) and the routes that
 * print procedure copy read it through here, so no figure is typed in a
 * data file. A price that is its own element on the page (the hero, the
 * fact rail, a price table) is a `PriceTag` instead.
 */
export async function resolveProcedureClaims<
    T extends { slug: string; content?: string },
>(procedure: T): Promise<T> {
    const pricing = await getPricing()
    const onIssue = logIssue(`procedure ${procedure.slug}`)
    const { content, ...rest } = procedure
    const resolved = resolveClaimTokensIn(rest, {
        mode: 'text',
        pricing,
        onIssue,
    })
    return {
        ...resolved,
        ...(content !== undefined && {
            content: resolveClaimTokens(content, {
                mode: 'markdown',
                pricing,
                onIssue,
            }),
        }),
    } as T
}
