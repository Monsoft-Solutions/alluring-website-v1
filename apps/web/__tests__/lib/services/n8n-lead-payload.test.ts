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
