/**
 * The verified facts about the practice that AI prompts and code may state.
 *
 * `docs/claims/canon.md` explains each one and where it was checked. The
 * surgeon's credentials were checked at the issuing bodies on 2026-09-19 and
 * her name follows Florida Rule 64B8-11.001(7).
 */

export const PRACTICE_NAME = 'Alluring Plastic Surgery'

/** How to describe the practice. "Plastic surgery" stays as the service term. */
export const PRACTICE_DESCRIPTOR =
    'a cosmetic surgery practice in Miami, Florida, with one surgeon'

export const PRACTICE_TAGLINE = 'Personal care. Honest price.'

/** The market is the United States only (CLAUDE.md). */
export const PRACTICE_MARKET =
    'South Florida locals and patients flying in from other US states'

/** Her name as advertising must give it. */
export const KARLINSKY_NAME = 'Victoria Karlinsky, MD, FACS'

/** The short form, after her full name has appeared once. */
export const KARLINSKY_SHORT_NAME = 'Dr. Karlinsky'

/** The only credentials sentence. Names what needs no Florida statement. */
export const KARLINSKY_CREDENTIALS =
    'She is board certified in general surgery by the American Board of Surgery and is a Fellow of the American College of Surgeons.'

export const FINANCING_LENDERS = [
    'Cherry',
    'CareCredit',
    'United Credit',
] as const
