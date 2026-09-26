import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push() {} }) }))
vi.mock('@/lib/analytics/utm-tracking.context', () => ({
    useUTMTracking: () => ({ utmData: null }),
}))

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
