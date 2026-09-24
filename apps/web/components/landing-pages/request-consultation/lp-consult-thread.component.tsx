'use client'

/**
 * The landing page's consultation request: the site's text thread
 * (`ConsultChat`), in the hero, in place of the five-field form (#283).
 *
 * The first two answers are a tap each, so the visitor's first action costs
 * no typing, and the ad group's procedure is already selected. Only the last
 * step asks for a name and a mobile number, and the practice always answers
 * by text.
 *
 * It submits like the form did: source `landing-page`, the lead's campaign
 * identifiers, and a full page load to the ad funnel's own thank-you page,
 * whose page view is what the Google Ads conversion fires on. It still pushes
 * `lp_lead_attempt` with the page version and ad group, and adds `lp_step`
 * for each answered step.
 */

import type { ConsultChatLang } from '@/components/shared/consult-chat/consult-chat.types'
import { ConsultChat } from '@/components/shared/consult-chat/consult-chat.component'
import { CONTACT_SOURCES } from '@/lib/types/forms/contact-form.type'

import { LP_CHAT_ID, LP_LEAD_KEY, LP_THANK_YOU_PATH } from './lp-config'
import type { LpChat } from './lp-chat-copy'
import { LP_PAGE_VARIANT, LP_PAGE_VERSION } from './lp-tracking'
import { type AdVariant, VARIANT_PROCEDURE } from './lp-variants'

import '@/components/shared/consult-chat/consult-chat.css'

interface LpConsultThreadProps {
    readonly lang: ConsultChatLang
    readonly adVariant: AdVariant
    readonly chat: LpChat
}

export function LpConsultThread({
    lang,
    adVariant,
    chat,
}: LpConsultThreadProps) {
    return (
        <ConsultChat
            id={LP_CHAT_ID}
            lang={lang}
            copy={chat.copy[lang]}
            staff={chat.staff}
            avatar={<span className='cc-monogram'>A</span>}
            source={CONTACT_SOURCES.LANDING_PAGE}
            formName='ads_lp_consultation'
            // The thread adds `hl` from the language at the moment of success.
            thankYouPath={`${LP_THANK_YOU_PATH}?p=${adVariant}&pv=${LP_PAGE_VERSION}`}
            leadStorageKey={LP_LEAD_KEY}
            subject={(procedure) => `Consultation Request: ${procedure}`}
            noteLines={[
                'Page: /lp/request-consultation (paid landing page)',
                `Ad group: ${adVariant}`,
                `Landing page: ${LP_PAGE_VARIANT}`,
            ]}
            defaultProcedure={VARIANT_PROCEDURE[adVariant]}
            dataLayerEvents={{ step: 'lp_step', attempt: 'lp_lead_attempt' }}
            dataLayerContext={{ pageVariant: LP_PAGE_VARIANT, adVariant }}
        />
    )
}
