/**
 * The claims canon as prompt text, so every AI surface gets the same rules
 * from the same data instead of its own pasted copy.
 *
 * - `chat`: Sofía, the website concierge. Gets the current starting prices in
 *   plain text (with any discount), the caveat and the contact details.
 * - `blog-writer`: the post writer and refresh writer. Never sees a price;
 *   gets the claim tokens to write instead.
 * - `blog-reviewer`: the review agents. Treat a typed Alluring price as a
 *   defect and tokens as correct.
 * - `blog-planner`: topics, outlines and content briefs, which never write a
 *   price. The writer's rules without the token catalog (about 5k tokens
 *   the planner would pay for on every call and never use).
 * - `image`, `gallery`: image prompts and gallery copy. No prices at all.
 *
 * The server appends the chat block to whatever `chat_config.system_prompt`
 * holds, so an admin edit cannot reintroduce a retired claim (canon §12).
 *
 * @module @workspace/shared/claims/prompt
 */
import {
    CONTACT,
    CONTACT_ADDRESS_LINE,
    CONTACT_PAGE_PATH,
    CONTACT_RULES,
    HOURS_LINE,
} from './contact'
import {
    FINANCING_FORBIDDEN,
    FINANCING_SENTENCE_LONG,
    getFinancingPartnersString,
} from './financing'
import {
    AREA_SERVED,
    BUSINESS_NAME,
    CHAT_AGENT,
    DESCRIPTION_LONG,
    RETIRED_BRAND_LINES,
    TAGLINE,
    TRAVEL_RULES,
    VOICE_RULES,
} from './identity'
import {
    CLAIM_PROCEDURES,
    FALLBACK_PRICING,
    NATIONAL_AVERAGE_EXCLUSION,
    NATIONAL_AVERAGES,
    PRICE_CAVEAT_LONG,
    PRICE_FRAMING_RULES,
} from './prices'
import {
    formatComboDiscountSentence,
    formatPriceText,
    formatTypicalRangeText,
    formatUsd,
    getDiscountStatement,
    getPriceDisplay,
    getTypicalRange,
    type PricingSnapshot,
} from './pricing'
import {
    FORBIDDEN_CREDENTIAL_PHRASES,
    KARLINSKY_CREDENTIALS,
    KARLINSKY_NAME,
    KARLINSKY_SHORT_NAME,
} from './surgeon'
import { CLAIM_TOKEN_SPECS, listClaimTokens } from './tokens'
import { RATING_RULE, UNVERIFIED_TRUST_CLAIMS } from './trust'

export type ClaimsPromptAudience =
    | 'chat'
    | 'blog-writer'
    | 'blog-reviewer'
    | 'blog-planner'
    | 'image'
    | 'gallery'

const bullets = (items: readonly string[]) =>
    items.map((item) => `- ${item}`).join('\n')

const section = (heading: string, body: string) => `### ${heading}\n\n${body}`

const SUPERLATIVES_AND_REGULATED = [
    'No superlatives about the practice, the surgeon, results or outcomes: "best", "top", "#1", "leading", "world-class", "premier", "elite", "renowned", "cutting-edge", "state-of-the-art", "most advanced", "unmatched". Generic advice wording ("the best way to sleep after a BBL", "best candidates") is fine.',
    'No promises: "guaranteed", "risk-free", "painless", "scarless", "perfect results", "permanent results", "dream body", "transform your body".',
    'No "luxury", "luxurious", "affordable" or "affordability".',
    'No urgency: "limited time", "act now", "spots left", "hurry", countdowns.',
    'Never "free" for a medical service (free surgery, free lipo area, free follow-ups, free garment), nor "complimentary" or "no-cost". "Free consultation" stays only where it already stands; new copy says "consultation" or "virtual consultation".',
    'No "medically reviewed by", "fact-checked by" or a medical review board.',
]

const MEDICAL_FIGURES = [
    'For BBL, liposuction and tummy tuck, every figure (%, $, time, count, volume, BMI, age) matches the procedure facts files, with their attribution.',
    'Any other figure needs a citation to ASPS, The Aesthetic Society, Cleveland Clinic, Mayo Clinic, MedlinePlus, the FDA or a PubMed-indexed journal, named inline. Never RealSelf, Healthline or clinic blogs.',
    'A third party quoted on the ASPS site is "a plastic surgeon interviewed by ASPS", never "ASPS says".',
    'Never a "1 in N" BBL mortality figure as current risk, "the deadliest cosmetic surgery", a capsular contracture rate without a read source, or a longevity claim ("implants last 10–20 years"); say "long-lasting" at most.',
    'Garment, massage and pillow schedules are evidence plus "or as your surgeon directs", never the practice\'s protocol.',
]

function identitySection(): string {
    return section(
        'Who the practice is',
        bullets([
            DESCRIPTION_LONG,
            `Call it "${BUSINESS_NAME}" first, then "Alluring". "Plastic surgery" is fine as the practice and service term; never call the surgeon a "plastic surgeon".`,
            `Market: the United States only (${AREA_SERVED.join(', ')}). Spanish content is for Spanish speakers within the US.`,
            `Tagline: "${TAGLINE}". Never: ${RETIRED_BRAND_LINES.map((line) => `"${line}"`).join(', ')}.`,
            ...VOICE_RULES,
        ])
    )
}

function surgeonSection(): string {
    return section(
        'The surgeon',
        bullets([
            `One surgeon performs every procedure at Alluring: ${KARLINSKY_NAME} (first mention), then "${KARLINSKY_SHORT_NAME}". Never "our surgeons" or "team of surgeons", and never another surgeon's name. Dr. Rita Shats: add no new mentions.`,
            `Her credentials, verbatim: "${KARLINSKY_CREDENTIALS}"`,
            'Never mention the American Board of Cosmetic Surgery or the American Board of Facial Cosmetic Surgery: Florida requires a statement that has no place here.',
            'Do not repeat her medical school, residency or fellowship.',
            `Never: ${FORBIDDEN_CREDENTIAL_PHRASES.join('; ')}.`,
        ])
    )
}

function trustSection(): string {
    return section(
        'Facility, safety and reviews',
        bullets([
            'The surgery is outpatient and you go home the same day. "An anesthesia provider monitors you throughout surgery."',
            RATING_RULE,
            ...UNVERIFIED_TRUST_CLAIMS.map((claim) => `Never: ${claim}.`),
        ])
    )
}

function financingSection(): string {
    return section(
        'Financing',
        bullets([
            FINANCING_SENTENCE_LONG,
            `Name the partners (${getFinancingPartnersString()}); quote no number.`,
            ...FINANCING_FORBIDDEN.map((item) => `Never: ${item}.`),
        ])
    )
}

function travelSection(): string {
    return section(
        'Travel',
        bullets([
            ...TRAVEL_RULES.approved,
            ...TRAVEL_RULES.forbidden.map((item) => `Never: ${item}.`),
        ])
    )
}

/** The chat agent's current starting prices, in plain text. */
function chatPriceLines(pricing: PricingSnapshot): string[] {
    const lines: string[] = []
    for (const procedure of CLAIM_PROCEDURES) {
        if (!procedure.path) continue
        const display = getPriceDisplay(pricing, procedure.key)
        if (!display) continue
        const range = getTypicalRange(pricing, procedure.key)
        // D2: there is no facelift-alone price, only the named line.
        lines.push(
            procedure.key === 'facelift'
                ? `facelift: no facelift-alone price. A ${display.label} is ${formatPriceText(display)}.`
                : `${procedure.name}: from ${formatPriceText(display)} for ${display.label}${range ? `, and ${formatTypicalRangeText(range)}` : ''}`
        )
    }
    lines.push(
        'mommy makeover: no total. It is priced part by part from the procedures in the plan, minus the combination discount.'
    )
    return lines
}

function chatPricesSection(pricing: PricingSnapshot): string {
    const statement = getDiscountStatement(pricing)
    return section(
        'Prices',
        [
            "You may quote these starting prices from the practice price list, always with the caveat. Quote no other figure: no range except BBL's, no total for a combination, no deposit amount, no weekly or monthly payment.",
            bullets(chatPriceLines(pricing)),
            bullets([
                formatComboDiscountSentence(pricing),
                `The caveat, with every price: "${PRICE_CAVEAT_LONG}"`,
                ...(statement
                    ? [
                          `A discount is on. Whenever you quote a discounted price, also give this statement verbatim: "${statement}"`,
                      ]
                    : []),
                'Do not say that a financing application uses a soft credit check.',
            ]),
        ].join('\n\n')
    )
}

function contactSection(): string {
    return section(
        'Contact',
        bullets([
            `Phone ${CONTACT.phoneDisplay} (calls only; it does not receive texts). Email ${CONTACT.email}.`,
            `Address: ${CONTACT_ADDRESS_LINE}. Hours: ${HOURS_LINE}`,
            `Link to the contact page as ${CONTACT_PAGE_PATH} on www.alluringplasticsurgery.com. Never alluringmiami.com.`,
            `You are ${CHAT_AGENT.name}, ${CHAT_AGENT.title}. Never "virtual assistant" or "asistente virtual", and never connected to travel.`,
            'Never promise a response time.',
        ])
    )
}

function nationalAverageLines(): string[] {
    return Object.values(NATIONAL_AVERAGES).map(
        ({ usd, procedure }) =>
            `ASPS national average for ${procedure}: ${formatUsd(usd)}, ${NATIONAL_AVERAGE_EXCLUSION}.`
    )
}

function tokenSection(
    pricing: PricingSnapshot,
    audience: 'blog-writer' | 'blog-reviewer'
): string {
    const intro =
        audience === 'blog-writer'
            ? 'Never type an Alluring price. Use tokens. Every Alluring price, price range, discount and canon sentence is a claim token, which the site fills in from the live price list when the post is shown. Tokens are plain text: double square brackets, lowercase, no spaces. Never type a dollar figure for the practice, a discounted figure or a "% off".'
            : 'Claim tokens are correct as written: never expand, reword or remove one. A typed dollar figure for an Alluring price is a defect: replace it with the matching token. An unknown token is a defect.'
    const grammar = CLAIM_TOKEN_SPECS.map(
        (spec) => `- ${spec.syntax.join(', ')}: ${spec.description}`
    ).join('\n')
    const catalog = listClaimTokens(pricing)
        .map((entry) => `- ${entry.token}: ${entry.description}`)
        .join('\n')

    return section(
        'Prices and claim tokens',
        [
            intro,
            grammar,
            'Every valid token:',
            catalog,
            bullets([
                'Put [[price-caveat]] or [[price-caveat:long]] in the same paragraph, list or table as any price token.',
                'Never put a price token in a heading: write "## How much does a BBL cost?" and give the price in the sentence under it.',
                'Name the variant next to a starting price: "from [[price:tummy-tuck]] for a [[price-label:tummy-tuck]]". Where the sentence names the variant itself, name the line: "a mini tummy tuck is [[price:tummy-tuck:mini]]".',
                'Facelift: there is no facelift-alone price and [[price:facelift]] is invalid. Only "A face and neck lift is [[price:facelift:face-neck-lift]]".',
                'Liposuction of one area added to another procedure: "[[price-span:lipo:add-ons]], depending on the area".',
                'BBL: "A BBL at Alluring starts at [[price:bbl]], and [[price-range:bbl]]."',
                'Combinations: [[combo-discount]]. Never "save up to" or a percentage.',
                ...PRICE_FRAMING_RULES,
                "National averages are not Alluring prices and are typed, only these, always attributed to ASPS with what they leave out, never with a year, never placed so they read as the practice's price:",
                ...nationalAverageLines(),
            ]),
        ].join('\n\n')
    )
}

/**
 * Prices for the planners: what a plan may and may not promise. No token
 * catalog: they never write a price, the writer does.
 */
function plannerPricesSection(): string {
    return section(
        'Prices',
        bullets([
            'Never type an Alluring price, a discounted figure or a "% off" in a topic, title, heading, outline point, brief or meta description. The writer places every Alluring price from the live price list.',
            'A plan may cover what a price depends on and that the surgeon confirms it at consultation. It never promises a figure, a total for a combination, a deposit, or a weekly or monthly payment.',
            'There is no facelift-alone price and no mommy makeover total. No "all-inclusive", "no hidden fees" or "everything included".',
            "National averages are ASPS figures, not Alluring prices: attributed, with what they leave out, never placed so they read as the practice's price.",
        ])
    )
}

function postContactSection(): string {
    return section('Contact in posts', bullets([...CONTACT_RULES]))
}

/**
 * The canon rules for one audience, as a Markdown block to append to its
 * system prompt. Pass the live pricing snapshot; the 2026-09-15 sheet is the
 * fallback.
 */
export function buildClaimsPromptBlock(
    audience: ClaimsPromptAudience,
    pricing: PricingSnapshot = FALLBACK_PRICING
): string {
    const header = `## Claims canon\n\nEverything you write follows these rules. If a claim is not allowed here, leave it out; never replace it with another claim that is not verified.`
    const regulated = section(
        'Superlatives and regulated words',
        bullets(SUPERLATIVES_AND_REGULATED)
    )

    const parts: string[] = [header, identitySection()]

    switch (audience) {
        case 'chat':
            parts.push(
                surgeonSection(),
                trustSection(),
                chatPricesSection(pricing),
                financingSection(),
                travelSection(),
                regulated,
                contactSection()
            )
            break
        case 'blog-writer':
        case 'blog-reviewer':
            parts.push(
                surgeonSection(),
                trustSection(),
                tokenSection(pricing, audience),
                financingSection(),
                section('Medical figures', bullets(MEDICAL_FIGURES)),
                travelSection(),
                regulated,
                postContactSection()
            )
            break
        case 'blog-planner':
            parts.push(
                surgeonSection(),
                trustSection(),
                plannerPricesSection(),
                financingSection(),
                section('Medical figures', bullets(MEDICAL_FIGURES)),
                travelSection(),
                regulated
            )
            break
        case 'image':
        case 'gallery':
            parts.push(
                section(
                    'Prices',
                    'Never put a price, a payment figure, a discount or "% off" in an image, a caption or gallery copy.'
                ),
                travelSection(),
                regulated
            )
            break
    }

    return parts.join('\n\n')
}
