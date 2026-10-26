/**
 * Claim tokens in a blog post's fields (issue #354), resolved against one
 * pricing snapshot. Pure, so the tests run it without a database; the
 * queries call it through `resolve-claims.server.ts`.
 *
 * Which mode each field takes:
 *
 * - `content` is compiled as MDX, so it takes `markdown`: a discounted price
 *   is "~~$5,500~~ $4,400", which remark-gfm renders as `<del>`. Every reader
 *   of the body (table of contents, CTA split, word count, the compiler)
 *   then sees the same resolved text.
 * - Everything else takes `text` ("$4,400 (20% off $5,500)"): the title, meta
 *   title and description, the excerpt, the quick answer and the FAQs. The
 *   quick answer and the FAQs render as plain text and are repeated word for
 *   word in Speakable and FAQPage structured data, which must match the
 *   visible text.
 *
 * @module lib/claims/post-claims
 */
import {
    getDiscountStatement,
    type PricingSnapshot,
} from '@workspace/shared/claims/pricing'
import {
    parseClaimTokens,
    resolveClaimTokensDetailed,
    type ClaimTokenIssue,
    type ClaimTokenMode,
} from '@workspace/shared/claims/tokens'

/** Called once per token that resolved to nothing, with the field it was in. */
export type ClaimIssueReporter = (field: string, issue: ClaimTokenIssue) => void

/** The text fields every post shape shares: a card, a search hit, a detail. */
type PostText = { title: string; excerpt?: string | null }

/** The fields a post detail carries tokens in. */
type PostDetailText = PostText & {
    content: string
    metaTitle?: string | null
    metaDescription: string | null
    quickAnswer?: string | null
    faqs?: { question: string; answer: string }[] | null
}

function createResolver(pricing: PricingSnapshot, report: ClaimIssueReporter) {
    let discounted = false

    function resolve<T extends string | null | undefined>(
        field: string,
        text: T,
        mode: ClaimTokenMode
    ): T {
        if (!text) return text
        const result = resolveClaimTokensDetailed(text, { mode, pricing })
        for (const issue of result.issues) report(field, issue)
        discounted ||= result.discounted
        return result.text as T
    }

    return { resolve, isDiscounted: () => discounted }
}

/**
 * A post card's title and excerpt, in text mode: cards, search results,
 * related posts and `llms*.txt` print them as plain text.
 */
export function resolvePostTextClaims<T extends PostText>(
    post: T,
    pricing: PricingSnapshot,
    report: ClaimIssueReporter
): T {
    const { resolve } = createResolver(pricing, report)
    return {
        ...post,
        title: resolve('title', post.title, 'text'),
        ...('excerpt' in post
            ? { excerpt: resolve('excerpt', post.excerpt, 'text') }
            : {}),
    }
}

/**
 * Every token-bearing field of a post detail, plus the 456.062 statement the
 * template shows once when a resolved price is discounted. A post that
 * places `[[discount-statement]]` itself gets no second copy.
 */
export function resolvePostDetailClaims<T extends PostDetailText>(
    post: T,
    pricing: PricingSnapshot,
    report: ClaimIssueReporter
): T & { discountStatement: string | null } {
    const { resolve, isDiscounted } = createResolver(pricing, report)

    const resolved = {
        ...post,
        title: resolve('title', post.title, 'text'),
        metaTitle: resolve('metaTitle', post.metaTitle, 'text'),
        metaDescription: resolve(
            'metaDescription',
            post.metaDescription,
            'text'
        ),
        excerpt: resolve('excerpt', post.excerpt, 'text'),
        content: resolve('content', post.content, 'markdown'),
        quickAnswer: resolve('quickAnswer', post.quickAnswer, 'text'),
        faqs: post.faqs
            ? post.faqs.map((faq, index) => ({
                  ...faq,
                  question: resolve(
                      `faqs[${index}].question`,
                      faq.question,
                      'text'
                  ),
                  answer: resolve(`faqs[${index}].answer`, faq.answer, 'text'),
              }))
            : post.faqs,
    }

    const placesStatement = parseClaimTokens(post.content).tokens.some(
        (token) => token.name === 'discount-statement'
    )

    return {
        ...resolved,
        discountStatement:
            isDiscounted() && !placesStatement
                ? getDiscountStatement(pricing)
                : null,
    }
}
