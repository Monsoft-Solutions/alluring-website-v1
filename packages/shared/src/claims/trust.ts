/**
 * The trust facts the site may state (claims canon §4). Everything else that
 * `siteConfig.trustStats` used to carry (patients, years, "100% certified",
 * "Double Board-Certified") is unverified and goes, along with the `?? '5,000+'`
 * and `?? '15+'` fallbacks in its consumers.
 *
 * @module @workspace/shared/claims/trust
 */
import {
    KARLINSKY_ABS_CERTIFIED_YEAR,
    KARLINSKY_FLORIDA_LICENSE,
} from './surgeon'

/**
 * The Google rating to show only when the synced figure
 * (`google_reviews_settings.average_rating`) is unavailable.
 */
export const RATING_FALLBACK = '4.7'

/**
 * The rating and the review count come from the synced Google figures. A
 * review count is never typed: copy that cannot read data leaves it out.
 */
export const RATING_RULE =
    'Read the rating and review count from the synced Google figures. Never type a review count; copy that cannot read data leaves the count out.'

/** Verified trust facts, as copy may state them. */
export const TRUST_FACTS = [
    `Board certified in general surgery by the American Board of Surgery since ${KARLINSKY_ABS_CERTIFIED_YEAR}.`,
    'Fellow of the American College of Surgeons.',
    `Active Florida medical license ${KARLINSKY_FLORIDA_LICENSE}, no discipline on record.`,
    'One surgeon performs every procedure at Alluring.',
] as const

/**
 * Short trust badges for a row of icons, each a verified fact (canon §2,
 * §4). They replace the retired "5,000+ patients", "15+ years", "Board-
 * Certified Surgeons" and "Accredited Facility" badges. The certification
 * badge names the board, as Florida Rule 64B8-11.001(2)(j) requires.
 */
export const TRUST_BADGES = {
    surgeon: 'One surgeon for every procedure',
    board: `Certified by the American Board of Surgery since ${KARLINSKY_ABS_CERTIFIED_YEAR}`,
    fellow: 'Fellow of the American College of Surgeons',
    spanish: 'Hablamos español',
} as const

/** "4.7 stars on Google": the synced rating, or {@link RATING_FALLBACK}. */
export function formatRatingBadge(rating?: string | number | null): string {
    const value =
        typeof rating === 'number'
            ? rating.toFixed(1)
            : rating || RATING_FALLBACK
    return `${value} stars on Google`
}

/** `siteConfig.trustStats` fields that are removed, with their fallbacks. */
export const RETIRED_TRUST_STATS = [
    'patients',
    'years',
    'certified',
    'accreditation',
] as const

/** Claims removed and not replaced (canon §3, §4). */
export const UNVERIFIED_TRUST_CLAIMS = [
    'patient or procedure volume ("5,000+ patients", "thousands of patients", "hundreds of BBLs")',
    'tenure ("15+ years", "decades of experience"); state "since 2008" instead',
    'satisfaction claims ("consistently high patient satisfaction")',
    'facility accreditation of any kind (AAAASF, QUAD A, AAAHC, Joint Commission, "accredited facility")',
    '"board-certified anesthesiologist(s)" or any anesthesia credential; say "an anesthesia provider monitors you throughout surgery"',
    '"state-of-the-art facility", "hospital-grade operating room", or where surgery happens',
    '"24/7 surgeon access", "around-the-clock care"',
    'named devices (VASER, SmartLipo, BodyTite); J-Plasma may be named as the price-sheet add-on',
    'drains or a drainless technique',
    '"safest", "zero complications", "risk-free"',
    'HIPAA as a marketing claim',
] as const
