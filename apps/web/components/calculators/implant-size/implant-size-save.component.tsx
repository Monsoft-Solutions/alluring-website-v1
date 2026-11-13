'use client'

/**
 * "Text me my size plan": the short form inside the calculator's result
 * panel (#382).
 *
 * The reader has an estimate and nowhere to keep it. This sends it to their
 * phone: first name, a US mobile number and, if they like, an email. The
 * estimate itself is never behind the form; the form only shows once there
 * is one.
 *
 * The lead is saved with source `size-calculator` and a staff note that says
 * what the reader picked and what the calculator answered
 * (`savedResultNote`), so the first message can be about that answer. Consent
 * is the shared submit notice (#350); no checkbox.
 *
 * After a lead is saved the page goes to the consultation thank-you screen
 * with a full page load, like the lead popup: that screen fires the
 * conversion tags and asks the optional follow-up questions.
 *
 * It lives in the calculator's own async chunk, so no other post pays for it.
 *
 * @module components/calculators/implant-size/implant-size-save
 */
import { type FormEvent, type ReactNode, useId, useRef, useState } from 'react'

import { cn } from '@workspace/ui/lib/utils'

import type { ConsultChatLead } from '@/components/shared/consult-chat/consult-chat.types'
import {
    formatPhone,
    nationalDigits,
    visitorTimeZone,
} from '@/components/shared/consult-chat/consult-chat.util'
import {
    SITE_CHAT_LEAD_KEY,
    SITE_CHAT_THANK_YOU_PATH,
} from '@/components/shared/consult-chat/site-chat.constants'
import { ConsentNotice } from '@/components/shared/forms/consent-notice.component'
import { useContactFormSubmission } from '@/hooks/useContactFormSubmission.hook'
import { SUBMIT_CONSENT } from '@/lib/constants/lead-consent'
import type { ContactSource } from '@/lib/types/forms/contact-form.type'

import {
    type ImplantSizeEstimate,
    type ImplantSizeInput,
    savedResultNote,
    savedResultSummary,
} from './implant-size.logic'

/**
 * `CONTACT_SOURCES.SIZE_CALCULATOR`, written out: importing the constant
 * would pull the form schemas (zod, libphonenumber) into this chunk.
 */
const SOURCE: ContactSource = 'size-calculator'

/** Loose on purpose; the API validates the address properly. */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** The funnel's name for this form in the `lead_*` events. */
export const SIZE_SAVE_FORM_NAME = 'size_calculator'

type Field = 'firstName' | 'phone' | 'email'

const ERRORS: Record<Field, string> = {
    firstName: 'Please enter your first name.',
    phone: 'Please enter a US mobile number, 10 digits.',
    email: 'That email does not look right. You can also leave it blank.',
}

type ImplantSizeSaveProps = {
    input: ImplantSizeInput
    estimate: ImplantSizeEstimate
    /** The procedure value the lead is filed under. */
    procedure: string
    className?: string
}

export function ImplantSizeSave({
    input,
    estimate,
    procedure,
    className,
}: ImplantSizeSaveProps) {
    const id = useId()
    const fieldId = (name: string) => `${id}-${name}`
    const titleId = fieldId('title')
    const consentId = fieldId('consent')

    const [firstName, setFirstName] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [errors, setErrors] = useState<ReadonlySet<Field>>(new Set())

    const firstNameRef = useRef<HTMLInputElement>(null)
    const phoneRef = useRef<HTMLInputElement>(null)
    const emailRef = useRef<HTMLInputElement>(null)
    const honeypotRef = useRef<HTMLInputElement>(null)
    const sentNameRef = useRef('')

    const {
        submit,
        isSubmitting,
        isSuccess,
        isError,
        formRef,
        trackValidationErrors,
    } = useContactFormSubmission({
        source: SOURCE,
        analyticsFormName: SIZE_SAVE_FORM_NAME,
        onFieldError: (field) => {
            if (field !== 'phone' && field !== 'email') return
            setErrors(new Set<Field>([field]))
            ;(field === 'phone' ? phoneRef : emailRef).current?.focus()
        },
        onSuccess: (result) => {
            const lead: ConsultChatLead = {
                firstName: sentNameRef.current,
                ...(result.lead && { lead: result.lead }),
            }
            try {
                window.sessionStorage.setItem(
                    SITE_CHAT_LEAD_KEY,
                    JSON.stringify(lead)
                )
            } catch {
                // The thank-you page greets without a name.
            }
            window.location.assign(`${SITE_CHAT_THANK_YOU_PATH}?hl=en`)
        },
    })

    const clearError = (field: Field) => {
        if (!errors.has(field)) return
        const next = new Set(errors)
        next.delete(field)
        setErrors(next)
    }

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const name = firstName.trim().replace(/\s+/g, ' ')
        const national = nationalDigits(phone)
        const mail = email.trim()

        const invalid = new Set<Field>()
        if (!name) invalid.add('firstName')
        if (!national) invalid.add('phone')
        if (mail && !EMAIL_SHAPE.test(mail)) invalid.add('email')
        setErrors(invalid)
        if (!national || invalid.size) {
            trackValidationErrors([...invalid])
            if (invalid.has('firstName')) firstNameRef.current?.focus()
            else if (invalid.has('phone')) phoneRef.current?.focus()
            else emailRef.current?.focus()
            return
        }

        sentNameRef.current = name
        const timeZone = visitorTimeZone()

        await submit({
            firstName: name,
            name,
            phone: formatPhone(national),
            ...(mail && { email: mail }),
            procedure,
            ...SUBMIT_CONSENT,
            _website: honeypotRef.current?.value ?? '',
            subject: 'Size calculator: result by text',
            message: [
                ...savedResultNote(input, estimate),
                `Page: ${window.location.pathname}`,
                ...(timeZone
                    ? [
                          `Visitor time zone: ${timeZone.zone}${timeZone.short ? ` (${timeZone.short})` : ''}`,
                      ]
                    : []),
            ].join('\n'),
            // The one field of these the CRM webhook forwards.
            offer: savedResultSummary(input, estimate),
            language: 'en',
            timeZone: timeZone?.zone,
        })
    }

    const busy = isSubmitting || isSuccess
    const invalid = (field: Field) => errors.has(field)

    return (
        <form
            ref={formRef}
            noValidate
            onSubmit={onSubmit}
            aria-labelledby={titleId}
            // Google Translate rewrites text nodes React keeps re-rendering.
            translate='no'
            className={cn(
                'mx-auto w-full max-w-[24rem] border-t border-white/15 pt-6 text-left',
                className
            )}
        >
            <h3
                id={titleId}
                className='text-center font-serif text-[1.375rem] leading-[1.2] font-normal text-stone-50'
            >
                Keep this for your <em className='italic'>consultation</em>
            </h3>
            <p className='mt-2 text-center text-[0.9375rem] leading-[1.55] text-stone-300'>
                We&rsquo;ll text you your range, the cc chart and real patient
                results. You can ask a coordinator your sizing questions there.
            </p>

            <div
                aria-hidden='true'
                className='absolute -left-[9999px] h-0 overflow-hidden'
            >
                <label htmlFor={fieldId('website')}>Website</label>
                <input
                    id={fieldId('website')}
                    ref={honeypotRef}
                    type='text'
                    name='_website'
                    tabIndex={-1}
                    autoComplete='off'
                />
            </div>

            <div className='mt-5 grid gap-3.5'>
                <TextField
                    id={fieldId('firstName')}
                    label='First name'
                    error={invalid('firstName') ? ERRORS.firstName : undefined}
                >
                    <input
                        id={fieldId('firstName')}
                        ref={firstNameRef}
                        type='text'
                        name='firstName'
                        autoComplete='given-name'
                        autoCapitalize='words'
                        enterKeyHint='next'
                        value={firstName}
                        disabled={busy}
                        onChange={(event) => {
                            setFirstName(event.target.value)
                            clearError('firstName')
                        }}
                        onKeyDown={(event) => {
                            // Enter moves on rather than sending half a form.
                            if (event.key !== 'Enter') return
                            event.preventDefault()
                            phoneRef.current?.focus()
                        }}
                        aria-invalid={invalid('firstName')}
                        aria-describedby={
                            invalid('firstName')
                                ? fieldId('firstName-error')
                                : undefined
                        }
                        className={inputClass}
                    />
                </TextField>

                <TextField
                    id={fieldId('phone')}
                    label='Mobile number'
                    error={invalid('phone') ? ERRORS.phone : undefined}
                >
                    <input
                        id={fieldId('phone')}
                        ref={phoneRef}
                        type='tel'
                        name='phone'
                        inputMode='tel'
                        autoComplete='tel-national'
                        enterKeyHint='next'
                        placeholder='(305) 555-0123'
                        value={phone}
                        disabled={busy}
                        onChange={(event) => {
                            setPhone(formatPhone(event.target.value))
                            clearError('phone')
                        }}
                        aria-invalid={invalid('phone')}
                        aria-describedby={
                            invalid('phone')
                                ? fieldId('phone-error')
                                : undefined
                        }
                        className={inputClass}
                    />
                </TextField>

                <TextField
                    id={fieldId('email')}
                    label='Email'
                    optional
                    error={invalid('email') ? ERRORS.email : undefined}
                >
                    <input
                        id={fieldId('email')}
                        ref={emailRef}
                        type='email'
                        name='email'
                        inputMode='email'
                        autoComplete='email'
                        autoCapitalize='none'
                        enterKeyHint='send'
                        value={email}
                        disabled={busy}
                        onChange={(event) => {
                            setEmail(event.target.value)
                            clearError('email')
                        }}
                        aria-invalid={invalid('email')}
                        aria-describedby={
                            invalid('email')
                                ? fieldId('email-error')
                                : undefined
                        }
                        className={inputClass}
                    />
                </TextField>
            </div>

            <ConsentNotice
                id={consentId}
                tone='dark'
                className='mt-4 text-[0.8125rem] sm:text-[0.8125rem]'
            />

            <button
                type='submit'
                disabled={busy}
                aria-describedby={consentId}
                data-cta='calculator_save'
                className='bg-gold-300 hover:bg-gold-200 focus-visible:outline-gold-300 mt-4 flex min-h-13 w-full items-center justify-center gap-2 rounded-full px-6 text-[1rem] font-semibold text-stone-950 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-70'
            >
                {busy ? 'Sending…' : 'Text me my size plan'}
            </button>

            <p
                role='alert'
                className={cn(
                    'mt-3 text-center text-[0.875rem] text-red-300',
                    !isError && 'hidden'
                )}
            >
                That did not go through. Please try again in a moment.
            </p>
        </form>
    )
}

const inputClass = cn(
    'mt-1.5 h-12 w-full rounded-xl border border-white/15 bg-stone-950/55 px-4 text-[1.0625rem] text-stone-50',
    'placeholder:text-stone-500 transition-[border-color,box-shadow] duration-150',
    'focus:border-gold-300 focus:ring-gold-300/25 focus:ring-2 focus:outline-none',
    'aria-invalid:border-red-300/80 disabled:opacity-60',
    'autofill:shadow-[inset_0_0_0_1000px_var(--stone-950)] autofill:[-webkit-text-fill-color:var(--stone-50)]'
)

function TextField({
    id,
    label,
    optional = false,
    error,
    children,
}: {
    id: string
    label: string
    optional?: boolean
    error?: string
    children: ReactNode
}) {
    return (
        <div>
            <label
                htmlFor={id}
                className='block text-[0.8125rem] font-semibold text-stone-200'
            >
                {label}
                {optional && (
                    <span className='font-normal text-stone-400'>
                        {' '}
                        (optional)
                    </span>
                )}
            </label>
            {children}
            {error && (
                <p
                    id={`${id}-error`}
                    className='mt-1.5 text-[0.8125rem] text-red-300'
                >
                    {error}
                </p>
            )}
        </div>
    )
}
