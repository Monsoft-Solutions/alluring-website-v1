/**
 * Claim tokens: how DB text (blog posts, FAQs, quick answers, excerpts, meta
 * fields, the chat prompt) names a price or a canon sentence without typing
 * it. The renderer resolves them from the live pricing snapshot, so a price
 * change in the admin reaches every post without an edit.
 *
 * ## Grammar
 *
 *     [[name]]  [[name:arg]]  [[name:arg:arg]]
 *
 * - Double square brackets, no spaces. `name` is lowercase letters and
 *   hyphens; each `arg` is lowercase letters, digits and hyphens.
 * - No braces or angle brackets anywhere, so a token is plain text to MDX and
 *   is resolved **before** MDX compilation, as a string pass.
 * - A procedure argument is a claim key (`bbl`, `tummy-tuck`, see
 *   `CLAIM_PROCEDURES`); the web page slug (`tummy-tuck-miami`) is accepted
 *   as an alias.
 *
 * | Token | Renders |
 * | ----- | ------- |
 * | `[[price:<procedure>]]` | the procedure's starting price: "$3,000" |
 * | `[[price:<procedure>:<line>]]` | one sheet line: "$4,500" |
 * | `[[price-label:<procedure>]]` | the starting line's name: "mini tummy tuck (no muscle repair)" |
 * | `[[price-label:<procedure>:<line>]]` | a line's name |
 * | `[[price-span:<procedure>:add-ons]]` | "$500 to $1,500" (single add-ons) |
 * | `[[price-range:bbl]]` | "most patients pay between $5,500 and $10,000" |
 * | `[[price-caveat]]`, `[[price-caveat:long]]` | the required price caveat |
 * | `[[combo-discount]]` | the combination discount sentence |
 * | `[[combo-discount:2]]`, `[[combo-discount:3]]` | "$500", "$1,000" |
 * | `[[discount-statement]]` | the 456.062 statement while a discount is on, else nothing |
 * | `[[financing]]`, `[[financing:long]]` | the approved financing sentence |
 * | `[[financing-partners]]` | "Cherry, CareCredit, and United Credit" |
 * | `[[surgeon:name]]` | "Victoria Karlinsky, MD, FACS" |
 * | `[[surgeon:short]]` | "Dr. Karlinsky" |
 * | `[[surgeon:credentials]]` | the approved credentials sentence |
 * | `[[surgeon:credentials-year]]` | the same, with "since 2008" |
 * | `[[phone]]` | "+1 (786) 305-8649" |
 *
 * `[[price:<procedure>]]` prints the figure only. Wherever the starting line
 * is a variant (a mini tummy tuck, a modified breast lift), name it next to
 * the price with `[[price-label:<procedure>]]`. The facelift has no
 * starting price at all (D2): `[[price:facelift]]` is invalid, and the only
 * form is "A face and neck lift is [[price:facelift:face-neck-lift]]".
 *
 * ## Modes
 *
 * - `markdown` (post bodies, FAQ answers rendered as markdown): a discounted
 *   price is "~~$5,500~~ $4,400", which remark-gfm renders as `<del>`. Text
 *   that comes from the database (line labels, the 456.062 statement) is
 *   put on one line and backslash-escaped so it can never open MDX syntax
 *   or break a table row. A token inside a JSX tag's attribute resolves as
 *   `text`, with typographic quotes.
 * - `text` (titles, meta descriptions, JSON-LD, `llms*.txt`, the chat
 *   prompt): "$4,400 (20% off $5,500)".
 *
 * ## Failures
 *
 * {@link validateClaimTokens} rejects anything it cannot resolve: an unknown
 * name, a bad argument, an unknown procedure or line, a malformed token, or
 * an unclosed one that starts with a known name (`[[price:bbl`). At render
 * time the same token resolves to **nothing**, and the issue is reported
 * (`onIssue`, default `console.warn`), so a reader never sees raw brackets.
 *
 * Text that only looks bracketed is left alone: `[[1]]` (a digit after the
 * brackets) and Markdown such as `[[Learn more](/x)]`, whose brackets never
 * close as `]]`.
 *
 * @module @workspace/shared/claims/tokens
 */
import { CONTACT } from './contact'
import {
    FINANCING_PAGE_PATH,
    FINANCING_SENTENCE_LONG,
    FINANCING_SENTENCE_SHORT,
    getFinancingPartnersString,
} from './financing'
import {
    CLAIM_PROCEDURES,
    FALLBACK_PRICING,
    PRICE_CAVEAT_LONG,
    PRICE_CAVEAT_SHORT,
    toClaimProcedureKey,
} from './prices'
import {
    findPriceLine,
    formatAddOnSpanMarkdown,
    formatAddOnSpanText,
    formatComboDiscountSentence,
    formatPriceMarkdown,
    formatPriceText,
    formatTypicalRangeMarkdown,
    formatTypicalRangeText,
    formatUsd,
    getAddOnSpan,
    getDiscountStatement,
    getProcedureLines,
    getStartingLine,
    getTypicalRange,
    priceLineId,
    quotesAsNamedLine,
    toPriceDisplay,
    type PriceLine,
    type PricingSnapshot,
} from './pricing'
import {
    KARLINSKY_CREDENTIALS,
    KARLINSKY_CREDENTIALS_WITH_YEAR,
    KARLINSKY_NAME,
    KARLINSKY_SHORT_NAME,
} from './surgeon'

export type ClaimTokenMode = 'markdown' | 'text'

/** What one token name accepts, for docs, prompts and validator messages. */
export interface ClaimTokenSpec {
    name: string
    syntax: readonly string[]
    description: string
}

export const CLAIM_TOKEN_SPECS = [
    {
        name: 'price',
        syntax: ['[[price:<procedure>]]', '[[price:<procedure>:<line>]]'],
        description:
            'A price from the live price list: the procedure\'s starting price, or one named line. Shows a discount when one is set. Name the variant next to a starting price with [[price-label:<procedure>]]. The facelift has no starting price: write "A face and neck lift is [[price:facelift:face-neck-lift]]".',
    },
    {
        name: 'price-label',
        syntax: [
            '[[price-label:<procedure>]]',
            '[[price-label:<procedure>:<line>]]',
        ],
        description:
            'What the starting line (or the named line) is, in lowercase prose: "mini tummy tuck (no muscle repair)". Use it to name the variant next to a starting price.',
    },
    {
        name: 'price-span',
        syntax: ['[[price-span:<procedure>:add-ons]]'],
        description:
            'The cheapest to the dearest of a procedure\'s single add-ons, from the live prices ("… to …"). Write "Liposuction of one area added to another procedure is [[price-span:lipo:add-ons]], depending on the area."',
    },
    {
        name: 'price-range',
        syntax: ['[[price-range:bbl]]'],
        description:
            'BBL only: the "most patients pay between … and …" sentence fragment, from the live prices. Write "A BBL at Alluring starts at [[price:bbl]], and [[price-range:bbl]]."',
    },
    {
        name: 'price-caveat',
        syntax: ['[[price-caveat]]', '[[price-caveat:long]]'],
        description:
            'The required price caveat (short, or long for FAQs and posts). Every price sits in a paragraph, list or table that carries it.',
    },
    {
        name: 'combo-discount',
        syntax: [
            '[[combo-discount]]',
            '[[combo-discount:2]]',
            '[[combo-discount:3]]',
        ],
        description:
            'The combination discount: the whole sentence, or the dollars off for two or three procedures.',
    },
    {
        name: 'discount-statement',
        syntax: ['[[discount-statement]]'],
        description:
            'The Fla. Stat. 456.062 statement while a discount is on; renders nothing otherwise.',
    },
    {
        name: 'financing',
        syntax: ['[[financing]]', '[[financing:long]]'],
        description:
            'The approved financing sentence, naming the partners and quoting no number.',
    },
    {
        name: 'financing-partners',
        syntax: ['[[financing-partners]]'],
        description: 'The financing partners as a list.',
    },
    {
        name: 'surgeon',
        syntax: [
            '[[surgeon:name]]',
            '[[surgeon:short]]',
            '[[surgeon:credentials]]',
            '[[surgeon:credentials-year]]',
        ],
        description:
            'The surgeon: full name with MD, FACS (first mention); "Dr. Karlinsky" after that; the approved credentials sentence, optionally with the year.',
    },
    {
        name: 'phone',
        syntax: ['[[phone]]'],
        description:
            'The practice phone number. Not for blog post bodies, which carry no phone number.',
    },
] as const satisfies readonly ClaimTokenSpec[]

export type ClaimTokenName = (typeof CLAIM_TOKEN_SPECS)[number]['name']

/** Every valid token name. */
export const CLAIM_TOKEN_NAMES: readonly ClaimTokenName[] =
    CLAIM_TOKEN_SPECS.map((spec) => spec.name)

/** The token names, longest first, as a regex alternation. */
const TOKEN_NAME_ALTERNATION = [...CLAIM_TOKEN_NAMES]
    .sort((a, b) => b.length - a.length)
    .join('|')

/**
 * A token candidate: either a closed `[[…]]` whose inside starts with a
 * letter and holds no bracket or newline (consumed through its `]]`
 * whatever its length, so no tail can leak), or an **unclosed** token
 * (`[[price:bbl]` or `[[price:bbl`) — but only when a known token name
 * follows the brackets. Ordinary Markdown such as `[[Learn more](/x)]` is
 * never a candidate, so it is never reported or removed. `[[1]]` (a digit
 * first) is not a candidate either.
 */
const TOKEN_SCAN = new RegExp(
    String.raw`\[\[(\s*[A-Za-z][^[\]\n]*)\]\]|\[\[\s*(?:${TOKEN_NAME_ALTERNATION})(?![A-Za-z-])[A-Za-z0-9:-]*\]?`,
    'gi'
)

/** The canonical inside of a token. */
const TOKEN_BODY = /^([a-z][a-z-]*)((?::[a-z0-9][a-z0-9-]*)*)$/

/** A parsed, well-formed token. */
export interface ClaimToken {
    /** The token as written, brackets included. */
    raw: string
    /** Offset of `raw` in the text. */
    index: number
    name: string
    args: string[]
}

/** A token that cannot be resolved. */
export interface ClaimTokenIssue {
    raw: string
    index: number
    reason: string
    /** The canonical form, when the token only had case or spacing wrong. */
    suggestion: string | null
}

export interface ClaimTokenOptions {
    /** The pricing to resolve against. Defaults to the 2026-09-15 sheet. */
    pricing?: PricingSnapshot
}

export interface ResolveClaimTokensOptions extends ClaimTokenOptions {
    mode: ClaimTokenMode
    /**
     * Called once per token that resolves to nothing. Defaults to
     * `console.warn`. Pass a no-op to silence.
     */
    onIssue?: (issue: ClaimTokenIssue) => void
}

export interface ResolvedClaimText {
    text: string
    issues: ClaimTokenIssue[]
    /** Tokens resolved to a value. */
    resolved: number
    /**
     * Whether any resolved price carries a discount. A surface that sets this
     * shows the 456.062 statement (`getDiscountStatement`) next to it.
     */
    discounted: boolean
}

type Resolution =
    | { ok: true; value: string; discounted: boolean }
    | { ok: false; reason: string }

/** Backslash-escapes what Markdown or MDX could read as syntax. */
export function escapeMarkdownText(value: string): string {
    return value.replace(/[\\`*_{}[\]<>|~#]/g, '\\$&')
}

function fail(reason: string): Resolution {
    return { ok: false, reason }
}

function value(text: string, discounted = false): Resolution {
    return { ok: true, value: text, discounted }
}

/** A procedure argument: a claim key, a page slug, or a procedure in the DB. */
function resolveProcedureArg(
    pricing: PricingSnapshot,
    arg: string | undefined
): string | null {
    if (!arg) return null
    const known = toClaimProcedureKey(arg)
    if (known) return known
    return pricing.lines.some((line) => line.procedure === arg) ? arg : null
}

function resolveLine(
    pricing: PricingSnapshot,
    name: string,
    args: string[]
): { line: PriceLine } | { reason: string } {
    if (args.length < 1 || args.length > 2) {
        return {
            reason: `[[${name}]] takes a procedure and an optional line: [[${name}:<procedure>]] or [[${name}:<procedure>:<line>]].`,
        }
    }
    const procedure = resolveProcedureArg(pricing, args[0])
    if (!procedure) return { reason: `Unknown procedure "${args[0]}".` }

    if (args.length === 1) {
        if (name === 'price' && quotesAsNamedLine(procedure)) {
            const line = getStartingLine(pricing, procedure)
            return {
                reason: `${procedure} has no "starting at" price (D2). Quote the named line: "A ${line?.label ?? '<line>'} is [[price:${procedure}:${line?.key ?? '<line>'}]]".`,
            }
        }
        const line = getStartingLine(pricing, procedure)
        if (!line) {
            return {
                reason: `${procedure} publishes no starting price. Name a line ([[${name}:${procedure}:<line>]]) or leave the price out.`,
            }
        }
        return { line }
    }

    const key = args[1]!
    const line = findPriceLine(pricing, procedure, key)
    if (!line) {
        return {
            reason: `Unknown or inactive line "${priceLineId(procedure, key)}".`,
        }
    }
    return { line }
}

function noArgs(name: string, args: string[]): Resolution | null {
    return args.length > 0 ? fail(`[[${name}]] takes no argument.`) : null
}

function resolveToken(
    name: string,
    args: string[],
    mode: ClaimTokenMode,
    pricing: PricingSnapshot
): Resolution {
    const markdown = mode === 'markdown'
    // DB text (line labels, the statement) can never open Markdown or MDX
    // syntax, nor break a table row or list item with a newline.
    const prose = (text: string) =>
        markdown ? escapeMarkdownText(text.replace(/\s+/g, ' ').trim()) : text

    switch (name) {
        case 'price': {
            const found = resolveLine(pricing, name, args)
            if ('reason' in found) return fail(found.reason)
            const display = toPriceDisplay(pricing, found.line)
            return value(
                markdown
                    ? formatPriceMarkdown(display)
                    : formatPriceText(display),
                display.discounted
            )
        }
        case 'price-label': {
            const found = resolveLine(pricing, name, args)
            if ('reason' in found) return fail(found.reason)
            return value(prose(found.line.label))
        }
        case 'price-span': {
            if (args.length !== 2 || args[1] !== 'add-ons') {
                return fail(
                    '[[price-span]] takes a procedure and "add-ons": [[price-span:lipo:add-ons]].'
                )
            }
            const procedure = resolveProcedureArg(pricing, args[0])
            if (!procedure) return fail(`Unknown procedure "${args[0]}".`)
            const span = getAddOnSpan(pricing, procedure)
            if (!span) {
                return fail(`${procedure} has no add-on prices to span.`)
            }
            return value(
                markdown
                    ? formatAddOnSpanMarkdown(span)
                    : formatAddOnSpanText(span),
                span.min.discounted || span.max.discounted
            )
        }
        case 'price-range': {
            if (args.length !== 1) {
                return fail(
                    '[[price-range]] takes a procedure: [[price-range:bbl]].'
                )
            }
            const procedure = resolveProcedureArg(pricing, args[0])
            if (!procedure) return fail(`Unknown procedure "${args[0]}".`)
            const range = getTypicalRange(pricing, procedure)
            if (!range) {
                return fail(
                    `${procedure} publishes no "most patients pay" range (BBL only).`
                )
            }
            return value(
                markdown
                    ? formatTypicalRangeMarkdown(range)
                    : formatTypicalRangeText(range),
                range.discounted
            )
        }
        case 'price-caveat': {
            if (args.length === 0 || (args.length === 1 && args[0] === 'short'))
                return value(PRICE_CAVEAT_SHORT)
            if (args.length === 1 && args[0] === 'long')
                return value(PRICE_CAVEAT_LONG)
            return fail('Use [[price-caveat]] or [[price-caveat:long]].')
        }
        case 'combo-discount': {
            if (args.length === 0)
                return value(formatComboDiscountSentence(pricing))
            if (args.length === 1 && args[0] === '2')
                return value(formatUsd(pricing.comboDiscounts.two))
            if (args.length === 1 && args[0] === '3')
                return value(formatUsd(pricing.comboDiscounts.three))
            return fail(
                'Use [[combo-discount]], [[combo-discount:2]] or [[combo-discount:3]].'
            )
        }
        case 'discount-statement': {
            const invalid = noArgs(name, args)
            if (invalid) return invalid
            const statement = getDiscountStatement(pricing)
            return value(statement ? prose(statement) : '')
        }
        case 'financing': {
            if (args.length === 0) return value(FINANCING_SENTENCE_SHORT)
            if (args.length === 1 && args[0] === 'long') {
                return value(
                    markdown
                        ? `${FINANCING_SENTENCE_LONG} See [financing](${FINANCING_PAGE_PATH}).`
                        : FINANCING_SENTENCE_LONG
                )
            }
            return fail('Use [[financing]] or [[financing:long]].')
        }
        case 'financing-partners':
            return noArgs(name, args) ?? value(getFinancingPartnersString())
        case 'surgeon': {
            const forms: Record<string, string> = {
                name: KARLINSKY_NAME,
                short: KARLINSKY_SHORT_NAME,
                credentials: KARLINSKY_CREDENTIALS,
                'credentials-year': KARLINSKY_CREDENTIALS_WITH_YEAR,
            }
            const form = args.length === 1 ? forms[args[0]!] : undefined
            return form
                ? value(form)
                : fail(
                      'Use [[surgeon:name]], [[surgeon:short]], [[surgeon:credentials]] or [[surgeon:credentials-year]].'
                  )
        }
        case 'phone':
            return noArgs(name, args) ?? value(CONTACT.phoneDisplay)
        default:
            return fail(
                `Unknown token "${name}". Valid names: ${CLAIM_TOKEN_NAMES.join(', ')}.`
            )
    }
}

function parseBody(body: string): { name: string; args: string[] } | null {
    const match = TOKEN_BODY.exec(body)
    if (!match) return null
    return {
        name: match[1]!,
        args: match[2] ? match[2].slice(1).split(':') : [],
    }
}

/** The canonical form of a sloppy token body, or `null`. */
function canonicalBody(body: string): string | null {
    const normalized = body
        .trim()
        .toLowerCase()
        .replace(/\s*:\s*/g, ':')
        .replace(/\s+/g, '-')
    return TOKEN_BODY.test(normalized) ? normalized : null
}

type ScanResult =
    | { kind: 'token'; token: ClaimToken }
    | { kind: 'malformed'; issue: ClaimTokenIssue }

function* scan(text: string): Generator<ScanResult> {
    for (const match of text.matchAll(TOKEN_SCAN)) {
        const raw = match[0]
        const index = match.index
        const body = match[1]

        if (body === undefined) {
            yield {
                kind: 'malformed',
                issue: {
                    raw,
                    index,
                    reason: 'Unclosed token: a token ends with "]]".',
                    suggestion: null,
                },
            }
            continue
        }

        const parsed = parseBody(body)
        if (parsed) {
            yield { kind: 'token', token: { raw, index, ...parsed } }
            continue
        }

        const canonical = canonicalBody(body)
        yield {
            kind: 'malformed',
            issue: {
                raw,
                index,
                reason: 'Malformed token: write [[name]] or [[name:arg]] in lowercase, with no spaces.',
                suggestion: canonical ? `[[${canonical}]]` : null,
            },
        }
    }
}

/** Whether the text contains anything token-shaped. */
export function hasClaimTokens(text: string): boolean {
    return /\[\[\s*[A-Za-z]/.test(text)
}

/** The well-formed tokens in a text, and the malformed ones. */
export function parseClaimTokens(text: string): {
    tokens: ClaimToken[]
    malformed: ClaimTokenIssue[]
} {
    const tokens: ClaimToken[] = []
    const malformed: ClaimTokenIssue[] = []
    for (const result of scan(text)) {
        if (result.kind === 'token') tokens.push(result.token)
        else malformed.push(result.issue)
    }
    return { tokens, malformed }
}

/** Tokens that print a dollar figure. */
const FIGURE_TOKEN_NAMES: ReadonlySet<string> = new Set([
    'price',
    'price-span',
    'price-range',
    'combo-discount',
])

/**
 * Price tokens in Markdown headings (`## BBL from [[price:bbl]]`), which a
 * post must not have. A heading prints its price in markdown mode, so a
 * discount shows "~~$5,500~~ $4,400" in the table of contents, and the
 * heading's id (rehype-slug, from its text) changes with every price or
 * discount edit, breaking every link to that section. Put the price in the
 * sentence under the heading instead. Fenced code is skipped.
 */
export function findHeadingPriceTokens(markdown: string): ClaimToken[] {
    if (!hasClaimTokens(markdown)) return []
    const found: ClaimToken[] = []
    let offset = 0
    let inFence = false
    for (const line of markdown.split('\n')) {
        if (/^\s*(```|~~~)/.test(line)) inFence = !inFence
        else if (!inFence && /^ {0,3}#{1,6}\s/.test(line)) {
            for (const token of parseClaimTokens(line).tokens) {
                if (FIGURE_TOKEN_NAMES.has(token.name)) {
                    found.push({ ...token, index: offset + token.index })
                }
            }
        }
        offset += line.length + 1
    }
    return found
}

/**
 * Checks every token in a text against the grammar and the pricing. Content
 * with an error is rejected before it is saved: an unknown token would render
 * as nothing.
 */
export function validateClaimTokens(
    text: string,
    { pricing = FALLBACK_PRICING }: ClaimTokenOptions = {}
): { valid: boolean; tokens: ClaimToken[]; errors: ClaimTokenIssue[] } {
    const { tokens, malformed } = parseClaimTokens(text)
    const errors = [...malformed]
    for (const token of tokens) {
        const result = resolveToken(token.name, token.args, 'text', pricing)
        if (!result.ok) {
            errors.push({
                raw: token.raw,
                index: token.index,
                reason: result.reason,
                suggestion: null,
            })
        }
    }
    errors.sort((a, b) => a.index - b.index)
    return { valid: errors.length === 0, tokens, errors }
}

/**
 * Whether `index` sits inside an open JSX tag (`<CalloutBox title="…`):
 * the last `<` before it starts a tag name and no `>` closes it first.
 */
function isInsideJsxTag(text: string, index: number): boolean {
    const open = text.lastIndexOf('<', index)
    if (open === -1 || !/[A-Za-z]/.test(text.charAt(open + 1))) return false
    const close = text.indexOf('>', open)
    return close === -1 || close > index
}

/**
 * A value safe inside a JSX attribute string, whichever quote opened it:
 * one line, typographic quotes.
 */
function toAttributeText(value: string): string {
    return value
        .replace(/\s+/g, ' ')
        .replace(/"/g, '\u201D')
        .replace(/'/g, '\u2019')
        .trim()
}

/**
 * Resolves every token, reporting what could not be resolved. Unresolvable
 * tokens become an empty string.
 *
 * In `markdown` mode a token inside a JSX tag (an attribute value such as
 * `<CalloutBox title="From [[price:bbl]]">`) resolves as `text` instead,
 * on one line and with typographic quotes: Markdown means nothing in an
 * attribute (`~~` would print as is) and a quote or newline would end it.
 */
export function resolveClaimTokensDetailed(
    text: string,
    {
        mode,
        pricing = FALLBACK_PRICING,
    }: Omit<ResolveClaimTokensOptions, 'onIssue'>
): ResolvedClaimText {
    if (!hasClaimTokens(text)) {
        return { text, issues: [], resolved: 0, discounted: false }
    }

    const issues: ClaimTokenIssue[] = []
    let resolved = 0
    let discounted = false
    let output = ''
    let cursor = 0

    for (const result of scan(text)) {
        const { raw, index } =
            result.kind === 'token' ? result.token : result.issue
        output += text.slice(cursor, index)
        cursor = index + raw.length

        if (result.kind === 'malformed') {
            issues.push(result.issue)
            // Prints nothing: take the space before it along, as below.
            if (output.endsWith(' ')) output = output.slice(0, -1)
            continue
        }

        const { name, args } = result.token
        const inTag = mode === 'markdown' && isInsideJsxTag(text, index)
        const resolution = resolveToken(
            name,
            args,
            inTag ? 'text' : mode,
            pricing
        )
        if (resolution.ok && resolution.value === '') {
            // A token that prints nothing on purpose (`[[discount-statement]]`
            // with no discount on) takes the space before it along, so
            // "Financing is available. [[discount-statement]]" ends cleanly.
            if (output.endsWith(' ')) output = output.slice(0, -1)
            resolved += 1
        } else if (resolution.ok) {
            output += inTag
                ? toAttributeText(resolution.value)
                : resolution.value
            resolved += 1
            discounted ||= resolution.discounted
        } else {
            issues.push({
                raw,
                index,
                reason: resolution.reason,
                suggestion: null,
            })
            if (output.endsWith(' ')) output = output.slice(0, -1)
        }
    }

    return {
        text: output + text.slice(cursor),
        issues,
        resolved,
        discounted,
    }
}

function warnIssue(issue: ClaimTokenIssue): void {
    console.warn(
        `[claims] Unresolved token ${issue.raw} at ${issue.index}: ${issue.reason}`
    )
}

/**
 * Resolves every token in a text. A token that cannot be resolved renders as
 * nothing and is reported through `onIssue`.
 */
export function resolveClaimTokens(
    text: string,
    { onIssue = warnIssue, ...options }: ResolveClaimTokensOptions
): string {
    const result = resolveClaimTokensDetailed(text, options)
    for (const issue of result.issues) onIssue(issue)
    return result.text
}

/**
 * Resolves the tokens in every string of a plain value (an FAQ list, a
 * JSON-LD object), leaving its shape alone. Arrays and plain objects are
 * walked; anything else is returned as it is.
 */
export function resolveClaimTokensIn<T>(
    input: T,
    options: ResolveClaimTokensOptions
): T {
    return walk(input, options) as T
}

function walk(input: unknown, options: ResolveClaimTokensOptions): unknown {
    if (typeof input === 'string') return resolveClaimTokens(input, options)
    if (Array.isArray(input)) return input.map((item) => walk(item, options))
    if (
        input !== null &&
        typeof input === 'object' &&
        Object.getPrototypeOf(input) === Object.prototype
    ) {
        return Object.fromEntries(
            Object.entries(input).map(([key, item]) => [
                key,
                walk(item, options),
            ])
        )
    }
    return input
}

/** One concrete token and what it stands for, for prompts and the admin. */
export interface ClaimTokenEntry {
    token: string
    description: string
}

/**
 * Every concrete token the pricing allows, with what each names. Prompts list
 * these so a writer picks a token instead of typing a price; the admin can
 * offer them for insertion.
 */
export function listClaimTokens(
    pricing: PricingSnapshot = FALLBACK_PRICING
): ClaimTokenEntry[] {
    const entries: ClaimTokenEntry[] = []
    const procedures = [
        ...CLAIM_PROCEDURES.map((procedure) => procedure.key as string),
        ...pricing.lines.map((line) => line.procedure),
    ].filter((key, index, all) => all.indexOf(key) === index)

    for (const procedure of procedures) {
        const starting = getStartingLine(pricing, procedure)
        const namedOnly = quotesAsNamedLine(procedure)
        if (starting && !namedOnly) {
            entries.push({
                token: `[[price:${procedure}]]`,
                description: `starting price (${starting.label}); name the variant next to it with [[price-label:${procedure}]]`,
            })
            entries.push({
                token: `[[price-label:${procedure}]]`,
                description: `name of the starting line: ${starting.label}`,
            })
        }
        for (const line of getProcedureLines(pricing, procedure)) {
            const description = line.addOn
                ? `${line.label} (add-on)`
                : namedOnly && starting && line.key === starting.key
                  ? `${line.label} only: there is no ${procedure}-alone price, so write "A ${line.label} is [[price:${procedure}:${line.key}]]", never "starts at"`
                  : line.label
            entries.push({
                token: `[[price:${procedure}:${line.key}]]`,
                description,
            })
        }
        if (getTypicalRange(pricing, procedure)) {
            entries.push({
                token: `[[price-range:${procedure}]]`,
                description: '"most patients pay between …" fragment',
            })
        }
        if (getAddOnSpan(pricing, procedure)) {
            entries.push({
                token: `[[price-span:${procedure}:add-ons]]`,
                description: 'cheapest to dearest single add-on: "… to …"',
            })
        }
    }

    entries.push(
        { token: '[[price-caveat]]', description: 'price caveat, short' },
        { token: '[[price-caveat:long]]', description: 'price caveat, long' },
        {
            token: '[[combo-discount]]',
            description: 'combination discount sentence',
        },
        {
            token: '[[combo-discount:2]]',
            description: 'dollars off for two procedures',
        },
        {
            token: '[[combo-discount:3]]',
            description: 'dollars off for three procedures',
        },
        {
            token: '[[discount-statement]]',
            description: '456.062 statement while a discount is on',
        },
        { token: '[[financing]]', description: 'financing sentence, short' },
        {
            token: '[[financing:long]]',
            description: 'financing sentence, long',
        },
        {
            token: '[[financing-partners]]',
            description: 'financing partners list',
        },
        { token: '[[surgeon:name]]', description: KARLINSKY_NAME },
        { token: '[[surgeon:short]]', description: KARLINSKY_SHORT_NAME },
        {
            token: '[[surgeon:credentials]]',
            description: 'credentials sentence',
        },
        {
            token: '[[surgeon:credentials-year]]',
            description: 'credentials sentence with the year',
        },
        {
            token: '[[phone]]',
            description: 'practice phone (not in post bodies)',
        }
    )

    return entries
}
