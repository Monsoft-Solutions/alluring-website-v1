/**
 * Who the practice is, in the words every surface uses (claims canon §1).
 *
 * @module @workspace/shared/claims/identity
 */
import { KARLINSKY_NAME } from './surgeon'

/** Legal and display name. */
export const BUSINESS_NAME = 'Alluring Plastic Surgery'

/** The name in a sentence after the first mention. */
export const BUSINESS_SHORT_NAME = 'Alluring'

/** `siteConfig.business.tagline` since #290. */
export const TAGLINE = 'Personal care. Honest price.'

/** Replaces `siteConfig.business.description`'s short uses. */
export const DESCRIPTION_SHORT = `Cosmetic surgery in Miami, Florida, with one surgeon: ${KARLINSKY_NAME}.`

/** Replaces `siteConfig.seo.siteDescription` and the `llms.txt` intro. */
export const DESCRIPTION_LONG = `${BUSINESS_NAME} is a cosmetic surgery practice in Miami, Florida. One surgeon, ${KARLINSKY_NAME}, performs BBL, liposuction, tummy tuck, breast augmentation, breast lift and reduction, mommy makeover, facelift and eyelid surgery. Prices start from the practice's published price list, financing is available, and your surgeon confirms your price at consultation.`

/** The practice's address in one line, for prompts and plain text. */
export const LOCATION = 'Miami, Florida'

/**
 * Market scope: the United States only. `areaServed` in structured data
 * covers these and nothing outside the US.
 */
export const AREA_SERVED = [
    'Miami',
    'South Florida',
    'Florida',
    'United States',
] as const

/** The sentence for patients who travel in. */
export const MARKET_SENTENCE = 'Patients fly in from other US states.'

/**
 * Spanish copy (`/consulta-gratis`, the Spanish FAQ) is for Spanish speakers
 * within the US, never framed as serving Latin America.
 */
export const SPANISH_SCOPE =
    'Spanish-language content is for Spanish speakers within the United States, not for patients from other countries.'

/** The website chat agent. Never "virtual assistant" or "asistente virtual". */
export const CHAT_AGENT = {
    name: 'Sofía',
    title: 'our concierge',
} as const

/** The voice every surface writes in. */
export const VOICE_RULES = [
    'Plain words and short sentences, written to "you".',
    'No exclamation marks and no superlatives.',
    'Show the value; never claim it. Don\'t write "luxury" or "affordable"; give the price and what happens.',
    'Don\'t diagnose. Candidacy answers end with "your surgeon decides at consultation".',
    'No body-negative or shame language, no fake urgency and no countdowns.',
    'Spanish copy follows every rule here. Write it natively, not as a word-for-word translation.',
] as const

/** Brand lines that are never published again. */
export const RETIRED_BRAND_LINES = [
    'Luxury Surgeries Made Affordable',
    'Where luxury meets affordability',
    'Luxury Made Affordable',
    'luxury yet affordable',
    'luxury but accessible',
    'premier plastic surgery clinic',
] as const

/** What the practice does and does not do for patients who travel (canon §8). */
export const TRAVEL_RULES = {
    approved: [
        MARKET_SENTENCE,
        "If you're flying in, Alluring confirms your surgery, pre-op and follow-up dates in writing and tells you how many nights to stay in Miami before you're cleared to fly home. You arrange the travel itself.",
        'BBL only: "Plan on 7 to 10 days in Miami." Other procedures give no number of nights: the surgeon sets it.',
        'We are not affiliated with any recovery house.',
        'Virtual consultation, in person in Miami or by video.',
        'Hablamos español.',
    ],
    forbidden: [
        'the practice handling travel: flights, hotels, lodging, transport, airport pickup, drivers, "travel coordination", "packages", "concierge" in a travel sense',
        'recovery houses, homes, suites or retreats, except the non-affiliation sentence',
        'any market outside the US: "international patients", "from abroad", "medical tourism", "Latin America", "the Caribbean", foreign countries as a patient source',
    ],
} as const
