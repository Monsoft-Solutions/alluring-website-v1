'use client'

/**
 * The landing page's consultation form, in any of the test's arms: one
 * screen with every field (`ConsultFields`, arm `form`, #307), the stepped
 * tap card (`ConsultCard`, arm `card`) or the quiet thread (`ConsultChat`,
 * arm `thread`, closed since #307). All run the same flow with the same copy,
 * send and tracking; only the drawing differs, so the test measures the form
 * and nothing else.
 *
 * Consent is the site-wide checkbox in every arm (#307). v6 had made tapping
 * the button the consent, and sends fell anyway, so the box stays and the
 * two arms differ only in steps vs one screen.
 *
 * It submits like the v5 thread did: source `landing-page`, the lead's
 * campaign identifiers, and a full page load to the ad funnel's own
 * thank-you page (whose page view is what the Google Ads conversion fires
 * on), now with `&fv=` for the arm. It still pushes `lp_step` and
 * `lp_lead_attempt` with the page version and ad group, and each lead
 * records the page version, the arm and how it consented. The page
 * version names the last step's wording arm too (#302): `v6` or `v6r`.
 */

import type { ConsultChatLang } from '@/components/shared/consult-chat/consult-chat.types'
import { ConsultCard } from '@/components/shared/consult-chat/consult-card.component'
import { ConsultChat } from '@/components/shared/consult-chat/consult-chat.component'
import { ConsultFields } from '@/components/shared/consult-chat/consult-fields.component'
import type {
    ConsultFlowAnswer,
    ConsultFlowOptions,
} from '@/components/shared/consult-chat/use-consult-flow.hook'
import { CONTACT_SOURCES } from '@/lib/types/forms/contact-form.type'

import type { LpChat } from './lp-chat-copy'
import { LP_CHAT_ID, LP_LEAD_KEY, LP_THANK_YOU_PATH } from './lp-config'
import type { LpCopyVariant, LpFormVariant } from './lp-form-variant'
import { lpPageVariant, lpPageVersion } from './lp-tracking'
import { type AdVariant, VARIANT_PROCEDURE } from './lp-variants'

import '@/components/shared/consult-chat/consult-chat.css'

interface LpConsultFormProps {
    readonly lang: ConsultChatLang
    readonly adVariant: AdVariant
    readonly formVariant: LpFormVariant
    /**
     * The last step's wording arm (#302). Its words are already in `chat`;
     * here it names the page variant the lead, the events and the thank-you
     * URL carry (`v6` / `v6r`).
     */
    readonly copyVariant: LpCopyVariant
    readonly chat: LpChat
    /** Every answer, for the page's own log of chip picks. */
    readonly onAnswer?: (answer: ConsultFlowAnswer) => void
}

export function LpConsultForm({
    lang,
    adVariant,
    formVariant,
    copyVariant,
    chat,
    onAnswer,
}: LpConsultFormProps) {
    const pageVariant = lpPageVariant(copyVariant)
    const flow: ConsultFlowOptions = {
        id: LP_CHAT_ID,
        lang,
        copy: chat.copy[lang],
        staff: chat.staff,
        source: CONTACT_SOURCES.LANDING_PAGE,
        formName: 'ads_lp_consultation',
        // The form adds `hl` from the language at the moment of success.
        thankYouPath: `${LP_THANK_YOU_PATH}?p=${adVariant}&pv=${lpPageVersion(copyVariant)}&fv=${formVariant}`,
        leadStorageKey: LP_LEAD_KEY,
        subject: (procedure) => `Consultation Request: ${procedure}`,
        noteLines: [
            'Page: /lp/request-consultation (paid landing page)',
            `Ad group: ${adVariant}`,
            `Landing page: ${pageVariant}`,
        ],
        dataLayerEvents: { step: 'lp_step', attempt: 'lp_lead_attempt' },
        dataLayerContext: {
            pageVariant,
            adVariant,
            formVariant,
        },
        typingMs: 0,
        analyticsParams: {
            form_variant: formVariant,
            page_variant: pageVariant,
        },
        startOn: 'first-answer',
        entryName: 'hero',
        leadVariants: { page: pageVariant, form: formVariant },
        keepSendAboveKeyboard: true,
        onAnswer,
    }
    const defaultProcedure = VARIANT_PROCEDURE[adVariant]

    if (formVariant === 'form') {
        return (
            <ConsultFields
                {...flow}
                defaultProcedure={defaultProcedure}
                nameField='first'
            />
        )
    }

    return formVariant === 'card' ? (
        <ConsultCard
            {...flow}
            defaultProcedure={defaultProcedure}
            nameField='first'
        />
    ) : (
        <ConsultChat
            {...flow}
            avatar={null}
            header='steps'
            greeting={false}
            history='compact'
            defaultProcedure={defaultProcedure}
            nameField='first'
        />
    )
}
