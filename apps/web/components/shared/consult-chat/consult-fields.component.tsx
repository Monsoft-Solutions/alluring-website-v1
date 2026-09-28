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
 */

import {
    ConsultContactFields,
    ConsultHoneypot,
    classNamer,
    LockIcon,
} from './consult-flow-parts.component'
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
}

const cc = classNamer('cc')

export function ConsultFields({
    defaultProcedure = '',
    nameField = 'full',
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

                <div className='cc-field cc-field--wide ck-procedure'>
                    <label htmlFor={procedureId}>
                        {copy.fieldProcedure ?? copy.qProcedure}
                    </label>
                    <select
                        id={procedureId}
                        value={answers.procedure}
                        onChange={(event) =>
                            flow.answer(0, { procedure: event.target.value })
                        }
                        aria-invalid={invalid('procedure')}
                        aria-describedby={
                            invalid('procedure') ? procedureError : undefined
                        }
                    >
                        <option value='' disabled>
                            {copy.procedurePlaceholder ?? ''}
                        </option>
                        {copy.procedures.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {invalid('procedure') && (
                        <p className='cc-error' id={procedureError}>
                            {copy.errors.procedure}
                        </p>
                    )}
                </div>

                <ConsultContactFields
                    c={cc}
                    flow={flow}
                    phoneRef={phoneRef}
                    sendRef={sendRef}
                    copy={copy}
                    nameField={nameField}
                />
            </form>

            <p className='ck-reassure'>
                <LockIcon />
                {copy.reassure}
            </p>
        </section>
    )
}
