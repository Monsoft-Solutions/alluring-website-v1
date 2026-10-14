'use client'

/**
 * The confirmation after a request from Dr. Karlinsky's page, in her voice.
 *
 * The body is the site's consultation thank-you (`ConsultationThankYou`): it
 * greets the visitor by the first name the form left in `sessionStorage`,
 * then asks the optional one-tap questions — the timeline first, since the
 * one-screen form skipped it — each saved to the lead she just sent. "How
 * did you hear about us?" is left out: her source already says.
 *
 * Its other job is `drk_lead_submitted`. GTM's lead conversions fire on this
 * page's view (the path contains "thank-you"); the event carries the
 * language and the campaign for reporting, and nothing personal.
 */

import { useEffect } from 'react'

import {
    pushDataLayer,
    readAttribution,
} from '@/components/landing-pages/request-consultation/lp-tracking'
import { ConsultationThankYou } from '@/components/sections/thank-you/consultation-thank-you.component'

import {
    DRK_EVENTS,
    DRK_FORM_VARIANT,
    DRK_LEAD_STORAGE_KEY,
    DRK_PAGE_VARIANT,
} from './drk-config'
import type { DrkDictionary, DrkLang } from './drk-copy'

interface DrkThankYouProps {
    readonly lang: DrkLang
    readonly override: DrkDictionary['thankYou']['override']
}

export function DrkThankYou({ lang, override }: DrkThankYouProps) {
    useEffect(() => {
        const campaign = readAttribution()
        pushDataLayer({
            event: DRK_EVENTS.submitted,
            pageVariant: DRK_PAGE_VARIANT,
            formVariant: DRK_FORM_VARIANT,
            lang,
            utm_source: campaign.utm_source,
            utm_medium: campaign.utm_medium,
            utm_campaign: campaign.utm_campaign,
            utm_content: campaign.utm_content,
            utm_term: campaign.utm_term,
        })
    }, [lang])

    return (
        <ConsultationThankYou
            leadStorageKey={DRK_LEAD_STORAGE_KEY}
            copyOverride={{ [lang]: override }}
            lang={lang}
            compact
            hideHeardFrom
        />
    )
}
