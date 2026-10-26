import { describe, expect, it } from 'vitest'

import { MJ_COPY } from '@/components/landing-pages/melissa-juvier/mj-copy'
import { LP_BADGES } from '@/components/landing-pages/request-consultation/lp-assets'

/** Every string in a nested copy object, however deep. */
function strings(value: unknown): string[] {
    if (typeof value === 'string') return [value]
    if (Array.isArray(value)) return value.flatMap(strings)
    if (value && typeof value === 'object') {
        return Object.values(value).flatMap(strings)
    }
    return []
}

/**
 * What Melissa's page must never say again (claims canon, #354): facility
 * accreditation, anesthesiologist claims, a count of boards, procedure counts
 * or years in practice, a typed review count, an "all-inclusive" price, a
 * reply time, or a week-by-week recovery plan.
 */
const BANNED = [
    /aaaa?sf|accredit|acredita/i,
    /anesthesiolog|anestesi[oó]log/i,
    /double[\s-]board|doble certificaci|triple|board[\s-]certified plastic/i,
    /5,000|\b15\s*\+|years in practice|a[nñ]os de experiencia/i,
    /\b\d{2,4}\s*\+\s*(?:reviews|rese[nñ]as)|m[aá]s de \d+ rese[nñ]as/i,
    /all[\s-]inclusive|todo incluido|surprise fees|sin sorpresas/i,
    // A promised reply time; the verbatim reviews' "less than 24 hours since my
    // surgery" is not one.
    /within \d+ hours|en (?:menos de )?\d+ horas|\d+-hour response/i,
    /week[\s-]by[\s-]week|semana a semana/i,
]

const PAGE_STRINGS = [...strings(MJ_COPY.en), ...strings(MJ_COPY.es)]

describe('Melissa Juvier page copy', () => {
    it.each(BANNED.map((pattern) => [String(pattern), pattern] as const))(
        'never says %s',
        (_, pattern) => {
            expect(PAGE_STRINGS.filter((text) => pattern.test(text))).toEqual(
                []
            )
        }
    )

    it('names the American Board of Surgery with every board certification', () => {
        for (const text of PAGE_STRINGS) {
            if (/board[\s-]*certifi|certificada/i.test(text)) {
                expect(text).toMatch(/American Board of Surgery/)
            }
        }
    })

    it('shows only the verified credential badges', () => {
        expect(LP_BADGES.map((badge) => badge.alt)).toEqual([
            'Board certified by the American Board of Surgery',
            'Fellow, American College of Surgeons',
        ])
    })
})
