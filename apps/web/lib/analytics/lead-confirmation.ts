/**
 * The one-time conversion signal for a lead just sent (#350).
 *
 * The thank-you pages render, and GTM fires its thank-you tag, on any load
 * of the URL — so a phone reopening a thank-you tab days later sent
 * `thank_you_page_view` and `generate_lead` again with no lead behind them
 * (ghost conversions, seen 2026-09-28 and 2026-10-16).
 *
 * Now the submission hook leaves a marker in `sessionStorage` when the API
 * confirms a lead, and a thank-you page pushes `lead_confirmed` to the
 * dataLayer only when it consumes a marker under ten minutes old. The marker
 * goes on first read, fresh or not, so a reload or a reopened tab pushes
 * nothing. GTM's conversion tag and the GA4 key event are re-pointed to the
 * event by hand (see the PR for #350).
 *
 * Zod-free and React-free: the thank-you pages' client island imports it.
 */

export const LEAD_MARKER_KEY = 'alluring_lead_marker'
export const LEAD_MARKER_MAX_AGE_MS = 10 * 60 * 1000
export const LEAD_CONFIRMED_EVENT = 'lead_confirmed'

export interface LeadMarker {
    /** Epoch ms when the API confirmed the lead. */
    readonly at: number
    /** The form's lead source (`home-page`, `landing-page`, …). */
    readonly source: string
    /** The form's analytics name. */
    readonly formName: string
}

export interface MarkerStorage {
    getItem(key: string): string | null
    setItem(key: string, value: string): void
    removeItem(key: string): void
}

export function setLeadMarker(
    storage: MarkerStorage | null,
    marker: LeadMarker
): void {
    try {
        storage?.setItem(LEAD_MARKER_KEY, JSON.stringify(marker))
    } catch {
        // No marker, no conversion event: undercounting beats a ghost.
    }
}

/**
 * Takes the marker out of storage and returns it when it is fresh: set no
 * more than `LEAD_MARKER_MAX_AGE_MS` before `now`, and not in the future.
 */
export function consumeLeadMarker(
    storage: MarkerStorage | null,
    now: number
): LeadMarker | null {
    if (!storage) return null
    let raw: string | null = null
    try {
        raw = storage.getItem(LEAD_MARKER_KEY)
        if (raw !== null) storage.removeItem(LEAD_MARKER_KEY)
    } catch {
        return null
    }
    if (!raw) return null
    try {
        const marker = JSON.parse(raw) as Partial<LeadMarker>
        if (typeof marker.at !== 'number') return null
        const age = now - marker.at
        if (age < 0 || age > LEAD_MARKER_MAX_AGE_MS) return null
        return {
            at: marker.at,
            source: typeof marker.source === 'string' ? marker.source : '',
            formName:
                typeof marker.formName === 'string' ? marker.formName : '',
        }
    } catch {
        return null
    }
}

/** What the thank-you page pushes. Nothing about the person. */
export function leadConfirmedEvent(marker: LeadMarker) {
    return {
        event: LEAD_CONFIRMED_EVENT,
        lead_source: marker.source,
        form_name: marker.formName,
    } as const
}

/**
 * Consumes the marker and, when it is fresh, pushes `lead_confirmed` once.
 * Returns whether it pushed.
 */
export function confirmLead(
    storage: MarkerStorage | null,
    now: number,
    push: (event: Record<string, unknown>) => void
): boolean {
    const marker = consumeLeadMarker(storage, now)
    if (!marker) return false
    push(leadConfirmedEvent(marker))
    return true
}
