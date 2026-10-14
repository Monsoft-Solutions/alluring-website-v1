import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

const { LeadQuestions } = await import(
    '@/components/sections/thank-you/consultation-thank-you.component'
)

const lead = { id: '00000000-0000-0000-0000-000000000000', token: 't' }

function render(props: { hideHeardFrom?: boolean; emailQuestion?: string }) {
    return renderToStaticMarkup(
        createElement(LeadQuestions, {
            lang: 'en',
            lead,
            storageKey: 'test_lead',
            stored: { firstName: 'Ana', lead, askTimeline: true },
            ...props,
        })
    )
}

describe('ConsultationThankYou questions', () => {
    it('asks how the visitor heard of us when the prop is left out', () => {
        const html = render({})
        expect(html).toContain('How did you hear about us?')
        expect(html).toContain('thank-you-q-heard-from')
    })

    it('leaves the question out with hideHeardFrom (#332)', () => {
        const html = render({ hideHeardFrom: true })
        expect(html).not.toContain('How did you hear about us?')
        expect(html).not.toContain('thank-you-q-heard-from')
        // The others stay, the timeline first when the form skipped it.
        expect(html).toContain('thank-you-q-timeline')
        expect(html).toContain('thank-you-q-consult-type')
        expect(html).toContain('thank-you-q-financing')
    })

    it('asks the page’s own email question when given one', () => {
        expect(render({})).toContain('Want your quote by email too?')
        const html = render({ emailQuestion: 'Want my team to email you too?' })
        expect(html).toContain('Want my team to email you too?')
        expect(html).not.toContain('Want your quote by email too?')
    })
})
