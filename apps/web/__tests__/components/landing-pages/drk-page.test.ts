import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push() {} }) }))
vi.mock('@/lib/analytics/utm-tracking.context', () => ({
    useUTMTracking: () => ({ utmData: null }),
}))

const config = await import(
    '@/components/landing-pages/dr-karlinsky-ig/drk-config'
)
const { DRK_COPY, buildDrkForm } = await import(
    '@/components/landing-pages/dr-karlinsky-ig/drk-copy'
)
const { DRK_PRICES, drkPriceFor } = await import(
    '@/components/landing-pages/dr-karlinsky-ig/drk-prices'
)
const { DRK_VIDEO, hasDrkVideo } = await import(
    '@/components/landing-pages/dr-karlinsky-ig/drk-media'
)
const { selectDrkReviews, reviewLanguage } = await import(
    '@/components/landing-pages/dr-karlinsky-ig/drk-proof'
)
const { DrkLanding } = await import(
    '@/components/landing-pages/dr-karlinsky-ig/drk-landing.component'
)
const { buildLpChat } = await import(
    '@/components/landing-pages/request-consultation/lp-chat-copy'
)
const { CONTACT_SOURCES } = await import('@/lib/types/forms/contact-form.type')

describe('Dr. Karlinsky IG page config (#332)', () => {
    it('tags leads with its own source, page and form variant', () => {
        expect(config.DRK_SOURCE).toBe(CONTACT_SOURCES.DR_KARLINSKY_IG)
        expect(config.DRK_SOURCE).toBe('dr-karlinsky-ig')
        expect(config.DRK_PAGE_VARIANT).toBe('drk-ig-v2')
        expect(config.DRK_FORM_VARIANT).toBe('form')
        expect(config.DRK_FORM_NAME).toBe('dr_karlinsky_ig_form')
        expect(config.DRK_LEAD_STORAGE_KEY).toBe('drk_lead')
    })

    it('uses variants the lead schema accepts', () => {
        // contact-form.type.ts: ^[a-z0-9][a-z0-9-]*$, at most 40 characters.
        for (const value of [
            config.DRK_PAGE_VARIANT,
            config.DRK_FORM_VARIANT,
        ]) {
            expect(value).toMatch(/^[a-z0-9][a-z0-9-]*$/)
            expect(value.length).toBeLessThanOrEqual(40)
        }
    })

    it('lives under /lp and lands on a thank-you path GTM converts on', () => {
        expect(config.DRK_PAGE_PATH).toBe('/lp/dr-karlinsky')
        expect(config.DRK_THANK_YOU_PATH).toBe('/lp/dr-karlinsky/thank-you')
        expect(config.DRK_THANK_YOU_PATH).toContain('thank-you')
    })

    it('names its dataLayer events', () => {
        expect(config.DRK_EVENTS).toEqual({
            step: 'drk_step',
            attempt: 'drk_lead_attempt',
            submitted: 'drk_lead_submitted',
            videoOpen: 'drk_video_open',
            videoProgress: 'drk_video_progress',
            videoCta: 'drk_video_cta',
            videoError: 'drk_video_error',
        })
    })

    it('formats the video length', () => {
        expect(config.formatDuration(48)).toBe('0:48')
        expect(config.formatDuration(65)).toBe('1:05')
    })
})

describe('Dr. Karlinsky IG copy rules', () => {
    const everything = JSON.stringify(DRK_COPY).toLowerCase()

    it.each([
        'free',
        'gratis',
        'complimentary',
        'no-cost',
        'luxury',
        'affordable',
        'board-certified plastic',
        'plastic surgeon',
        'triple',
        'double board',
        'cosmetic surgery board',
        'american board of cosmetic',
        'aaaasf',
        'accredited',
        '/week',
        '/mo',
        'within minutes',
        'flight',
        'hotel',
        'recovery house',
        'pickup',
        'international',
    ])('never says "%s"', (word) => {
        expect(everything).not.toContain(word)
    })

    it('frames every price as personal, with financing, in her voice', () => {
        for (const lang of ['en', 'es'] as const) {
            const copy = DRK_COPY[lang]
            expect(copy.faq.items[0]?.answer).toContain('$5,500')
            // The hero hint names a price, so it says it is personal too.
            expect(copy.priceHint.priced).toMatch(/personal/)
            expect(copy.priceHint.priced).toMatch(/financ/)
        }
        expect(DRK_COPY.en.prices.personal).toBe(
            'Your price is personal — I confirm it at your consultation.'
        )
        expect(DRK_COPY.en.faq.items[0]?.answer).toContain(
            'As a guide: BBL (Lipo 360 + BBL) from $5,500, Lipo 360 from $4,000, breast augmentation from $3,500 and tummy tuck from $3,000.'
        )
        expect(DRK_COPY.es.faq.items[0]?.answer).toContain(
            'aumento de senos desde $3,500 y abdominoplastia desde $3,000.'
        )
    })

    it('promises no reply time on the thank-you page, and no emailed quote', () => {
        for (const lang of ['en', 'es'] as const) {
            const { override } = DRK_COPY[lang].thankYou
            expect(override.closed).toBeTruthy()
            expect(override.closed).not.toMatch(/\{time\}|\{when\}|9/)
            expect(override.email?.toLowerCase()).not.toMatch(/quote|cotizaci/)
        }
        expect(DRK_COPY.es.thankYou.signName).toBe('Dra. Karlinsky')
    })

    it('gives her one title in Spanish', () => {
        expect(JSON.stringify(DRK_COPY.es)).not.toMatch(
            /Dra\. Victoria Karlinsky, MD/
        )
        expect(JSON.stringify(DRK_COPY.es)).not.toMatch(/"Dr\. /)
    })

    it('quotes the four starting prices from the price sheet', () => {
        expect(
            DRK_PRICES.map((price) => [price.procedure, price.from])
        ).toEqual([
            ['bbl', '$5,500'],
            ['liposuction', '$4,000'],
            ['breast-augmentation', '$3,500'],
            ['tummy-tuck', '$3,000'],
        ])
        expect(drkPriceFor('mommy-makeover')).toBeNull()
    })

    it('offers the ads page’s procedures, none preselected, checkbox consent', () => {
        for (const lang of ['en', 'es'] as const) {
            const form = buildDrkForm(lang)
            expect(form.copy.procedures).toEqual(
                buildLpChat('default').copy[lang].procedures
            )
            expect(form.copy.consentTap).toBeUndefined()
            expect(form.copy.consent).toEqual(
                buildLpChat('default').copy[lang].consent
            )
        }
        expect(buildDrkForm('en').copy.submit).toBe('Request my consultation')
        expect(buildDrkForm('es').copy.submit).toBe('Solicitar mi consulta')
    })
})

describe('Dr. Karlinsky IG reviews', () => {
    const review = (id: string, comment: string, rating = 5) => ({
        id,
        reviewerName: `Patient ${id}`,
        reviewerPhotoUrl: null,
        rating,
        comment,
        reviewCreatedAt: '2026-05-01T00:00:00.000Z',
        replyText: null,
    })
    const padding =
        ' The whole team took care of me from start to finish, and I love my results.'

    it('keeps five-star reviews that name her and no other doctor', () => {
        const picked = selectDrkReviews(
            {
                averageRating: 4.7,
                totalCount: 81,
                reviews: [
                    review('a', `Dr Karlinsky did my BBL.${padding}`),
                    review('b', `Dra. K is the best.${padding}`),
                    review('c', `Dr. Victoria Karlinsky is great.${padding}`),
                    review('d', `Great place, lovely staff.${padding}`),
                    review(
                        'e',
                        `Dr Karlinsky and Dr. Moran were great.${padding}`
                    ),
                    review('f', `Dr Karlinsky was fine.${padding}`, 4),
                    review(
                        'g',
                        `(Translated by Google) Dr Karlinsky.${padding}`
                    ),
                ],
            },
            'en'
        )
        expect(picked.map((item) => item.id)).toEqual(['a', 'b', 'c'])
        expect(picked[0]?.date).toBe('May 2026')
    })

    it('returns none without the database', () => {
        expect(selectDrkReviews(null, 'en')).toEqual([])
    })
})

describe('DrkLanding', () => {
    const proof = { photos: [], reviews: [], rating: null, reviewCount: null }
    const links = { en: '?hl=en', es: '?hl=es' }

    it('hides every play control while there is no video', () => {
        const html = renderToStaticMarkup(
            createElement(DrkLanding, {
                lang: 'en',
                languageLinks: links,
                proof,
                video: { ...DRK_VIDEO, src: '' },
            })
        )
        expect(hasDrkVideo({ ...DRK_VIDEO, src: '' })).toBe(false)
        expect(html).not.toContain('data-drk-play')
        expect(html).not.toContain('<video')
        expect(html).toContain('You know my work.')
        expect(html).toContain('id="drk-request"')
        // The price hint under the procedure list, before a choice.
        expect(html).toContain('ck-procedure__hint')
        expect(html).toContain('Your price is personal · financing available')
        expect(html).toContain('aria-describedby="drk-request-procedure-hint"')
    })

    it('ships the real cut: Blob URLs, captions in both languages, label from durationSec', () => {
        const blob =
            /^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/landing\/dr-karlinsky-ig\//
        expect(hasDrkVideo()).toBe(true)
        for (const url of [DRK_VIDEO.src, DRK_VIDEO.poster]) {
            expect(url).toMatch(blob)
        }
        // Same-origin captions: the <video> must not need crossOrigin (iOS).
        for (const url of [DRK_VIDEO.captionsEn, DRK_VIDEO.captionsEs]) {
            expect(url).toMatch(/^\/media\/dr-karlinsky-ig\/[a-z0-9.-]+\.vtt$/)
        }
        const html = renderToStaticMarkup(
            createElement(DrkLanding, {
                lang: 'en',
                languageLinks: links,
                proof,
                video: DRK_VIDEO,
            })
        )
        expect(html).toContain(config.formatDuration(DRK_VIDEO.durationSec))
        expect(html).not.toContain('0:48')
    })

    it('draws the story ring and the arches as play buttons, without a <video>', () => {
        const html = renderToStaticMarkup(
            createElement(DrkLanding, {
                lang: 'es',
                languageLinks: links,
                proof,
                video: { ...DRK_VIDEO, src: 'https://example.com/m.mp4' },
            })
        )
        expect(html).toContain('data-drk-play="story"')
        expect(html).toContain('data-drk-play="hero-cover"')
        expect(html).toContain('data-drk-play="hero-desktop"')
        // Her message plays from the hero only; the band below is gone (v2).
        expect(html).not.toContain('data-drk-play="inline"')
        // Mounted only on tap.
        expect(html).not.toContain('<video')
        expect(html).toContain('Ya conoces mi trabajo.')
    })

    it('sends the phone hero button to the form', () => {
        const html = renderToStaticMarkup(
            createElement(DrkLanding, {
                lang: 'en',
                languageLinks: links,
                proof,
            })
        )
        expect(html).toMatch(
            /id="drk-hero-go"[^]*?href="#drk-request"[^>]*data-drk-focus=""[^>]*data-cta="drk_hero"/
        )
        expect(html).toContain('Sarah from my team will text you.')
    })
})

describe('Dr. Karlinsky IG review language', () => {
    it('tags a review by the language it is written in', () => {
        expect(
            reviewLanguage(
                'La doctora Karlinsky es excelente, muy atenta con todo'
            )
        ).toBe('es')
        expect(
            reviewLanguage(
                'Dr. K was amazing and very kind to me and my family'
            )
        ).toBe('en')
    })
})

describe('drk_lead_submitted counts each lead once', async () => {
    const { claimLeadCount } = await import(
        '@/components/landing-pages/dr-karlinsky-ig/drk-thank-you.component'
    )

    function memoryStorage(): Storage {
        const map = new Map<string, string>()
        return {
            get length() {
                return map.size
            },
            clear: () => map.clear(),
            getItem: (key) => map.get(key) ?? null,
            key: (index) => [...map.keys()][index] ?? null,
            removeItem: (key) => void map.delete(key),
            setItem: (key, value) => void map.set(key, String(value)),
        }
    }

    it('counts the lead the form stored, then not on a reload', () => {
        const storage = memoryStorage()
        storage.setItem(
            'drk_lead',
            JSON.stringify({ firstName: 'Ana', lead: { id: 'a', token: 't' } })
        )
        expect(claimLeadCount(storage)).toBe(true)
        expect(claimLeadCount(storage)).toBe(false)
        // A second request in the same tab is a new lead.
        storage.setItem(
            'drk_lead',
            JSON.stringify({ firstName: 'Ana', lead: { id: 'b', token: 't' } })
        )
        expect(claimLeadCount(storage)).toBe(true)
    })

    it('does not count a visit with no stored lead', () => {
        expect(claimLeadCount(memoryStorage())).toBe(false)
    })

    it('counts when storage is unavailable', () => {
        expect(claimLeadCount(undefined)).toBe(true)
    })
})
