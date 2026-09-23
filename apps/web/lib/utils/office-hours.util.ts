/**
 * Is the practice open right now, and if not, when does it open next?
 *
 * Read from `siteConfig.contact.businessHours` in the practice's time zone,
 * so the thank-you page can tell a lead who writes at 11pm when to expect the
 * first text (#274). Two thirds of specials leads arrive outside office hours.
 */

import { siteConfig } from '@/lib/data/site-config'

const DAY_NAMES = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
] as const

interface DayHours {
    /** Minutes after midnight, practice time. */
    readonly open: number
    readonly close: number
}

/** "9:00 AM" → 540; null for "Closed" or anything unreadable. */
function minutesOf(time: string): number | null {
    const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(time.trim())
    if (!match) return null
    const hours = Number(match[1]) % 12
    const pm = match[3]?.toUpperCase() === 'PM'
    return (hours + (pm ? 12 : 0)) * 60 + Number(match[2])
}

/** "Monday - Friday" → [1…5]; "Saturday" → [6]. */
function daysOf(range: string): number[] {
    const [first, last] = range
        .toLowerCase()
        .split(/\s*[-–]\s*/)
        .map((day) =>
            DAY_NAMES.indexOf(day.trim() as (typeof DAY_NAMES)[number])
        )
    const from = first ?? -1
    const to = last ?? from
    if (from < 0 || to < 0) return []
    const days: number[] = []
    for (let day = from; ; day = (day + 1) % 7) {
        days.push(day)
        if (day === to || days.length === 7) break
    }
    return days
}

function weeklyHours(): ReadonlyMap<number, DayHours> {
    const hours = new Map<number, DayHours>()
    for (const entry of siteConfig.contact.businessHours ?? []) {
        const open = minutesOf(entry.open)
        const close = minutesOf(entry.close)
        if (open === null || close === null) continue
        for (const day of daysOf(entry.days)) hours.set(day, { open, close })
    }
    return hours
}

interface WallTime {
    readonly year: number
    readonly month: number
    readonly day: number
    readonly weekday: number
    readonly minutes: number
}

function wallTime(instant: Date, timeZone: string): WallTime {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        weekday: 'long',
        hour: 'numeric',
        minute: 'numeric',
        hourCycle: 'h23',
    }).formatToParts(instant)
    const part = (type: Intl.DateTimeFormatPartTypes) =>
        parts.find((entry) => entry.type === type)?.value ?? ''
    return {
        year: Number(part('year')),
        month: Number(part('month')),
        day: Number(part('day')),
        weekday: DAY_NAMES.indexOf(
            part('weekday').toLowerCase() as (typeof DAY_NAMES)[number]
        ),
        minutes: Number(part('hour')) * 60 + Number(part('minute')),
    }
}

/** The instant a wall-clock time happens in `timeZone`. */
function instantOf(
    year: number,
    month: number,
    day: number,
    minutes: number,
    timeZone: string
): Date {
    const guess = Date.UTC(year, month - 1, day, 0, minutes)
    // The zone's offset at that moment, measured by reading the guess back.
    const offsetAt = (utc: number) => {
        const wall = wallTime(new Date(utc), timeZone)
        return (
            Date.UTC(wall.year, wall.month - 1, wall.day, 0, wall.minutes) - utc
        )
    }
    const first = guess - offsetAt(guess)
    return new Date(guess - offsetAt(first))
}

export type OfficeStatus =
    | { readonly open: true }
    | {
          readonly open: false
          /** When the office next opens. */
          readonly opensAt: Date
          /** 0 = later today, 1 = tomorrow, 2+ = that many days ahead. */
          readonly daysAhead: number
      }

export function officeStatus(now: Date = new Date()): OfficeStatus | null {
    const timeZone = siteConfig.contact.timezone
    if (!timeZone) return null
    const hours = weeklyHours()
    if (hours.size === 0) return null

    const today = wallTime(now, timeZone)
    for (let ahead = 0; ahead < 8; ahead++) {
        // Noon avoids landing on the wrong date across a DST change.
        const date = wallTime(
            instantOf(
                today.year,
                today.month,
                today.day + ahead,
                12 * 60,
                timeZone
            ),
            timeZone
        )
        const day = hours.get(date.weekday)
        if (!day) continue
        if (ahead === 0 && today.minutes >= day.open) {
            if (today.minutes < day.close) return { open: true }
            continue
        }
        return {
            open: false,
            opensAt: instantOf(
                date.year,
                date.month,
                date.day,
                day.open,
                timeZone
            ),
            daysAhead: ahead,
        }
    }
    return null
}
