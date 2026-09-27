'use client'

/**
 * The landing page's consultation form, in either of the two test arms
 * (#292): the quiet thread (`ConsultChat`, arm `thread`) or the tap card
 * (`ConsultCard`, arm `card`). Both run the same flow with the same copy,
 * send and tracking; only the drawing differs, so the test measures the form
 * and nothing else.
 *
 * The thread is the site's own, made quiet: the form header instead of the
 * chat header, no greeting, no typing pause, earlier answers on one line,
 * and consent by tapping the button.
 *
 * It submits like the v5 thread did: source `landing-page`, the lead's
 * campaign identifiers, and a full page load to the ad funnel's own
 * thank-you page (whose page view is what the Google Ads conversion fires
 * on), now with `&fv=` for the arm. It still pushes `lp_step` and
 * `lp_lead_attempt` with the page version and ad group, and each lead
 * records the page version, the arm and the consent wording. The page
 * version names the last step's wording arm too (#302): `v6` or `v6r`.
 */

import type { ConsultChatLang } from '@/components/shared/consult-chat/consult-chat.types'
import { ConsultCard } from '@/components/shared/consult-chat/consult-card.component'
import { ConsultChat } from '@/components/shared/consult-chat/consult-chat.component'
import type {
    ConsultFlowAnswer,
    ConsultFlowOptions,
} from '@/components/shared/consult-chat/use-consult-flow.hook'
import { CONTACT_SOURCES } from '@/lib/types/forms/contact-form.type'

import { type LpChat, LP_CONSENT_VERSION } from './lp-chat-copy'
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
        consent: { method: 'tap', version: LP_CONSENT_VERSION },
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
