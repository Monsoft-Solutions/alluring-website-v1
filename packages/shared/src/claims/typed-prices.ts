/**
 * Typed Alluring prices in text (issue #354): find them, and turn the ones
 * that fit one price-sheet line into claim tokens.
 *
 * The canon's rule is that no Alluring price is typed anywhere: DB text names
 * a price with a token (`[[price:tummy-tuck:mini]]`), which follows every
 * admin edit and discount. A typed "$3,000" never does. Every writer of DB
 * text (the AI pipeline, the admin MCP, the admin editor, the web create API,
 * `blog/tools`) runs {@link findTypedPrices}; the pipeline and the one-off
 * post migration run {@link convertTypedPrices}.
 *
 * **What counts.** A dollar figure equal to a published amount (an active
 * line's list price, a combination discount, the top of the BBL range),
 * outside a token, in a sentence that does not attribute it to a third
 * party (ASPS, The Aesthetic Society, ISAPS, "national average") without
 * also naming the practice. The three ASPS averages are never Alluring
 * figures and are never matched.
 *
 * **Which token.** The sentence (or table row) is searched for the
 * procedures it names, widening to the paragraph and then the section when
 * it names none. Among the lines of those procedures priced at that figure,
 * the one whose label words the sentence uses wins, with a bonus for the
 * procedure's starting line next to "from" or "starts at". A tie gives no
 * suggestion: a person picks the line. The suggestion always names the line
 * (`[[price:breast-lift:modified]]`, never `[[price:breast-lift]]`), so an
 * admin's change of starting line can't change what the sentence claims.
 *
 * @module @workspace/shared/claims/typed-prices
 */
import {
    FALLBACK_PRICING,
    getClaimProcedure,
    NATIONAL_AVERAGES,
} from './prices'
import {
    formatComboDiscountSentence,
    formatUsd,
    getAddOnSpan,
    getStartingLine,
    getTypicalRange,
    PRICE_UNIT_SUFFIX,
    type PriceLine,
    type PricingSnapshot,
} from './pricing'
import { parseClaimTokens } from './tokens'

/** A typed dollar figure that should be a claim token. */
export interface TypedPriceIssue {
    /** The figure as written, e.g. "$5,500" (with a unit suffix it absorbs). */
    raw: string
    index: number
    usd: number
    reason: string
    /** The token that replaces `raw`, when exactly one line fits. */
    suggestion: string | null
}

export interface TypedPriceOptions {
    /** The pricing to match against. Defaults to the 2026-09-15 sheet. */
    pricing?: PricingSnapshot
}

/**
 * The words that name each priced procedure in prose. A procedure added in
 * the admin without an entry here is matched by its lines' labels only.
 */
const PROCEDURE_WORDS: Readonly<Record<string, RegExp>> = {
    bbl: /\bbbls?\b|brazilian butt lift|\bbutt lift|gl[uú]teos/i,
    lipo: /\blipo\b|lipo ?360|liposuction|liposucci[oó]n|j-?plasma/i,
    'tummy-tuck': /tummy tuck|abdominoplast/i,
    'breast-augmentation':
        /breast augmentation|\baugmentation\b|\bimplants?\b|aumento de senos|fat grafting to the breasts|capsulectom|capsulorr|crease repair|double bubble|axillary skin/i,
    'breast-lift': /breast lift|mastopex/i,
    'breast-reduction':
        /breast reduction|reduction mammaplasty|reducci[oó]n de senos/i,
    facelift:
        /face ?lift|face (?:and|&) neck lift|neck lift|brow lift|lip lift|tca peel|fat grafting to the face/i,
    blepharoplasty: /eyelid|blepharoplast/i,
    mens: /gynecomastia|\bmale\b|\bmen['’]?s\b|chest lipo/i,
    otoplasty: /otoplast|ear surgery/i,
    'back-lift': /back lift/i,
    'arm-lift': /arm lift|brachioplast/i,
    'thigh-lift': /thigh lift/i,
}

/** A sentence that quotes a third party's figure, not the practice's. */
const THIRD_PARTY =
    /\basps\b|american society of plastic surgeons|aesthetic society|\bisaps\b|national(?:ly)?\b|\baverages?\b|realself/i

/** A sentence that is about the practice's own prices. */
const PRACTICE = /\balluring\b|\bour\b|\bwe\b|\bus\b/i

/** Words that never tell two lines apart. */
const STOPWORDS = new Set(
    'a an and or with without of to for as its own on only no each first area added another procedure surgery the is s per'.split(
        ' '
    )
)

/** `$5,500`, `$ 5500`, `$5,500.00`; not part of a longer number. */
const DOLLAR_FIGURE = /\$\s?(\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{2})?(?![\d,]*\d)/g

/** "$500 to $1,500", any dash or "to". */
const SPAN_PHRASE =
    /\$\s?(\d{1,3}(?:,\d{3})+|\d+)\s*(?:to|[–—-])\s*\$\s?(\d{1,3}(?:,\d{3})+|\d+)/g

/** "most patients pay between $5,500 and $10,000", any dash or "to". */
const RANGE_PHRASE =
    /most patients pay (?:between )?\$\s?(\d{1,3}(?:,\d{3})+|\d+)\s*(?:and|to|[–—-])\s*\$\s?(\d{1,3}(?:,\d{3})+|\d+)/gi

function toUsd(digits: string): number {
    return Number(digits.replace(/,/g, ''))
}

function words(text: string): string[] {
    return text
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((word) => word.length > 1 && !STOPWORDS.has(word))
}

/** Replaces every well-formed token with spaces, so offsets stay put. */
function maskTokens(text: string): string {
    let masked = text
    for (const token of parseClaimTokens(text).tokens) {
        masked =
            masked.slice(0, token.index) +
            ' '.repeat(token.raw.length) +
            masked.slice(token.index + token.raw.length)
    }
    return masked
}

/** The sentence or table row around an offset. */
function sentenceAt(text: string, start: number, end: number): string {
    const before = text.slice(0, start)
    const breakBefore = Math.max(
        before.lastIndexOf('\n'),
        ...[...before.matchAll(/[.!?](?=\s)/g)].map((match) => match.index)
    )
    const after = text.slice(end)
    const breakAfter = after.search(/[.!?](?=\s|$)|\n/)
    return text.slice(
        breakBefore + 1,
        breakAfter === -1 ? text.length : end + breakAfter
    )
}

/** The blank-line-separated block around an offset. */
function paragraphAt(text: string, index: number): string {
    const start = text.lastIndexOf('\n\n', index)
    const end = text.indexOf('\n\n', index)
    return text.slice(start === -1 ? 0 : start, end === -1 ? text.length : end)
}

/** From the heading before an offset to the next heading. */
function sectionAt(text: string, index: number): string {
    const headings = [...text.matchAll(/^#{1,6} .*$/gm)].map(
        (match) => match.index
    )
    const start = headings.filter((at) => at <= index).at(-1) ?? 0
    const end = headings.find((at) => at > index) ?? text.length
    return text.slice(start, end)
}

function namedProcedures(text: string, pricing: PricingSnapshot): string[] {
    const procedures = [...new Set(pricing.lines.map((line) => line.procedure))]
    return procedures.filter((procedure) => {
        const pattern = PROCEDURE_WORDS[procedure]
        return pattern ? pattern.test(text) : false
    })
}

/**
 * The line a figure names in its sentence, or `null` when none or several
 * fit equally.
 */
function pickLine(
    usd: number,
    sentence: string,
    contexts: readonly string[],
    pricing: PricingSnapshot
): PriceLine | null {
    const active = pricing.lines.filter(
        (line) => line.active && line.usd === usd
    )
    if (active.length === 0) return null

    let candidates: PriceLine[] = []
    for (const context of contexts) {
        const procedures = namedProcedures(context, pricing)
        candidates = active.filter((line) =>
            procedures.includes(line.procedure)
        )
        if (candidates.length > 0) break
    }
    if (candidates.length === 0) return null
    if (candidates.length === 1) return candidates[0]!

    const sentenceWords = new Set(words(sentence))
    const startsAt = /\b(?:from|starts?|starting|desde)\b/i.test(sentence)
    const scored = candidates.map((line) => {
        const procedureWords = new Set(
            words(
                `${line.procedure} ${getClaimProcedure(line.procedure)?.name ?? ''}`
            )
        )
        const distinctive = [...new Set(words(line.label))].filter(
            (word) => !procedureWords.has(word)
        )
        const matched = distinctive.filter((word) =>
            sentenceWords.has(word)
        ).length
        const starting =
            startsAt &&
            getStartingLine(pricing, line.procedure)?.key === line.key
        return {
            line,
            score:
                matched * 2 -
                (distinctive.length - matched) +
                (starting ? 1.5 : 0),
        }
    })
    scored.sort((a, b) => b.score - a.score)
    const [best, second] = scored
    return best && (!second || best.score > second.score) ? best.line : null
}

/** Every amount the practice publishes, for a quick membership test. */
function publishedAmounts(pricing: PricingSnapshot): Set<number> {
    const amounts = new Set(
        pricing.lines.filter((line) => line.active).map((line) => line.usd)
    )
    amounts.add(pricing.comboDiscounts.two)
    amounts.add(pricing.comboDiscounts.three)
    for (const procedure of Object.keys(pricing.procedures)) {
        const range = getTypicalRange(pricing, procedure)
        if (range) amounts.add(range.max.listUsd)
    }
    for (const average of Object.values(NATIONAL_AVERAGES)) {
        amounts.delete(average.usd)
    }
    return amounts
}

/**
 * Every typed dollar figure in `text` that equals a published Alluring
 * amount and should be a claim token, with the token when one line fits.
 * Figures inside tokens, and attributed third-party figures, are left out.
 */
export function findTypedPrices(
    text: string,
    { pricing = FALLBACK_PRICING }: TypedPriceOptions = {}
): TypedPriceIssue[] {
    if (!text.includes('$')) return []
    const masked = maskTokens(text)
    const amounts = publishedAmounts(pricing)
    const issues: TypedPriceIssue[] = []
    const claimed = new Set<number>()

    // The BBL range phrase becomes one token.
    for (const match of masked.matchAll(RANGE_PHRASE)) {
        const [phrase, low = '', high = ''] = match
        for (const procedure of Object.keys(pricing.procedures)) {
            const range = getTypicalRange(pricing, procedure)
            if (
                range &&
                toUsd(low) === range.min.listUsd &&
                toUsd(high) === range.max.listUsd
            ) {
                issues.push({
                    raw: phrase,
                    index: match.index,
                    usd: range.max.listUsd,
                    reason: `A typed price range. Write [[price-range:${procedure}]].`,
                    suggestion: `[[price-range:${procedure}]]`,
                })
                for (
                    let at = match.index;
                    at < match.index + phrase.length;
                    at += 1
                )
                    claimed.add(at)
                break
            }
        }
    }

    // An add-on span ("$500 to $1,500, depending on the area") becomes one
    // token when its ends are a named procedure's cheapest and dearest add-on.
    for (const match of masked.matchAll(SPAN_PHRASE)) {
        const [phrase, low = '', high = ''] = match
        if ([...claimed].some((at) => at === match.index)) continue
        const sentence = sentenceAt(
            masked,
            match.index,
            match.index + phrase.length
        )
        for (const procedure of namedProcedures(sentence, pricing)) {
            const span = getAddOnSpan(pricing, procedure)
            if (
                span &&
                toUsd(low) === span.min.listUsd &&
                toUsd(high) === span.max.listUsd
            ) {
                issues.push({
                    raw: phrase,
                    index: match.index,
                    usd: span.max.listUsd,
                    reason: `A typed add-on price span. Write [[price-span:${procedure}:add-ons]].`,
                    suggestion: `[[price-span:${procedure}:add-ons]]`,
                })
                for (
                    let at = match.index;
                    at < match.index + phrase.length;
                    at += 1
                )
                    claimed.add(at)
                break
            }
        }
    }

    // The combination discount sentence becomes one token.
    const comboSentence = formatComboDiscountSentence(pricing)
    for (
        let at = masked.indexOf(comboSentence);
        at !== -1;
        at = masked.indexOf(comboSentence, at + 1)
    ) {
        issues.push({
            raw: comboSentence,
            index: at,
            usd: pricing.comboDiscounts.two,
            reason: 'The combination discount, typed. Write [[combo-discount]].',
            suggestion: '[[combo-discount]]',
        })
        for (let i = at; i < at + comboSentence.length; i += 1) claimed.add(i)
    }

    for (const match of masked.matchAll(DOLLAR_FIGURE)) {
        if (claimed.has(match.index)) continue
        const usd = toUsd(match[1] ?? '')
        if (!amounts.has(usd)) continue

        const start = match.index
        const end = start + match[0].length
        const sentence = sentenceAt(masked, start, end)
        if (THIRD_PARTY.test(sentence) && !PRACTICE.test(sentence)) continue

        let raw = match[0]
        let suggestion: string | null = null
        const combo =
            /\bcombin\w*|\b(?:two|three|2|3) procedures\b/i.test(sentence) &&
            /\boff\b|\bdiscount/i.test(sentence)
        if (combo && usd === pricing.comboDiscounts.two) {
            suggestion = '[[combo-discount:2]]'
        } else if (combo && usd === pricing.comboDiscounts.three) {
            suggestion = '[[combo-discount:3]]'
        } else {
            const line = pickLine(
                usd,
                sentence,
                [
                    sentence,
                    paragraphAt(masked, start),
                    sectionAt(masked, start),
                ],
                pricing
            )
            if (line) {
                suggestion = `[[price:${line.procedure}:${line.key}]]`
                // The token prints the unit; don't print it twice.
                const suffix = PRICE_UNIT_SUFFIX[line.unit]
                if (suffix && masked.slice(end).startsWith(` ${suffix}`)) {
                    raw = text.slice(start, end + suffix.length + 1)
                }
            }
        }

        issues.push({
            raw: text.slice(start, start + raw.length),
            index: start,
            usd,
            reason: suggestion
                ? `A typed Alluring price (${formatUsd(usd)}). Write ${suggestion}.`
                : `A typed Alluring price (${formatUsd(usd)}) that matches no single line here. Use the matching [[price:<procedure>:<line>]] token, or remove the figure.`,
            suggestion,
        })
    }

    return issues.sort((a, b) => a.index - b.index)
}

/** What {@link convertTypedPrices} changed and what it left. */
export interface TypedPriceConversion {
    text: string
    converted: { raw: string; token: string; index: number }[]
    /** Figures with no single matching line, left as typed. */
    remaining: TypedPriceIssue[]
}

/**
 * Replaces every typed Alluring figure that fits one line with its token,
 * and reports the rest. With no discount the rendered text is unchanged:
 * the token prints the same figure.
 */
export function convertTypedPrices(
    text: string,
    options: TypedPriceOptions = {}
): TypedPriceConversion {
    const issues = findTypedPrices(text, options)
    const converted: TypedPriceConversion['converted'] = []
    const remaining: TypedPriceIssue[] = []
    let output = text
    for (const issue of [...issues].reverse()) {
        if (!issue.suggestion) {
            remaining.unshift(issue)
            continue
        }
        output =
            output.slice(0, issue.index) +
            issue.suggestion +
            output.slice(issue.index + issue.raw.length)
        converted.unshift({
            raw: issue.raw,
            token: issue.suggestion,
            index: issue.index,
        })
    }
    return { text: output, converted, remaining }
}
