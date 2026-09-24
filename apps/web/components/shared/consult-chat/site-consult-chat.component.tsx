'use client'

/**
 * The consultation thread on site pages: the team persona, the `cc-*` site
 * styling, and the visitor's language.
 *
 * Site pages are English and translated by Google Translate. The thread is
 * marked `translate="no"` (Translate rewrites text nodes that React keeps
 * re-rendering), so it switches its own copy instead: it follows the
 * `googtrans` cookie and `<html lang>`, which Translate updates.
 */

import type { ReactNode } from 'react'

import type { ContactSource } from '@/lib/types/forms/contact-form.type'

import { ConsultChat } from './consult-chat.component'
import type {
    ConsultChatCopy,
    ConsultChatLang,
    ConsultChatStaffLabels,
} from './consult-chat.types'

import { usePageLanguage } from './use-page-language.hook'

import './consult-chat.css'

export interface SiteConsultChatProps {
    readonly id: string
    readonly copy: Readonly<Record<ConsultChatLang, ConsultChatCopy>>
    readonly staff: ConsultChatStaffLabels
    readonly source: ContactSource
    readonly formName: string
    readonly thankYouPath: string
    readonly leadStorageKey: string
    /** Staff subject line prefix, e.g. "Specials lead". */
    readonly subjectPrefix: string
    readonly noteLines: readonly string[]
    /** Title of the promotion shown with the thread, stored on the lead. */
    readonly offer?: string
    /** Extra bubble(s) between the greeting and the first question. */
    readonly intro?: Readonly<Partial<Record<ConsultChatLang, ReactNode>>>
    readonly defaultProcedure?: string
}

export function SiteConsultChat({
    id,
    copy,
    staff,
    source,
    formName,
    thankYouPath,
    leadStorageKey,
    subjectPrefix,
    noteLines,
    offer,
    intro,
    defaultProcedure,
}: SiteConsultChatProps) {
    const lang = usePageLanguage()

    return (
        <ConsultChat
            id={id}
            lang={lang}
            copy={copy[lang]}
            staff={staff}
            avatar={<span className='cc-monogram'>A</span>}
            source={source}
            formName={formName}
            thankYouPath={thankYouPath}
            leadStorageKey={leadStorageKey}
            subject={(procedure) => `${subjectPrefix}: ${procedure}`}
            noteLines={noteLines}
            offer={offer}
            intro={intro?.[lang] ?? intro?.en}
            defaultProcedure={defaultProcedure}
        />
    )
}
