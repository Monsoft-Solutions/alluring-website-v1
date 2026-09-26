/**
 * Logs each answer in the landing page's form to our own database
 * (`/api/lp/step` → `lp_form_step`, #292): the chip and the timeline a
 * visitor picked, in which arm, from which ad group. GA4 never gets the
 * answers (#272), and most visitors who answer never send a lead.
 *
 * `sendBeacon`, so the request outlives a visitor who leaves at once, and
 * nothing waits on it. The only key is a random one per browser tab, kept in
 * `sessionStorage`; nothing identifies the visitor.
 */

import type { ConsultFlowAnswer } from '@/components/shared/consult-chat/use-consult-flow.hook'
import type { LpFormStepPayload } from '@/lib/types/analytics/lp-form-step.type'

import type { LpLang } from './lp-copy'
import type { LpFormVariant } from './lp-form-variant'
import type { LpSection } from './lp-sections'
import { LP_PAGE_VARIANT } from './lp-tracking'
import type { AdVariant } from './lp-variants'

const TAB_KEY_STORAGE = 'lp_tab'
const STEP_ENDPOINT = '/api/lp/step'

/** A random key for this tab, made once and kept for the tab's life. */
function tabKey(): string {
    try {
        const saved = window.sessionStorage.getItem(TAB_KEY_STORAGE)
        if (saved && /^[a-z0-9]{8,40}$/.test(saved)) return saved
        const fresh = crypto.randomUUID().replace(/-/g, '')
        window.sessionStorage.setItem(TAB_KEY_STORAGE, fresh)
        return fresh
    } catch {
        return crypto.randomUUID().replace(/-/g, '')
    }
}

interface LpStepContext extends ConsultFlowAnswer {
    readonly lang: LpLang
    readonly adVariant: AdVariant
    readonly formVariant: LpFormVariant
    readonly section: LpSection | null
}

export function lpStepBeacon(context: LpStepContext): void {
    try {
        const entry = context.entry as LpFormStepPayload['entry']
        const payload: LpFormStepPayload = {
            tab: tabKey(),
            page: LP_PAGE_VARIANT,
            form: context.formVariant,
            ad: context.adVariant,
            section: context.section,
            lang: context.lang,
            step: context.step,
            answer: context.answer,
            entry,
        }
        const body = JSON.stringify(payload)
        const sent =
            typeof navigator.sendBeacon === 'function' &&
            navigator.sendBeacon(
                STEP_ENDPOINT,
                new Blob([body], { type: 'application/json' })
            )
        if (!sent) {
            void fetch(STEP_ENDPOINT, {
                method: 'POST',
                body,
                keepalive: true,
                headers: { 'Content-Type': 'application/json' },
            }).catch(() => {})
        }
    } catch {
        // Logging an answer must never get in the form's way.
    }
}
