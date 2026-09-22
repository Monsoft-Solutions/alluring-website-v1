/**
 * Procedure copy sweep (#252, #256): the launch gate for a procedure page
 * module. `scripts/procedure-copy.config.ts` names each page's facts file and
 * its own rules; the BBL page was the first.
 *
 * Reads the page as built — the prerendered HTML, or a running server with
 * `--url` — and checks what readers, crawlers and AI engines actually get:
 * every heading, paragraph, table cell, list item, FAQ answer and image alt
 * text on the page, its title and descriptions, and the page's own nodes in
 * the structured-data graph. It fails on:
 *
 *   - any %, cc, BMI, $, minute, hour, day, week, month, year or count figure
 *     that the page's facts file does not declare, and any number it cannot
 *     classify;
 *   - board-certification wording other than the credentials checked in
 *     `karlinsky-credentials.constant.ts`, and a board Florida does not
 *     approve named without Rule 64B8-11.001's statement beside it;
 *   - the practice claims still waiting on the owner (#247 item 3);
 *   - travel-coordination or non-US wording (CLAUDE.md);
 *   - "best", "safest", guarantees and keyword bolding;
 *   - the page's own rules from its config (the BBL page allows no volume
 *     or BMI figure at all);
 *   - an FAQ answer with pricing terms under a question that isn't about
 *     price, which `/landing/procedure/[slug]` would silently drop;
 *   - FAQPage structured data that differs from the visible FAQ;
 *   - a question-phrased H2 whose direct answer is not 40–60 words;
 *   - an in-page link to an anchor that doesn't exist, or a lost required
 *     anchor (`#pricing` by default).
 *
 * It also checks that every fact statement uses only its own figures, so the
 * facts file cannot drift from itself.
 *
 * The checks are concept-based and case-insensitive: they look for any figure
 * of a kind, not for the strings a previous fix removed. A sweep built from a
 * fix list only proves the fix list was applied.
 *
 * Not copy, so not checked: elements marked `data-copy-check="data"` (the
 * phone number, dates, the Google rating, patients' own reviews, the source
 * list, the form) and `aria-hidden` decoration. Scripts are skipped, so the
 * RSC payload's second copy of the text is not counted twice.
 *
 * Placeholders are a warning by default and a failure with `--launch`.
 *
 * Usage:
 *   pnpm --filter web build && pnpm --filter web check:procedure-copy --slug <slug> [--launch] [--map]
 *   pnpm --filter web check:procedure-copy --slug <slug> --url http://localhost:3100/procedures/<slug>
 *   pnpm --filter web check:bbl-copy   (the BBL page, same flags)
 */

import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { parse, type DefaultTreeAdapterMap } from 'parse5'

import type { ProcedureFigure } from '../lib/data/procedures/facts/procedure-facts'
import {
    FLORIDA_UNAPPROVED_BOARD_STATEMENT,
    KARLINSKY_ABS_CERTIFIED_ON,
} from '../lib/data/surgeons/karlinsky-credentials.constant'
import {
    procedureCopyConfigs,
    type ProcedureCopyConfig,
    type WordingRule,
} from './procedure-copy.config'

const LAUNCH = process.argv.includes('--launch')
// Print every licensed figure with the fact and sources behind it (markdown).
const MAP = process.argv.includes('--map')
const URL_ARG = process.argv[process.argv.indexOf('--url') + 1]
const URL_FLAG = process.argv.includes('--url') ? URL_ARG : undefined

const SLUG_FLAG = process.argv.includes('--slug')
    ? process.argv[process.argv.indexOf('--slug') + 1]
    : undefined

function readConfig(): ProcedureCopyConfig {
    const config = SLUG_FLAG ? procedureCopyConfigs[SLUG_FLAG] : undefined
    if (!config) {
        console.error(
            `${SLUG_FLAG ? `No copy config for "${SLUG_FLAG}"` : 'Pass --slug <procedure slug>'}. Configured: ${Object.keys(procedureCopyConfigs).join(', ')}. Add one to scripts/procedure-copy.config.ts.`
        )
        process.exit(2)
    }
    return config
}

const CONFIG = readConfig()
const SLUG = CONFIG.slug
const BUILT_HTML = fileURLToPath(
    new URL(`../.next/server/app/procedures/${SLUG}.html`, import.meta.url)
)

// Expected length in words, for the 40–60 word answer check.
const KNOWN_PLACEHOLDERS: Readonly<Record<string, number>> =
    CONFIG.placeholders ?? {}

interface CopyString {
    /** Where it is: the nearest section id, the element and the opening words. */
    path: string
    text: string
    /** The other strings in the same parent: a row's label, a stage's heading. */
    siblings: string[]
}

interface Finding {
    path: string
    rule: string
    detail: string
}

const failures: Finding[] = []
const licensedFigures: { path: string; raw: string; factIds: string[] }[] = []
const warnings: Finding[] = []

// ─── Read the page ──────────────────────────────────────────────────────────

async function readPage(): Promise<{ html: string; from: string }> {
    if (URL_FLAG) {
        const response = await fetch(URL_FLAG)
        if (!response.ok) {
            throw new Error(`${URL_FLAG} answered ${response.status}`)
        }
        return { html: await response.text(), from: URL_FLAG }
    }
    if (!existsSync(BUILT_HTML)) {
        throw new Error(
            `No built page at ${BUILT_HTML}. Run \`pnpm --filter web build\` first, or pass --url <page url>.`
        )
    }
    return { html: readFileSync(BUILT_HTML, 'utf8'), from: BUILT_HTML }
}

type Node = DefaultTreeAdapterMap['childNode']
type Element = DefaultTreeAdapterMap['element']
type ParentNode = DefaultTreeAdapterMap['parentNode']

const isElement = (node: Node): node is Element => 'tagName' in node

const attr = (element: Element, name: string): string | undefined =>
    element.attrs.find((a) => a.name === name)?.value

const hasClass = (element: Element, name: string): boolean =>
    (attr(element, 'class') ?? '').split(/\s+/).includes(name)

function* walk(node: ParentNode): Generator<Element> {
    for (const child of node.childNodes) {
        if (!isElement(child)) continue
        yield child
        yield* walk(child)
    }
}

const find = (root: ParentNode, test: (el: Element) => boolean) => {
    for (const el of walk(root)) if (test(el)) return el
    return undefined
}

const findAll = (root: ParentNode, test: (el: Element) => boolean) =>
    [...walk(root)].filter(test)

/** Elements whose text is never copy. */
const SKIPPED_TAGS = new Set([
    'script',
    'style',
    'template',
    'noscript',
    'svg',
    'form',
    'input',
    'select',
    'textarea',
    'button',
])

const isSkipped = (element: Element): boolean =>
    SKIPPED_TAGS.has(element.tagName) ||
    attr(element, 'aria-hidden') === 'true' ||
    attr(element, 'data-copy-check') === 'data' ||
    attr(element, 'hidden') !== undefined

/** Tags that break text into separate strings. */
const BLOCK_TAGS = new Set([
    'address',
    'article',
    'aside',
    'blockquote',
    'caption',
    'dd',
    'details',
    'div',
    'dl',
    'dt',
    'figcaption',
    'figure',
    'footer',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'header',
    'li',
    'main',
    'nav',
    'ol',
    'p',
    'section',
    'summary',
    'table',
    'tbody',
    'td',
    'th',
    'thead',
    'tr',
    'ul',
])

const squash = (text: string) => text.replace(/\s+/g, ' ').trim()

function textOf(node: Node): string {
    if (!isElement(node)) {
        return node.nodeName === '#text'
            ? (node as { value: string }).value
            : ''
    }
    if (isSkipped(node)) return ''
    const content =
        node.tagName === 'template'
            ? []
            : (node as ParentNode).childNodes.map(textOf)
    return BLOCK_TAGS.has(node.tagName)
        ? ` ${content.join('')} `
        : content.join('')
}

/** The nearest section anchor. A heading's own `…-heading` id is not one. */
function sectionOf(ancestors: Element[]): string {
    for (let i = ancestors.length - 1; i >= 0; i--) {
        const id = attr(ancestors[i]!, 'id')
        if (id && !id.endsWith('-heading')) return `#${id}`
    }
    return '(page)'
}

/**
 * Every run of inline text under `root`, one string per block: a paragraph,
 * a list item, a table cell, a heading, a caption. A string's siblings are
 * the strings of the other blocks under the same parent — a table row's
 * label, a timeline stage's heading — which is the context a short string
 * is read in.
 */
function collectBlocks(root: Element): CopyString[] {
    const out: CopyString[] = []
    const byParent = new Map<Element, CopyString[]>()

    function visit(element: Element, ancestors: Element[]): void {
        if (isSkipped(element)) return
        const path = [...ancestors, element]
        let run = ''
        const flush = () => {
            const text = squash(run)
            run = ''
            if (!text) return
            const entry: CopyString = {
                path: `${sectionOf(path)} ${element.tagName} "${text.slice(0, 48)}${text.length > 48 ? '…' : ''}"`,
                text,
                siblings: [],
            }
            out.push(entry)
            const parent = ancestors.at(-1) ?? element
            byParent.set(parent, [...(byParent.get(parent) ?? []), entry])
        }
        for (const child of element.childNodes) {
            if (isElement(child) && BLOCK_TAGS.has(child.tagName)) {
                flush()
                visit(child, path)
            } else {
                run += textOf(child)
            }
        }
        flush()
    }

    visit(root, [])

    for (const group of byParent.values()) {
        for (const entry of group) {
            entry.siblings = group
                .filter((other) => other !== entry)
                .map((other) => other.text)
        }
    }
    return out
}

/** Keys in the structured data whose values are identifiers, URLs or codes. */
const NON_COPY_LD_KEYS = new Set([
    '@id',
    '@type',
    '@context',
    'url',
    'item',
    'image',
    'logo',
    'primaryImageOfPage',
    'cssSelector',
    'priceCurrency',
    'availability',
    'dateModified',
    'datePublished',
    'validFrom',
    'validThrough',
    'priceValidUntil',
    'telephone',
    'sameAs',
])

function collectLd(value: unknown, path: string, out: CopyString[]): void {
    if (typeof value === 'string') {
        out.push({ path, text: value, siblings: [] })
        return
    }
    if (Array.isArray(value)) {
        value.forEach((item, index) =>
            collectLd(item, `${path}[${index}]`, out)
        )
        return
    }
    if (value && typeof value === 'object') {
        for (const [key, child] of Object.entries(value)) {
            if (NON_COPY_LD_KEYS.has(key)) continue
            collectLd(child, `${path}.${key}`, out)
        }
    }
}

type LdNode = Record<string, unknown> & { '@id'?: string; '@type'?: string }

function ldNodes(document: ParentNode): LdNode[] {
    return findAll(
        document,
        (el) =>
            el.tagName === 'script' &&
            attr(el, 'type') === 'application/ld+json'
    ).flatMap((script) => {
        const json = JSON.parse(
            script.childNodes.map((c) => ('value' in c ? c.value : '')).join('')
        ) as LdNode | LdNode[]
        const roots = Array.isArray(json) ? json : [json]
        return roots.flatMap((root) =>
            Array.isArray(root['@graph'])
                ? (root['@graph'] as LdNode[])
                : [root]
        )
    })
}

// ─── Figures ────────────────────────────────────────────────────────────────

type Unit = ProcedureFigure['unit'] | 'ratio' | 'temperature'

interface Extracted {
    unit: Unit
    min: number
    max: number
    raw: string
}

const NUMBER_WORDS: Record<string, number> = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    eleven: 11,
    twelve: 12,
    thirteen: 13,
    fourteen: 14,
    fifteen: 15,
    sixteen: 16,
    eighteen: 18,
    twenty: 20,
    thirty: 30,
    forty: 40,
    fifty: 50,
    sixty: 60,
    seventy: 70,
    eighty: 80,
    ninety: 90,
}

const ORDINALS: Record<string, number> = {
    first: 1,
    second: 2,
    third: 3,
    fourth: 4,
    fifth: 5,
    sixth: 6,
    seventh: 7,
    eighth: 8,
    ninth: 9,
    tenth: 10,
    eleventh: 11,
    twelfth: 12,
}

const TIME_UNIT = '(?:minutes?|hours?|days?|weeks?|months?|years?)'
const NUMBER_WORD = `(?:${Object.keys(NUMBER_WORDS).join('|')})`
const JOINER = '(?:-|to|or|and)'

function normalize(text: string): string {
    let t = ` ${text.toLowerCase()} `
    t = t.replace(/[–—−]/g, '-')
    // Identifiers that contain digits but are not figures: the page's own
    // (a statute number), then the ones every page may use.
    for (const [pattern, replacement] of CONFIG.identifiers ?? []) {
        t = t.replace(pattern, replacement)
    }
    t = t.replace(/\blipo\s*360\b/g, ' lipo-all-round ')
    t = t.replace(/\b24\s*\/\s*7\b/g, ' around-the-clock ')
    t = t.replace(/\bpercent\b/g, '%')
    t = t.replace(
        new RegExp(`\\b(${NUMBER_WORD})\\s*(%|cc\\b)`, 'g'),
        (_, a: string, unit: string) => `${NUMBER_WORDS[a]}${unit}`
    )
    // Number words next to a time unit: "two to three months", "week six".
    t = t.replace(
        new RegExp(
            `\\b(${NUMBER_WORD})(\\s*${JOINER}\\s*)(${NUMBER_WORD})\\s+(${TIME_UNIT})\\b`,
            'g'
        ),
        (_, a: string, joiner: string, b: string, unit: string) =>
            `${NUMBER_WORDS[a]}${joiner}${NUMBER_WORDS[b]} ${unit}`
    )
    t = t.replace(
        new RegExp(`\\b(${NUMBER_WORD})\\s+(${TIME_UNIT})\\b`, 'g'),
        (_, a: string, unit: string) => `${NUMBER_WORDS[a]} ${unit}`
    )
    t = t.replace(
        new RegExp(
            `\\b(minute|hour|day|week|month|year)s?\\s+(${NUMBER_WORD})\\b`,
            'g'
        ),
        (_, unit: string, a: string) => `${unit} ${NUMBER_WORDS[a]}`
    )
    // Ordinals: "the second month" is month 2.
    t = t.replace(
        new RegExp(
            `\\b(${Object.keys(ORDINALS).join('|')})\\s+(minute|hour|day|week|month|year)\\b(?!s)`,
            'g'
        ),
        (_, ordinal: string, unit: string) => `${unit} ${ORDINALS[ordinal]}`
    )
    // Rates before "a day" becomes "1 day": "12 hours a day".
    t = t.replace(
        /(\d[\d,.]*)\s*hours?\s+(?:a|per)\s+day\b/g,
        '$1 hours-per-day'
    )
    t = t.replace(/\bevery\s+(minute|hour|day|week|month)\b/g, '1 $1')
    t = t.replace(/\b(?:a|an)\s+(minute|hour|week|month|year)\b/g, '1 $1')
    t = t.replace(/(?<!(?:hours?|times|same|per|the)\s)\ba\s+day\b/g, '1 day')
    // Percent and dollar ranges: "50% to 80%", "$5,500 and $10,000".
    t = t.replace(
        new RegExp(`(\\d[\\d.]*)\\s*%\\s*${JOINER}\\s*(\\d[\\d.]*)\\s*%`, 'g'),
        '$1-$2%'
    )
    t = t.replace(
        new RegExp(
            `\\$\\s?(\\d[\\d,]*)\\s*${JOINER}\\s*\\$\\s?(\\d[\\d,]*)`,
            'g'
        ),
        '$$$1-$$$2'
    )
    // Numeric ranges: "10 to 14", "1 or 2", "between 2 and 3".
    t = t.replace(
        new RegExp(`(\\d[\\d,.]*\\d|\\d)\\s*${JOINER}\\s*(\\d)`, 'g'),
        '$1-$2'
    )
    return t
}

function toNumber(raw: string): number {
    return Number(raw.replace(/,/g, '').replace(/\.$/, ''))
}

function unitOf(word: string): Unit {
    if (/^min/.test(word)) return 'minute'
    if (/^(hour|hr)/.test(word)) return 'hour'
    if (/^day/.test(word)) return 'day'
    if (/^week/.test(word)) return 'week'
    if (/^month/.test(word)) return 'month'
    if (/^year/.test(word)) return 'year'
    if (/^death/.test(word)) return 'death'
    if (/^stud/.test(word)) return 'study'
    if (/^patient/.test(word)) return 'patient'
    throw new Error(`No unit for "${word}"`)
}

interface Pattern {
    re: RegExp
    read: (match: RegExpExecArray) => Omit<Extracted, 'raw'>
}

const NUM = '(\\d[\\d,]*(?:\\.\\d+)?)'

const PATTERNS: Pattern[] = [
    {
        re: new RegExp(`${NUM}\\s*hours-per-day`, 'g'),
        read: (m) => ({
            unit: 'hour',
            min: toNumber(m[1]!),
            max: toNumber(m[1]!),
        }),
    },
    {
        re: new RegExp(`\\$${NUM}(?:\\s*-\\s*\\$?${NUM})?`, 'g'),
        read: (m) => ({
            unit: 'usd',
            min: toNumber(m[1]!),
            max: toNumber(m[2] ?? m[1]!),
        }),
    },
    {
        re: new RegExp(`${NUM}(?:\\s*-\\s*${NUM})?\\s*%`, 'g'),
        read: (m) => ({
            unit: 'percent',
            min: toNumber(m[1]!),
            max: toNumber(m[2] ?? m[1]!),
        }),
    },
    {
        re: new RegExp(`\\bbmi\\b[^\\d]{0,20}${NUM}(?:\\s*-\\s*${NUM})?`, 'g'),
        read: (m) => ({
            unit: 'bmi',
            min: toNumber(m[1]!),
            max: toNumber(m[2] ?? m[1]!),
        }),
    },
    {
        re: new RegExp(`${NUM}(?:\\s*-\\s*${NUM})?\\s*cc\\b`, 'g'),
        read: (m) => ({
            unit: 'cc',
            min: toNumber(m[1]!),
            max: toNumber(m[2] ?? m[1]!),
        }),
    },
    {
        re: new RegExp(`\\b1\\s+in\\s+${NUM}`, 'g'),
        read: (m) => ({ unit: 'ratio', min: 1, max: toNumber(m[1]!) }),
    },
    {
        re: new RegExp(`${NUM}\\s*°\\s*[fc]\\b`, 'g'),
        read: (m) => ({
            unit: 'temperature',
            min: toNumber(m[1]!),
            max: toNumber(m[1]!),
        }),
    },
    {
        re: new RegExp(
            `${NUM}(?:\\s*-\\s*${NUM})?\\s*(minutes?|mins?|hours?|hrs?|days?|weeks?|months?|years?|deaths?|studies|study|patients?)\\b`,
            'g'
        ),
        read: (m) => ({
            unit: unitOf(m[3]!),
            min: toNumber(m[1]!),
            max: toNumber(m[2] ?? m[1]!),
        }),
    },
    {
        re: new RegExp(
            `\\b(minute|hour|day|week|month|year)s?\\s+${NUM}(?:\\s*-\\s*${NUM})?`,
            'g'
        ),
        read: (m) => ({
            unit: unitOf(m[1]!),
            min: toNumber(m[2]!),
            max: toNumber(m[3] ?? m[2]!),
        }),
    },
]

function extractFigures(text: string): {
    figures: Extracted[]
    years: number[]
    stray: string[]
} {
    let t = normalize(text)
    const figures: Extracted[] = []
    for (const { re, read } of PATTERNS) {
        t = t.replace(re, (...args: unknown[]) => {
            const match = args.slice(0, -2) as unknown as RegExpExecArray
            figures.push({
                ...read(match),
                raw: String(args[0])
                    .trim()
                    .replace(/[,.;]$/, '')
                    .replace('hours-per-day', 'hours a day'),
            })
            return ' '.repeat(String(args[0]).length)
        })
    }
    const years: number[] = []
    t = t.replace(/\b(?:19|20)\d\d\b/g, (year) => {
        years.push(Number(year))
        return '    '
    })
    const stray = [
        ...(t.match(/\d[\d,.]*/g) ?? []),
        // Large numbers written as words never name a declared figure.
        ...(t.match(
            /\b(?:eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|dozen)\b/g
        ) ?? []),
    ]
    return { figures, years, stray }
}

function figureKey(unit: string, min: number, max: number): string {
    return `${unit}:${min}-${max}`
}

function declaredKey(figure: ProcedureFigure): string {
    return 'value' in figure
        ? figureKey(figure.unit, figure.value, figure.value)
        : figureKey(figure.unit, figure.min, figure.max)
}

const FACTS = CONFIG.facts
const SOURCES = CONFIG.sources

const declaredFigures = new Set(
    FACTS.flatMap((fact) => fact.figures.map(declaredKey))
)

/** Which facts license a figure, for the context check. */
const factsByFigure = new Map<string, (typeof FACTS)[number][]>()
for (const fact of FACTS) {
    for (const key of fact.figures.map(declaredKey)) {
        factsByFigure.set(key, [...(factsByFigure.get(key) ?? []), fact])
    }
}

function sentences(text: string): string[] {
    return text.split(/(?<=[.;?!])\s+(?=[A-Z0-9({$])/)
}
const declaredYears = new Set<number>([
    ...FACTS.flatMap((fact) => fact.years ?? []),
    ...SOURCES.flatMap((source) =>
        source.date ? [Number(source.date.slice(0, 4))] : []
    ),
    // "Board certified … since 2008", from her record.
    Number(KARLINSKY_ABS_CERTIFIED_ON.slice(0, 4)),
    ...(CONFIG.extraYears ?? []),
])

function checkFigures({ path, text, siblings }: CopyString): void {
    // A short string (a table value, a timeline label) reads with its siblings.
    const shortContext =
        text.split(/\s+/).length <= 20 ? ` ${siblings.join(' ')}` : ''
    const { years, stray } = extractFigures(text)
    for (const sentence of sentences(text)) {
        const context = `${sentence}${shortContext}`.toLowerCase()
        for (const figure of extractFigures(sentence).figures) {
            const key = figureKey(figure.unit, figure.min, figure.max)
            const licensing = factsByFigure.get(key)
            if (!licensing) {
                failures.push({
                    path,
                    rule: 'undeclared-figure',
                    detail: `"${figure.raw}" (${key}) is not declared in ${CONFIG.factsFile}`,
                })
            } else if (
                licensing.some((fact) =>
                    fact.concepts.some((concept) => context.includes(concept))
                )
            ) {
                licensedFigures.push({
                    path,
                    raw: figure.raw,
                    factIds: licensing
                        .filter((fact) =>
                            fact.concepts.some((concept) =>
                                context.includes(concept)
                            )
                        )
                        .map((fact) => fact.id),
                })
            } else {
                failures.push({
                    path,
                    rule: 'figure-out-of-context',
                    detail: `"${figure.raw}" is declared by ${licensing.map((f) => f.id).join(', ')}, but "${sentence.trim()}" is about none of: ${[...new Set(licensing.flatMap((f) => f.concepts))].join(', ')}`,
                })
            }
        }
    }
    for (const year of years) {
        if (!declaredYears.has(year)) {
            failures.push({
                path,
                rule: 'undeclared-year',
                detail: `${year} is not a source or fact year`,
            })
        }
    }
    for (const raw of stray) {
        failures.push({
            path,
            rule: 'unclassified-number',
            detail: `"${raw}" is a number the sweep cannot tie to a unit; state its unit or remove it`,
        })
    }
}

// ─── Claims and wording ─────────────────────────────────────────────────────

// Names that contain "plastic surgery" or "board" but are not claims.
const NEUTRAL_NAMES = [
    /american society of plastic surgeons/g,
    /plastic and reconstructive surgery(?: global open)?/g,
    /seminars in plastic surgery/g,
    /aesthetic surgery journal/g,
    /alluring plastic surgery/g,
    // Attribution of a quoted figure, which the standard requires.
    /plastic surgeons? (?:interviewed|quoted) by asps/g,
    // The page's own attributions, e.g. a named ASPS author.
    ...(CONFIG.neutralNames ?? []),
]

const WORDING_RULES: WordingRule[] = [
    {
        rule: 'certification',
        re: /\babps\b|american board of plastic surgery|(?:double|triple)[\s-]board|board[\s-]certified(?! in general surgery by the american board of surgery)|plastic surg\w*[^.]{0,40}\bboard\b|\bboard\b[^.]{0,40}plastic surg|\bplastic surgeons?\b/,
        why: 'credentials are stated only as checked in karlinsky-credentials.constant.ts; she is not certified by the American Board of Plastic Surgery',
    },
    {
        rule: 'practice-claim',
        re: /aaaasf|accredit|anesthesiologist|vaser|around-the-clock (?:surgeon |doctor )?(?:access|support|availability|care)|24\/7 (?:surgeon |doctor )?(?:access|support|availability|care)|5,?000\+?|thousands of (?:patients|procedures)|\b(?:we|our|alluring)\b[^.]{0,80}ultrasound[^.]{0,40}\bevery\b|\bevery (?:case|bbl|patient|procedure)\b[^.]{0,60}\b(?:we|our)\b/,
        why: 'one of the six practice claims awaiting the owner (#247 item 3)',
    },
    {
        rule: 'travel-or-market',
        re: /concierge|airport|pick[\s-]?up|hotel|lodging|recovery (?:house|home|suite|retreat)|transport|chauffeur|\bpackages?\b|international|latin america|caribbean|abroad|overseas|medical touris|fly[\s-]in (?:program|package)|\bwe (?:coordinate|arrange|book)\b|(?:flights?|travel) (?:is |are )?(?:included|arranged|booked)/,
        why: 'the practice does not coordinate travel and serves the US only (CLAUDE.md)',
    },
    {
        rule: 'superlative',
        re: /\bbest\b|\bsafest\b|guarantee|number one|\bno\.? ?1\b|world[\s-]class|top[\s-]rated|\bleading\b/,
        why: 'no superlatives or guarantees (#252)',
    },
    {
        rule: 'keyword-bolding',
        re: /\*\*|__/,
        why: 'no keyword bolding (#252)',
    },
    // The page's own rules.
    ...(CONFIG.rules ?? []),
]

/** Boards the Florida Board of Medicine does not approve (Rule 64B8-11.001(8)). */
const UNAPPROVED_BOARD = /american board of (?:facial )?cosmetic surgery/
const FLORIDA_STATEMENT = FLORIDA_UNAPPROVED_BOARD_STATEMENT.toLowerCase()

function checkWording({ path, text }: CopyString): void {
    let t = text.toLowerCase()
    for (const name of NEUTRAL_NAMES) t = t.replace(name, ' ')
    for (const { rule, re, why } of WORDING_RULES) {
        const match = t.match(re)
        if (match) {
            failures.push({ path, rule, detail: `"${match[0]}": ${why}` })
        }
    }
    // Rule 64B8-11.001(2)(f): the statement goes with the mention, in the
    // same type size, so it has to be in the same element.
    const board = t.match(UNAPPROVED_BOARD)
    if (board && !squash(t).includes(FLORIDA_STATEMENT)) {
        failures.push({
            path,
            rule: 'florida-board-statement',
            detail: `"${board[0]}" is not approved by the Florida Board of Medicine, so the same element must carry its statement verbatim`,
        })
    }
}

function checkPlaceholders({ path, text }: CopyString): void {
    for (const match of text.matchAll(/\{\{[^}]*\}\}/g)) {
        const placeholder = match[0]
        if (!(placeholder in KNOWN_PLACEHOLDERS)) {
            failures.push({
                path,
                rule: 'unknown-placeholder',
                detail: `${placeholder} is not one of ${Object.keys(KNOWN_PLACEHOLDERS).join(', ')}`,
            })
        } else {
            ;(LAUNCH ? failures : warnings).push({
                path,
                rule: 'placeholder',
                detail: `${placeholder} still waits on the owner`,
            })
        }
    }
}

// ─── Structure ──────────────────────────────────────────────────────────────

function wordCount(text: string): number {
    let count = 0
    for (const word of text.split(/\s+/).filter(Boolean)) {
        const placeholder = Object.keys(KNOWN_PLACEHOLDERS).find((p) =>
            word.includes(p)
        )
        count += placeholder ? KNOWN_PLACEHOLDERS[placeholder]! : 1
    }
    return count
}

const blockText = (element: Element) => squash(textOf(element))

/** Every question-phrased H2 answers in 40–60 words, first. */
function checkAnswers(page: Element): void {
    for (const section of findAll(page, (el) => hasClass(el, 'answer-block'))) {
        const heading = find(section, (el) => el.tagName === 'h2')
        const answer = find(section, (el) =>
            hasClass(el, 'answer-block__answer')
        )
        const where = `#${attr(section, 'id') ?? '?'}`
        if (!heading || !answer) {
            failures.push({
                path: where,
                rule: 'answer-block',
                detail: 'a question section without its H2 or its direct answer',
            })
            continue
        }
        const words = wordCount(blockText(answer))
        if (words < 40 || words > 60) {
            failures.push({
                path: where,
                rule: 'answer-length',
                detail: `${words} words under "${blockText(heading)}"; the direct answer must be 40–60`,
            })
        }
    }
}

function readPricingTerms(): string[] {
    const page = fileURLToPath(
        new URL('../app/landing/procedure/[slug]/page.tsx', import.meta.url)
    )
    const source = readFileSync(page, 'utf8')
    const block = source.match(/const PRICING_TERMS = \[([\s\S]*?)\]/)
    if (!block) {
        throw new Error(
            'PRICING_TERMS not found in the landing page; update the sweep'
        )
    }
    return [...block[1]!.matchAll(/'([^']+)'/g)].map((m) => m[1]!)
}

type Faq = { question: string; answer: string }

/** A question that is about price, and may be dropped from the landing page. */
const PRICE_QUESTION =
    /\b(?:cost|costs|price|pricing|how much|financ\w*|afford\w*|insurance|pay)\b/i

/**
 * The visible FAQ must match the FAQPage node, and only a question about
 * price may carry pricing terms: the paid landing page drops any FAQ whose
 * question or answer mentions one.
 */
function checkFaqs(page: Element, nodes: LdNode[]): Faq[] {
    const faqSection = find(page, (el) => attr(el, 'id') === 'faq')
    const visible: Faq[] = faqSection
        ? findAll(faqSection, (el) => el.tagName === 'details').map((d) => ({
              question: blockText(find(d, (el) => el.tagName === 'summary')!),
              answer: squash(
                  d.childNodes
                      .filter((c) => isElement(c) && c.tagName !== 'summary')
                      .map(textOf)
                      .join(' ')
              ),
          }))
        : []

    const terms = readPricingTerms()
    const pricing = (text: string) =>
        terms.find((term) => text.toLowerCase().includes(term))
    const dropped = visible.filter(
        (faq) => pricing(faq.question) ?? pricing(faq.answer)
    )
    if (dropped.length) {
        warnings.push({
            path: '#faq',
            rule: 'landing-page-drops',
            detail: `the paid landing page drops ${dropped.length} as price questions: ${dropped.map((faq) => `"${faq.question}"`).join(', ')}`,
        })
    }
    for (const faq of visible) {
        const inAnswer = pricing(faq.answer)
        if (inAnswer && !PRICE_QUESTION.test(faq.question)) {
            failures.push({
                path: `#faq "${faq.question}"`,
                rule: 'pricing-term-in-general-faq',
                detail: `"${inAnswer}" in the answer — the paid landing page would drop a question that isn't about price`,
            })
        }
    }

    const faqNode = nodes.find((node) => node['@type'] === 'FAQPage')
    const structured = (
        (faqNode?.mainEntity as
            | { name: string; acceptedAnswer: { text: string } }[]
            | undefined) ?? []
    ).map((q) => ({ question: q.name, answer: q.acceptedAnswer.text }))
    const same =
        structured.length === visible.length &&
        structured.every(
            (q, i) =>
                squash(q.question) === visible[i]!.question &&
                squash(q.answer) === visible[i]!.answer
        )
    if (!same) {
        failures.push({
            path: '#faq',
            rule: 'faq-structured-data',
            detail: `the FAQPage node (${structured.length} questions) does not match the visible FAQ (${visible.length})`,
        })
    }
    const [minFaqs, maxFaqs] = CONFIG.faqCount ?? [10, 14]
    if (visible.length < minFaqs || visible.length > maxFaqs) {
        warnings.push({
            path: '#faq',
            rule: 'faq-count',
            detail: `${visible.length} FAQs; aim for ${minFaqs}–${maxFaqs} distinct questions`,
        })
    }
    return visible
}

function checkAnchors(document: ParentNode, page: Element): void {
    const ids = new Set(
        findAll(document, (el) => attr(el, 'id') !== undefined).map(
            (el) => attr(el, 'id')!
        )
    )
    for (const link of findAll(page, (el) => el.tagName === 'a')) {
        const href = attr(link, 'href') ?? ''
        if (href.startsWith('#') && !ids.has(href.slice(1))) {
            failures.push({
                path: `a "${blockText(link)}"`,
                rule: 'dead-anchor',
                detail: `${href} has no element on the page`,
            })
        }
    }
    for (const anchor of CONFIG.requiredAnchors ?? ['pricing']) {
        if (!ids.has(anchor)) {
            failures.push({
                path: `#${anchor}`,
                rule: 'required-anchor',
                detail: `the #${anchor} anchor must be kept: other pages and posts link to it`,
            })
        }
    }
}

function checkFactsFile(): void {
    const sourceIds = new Set(SOURCES.map((source) => source.id))
    for (const fact of FACTS) {
        const own = new Set(fact.figures.map(declaredKey))
        const ownYears = new Set<number>(fact.years ?? [])
        const { figures, years, stray } = extractFigures(fact.statement)
        for (const figure of figures) {
            const key = figureKey(figure.unit, figure.min, figure.max)
            if (!own.has(key)) {
                failures.push({
                    path: `${CONFIG.factsFile} ${fact.id}`,
                    rule: 'fact-statement-drift',
                    detail: `statement says "${figure.raw}" (${key}), which the fact does not declare`,
                })
            }
        }
        for (const year of years) {
            if (!ownYears.has(year) && !declaredYears.has(year)) {
                failures.push({
                    path: `${CONFIG.factsFile} ${fact.id}`,
                    rule: 'fact-statement-drift',
                    detail: `statement names ${year}, which no source or fact declares`,
                })
            }
        }
        for (const raw of stray) {
            failures.push({
                path: `${CONFIG.factsFile} ${fact.id}`,
                rule: 'unclassified-number',
                detail: `"${raw}" in the statement has no unit`,
            })
        }
        const statement = fact.statement.toLowerCase()
        if (!fact.concepts.some((concept) => statement.includes(concept))) {
            failures.push({
                path: `${CONFIG.factsFile} ${fact.id}`,
                rule: 'fact-concepts',
                detail: `the statement contains none of its concepts (${fact.concepts.join(', ')})`,
            })
        }
        for (const id of fact.sourceIds) {
            if (!sourceIds.has(id)) {
                failures.push({
                    path: `${CONFIG.factsFile} ${fact.id}`,
                    rule: 'unknown-source',
                    detail: id,
                })
            }
        }
    }
}

// ─── Run ────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
    const { html, from } = await readPage()
    const document = parse(html)
    const page = find(document, (el) => hasClass(el, CONFIG.rootClass))
    if (!page) {
        throw new Error(
            `${from} has no .${CONFIG.rootClass} element: is the ${CONFIG.name} module registered?`
        )
    }

    // The page body: every block of text, and the alt text of every image.
    const body = collectBlocks(page)
    const alts: CopyString[] = findAll(
        page,
        (el) => el.tagName === 'img' && Boolean(attr(el, 'alt'))
    ).map((img) => ({
        path: `img alt "${attr(img, 'alt')!.slice(0, 48)}…"`,
        text: attr(img, 'alt')!,
        siblings: [],
    }))

    // The head: the title and every description a search result or a share
    // card can show.
    const head: CopyString[] = findAll(
        document,
        (el) =>
            el.tagName === 'title' ||
            (el.tagName === 'meta' &&
                /^(description|og:title|og:description|twitter:title|twitter:description)$/.test(
                    attr(el, 'name') ?? attr(el, 'property') ?? ''
                ))
    ).map((el) => ({
        path: `head ${el.tagName === 'title' ? 'title' : (attr(el, 'name') ?? attr(el, 'property'))}`,
        text:
            el.tagName === 'title'
                ? blockText(el)
                : (attr(el, 'content') ?? ''),
        siblings: [],
    }))

    // The page's own graph nodes. The site-wide organization node belongs to
    // the root layout, not to this page's copy.
    const nodes = ldNodes(document)
    const pageNodes = nodes.filter((node) =>
        String(node['@id'] ?? '').includes(`/procedures/${SLUG}#`)
    )
    const structured: CopyString[] = []
    for (const node of pageNodes) {
        collectLd(node, `ld ${node['@type']}`, structured)
    }

    const copy = [...body, ...alts, ...head, ...structured]
    for (const entry of copy) {
        checkFigures(entry)
        checkWording(entry)
        checkPlaceholders(entry)
    }
    checkAnswers(page)
    const faqs = checkFaqs(page, pageNodes)
    checkAnchors(document, page)
    checkFactsFile()

    const sectionWords = new Map<string, number>()
    for (const { path, text } of body) {
        const section = path.split(' ')[0]!
        sectionWords.set(
            section,
            (sectionWords.get(section) ?? 0) + wordCount(text)
        )
    }
    const totalWords = [...sectionWords.values()].reduce((a, b) => a + b, 0)

    const dedupe = (findings: Finding[]) => [
        ...new Map(
            findings.map((f) => [`${f.path}|${f.rule}|${f.detail}`, f])
        ).values(),
    ]

    console.log(
        `${CONFIG.name} copy sweep${LAUNCH ? ' (launch)' : ''}: ${from}`
    )
    console.log(
        `  ${copy.length} strings (${body.length} body, ${alts.length} alt, ${head.length} head, ${structured.length} structured data) · ${totalWords} words on the page · ${faqs.length} FAQs · ${FACTS.length} facts · ${declaredFigures.size} declared figures`
    )
    console.log(
        `  words by section: ${[...sectionWords].map(([s, n]) => `${s} ${n}`).join(' · ')}`
    )
    for (const w of dedupe(warnings)) {
        console.log(`  warn  ${w.rule}  ${w.path}: ${w.detail}`)
    }
    for (const f of dedupe(failures)) {
        console.log(`  FAIL  ${f.rule}  ${f.path}: ${f.detail}`)
    }
    if (MAP) {
        const sourcesOf = (factId: string) =>
            FACTS.find((fact) => fact.id === factId)?.sourceIds.join(', ') ?? ''
        console.log(
            '\n| Where | Figure | Fact | Sources |\n| --- | --- | --- | --- |'
        )
        for (const { path, raw, factIds } of licensedFigures) {
            console.log(
                `| \`${path}\` | ${raw} | ${factIds.join(', ')} | ${[...new Set(factIds.map(sourcesOf))].join('; ')} |`
            )
        }
    }
    const failureCount = dedupe(failures).length
    console.log(
        failureCount === 0
            ? `  clean${warnings.length ? ` (${dedupe(warnings).length} warnings)` : ''}`
            : `  ${failureCount} failures`
    )
    process.exit(failureCount === 0 ? 0 : 1)
}

main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error)
    process.exit(2)
})
