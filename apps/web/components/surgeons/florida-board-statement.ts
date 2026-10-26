/**
 * The Florida statement for boards the Florida Board of Medicine does not
 * recognize (Rule 64B8-11.001(2)(f), claims canon §2).
 *
 * Every mention of the American Board of Cosmetic Surgery or the American
 * Board of Facial Cosmetic Surgery (name, acronym, badge image or its alt
 * text) carries the statement in the same element, at the same type size.
 * The surgeon components run surgeon data through these helpers, so a
 * mention in `surgeons-data.ts` can never render without it.
 *
 * A small local check, not the claims `patterns` module, which stays out of
 * client bundles.
 */
import { FLORIDA_UNAPPROVED_BOARD_STATEMENT } from '@workspace/shared/claims/surgeon'

export { FLORIDA_UNAPPROVED_BOARD_STATEMENT }

const NEEDS_FLORIDA_STATEMENT =
    /american board of (?:facial )?cosmetic surgery|\babf?cs\b/i

/** Whether the text names a board that needs the statement. */
export function needsFloridaStatement(text: string): boolean {
    return NEEDS_FLORIDA_STATEMENT.test(text)
}

/** The text, followed by the statement when it names such a board. */
export function withFloridaStatement(text: string): string {
    if (!needsFloridaStatement(text)) return text
    if (text.includes(FLORIDA_UNAPPROVED_BOARD_STATEMENT)) return text
    const sentence = /[.!?]$/.test(text.trim())
        ? text.trim()
        : `${text.trim()}.`
    return `${sentence} ${FLORIDA_UNAPPROVED_BOARD_STATEMENT}`
}
