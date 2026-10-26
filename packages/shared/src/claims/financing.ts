/**
 * Financing, as the site may describe it (claims canon §6, decision D6).
 *
 * The rule: say that financing is offered and name the partners. Quote no
 * number: no weekly or monthly payment, no APR, no term, no "as low as", no
 * deposit. A payment amount or rate is a Truth in Lending (Reg Z) trigger
 * term, and the old weekly figures were never on the practice's price sheet.
 *
 * @module @workspace/shared/claims/financing
 */

/**
 * Canonical list of financing partners, in display order.
 * Based on: https://www.alluringplasticsurgery.com/plastic-surgery-financing-miami/
 */
export const FINANCING_PARTNERS = [
    'Cherry',
    'CareCredit',
    'United Credit',
] as const

export type FinancingPartner = (typeof FINANCING_PARTNERS)[number]

/**
 * The partners as a comma-separated list: "Cherry, CareCredit, and United
 * Credit".
 */
export function getFinancingPartnersString(): string {
    const partners = [...FINANCING_PARTNERS]

    if (partners.length === 0) return ''
    if (partners.length === 1) return partners[0]!
    if (partners.length === 2) return `${partners[0]!} and ${partners[1]!}`

    const lastPartner = partners[partners.length - 1]!
    return `${partners.slice(0, -1).join(', ')}, and ${lastPartner}`
}

/** The financing page every "see financing" link points to. */
export const FINANCING_PAGE_PATH = '/plastic-surgery-financing-miami'

/**
 * The approved short sentence. Marked pure so a client bundle that imports
 * only the partners drops it.
 */
export const FINANCING_SENTENCE_SHORT = /* @__PURE__ */ financingSentence()

function financingSentence(): string {
    return `Financing is available through ${getFinancingPartnersString()} for qualified applicants.`
}

/** The approved long sentence, without the link (surfaces add their own). */
export const FINANCING_SENTENCE_LONG = `${FINANCING_SENTENCE_SHORT} Approval and terms are set by the lender.`

/** What financing copy never says. Enforced by `patterns` PR9–PR11 and PR13. */
export const FINANCING_FORBIDDEN = [
    'any weekly or monthly payment figure ("from $X a week", "$X/month")',
    'APR, "0% APR", "interest-free", "no interest", "buy now, pay later"',
    'a loan term or "as low as"',
    'a deposit amount',
    'approval claims: "fast", "instant" or "guaranteed" approval, "high approval rates", "no credit check", "bad credit OK", "won\'t affect your credit score"',
    '"make procedures more affordable"',
] as const
