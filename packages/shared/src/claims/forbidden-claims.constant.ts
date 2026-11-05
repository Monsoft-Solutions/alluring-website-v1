/**
 * Wording the practice must not publish, as patterns.
 *
 * These mirror the sweep the hand-written blog path already runs
 * (`SWEEP` in `blog/tools/lib/bloglib.py`), for AI output. Two rules differ on
 * purpose, because a report nobody can act on gets ignored: bare "best" is left
 * out ("the best time to...") and so is "fly-in" (`/fly-in-consultation` is a
 * real page and patients do fly in).
 */

export type ClaimRuleGroup =
    | 'credential'
    | 'owner-claim'
    | 'medically-reviewed'
    | 'superlative'
    | 'luxury-affordable'
    | 'travel-or-market'
    | 'retired-price'
    | 'financing-figure'
    | 'urgency'
    | 'phone'

export const FORBIDDEN_CLAIM_PATTERNS: Record<
    ClaimRuleGroup,
    readonly string[]
> = {
    credential: [
        'board[\\s-]*certifi\\w*',
        '\\babps\\b',
        'american board of plastic surgery',
        'american board of (?:facial )?cosmetic surgery',
        '\\babcs\\b',
        '(?:double|triple|dual)[\\s-]board',
        '\\bplastic surgeons?\\b',
        '\\bour (?:\\w+ )?surgeons\\b',
        '\\bdr\\.? (?:andrew )?lofman\\b',
    ],
    'owner-claim': [
        'aaaasf',
        'accredit\\w*',
        '\\bjcaho\\b',
        'joint commission',
        '\\bvaser\\b',
        '\\bsmartlipo\\b',
        '\\bbodytite\\b',
        '24\\s*/\\s*7',
        'around[\\s-]the[\\s-]clock (?:support|care|access|availability)',
        '(?<!\\$)\\b5,?000\\s*\\+',
        '\\b5,?000\\+?\\s+(?:happy |satisfied )?(?:patients|procedures|surgeries|clients)',
        'thousands of (?:happy |satisfied )?(?:patients|procedures|surgeries|women|clients)',
        '\\b\\d{1,2}\\+\\s*years\\b',
        '\\b\\d{1,2}\\+?\\s+years of (?:experience|practice|expertise)',
    ],
    'medically-reviewed': [
        'medically[\\s-]reviewed',
        'medical(?:ly)? review(?:ed|er)\\b',
        'reviewed by (?:dr\\b|a doctor|our|the surgeon)',
        'fact[\\s-]checked by',
    ],
    superlative: [
        '\\bbest (?:surgeon|surgeons|clinic|practice|results?|plastic|cosmetic)\\b',
        '\\bsafest\\b',
        'guarantee\\w*',
        '\\bnumber one\\b',
        '\\bno\\.? ?1\\b',
        'world[\\s-]class',
        'top[\\s-]rated',
        '\\bleading (?:surgeon|practice|clinic|provider|expert|center|centre|plastic|cosmetic)',
        'industry[\\s-]leading',
        'cutting[\\s-]edge',
        'state[\\s-]of[\\s-]the[\\s-]art',
        'revolutionary',
        '\\bpainless\\b',
        '\\bscarless\\b',
    ],
    'luxury-affordable': [
        '\\bluxur(?:y|ious)\\b',
        '\\baffordab(?:le|ility)\\b',
    ],
    'travel-or-market': [
        'concierge',
        '\\bairport\\b',
        'pick[\\s-]?up service',
        '\\bhotels?\\b',
        '\\blodging\\b',
        'recovery (?:house|home|suite|retreat|villa)s?',
        'chauffeur',
        '\\bpackages?\\b',
        '\\binternational\\b',
        'latin america',
        'caribbean',
        'medical touris\\w*',
        '\\btransportation\\b',
        '(?:book|arrang|coordinat)\\w*\\s+(?:your\\s+|the\\s+)?(?:flights?|travel|transport\\w*|stay)',
    ],
    'retired-price': [
        '(?:\\bbbl\\b|brazilian butt lift)[^.\\n]{0,60}\\$(?:3,500|4,500)\\b',
        '\\$(?:3,500|4,500)\\b[^.\\n]{0,60}(?:\\bbbl\\b|brazilian butt lift)',
        '\\$2,?500\\b',
        '\\$3,000\\s*(?:[–-]|to)\\s*\\$5,000',
        '\\$8,000\\s*\\+',
        'tummy tuck[^.\\n]{0,60}\\$8,000\\b',
        '(?:breast|thigh|arm|body|butt|face|neck|brow)[\\s-]lift[^.\\n]{0,60}\\$6,500\\b',
    ],
    'financing-figure': [
        '\\$\\s?\\d[\\d,]*(?:\\.\\d+)?\\s*(?:/\\s*|a |per )(?:week|wk|month|mo)\\b',
        '(?:monthly|weekly) payments? (?:of|from|as low as)',
        '\\b0\\s*%\\s*(?:apr|interest)',
    ],
    urgency: [
        'limited[\\s-]time',
        '\\bact now\\b',
        'spots? (?:left|remaining)',
        '\\bhurry\\b',
        '\\bcountdown\\b',
    ],
    phone: ['\\(?\\b\\d{3}\\)?[\\s.-]\\d{3}[\\s.-]\\d{4}\\b', '\\btel:'],
}

/** Names and approved wording that contain a forbidden word but aren't claims. */
export const CLAIM_NEUTRAL_PATTERNS: readonly string[] = [
    'american society of plastic surgeons',
    'plastic surgeons? (?:interviewed|quoted) by (?:asps|the american society of plastic surgeons|the aesthetic society)',
    'plastic and reconstructive surgery(?: global open)?',
    'journal of plastic,? reconstructive (?:and|&) aesthetic surgery',
    'aesthetic surgery journal',
    'clinics in plastic surgery',
    'seminars in plastic surgery',
    'american society of anesthesiologists',
    'international society of aesthetic plastic surgery',
    'international (?:journal|federation|society|confederation) of',
    'board certified in general surgery by the american board of surgery',
    'financing (?:plan |payment )?packages?',
]

export type ClaimHit = {
    group: ClaimRuleGroup
    /** The words that matched */
    match: string
    /** The match with the words around it, for a person to read */
    excerpt: string
}

const EXCERPT_CONTEXT = 40

const NEUTRAL = new RegExp(CLAIM_NEUTRAL_PATTERNS.join('|'), 'gi')

const RULES = (
    Object.entries(FORBIDDEN_CLAIM_PATTERNS) as [
        ClaimRuleGroup,
        readonly string[],
    ][]
).flatMap(([group, patterns]) =>
    patterns.map((pattern) => ({ group, pattern: new RegExp(pattern, 'gi') }))
)

/**
 * Finds forbidden wording in copy. Link targets and approved names are removed
 * first, so `(https://example.com/best-plastic-surgeons)` isn't a claim.
 *
 * This reports and never rewrites: whether a hit is a real claim, or a quoted
 * source talking about something else, is for a person to decide.
 */
export function findClaimHits(text: string): ClaimHit[] {
    const swept = text
        .replace(/\]\([^)]*\)/g, ']')
        .replace(NEUTRAL, (name) => ' '.repeat(name.length))

    const hits: ClaimHit[] = []
    for (const { group, pattern } of RULES) {
        for (const found of swept.matchAll(pattern)) {
            const start = Math.max(0, found.index - EXCERPT_CONTEXT)
            const end = found.index + found[0].length + EXCERPT_CONTEXT
            hits.push({
                group,
                match: found[0],
                excerpt: swept.slice(start, end).replace(/\s+/g, ' ').trim(),
            })
        }
    }
    return hits
}
