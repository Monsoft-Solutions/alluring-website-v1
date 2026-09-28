/**
 * The copy sweep's number reader: finds every figure in a string of copy,
 * with its unit, and every number it can't tie to one.
 *
 * `check-procedure-copy.ts` fails a figure its page's facts file doesn't
 * declare and any number left over, so a unit the reader doesn't know is a
 * number the sweep fails. Units: %, $, cc (implant and fat volumes), BMI,
 * minutes to years, nights (a stay), inches (an incision), ages ("22 or
 * older"), deaths, studies and patients, plus "1 in N" and temperatures.
 *
 * Pure: no page, config or process state, so a unit test can read it.
 *
 * @module
 */

import type { ProcedureFigure } from '../lib/data/procedures/facts/procedure-facts'

export type Unit = ProcedureFigure['unit'] | 'ratio' | 'temperature'

export interface Extracted {
    unit: Unit
    min: number
    max: number
    raw: string
}

/** `[pattern, replacement]`: identifiers with digits that are not figures. */
export type Identifiers = readonly (readonly [RegExp, string])[]

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

const TIME_UNIT = '(?:minutes?|hours?|days?|nights?|weeks?|months?|years?)'
const NUMBER_WORD = `(?:${Object.keys(NUMBER_WORDS).join('|')})`
const JOINER = '(?:-|to|or|and)'

function normalize(text: string, identifiers: Identifiers): string {
    let t = ` ${text.toLowerCase()} `
    t = t.replace(/[–—−]/g, '-')
    // Identifiers that contain digits but are not figures: the page's own
    // (a statute number), then the ones every page may use.
    for (const [pattern, replacement] of identifiers) {
        t = t.replace(pattern, replacement)
    }
    t = t.replace(/\blipo\s*360\b/g, ' lipo-all-round ')
    // "360-degree liposuction" is the same procedure's name, not a figure;
    // the gallery's alt text uses it.
    t = t.replace(/\b360[\s-]*degree\b/g, ' all-round ')
    t = t.replace(/\b24\s*\/\s*7\b/g, ' around-the-clock ')
    t = t.replace(/\bpercent\b/g, '%')
    t = t.replace(
        new RegExp(`\\b(${NUMBER_WORD})\\s*(%|cc\\b)`, 'g'),
        (_, a: string, unit: string) => `${NUMBER_WORDS[a]}${unit}`
    )
    // "a two-inch incision".
    t = t.replace(
        new RegExp(`\\b(${NUMBER_WORD})[\\s-]*(inch(?:es)?)\\b`, 'g'),
        (_, a: string, unit: string) => `${NUMBER_WORDS[a]} ${unit}`
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
            `\\b(minute|hour|day|night|week|month|year)s?\\s+(${NUMBER_WORD})\\b`,
            'g'
        ),
        (_, unit: string, a: string) => `${unit} ${NUMBER_WORDS[a]}`
    )
    // Ordinals: "the second month" is month 2, "the first night" night 1.
    t = t.replace(
        new RegExp(
            `\\b(${Object.keys(ORDINALS).join('|')})\\s+(minute|hour|day|night|week|month|year)\\b(?!s)`,
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
    if (/^night/.test(word)) return 'night'
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

const range =
    (unit: Unit, first = 1) =>
    (m: RegExpExecArray): Omit<Extracted, 'raw'> => ({
        unit,
        min: toNumber(m[first]!),
        max: toNumber(m[first + 1] ?? m[first]!),
    })

/**
 * In order: each pattern blanks what it reads, so a later one never reads
 * the same digits again. Ages come before the time units, so "22 years
 * old" is an age, not a duration.
 */
const PATTERNS: Pattern[] = [
    {
        re: new RegExp(`${NUM}\\s*hours-per-day`, 'g'),
        read: range('hour'),
    },
    {
        re: new RegExp(`\\$${NUM}(?:\\s*-\\s*\\$?${NUM})?`, 'g'),
        read: range('usd'),
    },
    {
        re: new RegExp(`${NUM}(?:\\s*-\\s*${NUM})?\\s*%`, 'g'),
        read: range('percent'),
    },
    {
        re: new RegExp(`\\bbmi\\b[^\\d]{0,20}${NUM}(?:\\s*-\\s*${NUM})?`, 'g'),
        read: range('bmi'),
    },
    {
        // "300 cc", "300cc", "300-400 cc", "350 ccs", "300 cubic centimeters".
        re: new RegExp(
            `${NUM}(?:\\s*-\\s*${NUM})?\\s*(?:ccs?\\b|cubic centimet(?:er|re)s?\\b)`,
            'g'
        ),
        read: range('cc'),
    },
    {
        // "a 2-inch incision", "1-2 inches".
        re: new RegExp(`${NUM}(?:\\s*-\\s*${NUM})?[\\s-]*inch(?:es)?\\b`, 'g'),
        read: range('inch'),
    },
    {
        // "age 22", "aged 18", "ages 18-22", "the age of 18".
        re: new RegExp(
            `\\b(?:age[sd]?|the age of)\\s+${NUM}(?:\\s*-\\s*${NUM})?(?:\\s*(?:years?(?:\\s*old)?|or (?:older|over)|and (?:older|over|up)))?`,
            'g'
        ),
        read: range('age'),
    },
    {
        // "22 or older", "18 and over", "22 years or older", "18 years old
        // and up", "22 years old", "18 years of age".
        re: new RegExp(
            `${NUM}\\s*(?:(?:years?\\s*(?:old|of age)?\\s*)?(?:or|and)\\s+(?:older|over|up)\\b|years?\\s*(?:old|of age)\\b)`,
            'g'
        ),
        read: range('age'),
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
            `${NUM}(?:\\s*-\\s*${NUM})?\\s*(minutes?|mins?|hours?|hrs?|days?|nights?|weeks?|months?|years?|deaths?|studies|study|patients?)\\b`,
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
            `\\b(minute|hour|day|night|week|month|year)s?\\s+${NUM}(?:\\s*-\\s*${NUM})?`,
            'g'
        ),
        read: (m) => ({
            unit: unitOf(m[1]!),
            min: toNumber(m[2]!),
            max: toNumber(m[3] ?? m[2]!),
        }),
    },
]

/**
 * Every figure in `text`, the calendar years it names, and the numbers it
 * could tie to no unit (`stray`), which the sweep fails.
 */
export function extractFigures(
    text: string,
    identifiers: Identifiers = []
): {
    figures: Extracted[]
    years: number[]
    stray: string[]
} {
    let t = normalize(text, identifiers)
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

export function figureKey(unit: string, min: number, max: number): string {
    return `${unit}:${min}-${max}`
}

export function declaredKey(figure: ProcedureFigure): string {
    return 'value' in figure
        ? figureKey(figure.unit, figure.value, figure.value)
        : figureKey(figure.unit, figure.min, figure.max)
}
