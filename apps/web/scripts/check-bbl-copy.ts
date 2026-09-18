/**
 * BBL copy sweep (#252, gate for #256).
 *
 * Walks every string in the BBL page content (headings, answers, FAQ answers,
 * link labels, alt text) and fails on:
 *
 *   - any %, cc, BMI, $, minute, hour, day, week, month, year or count figure
 *     that `bbl.facts.ts` does not declare, and any number it cannot classify;
 *   - board-certification wording outside the `{{CREDENTIALS}}` placeholder;
 *   - the six practice claims still waiting on the owner (#247 item 3);
 *   - travel-coordination or non-US wording (CLAUDE.md);
 *   - "best", "safest", guarantees and keyword bolding;
 *   - pricing terms in a non-price FAQ, which `/landing/procedure/[slug]`
 *     would silently drop;
 *   - a question-phrased H2 whose direct answer is not 40–60 words.
 *
 * It also checks that every fact statement uses only its own figures, so the
 * facts file cannot drift from itself.
 *
 * The checks are concept-based and case-insensitive: they look for any figure
 * of a kind, not for the strings a previous fix removed. A sweep built from a
 * fix list only proves the fix list was applied.
 *
 * Placeholders are a warning by default and a failure with `--launch`.
 *
 * Usage: pnpm --filter web check:bbl-copy [--launch] [--map]
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import {
    bblAnswerSections,
    bblImages,
    bblPageContent,
} from '../components/procedures/pages/bbl/bbl-page.content'
import {
    bblFacts,
    bblSources,
    type BblFigure,
} from '../lib/data/procedures/facts/bbl.facts'

const LAUNCH = process.argv.includes('--launch')
// Print every licensed figure with the fact and sources behind it (markdown).
const MAP = process.argv.includes('--map')

const KNOWN_PLACEHOLDERS: Record<string, number> = {
    // Expected length in words, for the 40–60 word answer check.
    '{{CREDENTIALS}}': 12,
    '{{BBL_SURGEON}}': 3,
}

// Keys whose values are identifiers or URLs, not copy.
const NON_COPY_KEYS = new Set([
    'id',
    'href',
    'src',
    'status',
    'aspect',
    'topic',
    'factIds',
    'sourceIds',
    'lawSourceId',
])

interface CopyString {
    path: string
    text: string
    /** The other strings in the same object or array: a row's label, a milestone's heading. */
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

// ─── Collect every copy string ──────────────────────────────────────────────

function collect(
    value: unknown,
    path: string,
    out: CopyString[],
    siblings: string[] = []
): void {
    if (typeof value === 'string') {
        out.push({
            path,
            text: value,
            siblings: siblings.filter((sibling) => sibling !== value),
        })
        return
    }
    const entries: [string, unknown][] = Array.isArray(value)
        ? value.map((item, index) => [`${path}[${index}]`, item])
        : value && typeof value === 'object'
          ? Object.entries(value)
                .filter(([key]) => !NON_COPY_KEYS.has(key))
                .map(([key, child]) => [path ? `${path}.${key}` : key, child])
          : []
    const strings = entries
        .map(([, child]) => child)
        .filter((child): child is string => typeof child === 'string')
    for (const [childPath, child] of entries) {
        collect(child, childPath, out, strings)
    }
}

const copy: CopyString[] = []
collect(bblPageContent, '', copy)
// Images reached through the content are already collected; add any slot the
// content does not reference so its alt text is swept too.
collect(bblImages, 'images', copy)

// ─── Figures ────────────────────────────────────────────────────────────────

type Unit = BblFigure['unit'] | 'cc' | 'bmi' | 'ratio' | 'temperature'

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
    // Identifiers that contain digits but are not figures.
    t = t.replace(/§\s*458\.328/g, ' statute ')
    t = t.replace(/\b458\.328\b/g, ' statute ')
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

function declaredKey(figure: BblFigure): string {
    return 'value' in figure
        ? figureKey(figure.unit, figure.value, figure.value)
        : figureKey(figure.unit, figure.min, figure.max)
}

const declaredFigures = new Set(
    bblFacts.flatMap((fact) => fact.figures.map(declaredKey))
)

/** Which facts license a figure, for the context check. */
const factsByFigure = new Map<string, (typeof bblFacts)[number][]>()
for (const fact of bblFacts) {
    for (const key of fact.figures.map(declaredKey)) {
        factsByFigure.set(key, [...(factsByFigure.get(key) ?? []), fact])
    }
}

function sentences(text: string): string[] {
    return text.split(/(?<=[.;?!])\s+(?=[A-Z0-9({$])/)
}
const declaredYears = new Set<number>([
    ...bblFacts.flatMap((fact) =>
        'years' in fact ? (fact.years as readonly number[]) : []
    ),
    ...bblSources.flatMap((source) =>
        source.date ? [Number(source.date.slice(0, 4))] : []
    ),
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
                    detail: `"${figure.raw}" (${key}) is not declared in bbl.facts.ts`,
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
    /by plastic surgeon kamran azad/g,
    /a plastic surgeon gives in asps/g,
]

interface Rule {
    rule: string
    re: RegExp
    why: string
}

const WORDING_RULES: Rule[] = [
    {
        rule: 'certification',
        re: /\babps\b|american board of plastic surgery|double[\s-]board|board[\s-]certified|plastic surg\w*[^.]{0,40}\bboard\b|\bboard\b[^.]{0,40}plastic surg|\bplastic surgeons?\b/,
        why: 'credentials are stated only through {{CREDENTIALS}} (#247, #248)',
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
        rule: 'volume-figure',
        re: /\bcc\b|\bml\b|cubic centimet|\bbmi\b/,
        why: 'no fat volume or BMI figure is in the sourced standard (#252)',
    },
    {
        rule: 'keyword-bolding',
        re: /\*\*|__/,
        why: 'no keyword bolding (#252)',
    },
]

function checkWording({ path, text }: CopyString): void {
    let t = text.toLowerCase()
    for (const name of NEUTRAL_NAMES) t = t.replace(name, ' ')
    for (const { rule, re, why } of WORDING_RULES) {
        const match = t.match(re)
        if (match) {
            failures.push({ path, rule, detail: `"${match[0]}": ${why}` })
        }
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
                detail: `${placeholder} still waits on #247`,
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

function checkAnswers(): void {
    for (const section of bblAnswerSections) {
        const words = wordCount(section.answer)
        if (words < 40 || words > 60) {
            failures.push({
                path: `${section.id}.answer`,
                rule: 'answer-length',
                detail: `${words} words under "${section.heading}"; the direct answer must be 40–60`,
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

function checkFaqs(): void {
    const terms = readPricingTerms()
    bblPageContent.faq.items.forEach((faq, index) => {
        if (faq.topic === 'price') return
        const haystack = `${faq.question} ${faq.answer}`.toLowerCase()
        const hit = terms.find((term) => haystack.includes(term))
        if (hit) {
            failures.push({
                path: `faq.items[${index}]`,
                rule: 'pricing-term-in-general-faq',
                detail: `"${hit}" in "${faq.question}" — the paid landing page would drop it`,
            })
        }
    })
}

function checkAnchors(): void {
    const ids = new Set<string>(
        Object.values(bblPageContent).flatMap((section) =>
            section && typeof section === 'object' && 'id' in section
                ? [String(section.id)]
                : []
        )
    )
    for (const link of bblPageContent.jumpLinks) {
        if (!ids.has(link.href.slice(1))) {
            failures.push({
                path: 'jumpLinks',
                rule: 'dead-anchor',
                detail: `${link.href} has no section`,
            })
        }
    }
    if (!ids.has('pricing')) {
        failures.push({
            path: 'cost.id',
            rule: 'pricing-anchor',
            detail: 'the #pricing anchor must be kept',
        })
    }
}

function checkFactsFile(): void {
    const sourceIds = new Set(bblSources.map((source) => source.id))
    for (const fact of bblFacts) {
        const own = new Set(fact.figures.map(declaredKey))
        const ownYears = new Set<number>(
            'years' in fact ? (fact.years as readonly number[]) : []
        )
        const { figures, years, stray } = extractFigures(fact.statement)
        for (const figure of figures) {
            const key = figureKey(figure.unit, figure.min, figure.max)
            if (!own.has(key)) {
                failures.push({
                    path: `bbl.facts.ts ${fact.id}`,
                    rule: 'fact-statement-drift',
                    detail: `statement says "${figure.raw}" (${key}), which the fact does not declare`,
                })
            }
        }
        for (const year of years) {
            if (!ownYears.has(year) && !declaredYears.has(year)) {
                failures.push({
                    path: `bbl.facts.ts ${fact.id}`,
                    rule: 'fact-statement-drift',
                    detail: `statement names ${year}, which no source or fact declares`,
                })
            }
        }
        for (const raw of stray) {
            failures.push({
                path: `bbl.facts.ts ${fact.id}`,
                rule: 'unclassified-number',
                detail: `"${raw}" in the statement has no unit`,
            })
        }
        const statement = fact.statement.toLowerCase()
        if (!fact.concepts.some((concept) => statement.includes(concept))) {
            failures.push({
                path: `bbl.facts.ts ${fact.id}`,
                rule: 'fact-concepts',
                detail: `the statement contains none of its concepts (${fact.concepts.join(', ')})`,
            })
        }
        for (const id of fact.sourceIds) {
            if (!sourceIds.has(id)) {
                failures.push({
                    path: `bbl.facts.ts ${fact.id}`,
                    rule: 'unknown-source',
                    detail: id,
                })
            }
        }
    }
}

// ─── Run ────────────────────────────────────────────────────────────────────

for (const entry of copy) {
    checkFigures(entry)
    checkWording(entry)
    checkPlaceholders(entry)
}
checkAnswers()
checkFaqs()
checkAnchors()
checkFactsFile()

const faqCount = bblPageContent.faq.items.length
if (faqCount < 10 || faqCount > 14) {
    warnings.push({
        path: 'faq.items',
        rule: 'faq-count',
        detail: `${faqCount} FAQs; #252 asks for about 12`,
    })
}

const prose = copy.filter(
    ({ path }) => !/\.alt$/.test(path) && !path.startsWith('images')
)
const sectionWords = new Map<string, number>()
for (const { path, text } of prose) {
    const section = path.split(/[.[]/)[0] ?? path
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

console.log(`BBL copy sweep${LAUNCH ? ' (launch)' : ''}`)
console.log(
    `  ${copy.length} strings · ${totalWords} words of copy (alt text excluded) · ${faqCount} FAQs · ${bblFacts.length} facts · ${declaredFigures.size} declared figures`
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
        bblFacts.find((fact) => fact.id === factId)?.sourceIds.join(', ') ?? ''
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
