/**
 * Breast implant size calculator: the figures and where they come from.
 *
 * Every number the estimate uses is here, with its source, so a copy or
 * clinical review reads one file. Sources read on 2026-10-12.
 *
 * 1. King NM, Lovric V, Parr WCH, Walsh WR, Moradi P. "What Is the Standard
 *    Volume to Increase a Cup Size for Breast Augmentation Surgery? A Novel
 *    Three-Dimensional Computed Tomographic Approach." Plastic and
 *    Reconstructive Surgery 2017;139(5):1084-1089.
 *    doi:10.1097/PRS.0000000000003247 · PMID 28445356
 *    https://pubmed.ncbi.nlm.nih.gov/28445356/
 *    - "The average incremental increase in bra cup size across all three
 *      brands in the laboratory arm was 135 cc. The mean volume increase per
 *      cup size was 138.23 cc in the clinical arm."
 *    - "patients should be advised that 130 to 150 cc equates to a
 *      one-cup-size increase. Bras with narrower band widths need 130 cc and
 *      wider band widths require 150 cc to increase one cup size."
 *    - "Previous reports equate 100 cc to a one-cup-size increase" (the old
 *      rule of thumb this replaces). Five cup sizes from three brands, and
 *      79 augmentation patients.
 *
 * 2. Moscarelli J, Judge A, Rodriguez J, et al. "SP32. Understanding Variation
 *    in Bra Cup Sizing Among Leading Manufacturers." Plastic and
 *    Reconstructive Surgery Global Open 2025.
 *    doi:10.1097/01.GOX.0001112884.78047.0a
 *    https://pmc.ncbi.nlm.nih.gov/articles/PMC12023244/
 *    - "Standard deviation in mean cup volume (cc), across all manufacturers,
 *      was A: 30.9, B: 40.1, C: 62.2, D: 69.7, and DD: 122.8." The same
 *      letter holds a different volume from brand to brand, more so as cups
 *      get larger: the reason the result is a range, never one number.
 *
 * 3. Chan M, Lonie S, Mackay S, MacGill K. "Reduction Mammaplasty: What Cup
 *    Size Will I Be?" Plastic and Reconstructive Surgery Global Open 2019.
 *    doi:10.1097/GOX.0000000000002273
 *    https://pmc.ncbi.nlm.nih.gov/articles/PMC6635214/
 *    - "Bra cup volume measurements were plotted (Fig. 3) and show a steady
 *      progression according to both cup and band sizes." Why the volume per
 *      cup grows with the band.
 *
 * 4. American Society of Plastic Surgeons, "All about breast implant
 *    profiles" (2016).
 *    https://www.plasticsurgery.org/news/blog/all-about-breast-implant-profiles
 *    - "Implants of the same size (cc volume) that have different widths will
 *      produce different levels of projection." Why the surgeon, not a
 *      volume, settles the final choice.
 *
 * 5. Pechter EA. "A new method for determining bra size and predicting
 *    postaugmentation breast size." Plastic and Reconstructive Surgery
 *    1998;102(4):1259-65. PMID 9734454
 *    - "The current popular system of determining bra size is inaccurate so
 *      often as to be useless." Context for the copy's "cups aren't
 *      standardized".
 *
 * What the calculator deliberately does NOT use: height, weight or frame. No
 * source above ties cc per cup to them (King et al. tie it to band width
 * only), so asking for them would add precision the evidence doesn't have.
 *
 * @module components/calculators/implant-size/implant-size.facts
 */

/** Band sizes offered (US inches). The study's "narrow" and "wide" ends. */
export const BAND_SIZES = [30, 32, 34, 36, 38, 40, 42] as const
export type BandSize = (typeof BAND_SIZES)[number]

/**
 * US cup letters in order. DDD is the US name for what many brands call F;
 * one step is one cup size.
 */
export const CUP_SIZES = ['AA', 'A', 'B', 'C', 'D', 'DD', 'DDD'] as const
export type CupSize = (typeof CUP_SIZES)[number]

/** Cups a reader can start from: anything below the largest. */
export const CURRENT_CUPS: readonly CupSize[] = CUP_SIZES.slice(0, -1)

/** Cups a reader can aim for: anything above the smallest. */
export const DESIRED_CUPS: readonly CupSize[] = CUP_SIZES.slice(1)

/**
 * cc for one cup size on a narrow band (source 1: "narrower band widths need
 * 130 cc"). Applied at band 32 and below.
 */
export const CC_PER_CUP_NARROW = 130

/**
 * cc for one cup size on a wide band (source 1: "wider band widths require
 * 150 cc"). Applied at band 38 and above.
 */
export const CC_PER_CUP_WIDE = 150

/** The band at or below which the narrow figure applies. */
export const NARROW_BAND = 32

/** The band at or above which the wide figure applies. */
export const WIDE_BAND = 38

/**
 * How far either side of the per-cup figure the range reaches, per cup.
 *
 * Our choice, not a published constant: ±15 cc per cup keeps the 130–150 cc
 * band of source 1 inside every band size's range (a 34 band spans 122–152),
 * and stays well inside the brand-to-brand spread of source 2 (31–123 cc).
 */
export const CC_SPREAD_PER_CUP = 15

/**
 * Source 1 measured five cup sizes, so four steps. A wish of more cups than
 * that is an extrapolation, and the result says so.
 */
export const MAX_STUDIED_CUPS = 4

/** Ranges are rounded outward to this many cc, so they never look exact. */
export const ROUND_TO_CC = 10
