'use client'

/**
 * ConsultCard — the consultation request as a tap card (#292).
 *
 * The same three steps, copy, send and tracking as the thread
 * (`ConsultChat`), on the same hook (`useConsultFlow`); only the body is
 * drawn differently. The question sits in large type and the answers are
 * tiles: two columns of procedures, then four full-width timeline rows. The
 * card stays where it is while the question changes, and the answers
 * collapse into one pill with Change above the next question.
 *
 * Built to run against the thread as a 50/50 test in the ads landing page's
 * hero, and to move lower on a page later without new work: the hook keeps
 * one store per form id, so a second view of the same form shows the same
 * progress.
 *
 * Its own elements are `ck-*` (`consult-card.css`). The header and the last
 * step are the thread's own components and keep their `cc-*` classes, so
 * both forms' last steps look and behave the same.
 */

import type { ConsultChatOption } from './consult-chat.types'
import { labelOf } from './consult-chat.util'
import {
    ConsultContactFields,
    ConsultHoneypot,
    classNamer,
    LockIcon,
} from './consult-flow-parts.component'
import { FLOW_LAST_STEP } from './consult-flow.logic'
import { ConsultStepsHeader } from './consult-steps-header.component'
import {
    type ConsultFlowOptions,
    useConsultFlow,
} from './use-consult-flow.hook'

import './consult-chat.css'
import './consult-card.css'

export interface ConsultCardProps extends ConsultFlowOptions {
    /** Pre-selects a procedure tile (still one tap to confirm). */
    readonly defaultProcedure?: string
    /** See `ConsultContactFields`. */
    readonly nameField?: 'full' | 'first'
}

const cc = classNamer('cc')

export function ConsultCard({
    defaultProcedure = '',
    nameField = 'full',
    ...options
}: ConsultCardProps) {
    const { copy } = options
    const { formRef, composerRef, phoneRef, sendRef, honeypotRef, ...flow } =
        useConsultFlow({ ...options, typingMs: 0 })
    const { step, answers, qId, titleId } = flow

    const questions = [copy.qProcedure, copy.qTimeline, copy.qContact] as const
    const given = [
        answers.procedure && labelOf(copy.procedures, answers.procedure),
        answers.timeline && labelOf(copy.timelines, answers.timeline),
    ].filter(Boolean)

    return (
        <section
            ref={formRef}
            id={options.id}
            className='ck-card'
            aria-labelledby={titleId}
            // Google Translate rewrites text nodes in place, which breaks a
            // form React keeps re-rendering. The copy is translated here.
            translate='no'
        >
            <ConsultStepsHeader
                prefix='cc'
                titleId={titleId}
                copy={copy}
                step={step}
            />

            <form
                className='ck-body'
                noValidate
                aria-labelledby={qId(step)}
                onSubmit={flow.onSubmit}
            >
                <ConsultHoneypot
                    c={cc}
                    fieldId={flow.fieldId}
                    inputRef={honeypotRef}
                />

                {step > 0 && given.length > 0 && (
                    <p className='ck-answer'>
                        <span>{given.join(' · ')}</span>
                        <button
                            type='button'
                            className='ck-answer__change'
                            onClick={() => flow.change(0)}
                        >
                            {copy.change}
                        </button>
                    </p>
                )}

                {/* Keyed by step: each question slides in fresh. */}
                <div ref={composerRef} className='ck-step' key={step}>
                    <p
                        className='ck-question'
                        id={qId(step)}
                        aria-live='polite'
                    >
                        {questions[step]}
                    </p>

                    {step === 0 && (
                        <Tiles
                            labelledBy={qId(0)}
                            options={copy.procedures}
                            selected={answers.procedure || defaultProcedure}
                            onPick={(procedure) =>
                                flow.answer(0, { procedure })
                            }
                        />
                    )}

                    {step === 1 && (
                        <div
                            className='ck-options'
                            role='group'
                            aria-labelledby={qId(1)}
                        >
                            {copy.timelines.map((option) => (
                                <button
                                    key={option.value}
                                    type='button'
                                    className='ck-option'
                                    aria-pressed={
                                        answers.timeline === option.value
                                    }
                                    onClick={() =>
                                        flow.answer(1, {
                                            timeline: option.value,
                                        })
                                    }
                                >
                                    <i aria-hidden='true' />
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {step === FLOW_LAST_STEP && (
                        <ConsultContactFields
                            c={cc}
                            flow={flow}
                            phoneRef={phoneRef}
                            sendRef={sendRef}
                            copy={copy}
                            nameField={nameField}
                        />
                    )}
                </div>
            </form>

            <p className='ck-reassure'>
                <LockIcon />
                {copy.reassure}
            </p>
        </section>
    )
}

/** Two columns of procedures; "Something else" closes them, full width. */
function Tiles({
    labelledBy,
    options,
    selected,
    onPick,
}: {
    readonly labelledBy: string
    readonly options: readonly ConsultChatOption[]
    readonly selected: string
    readonly onPick: (value: string) => void
}) {
    // Full width only when it would otherwise leave a tile alone on a row.
    const paired =
        options.filter((option) => option.value !== 'other').length % 2 === 0
    return (
        <div className='ck-tiles' role='group' aria-labelledby={labelledBy}>
            {options.map((option) => (
                <button
                    key={option.value}
                    type='button'
                    className={
                        option.value === 'other' && paired
                            ? 'ck-tile ck-tile--wide'
                            : 'ck-tile'
                    }
                    aria-pressed={selected === option.value}
                    onClick={() => onPick(option.value)}
                >
                    {option.label}
                </button>
            ))}
        </div>
    )
}
