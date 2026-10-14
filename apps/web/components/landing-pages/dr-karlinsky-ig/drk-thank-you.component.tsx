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
 *
 * It is pushed once per lead: a reload, or a tab restored days later, would
 * otherwise count a lead nobody sent (the ghost leads the ads page shows).
 * The form leaves the lead in `sessionStorage`; the event is pushed when
 * that lead is there and hasn't been counted yet.
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

/** Remembers which lead `drk_lead_submitted` was pushed for. */
export const DRK_COUNTED_STORAGE_KEY = `${DRK_LEAD_STORAGE_KEY}_counted`

/**
 * True the first time the page sees the lead the form just stored; marks
 * it as counted. False with no stored lead (a direct visit) or once counted.
 * When storage can't be read at all, true: nothing can be told apart, and a
 * real lead must not go uncounted.
 */
export function claimLeadCount(storage: Storage | undefined): boolean {
    try {
        if (!storage) return true
        const raw = storage.getItem(DRK_LEAD_STORAGE_KEY)
        if (!raw) return false
        const parsed = JSON.parse(raw) as { lead?: { id?: unknown } }
        const id = typeof parsed.lead?.id === 'string' ? parsed.lead.id : raw
        if (storage.getItem(DRK_COUNTED_STORAGE_KEY) === id) return false
        storage.setItem(DRK_COUNTED_STORAGE_KEY, id)
        return true
    } catch {
        return true
    }
}

function sessionStore(): Storage | undefined {
    try {
        return window.sessionStorage
    } catch {
        return undefined
    }
}

interface DrkThankYouProps {
    readonly lang: DrkLang
    readonly override: DrkDictionary['thankYou']['override']
}

export function DrkThankYou({ lang, override }: DrkThankYouProps) {
    useEffect(() => {
        if (!claimLeadCount(sessionStore())) return
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
