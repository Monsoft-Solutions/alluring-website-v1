'use client'

/**
 * Mounted on every thank-you page: pushes `lead_confirmed` to the dataLayer
 * once, and only for a lead sent in this tab within the last ten minutes
 * (`lib/analytics/lead-confirmation.ts`, #350). A reload, a reopened tab or
 * a visit from a bookmark pushes nothing. Renders nothing.
 */

import { useEffect } from 'react'

import { confirmLead } from '@/lib/analytics/lead-confirmation'
import { browserStorage } from '@/lib/analytics/visit-attribution'

export function LeadConfirmedEvent() {
    useEffect(() => {
        confirmLead(browserStorage('session'), Date.now(), (event) => {
            window.dataLayer = window.dataLayer ?? []
            window.dataLayer.push(event)
        })
    }, [])
    return null
}
