import { describe, expect, it } from 'vitest'

import { siteConfig } from '@/lib/data/site-config'
import { openingHoursSpecification } from '@/lib/utils/office-hours.util'

describe('openingHoursSpecification', () => {
    it('turns every open businessHours row into a schema.org entry', () => {
        const specs = openingHoursSpecification()
        const openRows = (siteConfig.contact.businessHours ?? []).filter(
            (row) => row.open !== 'Closed'
        )
        expect(specs).toHaveLength(openRows.length)
        for (const spec of specs) {
            expect(spec.opens).toMatch(/^\d{2}:\d{2}$/)
            expect(spec.closes).toMatch(/^\d{2}:\d{2}$/)
            expect(spec.dayOfWeek.length).toBeGreaterThan(0)
        }
        expect(specs.flatMap((s) => s.dayOfWeek)).not.toContain('Sunday')
    })

    it('expands a day range and converts 12-hour times', () => {
        const weekday = openingHoursSpecification().find((s) =>
            s.dayOfWeek.includes('Monday')
        )
        expect(weekday?.dayOfWeek).toEqual([
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
        ])
        const row = siteConfig.contact.businessHours?.[0]
        const pm = row?.close.endsWith('PM')
        expect(Number(weekday?.closes.slice(0, 2))).toBeGreaterThanOrEqual(
            pm ? 12 : 0
        )
    })
})
