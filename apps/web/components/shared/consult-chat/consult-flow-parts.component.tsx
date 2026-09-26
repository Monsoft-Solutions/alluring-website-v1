'use client'

/**
 * The pieces the thread (`ConsultChat`) and the tap card (`ConsultCard`)
 * draw the same way: the last step's fields, consent and send button, the
 * honeypot, and the two icons. Both forms run on `useConsultFlow`, so the
 * last step behaves identically in each.
 *
 * Classes are `<prefix>-<name>`: `cc` on site pages and in the card, `mj` on
 * Melissa's page, whose sheet styles its own.
 */

import { Rich } from '@/components/landing-pages/request-consultation/lp-primitives.component'

import type { ConsultChatCopy } from './consult-chat.types'
import type { RefObject } from 'react'

import type { ConsultFlowState } from './use-consult-flow.hook'

type ClassName = (name: string) => string

export const classNamer =
    (prefix: string): ClassName =>
    (name: string) =>
        `${prefix}-${name}`

export function ConsultHoneypot({
    c,
    fieldId,
    inputRef,
}: {
    readonly c: ClassName
    readonly fieldId: ConsultFlowState['fieldId']
    readonly inputRef: RefObject<HTMLInputElement | null>
}) {
    return (
        <div className={c('honeypot')} aria-hidden='true'>
            <label htmlFor={fieldId('website')}>Website</label>
            <input
                id={fieldId('website')}
                ref={inputRef}
                type='text'
                name='_website'
                tabIndex={-1}
                autoComplete='off'
            />
        </div>
    )
}

interface ConsultContactFieldsProps {
    readonly c: ClassName
    readonly flow: ConsultFlowState
    readonly phoneRef: RefObject<HTMLInputElement | null>
    readonly sendRef: RefObject<HTMLButtonElement | null>
    readonly copy: ConsultChatCopy
    /**
     * `first`: the field asks for a first name (`given-name`), which is all
     * a coordinator's first text needs. `full` (the default): the full name.
     */
    readonly nameField?: 'full' | 'first'
}

/** The last step: name, mobile number, consent, and the send button. */
export function ConsultContactFields({
    c,
    flow,
    phoneRef,
    sendRef,
    copy,
    nameField = 'full',
}: ConsultContactFieldsProps) {
    const { fieldId, invalid } = flow
    const consentLineId = fieldId('consent-line')
    return (
        <div className={c('fields')}>
            <div className={`${c('field')} ${c('field--wide')}`}>
                <label htmlFor={fieldId('name')}>{copy.fieldName}</label>
                <input
                    id={fieldId('name')}
                    type='text'
                    autoComplete={nameField === 'first' ? 'given-name' : 'name'}
                    autoCapitalize='words'
                    enterKeyHint='next'
                    value={flow.name}
                    onChange={(event) => flow.setName(event.target.value)}
                    onKeyDown={(event) => {
                        // Enter moves on to the number rather than sending
                        // half a form.
                        if (event.key !== 'Enter') return
                        event.preventDefault()
                        phoneRef.current?.focus()
                    }}
                    aria-invalid={invalid('name')}
                    aria-describedby={
                        invalid('name') ? fieldId('name-error') : undefined
                    }
                />
                {invalid('name') && (
                    <p className={c('error')} id={fieldId('name-error')}>
                        {copy.errors.name}
                    </p>
                )}
            </div>

            <div className={`${c('field')} ${c('field--wide')}`}>
                <label htmlFor={fieldId('phone')}>{copy.fieldPhone}</label>
                <input
                    id={fieldId('phone')}
                    ref={phoneRef}
                    type='tel'
                    inputMode='tel'
                    autoComplete='tel'
                    enterKeyHint='send'
                    placeholder='(305) 555-0123'
                    value={flow.phone}
                    onChange={(event) => flow.setPhone(event.target.value)}
                    onFocus={flow.onPhoneFocus}
                    aria-invalid={invalid('phone')}
                    aria-describedby={
                        invalid('phone') ? fieldId('phone-error') : undefined
                    }
                />
                {invalid('phone') && (
                    <p className={c('error')} id={fieldId('phone-error')}>
                        {copy.errors.phone}
                    </p>
                )}
            </div>

            {flow.tapConsent && copy.consentTap ? (
                <p className={c('consent-line')} id={consentLineId}>
                    <Rich parts={copy.consentTap} />
                </p>
            ) : (
                <>
                    <div
                        className={`${c('consent')}${invalid('consent') ? ' is-invalid' : ''}`}
                    >
                        <input
                            id={fieldId('consent')}
                            type='checkbox'
                            checked={flow.consentChecked}
                            onChange={(event) =>
                                flow.setConsent(event.target.checked)
                            }
                            aria-invalid={invalid('consent')}
                            aria-describedby={
                                invalid('consent')
                                    ? fieldId('consent-error')
                                    : undefined
                            }
                        />
                        <label htmlFor={fieldId('consent')}>
                            <Rich parts={copy.consent} />
                        </label>
                    </div>
                    {invalid('consent') && (
                        <p className={c('error')} id={fieldId('consent-error')}>
                            {copy.errors.consent}
                        </p>
                    )}
                </>
            )}

            <button
                ref={sendRef}
                type='submit'
                className={`${c('send')} ${c('send--final')}`}
                disabled={flow.busy}
                aria-busy={flow.busy}
                aria-describedby={
                    flow.tapConsent && copy.consentTap
                        ? consentLineId
                        : undefined
                }
            >
                {flow.busy ? copy.submitting : copy.submit}
                <ArrowIcon />
            </button>

            {flow.isError && (
                <p className={c('error')} role='alert'>
                    {copy.errors.submit}
                </p>
            )}
        </div>
    )
}

export function ArrowIcon() {
    return (
        <svg
            viewBox='0 0 24 24'
            width='18'
            height='18'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            aria-hidden='true'
        >
            <path d='M5 12h14M13 6l6 6-6 6' />
        </svg>
    )
}

export function LockIcon() {
    return (
        <svg
            viewBox='0 0 24 24'
            width='14'
            height='14'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            aria-hidden='true'
        >
            <rect x='4' y='11' width='16' height='10' rx='2' />
            <path d='M8 11V7a4 4 0 0 1 8 0v4' />
        </svg>
    )
}
