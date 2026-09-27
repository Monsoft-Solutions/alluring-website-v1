import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push() {} }) }))
vi.mock('@/lib/analytics/utm-tracking.context', () => ({
    useUTMTracking: () => ({ utmData: null }),
}))

/**
 * A server render always starts a fresh form. Forms whose id starts with
 * `last-` open on the last step instead, as if both taps were given.
 */
vi.mock(
    '@/components/shared/consult-chat/consult-flow-store',
    async (importOriginal) => {
        const actual =
            await importOriginal<
                typeof import('@/components/shared/consult-chat/consult-flow-store')
            >()
        return {
            ...actual,
            useFlowThread: (formId: string) =>
                formId.startsWith('last-')
                    ? {
                          step: 2,
                          answers: {
                              procedure: 'tummy-tuck',
                              timeline: '1-3-months',
                          },
                          name: '',
                          financing: false,
                      }
                    : actual.useFlowThread(formId),
        }
    }
)

const { ConsultChat } = await import(
    '@/components/shared/consult-chat/consult-chat.component'
)
const { ConsultCard } = await import(
    '@/components/shared/consult-chat/consult-card.component'
)
const { buildLpChat, LP_CONSENT_VERSION } = await import(
    '@/components/landing-pages/request-consultation/lp-chat-copy'
)
const { HOME_CHAT } = await import(
    '@/components/shared/consult-chat/site-chat-copy'
)

const lp = buildLpChat('tummy-tuck')

const base = {
    id: 'consultation',
    lang: 'en' as const,
    staff: lp.staff,
    source: 'landing-page' as const,
    formName: 'test_form',
    thankYouPath: '/thank-you',
    leadStorageKey: 'test_lead',
    subject: (procedure: string) => `Consultation Request: ${procedure}`,
    noteLines: [],
}

describe('ConsultChat with its defaults (home, contact, specials)', () => {
    const copy = HOME_CHAT.copy.en
    const html = renderToStaticMarkup(
        createElement(ConsultChat, {
            ...base,
            copy,
            avatar: createElement('span', null, 'A'),
        })
    )

    it('keeps the messaging-app header, greeting and first question', () => {
        expect(html).toContain('cc-chat__head')
        expect(html).toContain('cc-chat__avatar')
        expect(html).toContain('cc-dot')
        expect(html).toContain(copy.greeting)
        expect(html).toContain(copy.qProcedure)
        expect(html).not.toContain('cc-steps')
        expect(html).not.toContain('cc-thread--compact')
    })

    it('offers every procedure chip', () => {
        for (const option of copy.procedures) {
            expect(html).toContain(`>${option.label}</button>`)
        }
    })
})

describe('the landing page’s quiet thread (arm A)', () => {
    const copy = lp.copy.en
    const html = renderToStaticMarkup(
        createElement(ConsultChat, {
            ...base,
            copy,
            avatar: null,
            header: 'steps',
            greeting: false,
            history: 'compact',
            typingMs: 0,
            consent: { method: 'tap', version: LP_CONSENT_VERSION },
            defaultProcedure: 'tummy-tuck',
        })
    )

    it('wears the form header, not the chat header', () => {
        expect(html).toContain('cc-steps')
        expect(html).toContain('Request your consultation')
        expect(html).toContain('30 seconds')
        expect(html).toContain('Step 1 of 3')
        for (const step of ['Procedure', 'Timing', 'Your number']) {
            expect(html).toContain(step)
        }
        expect(html).not.toContain('cc-chat__avatar')
        expect(html).not.toContain('cc-dot')
    })

    it('opens on the question alone, with the ad’s procedure first and pressed', () => {
        expect(html).not.toContain('Hi.')
        expect(html).toContain('What are you considering?')
        expect(html).toMatch(
            /<button type="button" class="cc-chip" aria-pressed="true">Tummy tuck<\/button>/
        )
        expect(html.match(/class="cc-chip"/g)).toHaveLength(7)
    })
})

describe('the landing page’s tap card (arm B)', () => {
    const copy = lp.copy.es
    const html = renderToStaticMarkup(
        createElement(ConsultCard, {
            ...base,
            lang: 'es',
            copy,
            consent: { method: 'tap', version: LP_CONSENT_VERSION },
            defaultProcedure: 'tummy-tuck',
        })
    )

    it('draws the shared header and tiles in a card', () => {
        expect(html).toContain('ck-card')
        expect(html).toContain('cc-steps')
        expect(html).toContain('Pide tu consulta')
        expect(html).toContain('¿Qué estás considerando?')
        expect(html.match(/class="ck-tile( ck-tile--wide)?"/g)).toHaveLength(7)
        expect(html).toContain('ck-tile ck-tile--wide')
        expect(html).toMatch(/aria-pressed="true">Abdominoplastia</)
    })

    it('carries the section id every CTA links to', () => {
        expect(html).toContain('id="consultation"')
    })
})

describe('the last step’s wording test (#302)', () => {
    const lastStep = (
        form: 'thread' | 'card',
        lang: 'en' | 'es',
        copyVariant: 'plain' | 'reassure'
    ) => {
        const props = {
            ...base,
            id: `last-${form}-${lang}-${copyVariant}`,
            lang,
            copy: buildLpChat('tummy-tuck', copyVariant).copy[lang],
            consent: { method: 'tap', version: LP_CONSENT_VERSION },
            defaultProcedure: 'tummy-tuck',
        } as const
        return renderToStaticMarkup(
            form === 'card'
                ? createElement(ConsultCard, props)
                : createElement(ConsultChat, {
                      ...props,
                      avatar: null,
                      header: 'steps',
                      greeting: false,
                      history: 'compact',
                  })
        )
    }
    const NOTE = {
        en: 'A patient coordinator will text you to set up your consultation. Private, and no obligation.',
        es: 'Una coordinadora te escribe por texto para agendar tu consulta. Privado y sin compromiso.',
    }

    it.each([
        ['thread', 'en'],
        ['thread', 'es'],
        ['card', 'en'],
        ['card', 'es'],
    ] as const)(
        'the %s shows the note first in the fields with reassure (%s)',
        (form, lang) => {
            const html = lastStep(form, lang, 'reassure')
            expect(html).toContain(
                `<div class="cc-fields"><p class="cc-contact-note">${NOTE[lang]}</p>`
            )
            // Nothing else on the step changes.
            expect(html).toContain('cc-consent-line')
        }
    )

    it.each(['thread', 'card'] as const)(
        'the %s has no note with plain',
        (form) => {
            const html = lastStep(form, 'en', 'plain')
            expect(html).toContain('cc-fields')
            expect(html).not.toContain('cc-contact-note')
        }
    )

    it('leaves the home thread’s last step without a note', () => {
        const html = renderToStaticMarkup(
            createElement(ConsultChat, {
                ...base,
                id: 'last-home',
                copy: HOME_CHAT.copy.en,
                avatar: createElement('span', null, 'A'),
            })
        )
        expect(html).toContain('cc-fields')
        expect(html).not.toContain('cc-contact-note')
    })
})
