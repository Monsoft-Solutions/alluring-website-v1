/**
 * Claim tokens in a blog post's fields (issue #354): which ones would render
 * as nothing, and which Alluring prices are typed instead of tokens. The
 * admin MCP and the blog editor's save actions reject a post that has any,
 * so a typo never reaches a reader as a missing price and a typed price
 * never goes stale after an admin edit.
 *
 * Pure: the caller passes the pricing snapshot to check lines against.
 *
 * @module lib/utils/claim-token-fields
 */
import type { PricingSnapshot } from '@workspace/shared/claims/pricing'
import {
    findHeadingPriceTokens,
    parseClaimTokens,
    validateClaimTokens,
} from '@workspace/shared/claims/tokens'
import { findTypedPrices } from '@workspace/shared/claims/typed-prices'

/** The reader-facing text fields of a post that may carry claim tokens. */
export type ClaimTokenFields = {
    title?: string | null
    content?: string | null
    metaTitle?: string | null
    metaDescription?: string | null
    excerpt?: string | null
    quickAnswer?: string | null
    faqs?: readonly { question: string; answer: string }[] | null
}

/**
 * One line per invalid token, "field: [[token]] — reason", with the
 * canonical form when only case or spacing was wrong, one per typed
 * Alluring price, "field: $5,500 — reason", with the token to write, and one
 * per price token in a body heading (`findHeadingPriceTokens`). Empty when
 * every token resolves, no price is typed and no heading carries a price.
 */
export function findClaimTokenErrors(
    fields: ClaimTokenFields,
    pricing: PricingSnapshot
): string[] {
    const texts: [string, string | null | undefined][] = [
        ['title', fields.title],
        ['content', fields.content],
        ['metaTitle', fields.metaTitle],
        ['metaDescription', fields.metaDescription],
        ['excerpt', fields.excerpt],
        ['quickAnswer', fields.quickAnswer],
        ...(fields.faqs ?? []).flatMap((faq, index): [string, string][] => [
            [`faqs[${index}].question`, faq.question],
            [`faqs[${index}].answer`, faq.answer],
        ]),
    ]

    return texts.flatMap(([field, text]) =>
        text
            ? [
                  ...validateClaimTokens(text, { pricing }).errors.map(
                      (error) =>
                          `${field}: ${error.raw} — ${error.reason}${error.suggestion ? ` Did you mean ${error.suggestion}?` : ''}`
                  ),
                  ...findTypedPrices(text, { pricing }).map(
                      (issue) => `${field}: ${issue.raw} — ${issue.reason}`
                  ),
                  ...(field === 'content'
                      ? findHeadingPriceTokens(text).map(
                            (token) =>
                                `${field}: ${token.raw} — a price in a heading. Its table-of-contents entry would show both figures while a discount is on, and its anchor would change with every price edit. Move the price into the sentence under the heading.`
                        )
                      : []),
              ]
            : []
    )
}

/** A piece of DB text that may carry tokens, and where it lives. */
export type ClaimTokenSource = {
    source: string
    text: string | null | undefined
}

/**
 * The tokens that resolve under the current pricing but would resolve to
 * nothing under the next one: a line deactivated, or a starting line set to
 * none, that live posts still name. One line each, "source: [[token]]".
 */
export function findClaimTokensBrokenBy(
    sources: readonly ClaimTokenSource[],
    current: PricingSnapshot,
    next: PricingSnapshot
): string[] {
    const broken: string[] = []
    for (const { source, text } of sources) {
        if (!text) continue
        const { tokens } = parseClaimTokens(text)
        const seen = new Set<string>()
        for (const token of tokens) {
            if (seen.has(token.raw)) continue
            seen.add(token.raw)
            if (
                validateClaimTokens(token.raw, { pricing: current }).valid &&
                !validateClaimTokens(token.raw, { pricing: next }).valid
            ) {
                broken.push(`${source}: ${token.raw}`)
            }
        }
    }
    return broken
}
