import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

const { LeadQuestions } = await import(
    '@/components/sections/thank-you/consultation-thank-you.component'
)

const lead = { id: '00000000-0000-0000-0000-000000000000', token: 't' }

function render(hideHeardFrom: boolean) {
    return renderToStaticMarkup(
        createElement(LeadQuestions, {
            lang: 'en',
            lead,
            storageKey: 'test_lead',
            stored: { firstName: 'Ana', lead, askTimeline: true },
            hideHeardFrom,
        })
    )
}

describe('ConsultationThankYou questions', () => {
    it('asks how the visitor heard of us by default', () => {
        const html = render(false)
        expect(html).toContain('How did you hear about us?')
        expect(html).toContain('thank-you-q-heard-from')
    })

    it('leaves the question out with hideHeardFrom (#332)', () => {
        const html = render(true)
        expect(html).not.toContain('How did you hear about us?')
        expect(html).not.toContain('thank-you-q-heard-from')
        // The others stay, the timeline first when the form skipped it.
        expect(html).toContain('thank-you-q-timeline')
        expect(html).toContain('thank-you-q-consult-type')
        expect(html).toContain('thank-you-q-financing')
    })
})
