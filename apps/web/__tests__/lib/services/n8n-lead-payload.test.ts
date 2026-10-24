import { describe, expect, it, vi } from 'vitest'

vi.mock('@/env', () => ({
    env: { N8N_WEBHOOK_URL: '', N8N_LEAD_UPDATE_WEBHOOK_URL: '' },
}))

const { buildN8NLeadPayload } = await import(
    '@/lib/services/n8n-webhook.service'
)

describe('buildN8NLeadPayload', () => {
    it('sends the page variant and source of a Dr. Karlinsky IG lead', () => {
        const payload = buildN8NLeadPayload(
            {
                id: 'lead-1',
                firstName: 'Ana',
                phone: '+13055550123',
                source: 'dr-karlinsky-ig',
                pageVariant: 'drk-ig-v2-arch',
                utmSource: 'doctor',
                utmMedium: 'dr-karlinsky',
                utmCampaign: 'ig-bio',
            },
            'lead.created'
        )
        expect(payload.page_variant).toBe('drk-ig-v2-arch')
        expect(payload.source).toBe('dr-karlinsky-ig')
        expect(payload.utm_source).toBe('doctor')
        expect(payload.utm_campaign).toBe('ig-bio')
        expect(payload.event).toBe('lead.created')
    })

    it('sends an empty page variant for a form that tags none', () => {
        const payload = buildN8NLeadPayload({ id: 'lead-2' }, 'lead.updated')
        expect(payload.page_variant).toBe('')
    })
})

describe('buildN8NLeadPayload: consent and first touch (#350)', () => {
    it('says the lead consented by submitting, and to which wording', () => {
        const payload = buildN8NLeadPayload(
            {
                id: 'lead-3',
                consentGiven: true,
                consentMethod: 'tap',
                consentVersion: 'site-submit-2026-10-24',
            },
            'lead.created'
        )
        expect(payload.sms_consent).toBe(true)
        expect(payload.consent_method).toBe('tap')
        expect(payload.consent_version).toBe('site-submit-2026-10-24')
        expect(payload.sms_consent_note).toBe(
            'Text consent: yes (by submitting the form, notice site-submit-2026-10-24 of 2026-10-24)'
        )
    })

    it('says nothing about consent for a lead that gave none', () => {
        const payload = buildN8NLeadPayload({ id: 'lead-4' }, 'lead.created')
        expect(payload.sms_consent).toBe(false)
        expect(payload.consent_method).toBe('')
        expect(payload.sms_consent_note).toBe('')
    })

    it('sends the first touch in snake case, or null', () => {
        const payload = buildN8NLeadPayload(
            {
                id: 'lead-5',
                firstTouch: {
                    source: 'chatgpt',
                    medium: 'ai',
                    referrer: 'https://chatgpt.com/',
                    landingPage: 'https://www.alluringplasticsurgery.com/',
                    at: '2026-10-20T14:00:00.000Z',
                },
            },
            'lead.created'
        )
        expect(payload.first_touch).toEqual({
            source: 'chatgpt',
            medium: 'ai',
            campaign: '',
            referrer: 'https://chatgpt.com/',
            landing_page: 'https://www.alluringplasticsurgery.com/',
            at: '2026-10-20T14:00:00.000Z',
        })
        expect(
            buildN8NLeadPayload({ id: 'lead-6' }, 'lead.created').first_touch
        ).toBeNull()
    })
})
