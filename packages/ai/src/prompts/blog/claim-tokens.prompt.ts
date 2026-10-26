/**
 * The one rule every blog step that copies text out of a post follows
 * (issue #354): claim tokens travel verbatim.
 *
 * Posts write Alluring's prices and canon sentences as claim tokens
 * (`[[price:bbl]]`, `[[surgeon:name]]`; the grammar is in
 * `@workspace/shared/claims/tokens`), which the site fills in from the live
 * price list when the post is shown. A step that lifts a sentence into an
 * FAQ, a quick answer, an excerpt or a meta description keeps the token, so
 * the copy follows the next price change too.
 *
 * @module @workspace/ai/prompts/blog/claim-tokens
 */
export const CLAIM_TOKEN_RULE = `**Claim tokens**
The article writes Alluring's prices and some fixed sentences as claim tokens in double square brackets, such as [[price:bbl]], [[price-range:bbl]], [[price-caveat]] or [[surgeon:name]]. The site replaces each one with the current value when the page is shown.
- When you repeat what a token says, copy the token exactly, brackets included. Never replace it with a dollar figure or a name you typed.
- Never invent a token, and never type an Alluring price that is not a token in the article.`
