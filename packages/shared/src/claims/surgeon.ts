/**
 * What the site states about Dr. Karlinsky's credentials, each checked against
 * the issuing body's own public record on 2026-09-19 (claims canon §2). The
 * practice has one surgeon, and she performs every procedure at Alluring.
 *
 * Florida Rule 64B8-11.001 sets the wording:
 * - (7) advertising names the licensee as an MD, so her name carries it;
 * - (2)(f) the American Board of Surgery is an ABMS member board, which the
 *   Florida Board of Medicine approves, so it needs no statement;
 * - (2)(f) the American Board of Cosmetic Surgery and the American Board of
 *   Facial Cosmetic Surgery are not approved, so any mention of either carries
 *   `FLORIDA_UNAPPROVED_BOARD_STATEMENT`, in the same element and type size.
 *
 * She is not certified by the American Board of Plastic Surgery. Never call
 * her a board-certified plastic surgeon, or a plastic surgeon at all.
 *
 * Moved here from `apps/web/lib/data/surgeons/karlinsky-credentials.constant.ts`
 * (which now re-exports this module) so `packages/ai` and the admin read the
 * same sentences.
 *
 * @module @workspace/shared/claims/surgeon
 */

/** Her name as advertising must give it: with MD, per Rule 64B8-11.001(7). */
export const KARLINSKY_NAME = 'Victoria Karlinsky, MD, FACS'

/** The short form, after her full name has appeared once. */
export const KARLINSKY_SHORT_NAME = 'Dr. Karlinsky'

/**
 * The credentials sentence for answers and FAQs. Names only the credentials
 * that need no Florida statement.
 */
export const KARLINSKY_CREDENTIALS =
    'She is board certified in general surgery by the American Board of Surgery and is a Fellow of the American College of Surgeons.'

/**
 * The date on her American Board of Surgery record: board certified in
 * general surgery since 27 October 2008. The BBL page states the year, and
 * `check:bbl-copy` accepts that year because it is declared here.
 */
export const KARLINSKY_ABS_CERTIFIED_ON = '2008-10-27'

/** The year of her ABS certification. State the year; never compute a tenure. */
export const KARLINSKY_ABS_CERTIFIED_YEAR = /* @__PURE__ */ Number(
    KARLINSKY_ABS_CERTIFIED_ON.slice(0, 4)
)

/** The credentials sentence with the year (canon §2). */
export const KARLINSKY_CREDENTIALS_WITH_YEAR = `She has been board certified in general surgery by the American Board of Surgery since ${KARLINSKY_ABS_CERTIFIED_YEAR} and is a Fellow of the American College of Surgeons.`

/** Her Florida medical license, clear and active on the Department of Health's record. */
export const KARLINSKY_FLORIDA_LICENSE = 'ME130613'

/**
 * The long form, for the surgeon page and `llms-full.txt` only. Link each
 * credential to `karlinskyRecords` where the surface can carry links.
 */
export const KARLINSKY_CREDENTIALS_LONG = `${KARLINSKY_NAME}, is board certified in general surgery by the American Board of Surgery (since ${KARLINSKY_ABS_CERTIFIED_YEAR}) and is a Fellow of the American College of Surgeons. She holds an active Florida medical license, ${KARLINSKY_FLORIDA_LICENSE}, with no discipline on record.`

/** Rule 64B8-11.001(2)(f), verbatim. */
export const FLORIDA_UNAPPROVED_BOARD_STATEMENT =
    'The specialty recognition identified herein has been received from a private organization not affiliated with or recognized by the Florida Board of Medicine.'

/**
 * The cosmetic boards, followed by the Florida statement, as one unit. Use it
 * only where the statement sits in the same element at the same type size:
 * never in posts, titles, meta descriptions, `llms*.txt`, chat or ads.
 */
export const KARLINSKY_COSMETIC_BOARDS = `She is also certified by the American Board of Cosmetic Surgery (2011, recertified 2021) and listed in the directory of the American Board of Facial Cosmetic Surgery. ${FLORIDA_UNAPPROVED_BOARD_STATEMENT}`

/** The public records a patient can check her credentials against. */
export const karlinskyRecords = {
    floridaLicense:
        'https://mqa-internet.doh.state.fl.us/MQASearchServices/HealthCareProviders/LicenseVerification?LicInd=127471&ProCde=1501',
    americanBoardOfSurgery:
        'https://certificates.absurgery.org/certification/63642',
    americanCollegeOfSurgeons: 'https://www.facs.org/profile/53959700',
    americanBoardOfCosmeticSurgery:
        'https://www.americanboardcosmeticsurgery.org/doctors/victoria-karlinsky-bellini/',
} as const

/**
 * One surgeon performs every procedure at Alluring (the user, 2026-09-19).
 * Copy never says "our surgeons", "team of surgeons" or names another surgeon.
 */
export const SINGLE_SURGEON = true

/** The sentence the canon allows for the single-surgeon fact. */
export function singleSurgeonSentence(procedure: string): string {
    return `One surgeon performs every ${procedure} at Alluring: ${KARLINSKY_NAME}.`
}

/**
 * Credential phrasings the canon bans (§2), with their variants: hyphenated
 * or spaced, any case, and Spanish. The regex rules in `patterns` enforce
 * them; this list is what prompts and reviewers read.
 */
export const FORBIDDEN_CREDENTIAL_PHRASES = [
    '"board-certified plastic surgeon", "certified plastic surgeon", "cirujana plástica certificada"',
    '"double", "dual", "triple" or "two-time" board-certified, "certified by two/three boards", "doble certificación"',
    '"American Board of Plastic Surgery", "ABPS", "ABPS-certified"',
    'bare "board-certified" that does not name the American Board of Surgery in the same sentence, including "Board Certified Cosmetic Surgeon" and "Board-Certified Surgeons"',
    '"board-certified" or her name in a <title> or SEO title',
    '"plastic surgeon" for her: say "surgeon" or "cosmetic surgeon"',
    '"Fellowship Director, American Board of Cosmetic Surgery", "Fellow, American Academy of Cosmetic Surgery"',
    '"renowned", "distinguished", "leading authority", "highest standards", "top surgeon", "best surgeon", "#1", "premier"',
    '"medically reviewed by", "reviewed by Dr. …", "fact-checked by", or a medical review board',
    '"100% certified"',
    'plural surgeons: "our surgeons", "team of surgeons", "match you with the right surgeon"',
    'any other surgeon by name (Dr. Andrew Lofman is not with the practice)',
] as const

/**
 * D9 (default: hold). The surgeon page keeps these lines as they are; posts,
 * `llms*.txt`, the chat agent and structured data do not repeat them until
 * they are checked against the Florida DOH practitioner profile.
 */
export const UNVERIFIED_EDUCATION_LINES = [
    'MD from Ross University',
    'residency at Beth Israel Medical Center',
    'fellowship in Abilene, Texas',
] as const
