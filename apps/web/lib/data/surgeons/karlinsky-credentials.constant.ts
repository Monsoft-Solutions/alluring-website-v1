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

// Her name and credentials sentence live in the shared claims module, so the
// AI prompts state exactly what the site states.
export {
    KARLINSKY_CREDENTIALS,
    KARLINSKY_NAME,
    KARLINSKY_SHORT_NAME,
} from '@workspace/shared/claims'

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
