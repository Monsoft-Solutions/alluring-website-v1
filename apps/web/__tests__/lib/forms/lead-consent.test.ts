import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ConsentNotice } from '@/components/shared/forms/consent-notice.component'
import {
    consentNoticeText,
    LEAD_CONSENT_VERSION,
    SUBMIT_CONSENT,
} from '@/lib/constants/lead-consent'
import {
    CHECKBOX_WORDING,
    CONSENT_WORDINGS,
    describeConsent,
    LP_TAP_CONSENT_VERSION,
} from '@/lib/constants/lead-consent-archive'
import { getPhoneLink, siteConfig } from '@/lib/data/site-config'
import { contactFormSchema } from '@/lib/types/forms/contact-form.type'

describe('consent by submitting (#350)', () => {
    it('says what the Meta instant forms say, in both languages', () => {
        const en = consentNoticeText('en')
        expect(en).toMatch(/^By submitting this form, you agree that/)
        expect(en).toContain(
            'may call and text you about your consultation request at the phone number you entered, including automated texts.'
        )
        expect(en).toContain('Consent isn’t a condition of purchase')
        expect(en).toContain(
            'Msg & data rates may apply. Msg frequency varies.'
        )
        expect(en).toContain('Reply STOP to opt out, HELP for help.')

        const es = consentNoticeText('es')
        expect(es).toMatch(/^Al enviar este formulario, aceptas que/)
        expect(es).toContain('incluidos mensajes automatizados')
        expect(es).toContain('El consentimiento no es una condición de compra')
        expect(es).toContain('Responde STOP para cancelar o HELP')
    })

    it('reads the business name and phone number from the site config', () => {
        const digits = siteConfig.contact.phone.replace(/\D/g, '').slice(1)
        for (const lang of ['en', 'es'] as const) {
            const text = consentNoticeText(lang)
            expect(text).toContain(siteConfig.business.name)
            expect(text.replace(/\D/g, '')).toContain(digits)
        }
    })

    it('renders above-the-button markup with a call link and the legal pages', () => {
        const html = renderToStaticMarkup(
            createElement(ConsentNotice, { id: 'c1', lang: 'es' })
        )
        expect(html).toContain('id="c1"')
        expect(html).toContain(`href="${getPhoneLink()}"`)
        expect(html).toContain('href="/privacy"')
        expect(html).toContain('href="/terms"')
        expect(html).toContain('Política de privacidad')
        expect(html).not.toContain('type="checkbox"')
        // Reading size and ink, not legal grey.
        expect(html).toContain('text-stone-200')
        expect(html).not.toMatch(/text-(xs|\[0\.6875rem\]|\[11px\])/)
    })

    it('sends consent, the method and the version with every lead', () => {
        expect(SUBMIT_CONSENT).toEqual({
            consentGiven: true,
            consentMethod: 'tap',
            consentVersion: LEAD_CONSENT_VERSION,
        })
        const parsed = contactFormSchema.parse({
            name: 'Adriano Test',
            phone: '3057974357',
            ...SUBMIT_CONSENT,
        })
        expect(parsed).toMatchObject(SUBMIT_CONSENT)
    })

    it('keeps every wording a stored lead can name', () => {
        expect(LEAD_CONSENT_VERSION).toMatch(/^site-submit-\d{4}-\d{2}-\d{2}$/)
        expect(CONSENT_WORDINGS[LEAD_CONSENT_VERSION]?.text).toEqual({
            en: consentNoticeText('en'),
            es: consentNoticeText('es'),
        })
        expect(CONSENT_WORDINGS[LP_TAP_CONSENT_VERSION]).toBeDefined()
        expect(CHECKBOX_WORDING.en).toContain('automatic telephone dialing')
    })

    it('describes each consent for the staff note and the CRM', () => {
        expect(describeConsent(SUBMIT_CONSENT)).toBe(
            `by submitting the form, notice ${LEAD_CONSENT_VERSION} of 2026-10-24`
        )
        expect(
            describeConsent({
                consentGiven: true,
                consentMethod: 'tap',
                consentVersion: LP_TAP_CONSENT_VERSION,
            })
        ).toContain(LP_TAP_CONSENT_VERSION)
        expect(
            describeConsent({ consentGiven: true, consentMethod: 'checkbox' })
        ).toBe('ticked the consent box')
        expect(describeConsent({ consentGiven: false })).toBeNull()
    })

    it('stores a first touch when well formed and drops it otherwise', () => {
        const firstTouch = {
            source: 'chatgpt',
            medium: 'ai',
            referrer: 'https://chatgpt.com/',
            landingPage: 'https://www.alluringplasticsurgery.com/',
            at: '2026-10-20T14:00:00.000Z',
        }
        const lead = { name: 'Adriano Test', phone: '3057974357' }
        expect(
            contactFormSchema.parse({ ...lead, firstTouch }).firstTouch
        ).toEqual(firstTouch)
        expect(
            contactFormSchema.parse({
                ...lead,
                firstTouch: { ...firstTouch, at: 'yesterday' },
            }).firstTouch
        ).toBeUndefined()
    })
})
