import { describe, expect, it } from 'vitest'

import { buildLpChat } from '@/components/landing-pages/request-consultation/lp-chat-copy'
import { LP_COPY } from '@/components/landing-pages/request-consultation/lp-copy'
import {
    orderLpSections,
    resolveLpSection,
} from '@/components/landing-pages/request-consultation/lp-sections'
import { LP_PAGE_VARIANT } from '@/components/landing-pages/request-consultation/lp-tracking'
import {
    AD_VARIANT_COPY,
    AD_VARIANTS,
    lpTitle,
    resolveAdVariant,
    VARIANT_PROCEDURE,
} from '@/components/landing-pages/request-consultation/lp-variants'
import { siteConfig } from '@/lib/data/site-config'
import { contactFormSchema } from '@/lib/types/forms/contact-form.type'

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
 * What the ads landing page must never say (#290): an unconfirmed facility
 * or anesthesiologist claim, the retired "luxury / affordable" register,
 * "free" before counsel settles s. 456.062, a payment figure or APR (Reg Z),
 * or a credential Florida does not allow.
 */
const BANNED = [
    /aaaasf|accredit|acredita/i,
    /anesthesiolog|anestesi[oó]log/i,
    /luxury|affordab|\blujo|asequible|econ[oó]mic/i,
    /\bfree\b|gratis/i,
    /\bapr\b|\$\d[\d,]*\s*(?:\/|per|a la)\s*(?:week|wk|mo|month|semana|mes)/i,
    /double[\s-]board|board[\s-]certified plastic|american board of plastic/i,
]

const PAGE_STRINGS = [
    ...strings(LP_COPY),
    ...strings(AD_VARIANT_COPY),
    ...AD_VARIANTS.flatMap((variant) => strings(buildLpChat(variant).copy)),
]

describe('ads landing page v5 copy', () => {
    it.each(BANNED.map((pattern) => [String(pattern), pattern] as const))(
        'never says %s',
        (_, pattern) => {
            expect(PAGE_STRINGS.filter((text) => pattern.test(text))).toEqual(
                []
            )
        }
    )

    it('names the procedure and Miami in every procedure headline', () => {
        for (const lang of ['en', 'es'] as const) {
            for (const variant of AD_VARIANTS) {
                const copy = AD_VARIANT_COPY[lang][variant]
                expect(copy.headline + copy.headlineEm).toMatch(/Miami/)
                expect(copy.title).toMatch(/Miami/)
            }
        }
    })

    it('mentions financing in the first reply, priced or not', () => {
        const { copy } = buildLpChat('bbl')
        for (const lang of ['en', 'es'] as const) {
            const reply = copy[lang].procedureReply
            expect(reply?.priced).toMatch(/financ/i)
            expect(reply?.standard).toMatch(/financ/i)
            expect(reply?.byProcedure?.other).toMatch(/financ/i)
        }
    })

    it('reports the page as v5', () => {
        expect(LP_PAGE_VARIANT).toBe('ads-consultation-v5')
    })

    it('carries the new tagline in the site config', () => {
        expect(siteConfig.business.tagline).toBe('Personal care. Honest price.')
    })
})

describe('resolveAdVariant', () => {
    it.each([
        ['breast-lift', 'breast-lift'],
        ['mastopexy', 'breast-lift'],
        ['reduction', 'breast-reduction'],
        ['skin-removal', 'skin-removal'],
        ['loose-skin', 'skin-removal'],
        ['second-opinion', 'second-opinion'],
        ['competitors', 'second-opinion'],
        ['LIPO', 'liposuction'],
        ['nonsense', 'default'],
        ['', 'default'],
    ])('%s → %s', (raw, expected) => {
        expect(resolveAdVariant(raw)).toBe(expected)
    })

    it('preselects the new breast chips, and nothing for skin removal or a second opinion', () => {
        expect(VARIANT_PROCEDURE['breast-lift']).toBe('breast-lift')
        expect(VARIANT_PROCEDURE['breast-reduction']).toBe('breast-reduction')
        expect(VARIANT_PROCEDURE['skin-removal']).toBe('')
        expect(VARIANT_PROCEDURE['second-opinion']).toBe('')
    })

    it('puts the procedure in the page title', () => {
        expect(lpTitle('en', 'tummy-tuck')).toBe(
            'Tummy Tuck in Miami · Financing Available | Alluring Plastic Surgery'
        )
        expect(lpTitle('es', 'default')).toBe(
            'Consulta de cirugía plástica en Miami · Con financiamiento | Alluring Plastic Surgery'
        )
    })
})

describe('?s= section views', () => {
    it.each([
        ['financing', 'financing'],
        ['pricing', 'financing'],
        ['gallery', 'results'],
        ['Reviews', 'reviews'],
        ['fly-in', 'fly-in'],
        ['travel', 'fly-in'],
        ['surgeon', 'surgeon'],
        ['nope', null],
        [undefined, null],
    ])('%s → %s', (raw, expected) => {
        expect(resolveLpSection(raw)).toBe(expected)
    })

    it('moves the requested section to the top and keeps the rest in order', () => {
        expect(orderLpSections('reviews')).toEqual([
            'reviews',
            'results',
            'financing',
            'surgeon',
            'fly-in',
            'faq',
        ])
        expect(orderLpSections(null)[0]).toBe('results')
    })
})

describe('financing interest on a new lead', () => {
    const lead = { name: 'Test Lead', phone: '(305) 555-0123' }

    it('keeps a valid answer', () => {
        expect(
            contactFormSchema.parse({ ...lead, financingInterest: 'yes' })
                .financingInterest
        ).toBe('yes')
    })

    it('drops a malformed one instead of rejecting the lead', () => {
        const parsed = contactFormSchema.parse({
            ...lead,
            financingInterest: 'maybe',
        })
        expect(parsed.financingInterest).toBeUndefined()
    })
})
