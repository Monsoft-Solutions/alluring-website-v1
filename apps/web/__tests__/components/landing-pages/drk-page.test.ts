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
const hero = await import(
    '@/components/landing-pages/dr-karlinsky-ig/drk-hero-variant'
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
const { ConsultFields } = await import(
    '@/components/shared/consult-chat/consult-fields.component'
)

describe('Dr. Karlinsky IG page config (#332)', () => {
    it('tags leads with its own source, page and form variant', () => {
        expect(config.DRK_SOURCE).toBe(CONTACT_SOURCES.DR_KARLINSKY_IG)
        expect(config.DRK_SOURCE).toBe('dr-karlinsky-ig')
        expect(config.DRK_PAGE_VERSION).toBe('drk-ig-v2')
        expect(config.drkPageVariant('arch')).toBe('drk-ig-v2-arch')
        expect(config.drkPageVariant('pick')).toBe('drk-ig-v2-pick')
        expect(config.DRK_FORM_VARIANT).toBe('form')
        expect(config.DRK_FORM_NAME).toBe('dr_karlinsky_ig_form')
        expect(config.DRK_LEAD_STORAGE_KEY).toBe('drk_lead')
    })

    it('uses variants the lead schema accepts', () => {
        // contact-form.type.ts: ^[a-z0-9][a-z0-9-]*$, at most 40 characters.
        for (const value of [
            ...hero.DRK_HERO_ARMS.map(config.drkPageVariant),
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
            view: 'drk_view',
            sectionView: 'drk_section_view',
            scroll: 'drk_scroll',
            cta: 'drk_cta',
            faqOpen: 'drk_faq_open',
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

    it('lists no prices; names the financing partners instead', () => {
        for (const lang of ['en', 'es'] as const) {
            const copy = DRK_COPY[lang]
            expect(JSON.stringify(copy)).not.toMatch(/\$\s?\d/)
            expect(copy.formHint).toMatch(/personal/)
            expect(copy.formHint).toMatch(/financ/)
            expect(copy.tilesNote).toBeTruthy()
            expect(copy.financing.fine).toMatch(/Cherry/)
        }
        expect(DRK_COPY.en.faq.items[0]?.answer).toBe(
            'Your price is personal — I confirm it at your consultation, in writing, before you decide. No obligation.'
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
        // The line under the procedure list.
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

    it.each(['pick', 'arch'] as const)(
        'draws the %s arm’s play buttons, without a <video>',
        (heroArm) => {
            const html = renderToStaticMarkup(
                createElement(DrkLanding, {
                    lang: 'es',
                    languageLinks: links,
                    proof,
                    video: { ...DRK_VIDEO, src: 'https://example.com/m.mp4' },
                    heroArm,
                })
            )
            expect(html).toContain('data-drk-play="story"')
            expect(html).toContain('data-drk-play="hero-desktop"')
            // The arch arm plays her message from the hero cover; the pick
            // arm keeps the "A message from me" band instead.
            expect(html.includes('data-drk-play="hero-cover"')).toBe(
                heroArm === 'arch'
            )
            expect(html.includes('data-drk-play="inline"')).toBe(
                heroArm === 'pick'
            )
            expect(html).toContain(`data-hero-arm="${heroArm}"`)
            expect(html).toContain(`data-page-variant="drk-ig-v2-${heroArm}"`)
            // Mounted only on tap.
            expect(html).not.toContain('<video')
            expect(html).toContain('Ya conoces mi trabajo.')
        }
    )

    const render = (heroArm: 'arch' | 'pick', lang: 'en' | 'es' = 'en') =>
        renderToStaticMarkup(
            createElement(DrkLanding, {
                lang,
                languageLinks: links,
                proof,
                heroArm,
            })
        )

    it('sends the arch arm’s hero button to the form, which keeps its list', () => {
        const html = render('arch')
        expect(html).toMatch(
            /id="drk-hero-go"[^]*?href="#drk-request"[^>]*data-drk-focus=""[^>]*data-cta="drk_hero"/
        )
        expect(html).toContain('Sarah from my team will text you.')
        expect(html).toContain('drk-hero--arch')
        expect(html).toContain('<select id="drk-request-procedure"')
        expect(html).not.toContain('type="radio"')
        expect(html).not.toContain('Then just your first name and mobile.')
    })

    it('opens the pick arm on the procedure tiles, with no hero button', () => {
        const html = render('pick')
        expect(html).not.toContain('drk-hero-go')
        expect(html).toContain('drk-hero--pick')
        expect(html).not.toContain('<select')
        const radios = html.match(/type="radio"/g) ?? []
        expect(radios).toHaveLength(buildDrkForm('en').copy.procedures.length)
        expect(html).toContain('Then just your first name and mobile.')
        expect(html).toContain('class="ck-pick__more" hidden=""')
        expect(render('pick', 'es')).toContain(
            'Luego solo tu nombre y tu celular.'
        )
    })

    it('marks every section for the section-view events', () => {
        const html = renderToStaticMarkup(
            createElement(DrkLanding, {
                lang: 'en',
                languageLinks: links,
                proof,
                heroArm: 'pick',
            })
        )
        const sections = [...html.matchAll(/data-drk-section="([a-z]+)"/g)].map(
            (match) => match[1]
        )
        expect(sections).toEqual(
            expect.arrayContaining([
                'hero',
                'message',
                'steps',
                'financing',
                'faq',
                'closing',
            ])
        )
        expect(new Set(sections).size).toBe(sections.length)
    })

    it('shows financing, not prices', () => {
        const html = renderToStaticMarkup(
            createElement(DrkLanding, {
                lang: 'en',
                languageLinks: links,
                proof,
            })
        )
        expect(html).not.toMatch(/\$\s?\d/)
        for (const partner of ['Cherry', 'CareCredit', 'United Credit']) {
            expect(html).toContain(`<li>${partner}</li>`)
        }
        expect(html).toContain('data-cta="drk_financing"')
    })
})

describe('Dr. Karlinsky IG hero test (#332)', () => {
    const assign = (
        query: string | null,
        cookie: string | null,
        random: number,
        split = hero.parseDrkHeroSplit(undefined)
    ) => hero.assignDrkHeroArm({ query, cookie, split, random }).variant

    it('splits new visitors 50/50 between arch and pick by default', () => {
        expect(hero.DRK_HERO_ARMS).toEqual(['arch', 'pick'])
        expect(hero.parseDrkHeroSplit(undefined)).toEqual({
            arch: 50,
            pick: 50,
        })
        expect(assign(null, null, 0.1)).toBe('arch')
        expect(assign(null, null, 0.49)).toBe('arch')
        expect(assign(null, null, 0.5)).toBe('pick')
        expect(assign(null, null, 0.99)).toBe('pick')
    })

    it('keeps a returning visitor in their arm, and lets QA force one', () => {
        expect(assign(null, 'arch', 0.9)).toBe('arch')
        expect(assign(null, 'pick', 0.1)).toBe('pick')
        expect(assign('arch', 'pick', 0.9)).toBe('arch')
        expect(assign('pick', 'arch', 0.1)).toBe('pick')
        expect(assign(null, 'garbage', 0.9)).toBe('pick')
    })

    it('draws again for a visitor still holding the retired v1 arm', () => {
        expect(hero.toDrkHeroArm('form')).toBeNull()
        expect(assign(null, 'form', 0.1)).toBe('arch')
        expect(assign(null, 'form', 0.9)).toBe('pick')
        expect(assign('form', null, 0.9)).toBe('pick')
    })

    it('ends the test with one environment variable', () => {
        const split = hero.parseDrkHeroSplit('arch:100')
        expect(assign(null, 'pick', 0.9, split)).toBe('arch')
        expect(assign(null, 'form', 0.9, split)).toBe('arch')
        expect(hero.parseDrkHeroSplit('arch:50,pick:50')).toEqual({
            arch: 50,
            pick: 50,
        })
        // A typo must not send everyone to one arm.
        expect(hero.parseDrkHeroSplit('arhc:100')).toEqual({
            arch: 50,
            pick: 50,
        })
    })
})

describe('ConsultFields procedure input (#332)', () => {
    const form = buildDrkForm('en')
    const render = (extra: Record<string, unknown> = {}) =>
        renderToStaticMarkup(
            createElement(ConsultFields, {
                id: 'cf-test',
                lang: 'en',
                copy: form.copy,
                staff: form.staff,
                source: config.DRK_SOURCE,
                formName: 'test_form',
                thankYouPath: '/thank-you',
                leadStorageKey: 'test_lead',
                subject: (procedure: string) => procedure,
                noteLines: [],
                nameField: 'first',
                procedureHint: () => 'A hint',
                ...extra,
            })
        )

    it('draws the list by default, everything open', () => {
        const html = render()
        expect(html).toBe(render({ procedureInput: 'select' }))
        expect(html).toContain('<select id="cf-test-procedure"')
        expect(html).not.toContain('type="radio"')
        expect(html).not.toContain('ck-pick')
        expect(html).not.toContain('hidden=""')
        expect(html).toContain('id="cf-test-name"')
        expect(html).toContain('A hint')
    })

    it('draws one radio tile per procedure, the note, and folds the rest', () => {
        const html = render({
            procedureInput: 'tiles',
            tilesNote: 'Then less.',
        })
        expect(html).not.toContain('<select')
        expect(html).toMatch(/<fieldset class="ck-pick"[^>]*><legend/)
        expect(html).toContain('What are you considering?')
        const radios = [...html.matchAll(/<input[^>]*type="radio"[^>]*>/g)]
        expect(radios).toHaveLength(form.copy.procedures.length)
        for (const option of form.copy.procedures) {
            expect(html).toContain(`value="${option.value}"`)
        }
        for (const [radio] of radios) {
            expect(radio).toContain('name="cf-test-procedure"')
            expect(radio).not.toContain('checked')
        }
        expect(html).toContain('<p class="ck-pick__note">Then less.</p>')
        // Folded, but rendered: the hook's refs keep their elements.
        expect(html).toMatch(
            /class="ck-pick__more" hidden=""[^]*id="cf-test-name"[^]*id="cf-test-phone"[^]*type="submit"/
        )
        expect(html).toContain('class="ck-reassure" hidden=""')
    })

    it('starts open on a preset procedure', () => {
        const value = form.copy.procedures[0]?.value ?? ''
        const html = render({
            procedureInput: 'tiles',
            tilesNote: 'Then less.',
            defaultProcedure: value,
        })
        expect(html).not.toContain('hidden=""')
        expect(html).not.toContain('Then less.')
        expect(html).toMatch(
            new RegExp(`<input[^>]*checked=""[^>]*value="${value}"`)
        )
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

describe('drk_section_view counts tall sections (#332)', async () => {
    const { isSeen } = await import(
        '@/components/landing-pages/dr-karlinsky-ig/drk-insights.component'
    )
    // An iPhone 13's visible area: 664px tall.
    const entry = (sectionHeight: number, visible: number) => ({
        intersectionRatio: visible / sectionHeight,
        intersectionRect: { height: visible } as DOMRectReadOnly,
        rootBounds: { height: 664 } as DOMRectReadOnly,
    })

    it('counts a short section once 40% of it is on screen', () => {
        expect(isSeen(entry(488, 196))).toBe(true)
        expect(isSeen(entry(488, 150))).toBe(false)
    })

    it('counts the arch hero and the reviews once they cover 40% of the screen', () => {
        // Never 40% of themselves on a 664px screen.
        expect(isSeen(entry(1144, 270))).toBe(true)
        expect(isSeen(entry(1130, 266))).toBe(true)
        expect(isSeen(entry(1144, 200))).toBe(false)
    })
})
