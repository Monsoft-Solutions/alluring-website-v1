'use client'

/**
 * The consultation request on Dr. Karlinsky's page: the site's one-screen
 * form (`ConsultFields`, #307) — procedure, first name, mobile number, the
 * consent box and one button — with her lead identity.
 *
 * It runs on `useConsultFlow`, so validation (US mobile numbers), consent,
 * the funnel events and the full-page redirect to the thank-you page are the
 * shared ones. What this file adds: the source and tags every lead carries
 * (`dr-karlinsky-ig`, `drk-ig-v2-<arm>`, `form`), the `drk_*` dataLayer
 * names, the line under the procedure list (no prices: her price is
 * personal, and financing is the point), and, in the hero test's `pick`
 * arm, the procedures as tiles.
 *
 * No procedure is preselected: her followers come for many reasons.
 */

import { ConsultFields } from '@/components/shared/consult-chat/consult-fields.component'
import type {
    ConsultChatCopy,
    ConsultChatLang,
    ConsultChatStaffLabels,
} from '@/components/shared/consult-chat/consult-chat.types'

import {
    DRK_EVENTS,
    DRK_FORM_ID,
    DRK_FORM_NAME,
    DRK_FORM_VARIANT,
    DRK_LEAD_STORAGE_KEY,
    DRK_PAGE_PATH,
    DRK_SOURCE,
    DRK_THANK_YOU_PATH,
    drkPageVariant,
} from './drk-config'
import type { DrkHeroArm } from './drk-hero-variant'

import '@/components/shared/consult-chat/consult-chat.css'

interface DrkFormProps {
    readonly lang: ConsultChatLang
    readonly copy: ConsultChatCopy
    readonly staff: ConsultChatStaffLabels
    /** Under the procedure list, whatever is chosen. */
    readonly hint: string
    /** The `pick` arm: under the tiles until one is chosen. */
    readonly tilesNote: string
    readonly heroArm: DrkHeroArm
}

export function DrkForm({
    lang,
    copy,
    staff,
    hint,
    tilesNote,
    heroArm,
}: DrkFormProps) {
    const pageVariant = drkPageVariant(heroArm)
    const noteLines = [
        `Page: ${DRK_PAGE_PATH} (Dr. Karlinsky's Instagram bio link)`,
        `Landing page: ${pageVariant}`,
    ]

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
            noteLines={noteLines}
            dataLayerEvents={{
                step: DRK_EVENTS.step,
                attempt: DRK_EVENTS.attempt,
            }}
            dataLayerContext={{
                pageVariant,
                heroArm,
                formVariant: DRK_FORM_VARIANT,
            }}
            analyticsParams={{
                form_variant: DRK_FORM_VARIANT,
                page_variant: pageVariant,
                hero_arm: heroArm,
            }}
            startOn='first-answer'
            entryName='hero'
            leadVariants={{ page: pageVariant, form: DRK_FORM_VARIANT }}
            keepSendAboveKeyboard
            nameField='first'
            procedureHint={() => hint}
            // The `pick` arm asks for the procedure with tiles, and opens the
            // rest once one is chosen (drk-hero-variant.ts).
            procedureInput={heroArm === 'pick' ? 'tiles' : 'select'}
            tilesNote={heroArm === 'pick' ? tilesNote : undefined}
        />
    )
}
