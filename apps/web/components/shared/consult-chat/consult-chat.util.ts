/**
 * Small, dependency-free helpers for the consultation chat. Validation here
 * is deliberately light — the server runs the real phone and consent checks
 * — so pages using the thread ship without zod or libphonenumber.
 */

import type { ConsultChatOption } from './consult-chat.types'

/** Fills `{key}` placeholders in a copy string. */
export function fill(template: string, values: Record<string, string>): string {
    return template.replace(/\{(\w+)\}/g, (match, key: string) =>
        key in values ? (values[key] ?? match) : match
    )
}

export const labelOf = (
    options: readonly ConsultChatOption[],
    value: string
): string => options.find((option) => option.value === value)?.label ?? value

/** US numbers only: ten digits, or eleven with the leading country code. */
export function nationalDigits(value: string): string | null {
    const digits = value.replace(/\D/g, '')
    const national =
        digits.length === 11 && digits.startsWith('1')
            ? digits.slice(1)
            : digits
    return /^[2-9]\d{2}[2-9]\d{6}$/.test(national) ? national : null
}

/** Formats as the visitor types: (305) 555-0123. */
export function formatPhone(value: string): string {
    let digits = value.replace(/\D/g, '')
    if (digits.length === 11 && digits.startsWith('1')) digits = digits.slice(1)
    digits = digits.slice(0, 10)
    if (digits.length < 4) return digits
    if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

/** "Ana María Torres" → `{ firstName: 'Ana', lastName: 'María Torres' }`. */
export function splitName(fullName: string): {
    readonly firstName: string
    readonly lastName: string
} {
    const [firstName = '', ...rest] = fullName.trim().split(/\s+/)
    return { firstName, lastName: rest.join(' ') }
}

/**
 * What a thread keeps in `sessionStorage` so a visitor who looks at the
 * gallery and comes back finds their answers (#274). Never the phone number.
 */
export interface SavedThread {
    readonly procedure: string
    readonly timeline: string
    readonly name: string
    /** Set by a financing CTA on the page (`data-consult-financing`). */
    readonly financing?: boolean
}

export function readSavedThreadRaw(key: string): string {
    try {
        return window.sessionStorage.getItem(key) ?? ''
    } catch {
        return ''
    }
}

export function parseSavedThread(raw: string): SavedThread | null {
    if (!raw) return null
    try {
        const value = JSON.parse(raw) as Partial<SavedThread>
        const text = (field: unknown) =>
            typeof field === 'string' ? field.slice(0, 120) : ''
        return {
            procedure: text(value.procedure),
            timeline: text(value.timeline),
            name: text(value.name),
            financing: value.financing === true,
        }
    } catch {
        return null
    }
}

export function writeSavedThread(key: string, thread: SavedThread | null) {
    try {
        if (thread) window.sessionStorage.setItem(key, JSON.stringify(thread))
        else window.sessionStorage.removeItem(key)
    } catch {
        // Private mode or blocked storage: the thread still works, it just
        // starts over on the next visit.
    }
}

/** The browser's time zone, e.g. `{ zone: 'America/Chicago', short: 'CDT' }`. */
export function visitorTimeZone(): {
    readonly zone: string
    readonly short: string
} | null {
    try {
        const zone = Intl.DateTimeFormat().resolvedOptions().timeZone
        if (!zone) return null
        const short =
            new Intl.DateTimeFormat('en-US', {
                timeZone: zone,
                timeZoneName: 'short',
            })
                .formatToParts(new Date())
                .find((part) => part.type === 'timeZoneName')?.value ?? ''
        return { zone, short }
    } catch {
        return null
    }
}

export function prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
