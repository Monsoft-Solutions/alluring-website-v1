'use client'

/**
 * ConsultFields — the consultation request on one screen (#307): the
 * procedure, first name and mobile number together, with the consent box and
 * the send button. No timeline: the thank-you page asks it.
 *
 * It runs on the same hook as the thread and the tap card
 * (`useConsultFlow`, `layout: 'one-screen'`), so the send, validation,
 * consent, tracking and lead record are theirs. The ads landing page tests it
 * against the stepped card, to see whether paid visitors prefer steps or
 * everything at once.
 *
 * Drawn in the card's shell (`ck-*`), with the thread's fields (`cc-*`), so
 * the two arms look alike apart from the steps.
 *
 * `procedureInput: 'tiles'` (Dr. Karlinsky's page, #332) asks for the
 * procedure with big radio tiles instead of the list, and keeps the rest of
 * the form folded until one is chosen. The default, `select`, draws exactly
 * what it always has.
 */

import { type ReactNode, type Ref, useEffect, useRef } from 'react'

import {
    ConsultContactFields,
    ConsultHoneypot,
    classNamer,
    LockIcon,
} from './consult-flow-parts.component'
import type { ConsultChatOption } from './consult-chat.types'
import { prefersReducedMotion } from './consult-chat.util'
import {
    type ConsultFlowOptions,
    useConsultFlow,
} from './use-consult-flow.hook'

import './consult-chat.css'
import './consult-card.css'

export interface ConsultFieldsProps
    extends Omit<ConsultFlowOptions, 'layout' | 'presetProcedure'> {
    /** The procedure the list starts on (the ad group's). */
    readonly defaultProcedure?: string
    /** See `ConsultContactFields`. */
    readonly nameField?: 'full' | 'first'
    /**
     * A quiet line under the procedure list that follows the choice (Dr.
     * Karlinsky's page, #332: her price is personal, financing available).
     * Given the selected value, '' before one is chosen. Unset, nothing is
     * drawn. With tiles it opens with the contact fields, above them.
     */
    readonly procedureHint?: (procedure: string) => ReactNode
    /**
     * How the procedure is asked: a `select` list (the default) or `tiles`,
     * one radio tile per procedure in two columns. With tiles, the hint, the
     * contact fields, the send button and the reassurance stay folded
     * (rendered, `hidden`) until a procedure is chosen, then open in place.
     */
    readonly procedureInput?: 'select' | 'tiles'
    /** Tiles only: a quiet line under them until one is chosen. */
    readonly tilesNote?: string
}

const cc = classNamer('cc')

export function ConsultFields({
    defaultProcedure = '',
    nameField = 'full',
    procedureHint,
    procedureInput = 'select',
    tilesNote,
    ...options
}: ConsultFieldsProps) {
    const { copy } = options
    const { formRef, phoneRef, sendRef, honeypotRef, ...flow } = useConsultFlow(
        {
            ...options,
            typingMs: 0,
            layout: 'one-screen',
            presetProcedure: defaultProcedure,
        }
    )
    const { answers, fieldId, invalid, titleId } = flow
    const procedureId = fieldId('procedure')
    const procedureError = fieldId('procedure-error')
    const procedureHintId = fieldId('procedure-hint')
    const describedBy =
        [
            invalid('procedure') ? procedureError : null,
            procedureHint ? procedureHintId : null,
        ]
            .filter(Boolean)
            .join(' ') || undefined
    const tiles = procedureInput === 'tiles'
    // Open once a procedure is chosen: by a tile, preset, or by a link on
    // the page that answers for the visitor.
    const folded = tiles && !answers.procedure
    const moreRef = useRef<HTMLDivElement>(null)
    const tilesRef = useRef<HTMLFieldSetElement>(null)
    const scrollOnOpen = useRef(false)
    // Tiles report the procedure step once per form: arrow keys move the
    // checked radio, and each move would otherwise count as another step.
    const stepTracked = useRef(false)

    useEffect(() => {
        if (folded || !scrollOnOpen.current) return
        scrollOnOpen.current = false
        // Bring the fields that just opened into view, as far as the tiles
        // allow: the bottom of the block lines up with the screen's, unless
        // that would push the top of the tiles off it (a 360px phone). No
        // focus: a text field would raise the keyboard over them.
        const more = moreRef.current
        const tilesBox = tilesRef.current
        if (!more || !tilesBox) return
        // The block's own scroll-margin-bottom keeps what sits under it
        // (the reassurance line) on screen too.
        const margin =
            Number.parseFloat(getComputedStyle(more).scrollMarginBottom) || 0
        const toBottom =
            more.getBoundingClientRect().bottom + margin - window.innerHeight
        const toTiles = tilesBox.getBoundingClientRect().top - 8
        const by = Math.min(toBottom, toTiles)
        if (by <= 0) return
        window.scrollBy({
            top: by,
            behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        })
    }, [folded])

    const pickProcedure = (value: string) => {
        if (folded) scrollOnOpen.current = true
        const track = !stepTracked.current
        stepTracked.current = true
        flow.answer(0, { procedure: value }, undefined, track)
    }

    const hint = procedureHint && (
        <p
            className='ck-procedure__hint'
            id={procedureHintId}
            aria-live='polite'
        >
            {procedureHint(answers.procedure)}
        </p>
    )

    return (
        <section
            ref={formRef}
            id={options.id}
            className='ck-card ck-card--fields'
            aria-labelledby={titleId}
            // Google Translate rewrites text nodes in place, which breaks a
            // form React keeps re-rendering. The copy is translated here.
            translate='no'
        >
            <header className='cc-steps'>
                <div className='cc-steps__top'>
                    <h2 id={titleId} className='cc-steps__title'>
                        {copy.title}
                    </h2>
                    {copy.formHeader && (
                        <span className='cc-steps__time' aria-hidden='true'>
                            {copy.formHeader.time}
                        </span>
                    )}
                </div>
            </header>

            <form
                className='ck-body'
                noValidate
                aria-labelledby={titleId}
                onSubmit={flow.onSubmit}
            >
                <ConsultHoneypot
                    c={cc}
                    fieldId={fieldId}
                    inputRef={honeypotRef}
                />

                {tiles ? (
                    <>
                        <ProcedureTiles
                            fieldsetRef={tilesRef}
                            name={procedureId}
                            legend={copy.fieldProcedure ?? copy.qProcedure}
                            options={copy.procedures}
                            selected={answers.procedure}
                            onPick={pickProcedure}
                            error={
                                invalid('procedure') ? (
                                    <p className='cc-error' id={procedureError}>
                                        {copy.errors.procedure}
                                    </p>
                                ) : null
                            }
                            errorId={
                                invalid('procedure')
                                    ? procedureError
                                    : undefined
                            }
                            invalid={invalid('procedure')}
                        />
                        {tilesNote && folded && (
                            <p className='ck-pick__note'>{tilesNote}</p>
                        )}
                        <div
                            ref={moreRef}
                            className='ck-pick__more'
                            hidden={folded}
                        >
                            {hint}
                            <ConsultContactFields
                                c={cc}
                                flow={flow}
                                phoneRef={phoneRef}
                                sendRef={sendRef}
                                copy={copy}
                                nameField={nameField}
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <div className='cc-field cc-field--wide ck-procedure'>
                            <label htmlFor={procedureId}>
                                {copy.fieldProcedure ?? copy.qProcedure}
                            </label>
                            <select
                                id={procedureId}
                                value={answers.procedure}
                                onChange={(event) =>
                                    flow.answer(0, {
                                        procedure: event.target.value,
                                    })
                                }
                                aria-invalid={invalid('procedure')}
                                aria-describedby={describedBy}
                            >
                                <option value='' disabled>
                                    {copy.procedurePlaceholder ?? ''}
                                </option>
                                {copy.procedures.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {invalid('procedure') && (
                                <p className='cc-error' id={procedureError}>
                                    {copy.errors.procedure}
                                </p>
                            )}
                            {hint}
                        </div>

                        <ConsultContactFields
                            c={cc}
                            flow={flow}
                            phoneRef={phoneRef}
                            sendRef={sendRef}
                            copy={copy}
                            nameField={nameField}
                        />
                    </>
                )}
            </form>

            <p className='ck-reassure' hidden={folded}>
                <LockIcon />
                {copy.reassure}
            </p>
        </section>
    )
}

/**
 * The procedures as radio tiles in two columns, "Something else" full width
 * when it would otherwise sit alone on a row (as on the tap card).
 */
function ProcedureTiles({
    fieldsetRef,
    name,
    legend,
    options,
    selected,
    onPick,
    error,
    errorId,
    invalid,
}: {
    readonly fieldsetRef: Ref<HTMLFieldSetElement>
    readonly name: string
    readonly legend: string
    readonly options: readonly ConsultChatOption[]
    readonly selected: string
    readonly onPick: (value: string) => void
    readonly error: ReactNode
    readonly errorId: string | undefined
    readonly invalid: boolean
}) {
    const paired =
        options.filter((option) => option.value !== 'other').length % 2 === 0
    return (
        // `tabIndex={-1}`: the page's CTAs focus the group, not one tile,
        // while none is chosen (drk-focus.ts).
        <fieldset
            ref={fieldsetRef}
            className='ck-pick'
            aria-describedby={errorId}
            tabIndex={-1}
        >
            <legend className='ck-pick__legend'>{legend}</legend>
            <div className='ck-pick__tiles'>
                {options.map((option) => (
                    <label
                        key={option.value}
                        className={
                            option.value === 'other' && paired
                                ? 'ck-pick__tile ck-pick__tile--wide'
                                : 'ck-pick__tile'
                        }
                    >
                        <input
                            className='ck-pick__input'
                            type='radio'
                            name={name}
                            value={option.value}
                            checked={selected === option.value}
                            aria-invalid={invalid || undefined}
                            onChange={() => onPick(option.value)}
                        />
                        <span className='ck-pick__face'>
                            {option.label}
                            <svg
                                className='ck-pick__check'
                                viewBox='0 0 24 24'
                                width='18'
                                height='18'
                                fill='none'
                                stroke='currentColor'
                                strokeWidth='2.6'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                aria-hidden='true'
                            >
                                <path d='m5 12.5 4.5 4.5L19 7.5' />
                            </svg>
                        </span>
                    </label>
                ))}
            </div>
            {error}
        </fieldset>
    )
}
