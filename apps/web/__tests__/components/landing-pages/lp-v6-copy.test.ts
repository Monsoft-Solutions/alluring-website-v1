import { describe, expect, it } from 'vitest'

import {
    buildLpChat,
    lpProcedureOrder,
} from '@/components/landing-pages/request-consultation/lp-chat-copy'
import {
    consentNoticeText,
    LEAD_CONSENT_VERSION,
} from '@/lib/constants/lead-consent'
import {
    CONSENT_WORDINGS,
    LP_TAP_CONSENT_VERSION,
} from '@/lib/constants/lead-consent-archive'
import { LP_COPY } from '@/components/landing-pages/request-consultation/lp-copy'
import { LP_COPY_VARIANTS } from '@/components/landing-pages/request-consultation/lp-form-variant'
import { lpQuoteIndex } from '@/components/landing-pages/request-consultation/lp-quote'
import {
    LP_PAGE_ORDER,
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
 * What the ads landing page must never say: an unconfirmed facility or
 * anesthesiologist claim, the retired "luxury / affordable" register, "free"
 * before counsel settles s. 456.062, a payment figure or APR (Reg Z), a
 * credential Florida does not allow (#290) — or a procedure count with no
 * source on file (#292). Since the claims canon (#354): no "all-inclusive"
 * price or "no surprise fees" (D4), no soft-credit-check claim (D10), no
 * reply time, no typed review count and no week-by-week recovery plan.
 */
const BANNED = [
    /aaaasf|accredit|acredita/i,
    /anesthesiolog|anestesi[oó]log/i,
    /luxury|affordab|\blujo|asequible|econ[oó]mic/i,
    /\bfree\b|gratis/i,
    /\bapr\b|\$\d[\d,]*\s*(?:\/|per|a la)\s*(?:week|wk|mo|month|semana|mes)/i,
    /double[\s-]board|board[\s-]certified plastic|american board of plastic/i,
    /5,000|1,500|\b5000\b|\b1500\b/,
    /all[\s-]inclusive|todo incluido|surprise fees|cargos sorpresa|no hidden/i,
    /credit score|puntaje de cr[eé]dito/i,
    /within \d+ (?:hours?|minutes?)|en (?:menos de )?\d+ horas/i,
    /\b\d{2,4}\s*\+\s*(?:reviews|rese[nñ]as)|m[aá]s de \d+ rese[nñ]as/i,
    /week[\s-]by[\s-]week|semana a semana/i,
]

/**
 * The page's own words, and the site-wide consent notice the form shows
 * above its button (#350).
 */
const PAGE_STRINGS = [
    ...strings(LP_COPY.en),
    ...strings(LP_COPY.es),
    ...strings(AD_VARIANT_COPY),
    consentNoticeText('en'),
    consentNoticeText('es'),
    ...AD_VARIANTS.flatMap((variant) =>
        LP_COPY_VARIANTS.flatMap((copyVariant) => {
            const { copy } = buildLpChat(variant, copyVariant)
            return [...strings(copy.en), ...strings(copy.es)]
        })
    ),
]

describe('ads landing page v6 copy', () => {
    it.each(BANNED.map((pattern) => [String(pattern), pattern] as const))(
        'never says %s',
        (_, pattern) => {
            expect(PAGE_STRINGS.filter((text) => pattern.test(text))).toEqual(
                []
            )
        }
    )

    it('names the procedure and Miami in every headline', () => {
        for (const lang of ['en', 'es'] as const) {
            for (const variant of AD_VARIANTS) {
                const copy = AD_VARIANT_COPY[lang][variant]
                expect(copy.headline + copy.headlineEm).toMatch(/Miami/)
                expect(copy.title).toMatch(/Miami/)
            }
        }
    })

    it('reports the page as v6', () => {
        expect(LP_PAGE_VARIANT).toBe('ads-consultation-v6')
    })

    it('carries the tagline in the site config', () => {
        expect(siteConfig.business.tagline).toBe('Personal care. Honest price.')
    })
})

describe('the form', () => {
    it('has no reply after the first tap, so no price in the form', () => {
        for (const variant of AD_VARIANTS) {
            const { copy } = buildLpChat(variant)
            expect(copy.en.procedureReply).toBeUndefined()
            expect(copy.es.procedureReply).toBeUndefined()
        }
    })

    it('carries no consent words of its own: the site notice says it', () => {
        const { copy } = buildLpChat('default')
        for (const lang of ['en', 'es'] as const) {
            expect(copy[lang]).not.toHaveProperty('consent')
            expect(copy[lang]).not.toHaveProperty('consentTap')
            const notice = consentNoticeText(lang)
            expect(notice).toMatch(/STOP/)
            expect(notice).toMatch(/HELP/)
            expect(notice).not.toMatch(/email|correo/i)
        }
    })

    it('keeps v6’s tap wording resolvable for its leads', () => {
        expect(LP_TAP_CONSENT_VERSION).toMatch(/^lp-tap-\d{4}-\d{2}-\d{2}$/)
        expect(CONSENT_WORDINGS[LP_TAP_CONSENT_VERSION]?.text.en).toContain(
            '“Request my consultation”'
        )
        expect(CONSENT_WORDINGS[LEAD_CONSENT_VERSION]?.method).toBe('tap')
    })

    it('starts every ad group’s chips with its procedure', () => {
        for (const variant of AD_VARIANTS) {
            const lead = VARIANT_PROCEDURE[variant]
            const values = buildLpChat(variant).copy.en.procedures.map(
                (option) => option.value
            )
            if (lead) expect(values[0]).toBe(lead)
            expect(values.at(-1)).toBe('other')
            expect(new Set(values).size).toBe(values.length)
        }
    })

    it('offers the six, plus the ad’s own procedure when it is not one of them', () => {
        expect(lpProcedureOrder('default')).toEqual([
            'liposuction',
            'multiple',
            'mommy-makeover',
            'bbl',
            'breast-augmentation',
            'tummy-tuck',
            'other',
        ])
        expect(lpProcedureOrder('tummy-tuck')).toHaveLength(7)
        expect(lpProcedureOrder('breast-lift')).toHaveLength(8)
    })

    it('labels the catch-all “Something else” / “Otro”', () => {
        const { copy } = buildLpChat('default')
        expect(copy.en.procedures.at(-1)?.label).toBe('Something else')
        expect(copy.es.procedures.at(-1)?.label).toBe('Otro')
    })

    it('keeps the settled starting prices for the FAQ', () => {
        const { prices } = buildLpChat('default')
        expect(prices.bbl).toMatch(/^\$\d/)
        expect(prices.liposuction).toMatch(/^\$\d/)
    })
})

describe('the last step’s wording test (#302)', () => {
    it('says what happens next above the fields in the reassure arm', () => {
        for (const variant of AD_VARIANTS) {
            const { copy } = buildLpChat(variant, 'reassure')
            expect(copy.en.contactNote).toBe(
                'A patient coordinator will text you to set up your consultation. Private, and no obligation.'
            )
            expect(copy.es.contactNote).toBe(
                'Una coordinadora te escribe por texto para agendar tu consulta. Privado y sin compromiso.'
            )
        }
    })

    it('has no note in the plain arm, or when no arm is named', () => {
        for (const copy of [
            buildLpChat('tummy-tuck', 'plain').copy,
            buildLpChat('tummy-tuck').copy,
        ]) {
            expect(copy.en.contactNote).toBeUndefined()
            expect(copy.es.contactNote).toBeUndefined()
        }
    })

    it('changes nothing else in the form', () => {
        const plain = buildLpChat('bbl', 'plain').copy
        const reassure = buildLpChat('bbl', 'reassure').copy
        // toEqual ignores a key whose value is undefined.
        expect({ ...reassure.en, contactNote: undefined }).toEqual(plain.en)
        expect({ ...reassure.es, contactNote: undefined }).toEqual(plain.es)
        expect(LP_TAP_CONSENT_VERSION).toBe('lp-tap-2026-09-26')
    })
})

describe('the page', () => {
    it('asks five questions, none about time off', () => {
        for (const lang of ['en', 'es'] as const) {
            expect(LP_COPY[lang].faq.items).toHaveLength(5)
        }
        expect(
            LP_COPY.en.faq.items.some((item) => /time off/i.test(item.question))
        ).toBe(false)
    })

    it('picks one quote per ad group', () => {
        expect(lpQuoteIndex('en', 'tummy-tuck')).toBe(2)
        expect(lpQuoteIndex('en', 'mommy-makeover')).toBe(1)
        expect(lpQuoteIndex('en', 'bbl')).toBe(0)
        expect(lpQuoteIndex('es', 'liposuction')).toBe(0)
        expect(lpQuoteIndex('es', 'skin-removal')).toBe(1)
        expect(lpQuoteIndex('es', 'default')).toBe(2)
        expect(LP_COPY.en.reviews.items[2]?.by).toMatch(/Marycelis/)
        expect(LP_COPY.en.reviews.items[1]?.by).toMatch(/Alannah/)
    })
})

describe('resolveAdVariant', () => {
    it.each([
        ['breast-lift', 'breast-lift'],
        ['mastopexy', 'breast-lift'],
        ['reduction', 'breast-reduction'],
        ['loose-skin', 'skin-removal'],
        ['competitors', 'second-opinion'],
        ['LIPO', 'liposuction'],
        ['nonsense', 'default'],
        ['', 'default'],
    ])('%s → %s', (raw, expected) => {
        expect(resolveAdVariant(raw)).toBe(expected)
    })

    it('puts the procedure in the page title', () => {
        expect(lpTitle('en', 'tummy-tuck')).toBe(
            'Tummy Tuck in Miami · Financing Available | Alluring Plastic Surgery'
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

    it('is the short page with no view', () => {
        expect(orderLpSections(null)).toEqual([
            'results',
            'surgeon',
            'reviews',
            'faq',
        ])
        expect(LP_PAGE_ORDER).not.toContain('financing')
        expect(LP_PAGE_ORDER).not.toContain('fly-in')
    })

    it('adds a view-only section at the top, and moves one already there', () => {
        expect(orderLpSections('financing')).toEqual([
            'financing',
            'results',
            'surgeon',
            'reviews',
            'faq',
        ])
        expect(orderLpSections('reviews')).toEqual([
            'reviews',
            'results',
            'surgeon',
            'faq',
        ])
    })
})

describe('a new lead’s context fields', () => {
    const lead = { name: 'Test Lead', phone: '(305) 555-0123' }

    it('keeps well-formed variants and consent', () => {
        const parsed = contactFormSchema.parse({
            ...lead,
            financingInterest: 'yes',
            pageVariant: 'ads-consultation-v6',
            formVariant: 'card',
            consentMethod: 'tap',
            consentVersion: LEAD_CONSENT_VERSION,
        })
        expect(parsed).toMatchObject({
            financingInterest: 'yes',
            pageVariant: 'ads-consultation-v6',
            formVariant: 'card',
            consentMethod: 'tap',
            consentVersion: LEAD_CONSENT_VERSION,
        })
    })

    it('keeps the reassure arm’s page variant (#302)', () => {
        const parsed = contactFormSchema.parse({
            ...lead,
            pageVariant: 'ads-consultation-v6r',
        })
        expect(parsed.pageVariant).toBe('ads-consultation-v6r')
    })

    it('drops malformed ones instead of rejecting the lead', () => {
        const parsed = contactFormSchema.parse({
            ...lead,
            financingInterest: 'maybe',
            formVariant: '<script>',
            consentMethod: 'nod',
            consentVersion: 'x'.repeat(80),
        })
        expect(parsed.financingInterest).toBeUndefined()
        expect(parsed.formVariant).toBeUndefined()
        expect(parsed.consentMethod).toBeUndefined()
        expect(parsed.consentVersion).toBeUndefined()
    })
})
