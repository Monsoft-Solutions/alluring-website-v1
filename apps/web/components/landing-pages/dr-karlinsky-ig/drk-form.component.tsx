'use client'

/**
 * The consultation request on Dr. Karlinsky's page: the site's one-screen
 * form (`ConsultFields`, #307) — procedure, first name, mobile number, the
 * consent box and one button — with her lead identity.
 *
 * It runs on `useConsultFlow`, so validation (US mobile numbers), consent,
 * the funnel events and the full-page redirect to the thank-you page are the
 * shared ones. What this file adds: the source and tags every lead carries
 * (`dr-karlinsky-ig`, `drk-ig-v1`, `form`), the `drk_*` dataLayer names, and
 * the starting-price hint under the procedure list.
 *
 * No procedure is preselected: her followers come for many reasons.
 */

import { ConsultFields } from '@/components/shared/consult-chat/consult-fields.component'
import type {
    ConsultChatCopy,
    ConsultChatLang,
    ConsultChatStaffLabels,
} from '@/components/shared/consult-chat/consult-chat.types'
import { labelOf } from '@/components/shared/consult-chat/consult-chat.util'

import {
    DRK_EVENTS,
    DRK_FORM_ID,
    DRK_FORM_NAME,
    DRK_FORM_VARIANT,
    DRK_LEAD_STORAGE_KEY,
    DRK_PAGE_PATH,
    DRK_PAGE_VARIANT,
    DRK_SOURCE,
    DRK_THANK_YOU_PATH,
    fill,
} from './drk-config'
import { drkPriceFor } from './drk-prices'

import '@/components/shared/consult-chat/consult-chat.css'

interface DrkFormProps {
    readonly lang: ConsultChatLang
    readonly copy: ConsultChatCopy
    readonly staff: ConsultChatStaffLabels
    readonly priceHint: {
        readonly priced: string
        readonly unpriced: string
    }
}

const NOTE_LINES = [
    `Page: ${DRK_PAGE_PATH} (Dr. Karlinsky's Instagram bio link)`,
    `Landing page: ${DRK_PAGE_VARIANT}`,
] as const

export function DrkForm({ lang, copy, staff, priceHint }: DrkFormProps) {
    const hint = (procedure: string) => {
        const price = drkPriceFor(procedure)
        if (!price) return priceHint.unpriced
        return fill(priceHint.priced, {
            procedure: labelOf(copy.procedures, procedure),
            price: price.from,
        })
    }

    return (
        <ConsultFields
            id={DRK_FORM_ID}
            lang={lang}
            copy={copy}
            staff={staff}
            source={DRK_SOURCE}
            formName={DRK_FORM_NAME}
            // The form adds `hl` from the language at the moment of success.
            thankYouPath={DRK_THANK_YOU_PATH}
            leadStorageKey={DRK_LEAD_STORAGE_KEY}
            subject={(procedure) =>
                `Dr. Karlinsky Instagram lead: ${procedure}`
            }
            noteLines={NOTE_LINES}
            dataLayerEvents={{
                step: DRK_EVENTS.step,
                attempt: DRK_EVENTS.attempt,
            }}
            dataLayerContext={{
                pageVariant: DRK_PAGE_VARIANT,
                formVariant: DRK_FORM_VARIANT,
            }}
            analyticsParams={{
                form_variant: DRK_FORM_VARIANT,
                page_variant: DRK_PAGE_VARIANT,
            }}
            startOn='first-answer'
            entryName='hero'
            leadVariants={{ page: DRK_PAGE_VARIANT, form: DRK_FORM_VARIANT }}
            keepSendAboveKeyboard
            nameField='first'
            procedureHint={hint}
        />
    )
}
