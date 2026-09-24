/**
 * Types for the chat-style consultation request (`ConsultChat`).
 *
 * The copy shape is the one Melissa's page introduced; every page that uses
 * the thread supplies a dictionary of this shape per language.
 */

import type { RichText } from '@/components/landing-pages/request-consultation/lp-copy'
import type { LeadFinancingInterest } from '@/lib/constants/lead-fields'

export type ConsultChatLang = 'en' | 'es'

export interface ConsultChatOption {
    readonly value: string
    readonly label: string
}

/**
 * The coordinator's answer to the procedure tap, sent before the next
 * question so the first tap earns something back (#274).
 */
export interface ConsultChatProcedureReply {
    /** For a procedure with a settled starting price: `{procedure}`, `{price}`. */
    readonly priced: string
    readonly standard: string
    /** Starting prices by procedure value, already formatted ("$5,500"). */
    readonly prices: Readonly<Record<string, string>>
    /** Replies for particular answers, such as "Not sure yet". */
    readonly byProcedure?: Readonly<Record<string, string>>
}

export interface ConsultChatCopy {
    /** Name in the thread header ("Message Melissa", "Alluring patient care"). */
    readonly title: string
    readonly status: string
    readonly greeting: string
    readonly qProcedure: string
    readonly procedures: readonly ConsultChatOption[]
    readonly procedureReply?: ConsultChatProcedureReply
    readonly qTimeline: string
    readonly timelines: readonly ConsultChatOption[]
    /** The last step asks for the name and the mobile number together. */
    readonly qContact: string
    readonly fieldName: string
    readonly fieldPhone: string
    readonly consent: RichText
    readonly submit: string
    readonly submitting: string
    readonly change: string
    readonly typing: string
    /** `{n}` is replaced with the step number. */
    readonly stepLabel: string
    readonly reassure: string
    readonly errors: {
        readonly name: string
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

/**
 * What the thank-you page reads back from `sessionStorage`: the first name
 * for its greeting, and the saved lead with the token that lets the page add
 * optional answers to it. Never the phone number.
 */
export interface ConsultChatLead {
    readonly firstName: string
    readonly lead?: {
        readonly id: string
        readonly token: string
    }
    /**
     * Answers the thread already has, so the thank-you page shows them as
     * given instead of asking again: a visitor who tapped "Ask about
     * financing" sees "Interested in financing?" already answered yes.
     */
    readonly answers?: {
        readonly financingInterest?: LeadFinancingInterest
    }
}

/** Dispatched on `window` whenever the thread moves, for sticky bars. */
export const CONSULT_CHAT_PROGRESS_EVENT = 'consult-chat:progress'

export interface ConsultChatProgressDetail {
    readonly id: string
    /** Steps answered so far, 0 up to `total - 1` (the last step sends). */
    readonly answered: number
    readonly total: number
}
