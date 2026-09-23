/**
 * Types for the chat-style consultation request (`ConsultChat`).
 *
 * The copy shape is the one Melissa's page introduced; every page that uses
 * the thread supplies a dictionary of this shape per language.
 */

import type { RichText } from '@/components/landing-pages/request-consultation/lp-copy'

export type ConsultChatLang = 'en' | 'es'

export interface ConsultChatOption {
    readonly value: string
    readonly label: string
}

export interface ConsultChatCopy {
    /** Name in the thread header ("Message Melissa", "Alluring patient care"). */
    readonly title: string
    readonly status: string
    readonly greeting: string
    readonly qProcedure: string
    readonly procedures: readonly ConsultChatOption[]
    readonly qTimeline: string
    readonly timelines: readonly ConsultChatOption[]
    readonly qName: string
    readonly fieldFirstName: string
    readonly fieldLastName: string
    readonly next: string
    /** `{name}` is replaced with the visitor's first name. */
    readonly qContact: string
    readonly fieldPhone: string
    readonly methodLegend: string
    readonly methods: readonly ConsultChatOption[]
    readonly consent: RichText
    readonly submit: string
    readonly submitting: string
    readonly change: string
    readonly typing: string
    /** `{n}` is replaced with the step number. */
    readonly stepLabel: string
    readonly reassure: string
    readonly errors: {
        readonly firstName: string
        readonly lastName: string
        readonly phone: string
        readonly consent: string
        readonly submit: string
    }
}

/** The English labels, because staff always read the lead in English. */
export interface ConsultChatStaffLabels {
    readonly procedures: readonly ConsultChatOption[]
    readonly timelines: readonly ConsultChatOption[]
}

export type ConsultChatMethod = 'text' | 'call'

/** What the thank-you page reads back from `sessionStorage`. */
export interface ConsultChatLead {
    readonly firstName: string
    readonly method: ConsultChatMethod
}

/** Dispatched on `window` whenever the thread moves, for sticky bars. */
export const CONSULT_CHAT_PROGRESS_EVENT = 'consult-chat:progress'

export interface ConsultChatProgressDetail {
    readonly id: string
    /** Steps answered so far, 0–4. */
    readonly answered: number
    readonly total: number
}
