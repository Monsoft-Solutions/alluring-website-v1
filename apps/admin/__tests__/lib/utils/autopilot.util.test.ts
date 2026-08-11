/**
 * Tests for the autopilot pure helpers (epic #122).
 *
 * Cadence semantics are interval-based and self-healing: the cron ticks
 * daily and the job decides whether its cadence is satisfied, so a missed
 * or failed tick is picked up by the next one.
 */
import { describe, expect, it } from 'vitest'

import {
    easternWeekday,
    isCadenceDue,
    isNearDuplicateTopic,
    topicSimilarity,
} from '@/lib/utils/autopilot.util'

// Fixed reference times (UTC). 2026-08-11 is a Tuesday; 15:00 UTC = 11:00 ET.
const TUESDAY = new Date('2026-08-11T15:00:00Z')
const SATURDAY = new Date('2026-08-15T15:00:00Z')
const SUNDAY = new Date('2026-08-16T15:00:00Z')

const hoursAgo = (hours: number, from: Date = TUESDAY) =>
    new Date(from.getTime() - hours * 60 * 60 * 1000)

describe('easternWeekday', () => {
    it('maps UTC instants to Eastern weekdays', () => {
        expect(easternWeekday(TUESDAY)).toBe('Tue')
        expect(easternWeekday(SATURDAY)).toBe('Sat')
        // 02:00 UTC Saturday is still Friday evening in New York
        expect(easternWeekday(new Date('2026-08-15T02:00:00Z'))).toBe('Fri')
    })
})

describe('isCadenceDue', () => {
    it('is always due when no run has ever completed', () => {
        expect(isCadenceDue('daily', null, TUESDAY)).toBe(true)
        expect(isCadenceDue('weekly', null, TUESDAY)).toBe(true)
    })

    it('daily: due after ~a day, not right after a run', () => {
        expect(isCadenceDue('daily', hoursAgo(2), TUESDAY)).toBe(false)
        expect(isCadenceDue('daily', hoursAgo(24), TUESDAY)).toBe(true)
    })

    it('daily: tolerates tick jitter (20h threshold, not 24h)', () => {
        // Yesterday's tick ran a few minutes late; today's must still fire
        expect(isCadenceDue('daily', hoursAgo(23.5), TUESDAY)).toBe(true)
    })

    it('weekly: not due mid-week, due after 6 days', () => {
        expect(isCadenceDue('weekly', hoursAgo(72), TUESDAY)).toBe(false)
        expect(isCadenceDue('weekly', hoursAgo(6 * 24), TUESDAY)).toBe(true)
    })

    it('weekly self-heals: a missed tick is picked up the next day', () => {
        // Last completed 7.5 days ago (the day-6 and day-7 ticks failed)
        expect(isCadenceDue('weekly', hoursAgo(7.5 * 24), TUESDAY)).toBe(true)
    })

    it('weekdays: never due on Eastern weekends, due on weekdays', () => {
        expect(isCadenceDue('weekdays', hoursAgo(48, SATURDAY), SATURDAY)).toBe(
            false
        )
        expect(isCadenceDue('weekdays', hoursAgo(48, SUNDAY), SUNDAY)).toBe(
            false
        )
        expect(isCadenceDue('weekdays', hoursAgo(48, TUESDAY), TUESDAY)).toBe(
            true
        )
    })
})

describe('topicSimilarity / isNearDuplicateTopic', () => {
    it('flags reworded near-duplicates', () => {
        expect(
            topicSimilarity(
                'BBL Recovery Tips for Miami Moms',
                'Tips for BBL Recovery'
            )
        ).toBeGreaterThanOrEqual(0.6)
    })

    it('keeps genuinely distinct topics apart', () => {
        expect(
            topicSimilarity(
                'Tummy Tuck Compression Garments',
                'Facelift Recovery Sleep Positions'
            )
        ).toBeLessThan(0.6)
    })

    it('ignores boilerplate words (miami, guide, stopwords)', () => {
        // Only boilerplate overlaps — must NOT count as a duplicate
        expect(
            topicSimilarity(
                'Your Miami Guide to the Best Surgeons',
                'A Miami Guide for Breast Augmentation Recovery'
            )
        ).toBeLessThan(0.6)
    })

    it('matches against the primary keyword, not just the title', () => {
        const rejected = [
            {
                title: 'Understanding Post-Op Swelling',
                primaryKeyword: 'bbl swelling timeline',
            },
        ]
        expect(
            isNearDuplicateTopic(
                { title: 'BBL Swelling Timeline: What to Expect' },
                rejected
            )
        ).toBe(true)
    })

    it('passes a fresh topic against a varied existing set', () => {
        const existing = [
            { title: 'BBL Recovery Time in Miami' },
            { title: 'Tummy Tuck vs Liposuction' },
            { title: 'Breast Augmentation Sizing' },
        ]
        expect(
            isNearDuplicateTopic(
                {
                    title: 'Rhinoplasty Consultation Checklist',
                    primaryKeyword: 'rhinoplasty consultation',
                },
                existing
            )
        ).toBe(false)
    })
})
