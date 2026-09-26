/**
 * The consultation flow's rules, with no React and no browser in them, so the
 * thread (`ConsultChat`) and the tap card (`ConsultCard`) follow exactly the
 * same steps and the rules can be tested on their own.
 *
 * Three steps: the procedure, the timeline, then the name and the mobile
 * number together. The first two are a tap each.
 */

import type { ConsultChatCopy } from './consult-chat.types'
import type { SavedThread } from './consult-chat.util'

export type FlowStep = 0 | 1 | 2

export const FLOW_STEP_NAMES = ['procedure', 'timeline', 'contact'] as const
export type FlowStepName = (typeof FLOW_STEP_NAMES)[number]

export const FLOW_TOTAL_STEPS = FLOW_STEP_NAMES.length
export const FLOW_LAST_STEP: FlowStep = 2

export interface FlowAnswers {
    readonly procedure: string
    readonly timeline: string
}

/** Everything the visitor has told the form, and where they are in it. */
export interface FlowThread {
    readonly step: FlowStep
    readonly answers: FlowAnswers
    readonly name: string
    /** The visitor asked about financing through a CTA on the page. */
    readonly financing: boolean
}

export const EMPTY_THREAD: FlowThread = {
    step: 0,
    answers: { procedure: '', timeline: '' },
    name: '',
    financing: false,
}

/** The first step after `from` still missing an answer. */
export function nextOpenStep(from: number, answers: FlowAnswers): FlowStep {
    const done = [Boolean(answers.procedure), Boolean(answers.timeline)]
    for (let index = from + 1; index < FLOW_LAST_STEP; index++) {
        if (!done[index]) return index as FlowStep
    }
    return FLOW_LAST_STEP
}

/** A saved thread, with answers the current options no longer offer dropped. */
export function restoreThread(
    saved: SavedThread | null,
    copy: Pick<ConsultChatCopy, 'procedures' | 'timelines'>
): FlowThread | null {
    if (!saved) return null
    const offered = (options: ConsultChatCopy['procedures'], value: string) =>
        options.some((option) => option.value === value) ? value : ''
    const answers = {
        procedure: offered(copy.procedures, saved.procedure),
        timeline: offered(copy.timelines, saved.timeline),
    }
    const financing = saved.financing === true
    if (!answers.procedure && !answers.timeline && !saved.name && !financing) {
        return null
    }
    return {
        step: nextOpenStep(-1, answers),
        answers,
        name: saved.name,
        financing,
    }
}

/** The thread after answering step `from`, moved to the next open step. */
export function answerStep(
    thread: FlowThread,
    from: FlowStep,
    patch: Partial<FlowAnswers>
): FlowThread {
    const answers = { ...thread.answers, ...patch }
    return { ...thread, answers, step: nextOpenStep(from, answers) }
}

/** Steps answered so far, for sticky bars: 0 up to `FLOW_TOTAL_STEPS - 1`. */
export function answeredCount(answers: FlowAnswers): number {
    return [answers.procedure, answers.timeline].filter(Boolean).length
}

/**
 * How a lead gave its consent to be texted, stored with the lead
 * (`consent_method`, `consent_version`) so each record says which wording
 * it agreed to.
 *
 * - `checkbox`: the site-wide wording beside a box the visitor ticks.
 * - `tap`: a line above the button that names it; sending is the consent.
 *   `version` names the wording, and changes whenever the wording does.
 */
export type ConsultConsent =
    | { readonly method: 'checkbox' }
    | { readonly method: 'tap'; readonly version: string }

export const CHECKBOX_CONSENT: ConsultConsent = { method: 'checkbox' }
