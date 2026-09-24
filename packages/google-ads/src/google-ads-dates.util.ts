/**
 * Date windows for GAQL
 *
 * GAQL dates are calendar days in the account's time zone, not UTC. A window
 * computed from `new Date().toISOString()` would shift by a day every evening
 * in Miami, so "today" is resolved in the account zone.
 *
 * @module @workspace/google-ads — dates
 */
import type { DateRange } from './google-ads.type.js'

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

/** Today's calendar date (YYYY-MM-DD) in a given IANA zone. */
export function todayIn(timeZone: string, now: Date = new Date()): string {
    // en-CA formats as YYYY-MM-DD.
    return new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(now)
}

/** Shift a YYYY-MM-DD date by whole days. */
export function addDays(date: string, days: number): string {
    const shifted = new Date(`${date}T12:00:00Z`)
    shifted.setUTCDate(shifted.getUTCDate() + days)
    return shifted.toISOString().slice(0, 10)
}

/** Inclusive day count between two YYYY-MM-DD dates. */
export function daysBetween(startDate: string, endDate: string): number {
    const start = Date.parse(`${startDate}T12:00:00Z`)
    const end = Date.parse(`${endDate}T12:00:00Z`)
    return Math.round((end - start) / 86_400_000) + 1
}

/** Throw unless a string is a real YYYY-MM-DD date. */
export function assertIsoDate(value: string, label: string): void {
    if (
        !DATE_PATTERN.test(value) ||
        Number.isNaN(Date.parse(`${value}T12:00:00Z`))
    ) {
        throw new Error(`${label} must be a YYYY-MM-DD date, got "${value}"`)
    }
}

/**
 * Resolve a reporting window.
 *
 * With no explicit dates, the window is the last `days` complete days, ending
 * yesterday in the account zone — today's numbers are still filling in.
 *
 * @param options.days - Window length when startDate is absent (default 30)
 * @param options.startDate - Explicit first day, inclusive
 * @param options.endDate - Explicit last day, inclusive (default yesterday)
 * @param options.timeZone - The account's IANA zone
 * @param options.now - Clock override for tests
 */
export function resolveDateRange(options: {
    days?: number
    startDate?: string
    endDate?: string
    timeZone: string
    now?: Date
}): DateRange {
    const endDate =
        options.endDate ?? addDays(todayIn(options.timeZone, options.now), -1)
    assertIsoDate(endDate, 'endDate')

    const startDate =
        options.startDate ?? addDays(endDate, -((options.days ?? 30) - 1))
    assertIsoDate(startDate, 'startDate')

    if (startDate > endDate) {
        throw new Error(`startDate ${startDate} is after endDate ${endDate}`)
    }

    return { startDate, endDate, days: daysBetween(startDate, endDate) }
}
