/**
 * What the site states about Dr. Karlinsky's credentials, each checked against
 * the issuing body's own public record on 2026-09-19. She performs every BBL
 * at Alluring.
 *
 * Florida Rule 64B8-11.001 sets the wording:
 * - (7) advertising names the licensee as an MD, so her name carries it;
 * - (2)(f) the American Board of Surgery is an ABMS member board, which the
 *   Florida Board of Medicine approves, so it needs no statement;
 * - (2)(f) the American Board of Cosmetic Surgery and the American Board of
 *   Facial Cosmetic Surgery are not approved, so any mention of either carries
 *   `FLORIDA_UNAPPROVED_BOARD_STATEMENT`, in the same type size.
 *
 * She is not certified by the American Board of Plastic Surgery. Never call
 * her a board-certified plastic surgeon.
 *
 * @module
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

/** Her Florida medical license, clear and active on the Department of Health's record. */
export const KARLINSKY_FLORIDA_LICENSE = 'ME130613'

/** Rule 64B8-11.001(2)(f), verbatim. */
export const FLORIDA_UNAPPROVED_BOARD_STATEMENT =
    'The specialty recognition identified herein has been received from a private organization not affiliated with or recognized by the Florida Board of Medicine.'

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
