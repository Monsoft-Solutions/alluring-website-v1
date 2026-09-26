'use client'

/**
 * ConsultChat — the consultation request written as a text thread.
 *
 * Built for Melissa's bio-link page and shared from there (#274): the
 * coordinator asks one question at a time and the first two answers are a
 * single tap. A tap is a cheaper first yes than a name, and by the time the
 * thread asks for a phone number the visitor has already answered twice.
 *
 * Three steps: the procedure (answered with a useful reply, a price where
 * one is settled), the timeline, then the name and mobile number together so
 * one autofill pick fills both. The practice always answers by text, so the
 * thread never asks how to reach the visitor.
 *
 * Answers are kept in `sessionStorage` for the tab — never the phone number
 * — so a visitor who checks the gallery and comes back picks up where they
 * left off.
 *
 * Links elsewhere on the page can answer for the visitor: a procedure chip
 * (`data-consult-procedure`) answers the first question, and a financing CTA
 * (`data-consult-financing="yes"`, the ads landing page, #290) saves the lead
 * with `financing_interest = yes` and tells the coordinator in the note.
 *
 * The state and the send live in `useConsultFlow`, which the tap card
 * (`ConsultCard`) shares; this component only draws the thread. The ads
 * landing page (#292) draws it quieter — `header="steps"`, no greeting,
 * `history="compact"`, no typing pause, consent by tapping the button — and
 * every one of those props defaults to the thread the other pages show.
 *
 * Styling is the page's job. Every class is `<prefix>-<name>`: Melissa's page
 * keeps its own `mj-*` sheet, and site pages use `consult-chat.css` (`cc-*`).
 */

import type { ReactNode } from 'react'

import type { ConsultChatCopy } from './consult-chat.types'
import { fill, labelOf } from './consult-chat.util'
import {
    ConsultContactFields,
    ConsultHoneypot,
    classNamer,
    LockIcon,
} from './consult-flow-parts.component'
import {
    FLOW_LAST_STEP,
    FLOW_TOTAL_STEPS,
    type FlowStep,
} from './consult-flow.logic'
import { ConsultStepsHeader } from './consult-steps-header.component'
import {
    type ConsultFlowOptions,
    useConsultFlow,
} from './use-consult-flow.hook'

export interface ConsultChatProps extends ConsultFlowOptions {
    /** Avatar in the thread header: a photo or a monogram. */
    readonly avatar: ReactNode
    /** Extra coordinator bubbles between the greeting and the first question. */
    readonly intro?: ReactNode
    /** Pre-selects a procedure chip (still one tap to confirm). */
    readonly defaultProcedure?: string
    /** Class prefix for every element (`mj` on Melissa's page, `cc` on site pages). */
    readonly classPrefix?: string
    /**
     * `chat` (the default): a messaging-app header, the coordinator's name,
     * an online dot and a progress bar. `steps`: the form header, a title,
     * the time it takes and the three steps by name (#292).
     */
    readonly header?: 'chat' | 'steps'
    /** Open with the greeting bubble. On by default. */
    readonly greeting?: boolean
    /**
     * `full` (the default): every question and answer stays in the thread.
     * `compact`: only the current question, with earlier answers collapsed
     * into one line and a Change that goes back to the first step.
     */
    readonly history?: 'full' | 'compact'
    /** See `ConsultContactFields`. */
    readonly nameField?: 'full' | 'first'
}

export function ConsultChat({
    avatar,
    intro,
    defaultProcedure = '',
    classPrefix = 'cc',
    header = 'chat',
    greeting = true,
    history = 'full',
    nameField = 'full',
    ...options
}: ConsultChatProps) {
    const { copy } = options
    const c = classNamer(classPrefix)
    const { formRef, composerRef, phoneRef, sendRef, honeypotRef, ...flow } =
        useConsultFlow(options)
    const { step, answers, typing, qId, titleId } = flow
    const compact = history === 'compact'

    const showQuestion = (index: FlowStep) =>
        step > index || (step === index && !typing)
    const selectedProcedure = answers.procedure || defaultProcedure
    const reply = compact ? null : procedureReply(copy, answers.procedure)
    const questions = [copy.qProcedure, copy.qTimeline, copy.qContact] as const
    const given = [
        answers.procedure && labelOf(copy.procedures, answers.procedure),
        answers.timeline && labelOf(copy.timelines, answers.timeline),
    ].filter(Boolean)

    // Melissa's sheet names the coordinator's bubbles after her.
    const theirs = `${c('bubble')} ${c(classPrefix === 'mj' ? 'bubble--melissa' : 'bubble--them')}`

    return (
        <section
            ref={formRef}
            id={options.id}
            className={`${c('chat')}${header === 'steps' ? ` ${c('chat--form')}` : ''}`}
            aria-labelledby={titleId}
            // Google Translate rewrites text nodes in place, which breaks a
            // thread React keeps re-rendering. The copy is translated here.
            translate='no'
        >
            {header === 'steps' ? (
                <ConsultStepsHeader
                    prefix={classPrefix}
                    titleId={titleId}
                    copy={copy}
                    step={step}
                />
            ) : (
                <>
                    <header className={c('chat__head')}>
                        <span className={c('chat__avatar')}>{avatar}</span>
                        <span className={c('chat__who')}>
                            <h2 id={titleId} className={c('chat__title')}>
                                {copy.title}
                            </h2>
                            <span className={c('chat__status')}>
                                <span className={c('dot')} aria-hidden='true' />
                                {copy.status}
                            </span>
                        </span>
                        <span className={c('chat__step')} aria-hidden='true'>
                            {fill(copy.stepLabel, { n: String(step + 1) })}
                        </span>
                    </header>

                    <div className={c('chat__progress')} aria-hidden='true'>
                        <span
                            style={{
                                width: `${((step + (typing ? 0 : 1)) / FLOW_TOTAL_STEPS) * 100}%`,
                            }}
                        />
                    </div>
                </>
            )}

            {compact ? (
                <ol className={`${c('thread')} ${c('thread--compact')}`}>
                    {step > 0 && given.length > 0 && (
                        <YouBubble
                            c={c}
                            changeLabel={copy.change}
                            onChange={() => flow.change(0)}
                        >
                            {given.join(' · ')}
                        </YouBubble>
                    )}
                    <li className={theirs} aria-live='polite'>
                        <p id={qId(step)}>{questions[step]}</p>
                    </li>
                </ol>
            ) : (
                <ol className={c('thread')} aria-live='polite'>
                    {greeting && (
                        <li className={theirs}>
                            <p>{copy.greeting}</p>
                        </li>
                    )}
                    {intro}
                    <li className={theirs}>
                        <p id={qId(0)}>{copy.qProcedure}</p>
                    </li>

                    {step > 0 && answers.procedure && (
                        <YouBubble
                            c={c}
                            changeLabel={copy.change}
                            onChange={() => flow.change(0)}
                        >
                            {labelOf(copy.procedures, answers.procedure)}
                        </YouBubble>
                    )}
                    {step >= 1 && showQuestion(1) && (
                        <>
                            {reply && (
                                <li className={theirs}>
                                    <p>{reply}</p>
                                </li>
                            )}
                            <li className={theirs}>
                                <p id={qId(1)}>{copy.qTimeline}</p>
                            </li>
                        </>
                    )}

                    {step > 1 && answers.timeline && (
                        <YouBubble
                            c={c}
                            changeLabel={copy.change}
                            onChange={() => flow.change(1)}
                        >
                            {labelOf(copy.timelines, answers.timeline)}
                        </YouBubble>
                    )}
                    {step >= 2 && showQuestion(2) && (
                        <li className={theirs}>
                            <p id={qId(2)}>{copy.qContact}</p>
                        </li>
                    )}

                    {typing && (
                        <li className={`${theirs} ${c('bubble--typing')}`}>
                            <span className={c('sr')}>{copy.typing}</span>
                            <span className={c('typing')} aria-hidden='true'>
                                <i />
                                <i />
                                <i />
                            </span>
                        </li>
                    )}
                </ol>
            )}

            <form
                className={c('composer')}
                noValidate
                aria-labelledby={qId(step)}
                onSubmit={flow.onSubmit}
            >
                <ConsultHoneypot
                    c={c}
                    fieldId={flow.fieldId}
                    inputRef={honeypotRef}
                />

                <div
                    ref={composerRef}
                    className={`${c('composer__body')}${typing ? ' is-waiting' : ''}`}
                    inert={typing}
                >
                    {step === 0 && (
                        <Chips
                            c={c}
                            labelledBy={qId(0)}
                            options={copy.procedures}
                            selected={selectedProcedure}
                            onPick={(procedure) =>
                                flow.answer(0, { procedure })
                            }
                        />
                    )}

                    {step === 1 && (
                        <Chips
                            c={c}
                            labelledBy={qId(1)}
                            options={copy.timelines}
                            selected={answers.timeline}
                            onPick={(timeline) => flow.answer(1, { timeline })}
                        />
                    )}

                    {step === FLOW_LAST_STEP && (
                        <ConsultContactFields
                            c={c}
                            flow={flow}
                            phoneRef={phoneRef}
                            sendRef={sendRef}
                            copy={copy}
                            nameField={nameField}
                        />
                    )}
                </div>
            </form>

            <p className={c('chat__reassure')}>
                <LockIcon />
                {copy.reassure}
            </p>
        </section>
    )
}

/** The coordinator's answer to the procedure tap, or null when there is none. */
function procedureReply(
    copy: ConsultChatCopy,
    procedure: string
): string | null {
    const reply = copy.procedureReply
    if (!reply || !procedure) return null
    const special = reply.byProcedure?.[procedure]
    if (special) return special
    const price = reply.prices[procedure]
    return price
        ? fill(reply.priced, {
              procedure: labelOf(copy.procedures, procedure),
              price,
          })
        : reply.standard
}

type ClassName = (name: string) => string

function YouBubble({
    c,
    children,
    onChange,
    changeLabel,
}: {
    readonly c: ClassName
    readonly children: ReactNode
    readonly onChange: () => void
    readonly changeLabel: string
}) {
    return (
        <li className={`${c('bubble')} ${c('bubble--you')}`}>
            <p>{children}</p>
            <button
                type='button'
                className={c('bubble__change')}
                onClick={onChange}
            >
                {changeLabel}
            </button>
        </li>
    )
}

function Chips({
    c,
    labelledBy,
    options,
    selected,
    onPick,
}: {
    readonly c: ClassName
    readonly labelledBy: string
    readonly options: ConsultChatCopy['procedures']
    readonly selected: string
    readonly onPick: (value: string) => void
}) {
    return (
        <div className={c('chips')} role='group' aria-labelledby={labelledBy}>
            {options.map((option) => (
                <button
                    key={option.value}
                    type='button'
                    className={c('chip')}
                    aria-pressed={selected === option.value}
                    onClick={() => onPick(option.value)}
                >
                    {option.label}
                </button>
            ))}
        </div>
    )
}
