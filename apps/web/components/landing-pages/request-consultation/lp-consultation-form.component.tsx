'use client'

/**
 * The consultation form card on /lp/request-consultation.
 *
 * It submits through the site's own contact pipeline, the same one every other
 * form uses: `useContactFormSubmission` posts to `/api/contact`, which stores
 * the lead in `contact_submission`, syncs it to the CRM and sends the
 * notification emails. Google's click id and the campaign's utm_* ride along
 * with the submission, which is what attributes the lead to the ad.
 *
 * The fields are plain server-rendered inputs styled by the page's own
 * stylesheet. Errors are shown from the copy deck in the current language,
 * keyed by field, so a language switch retranslates whatever is on screen.
 */

import { zodResolver } from '@hookform/resolvers/zod'
import { type FormEvent, useEffect, useRef } from 'react'
import {
    type FieldErrors,
    type Resolver,
    type UseFormRegisterReturn,
    useForm,
} from 'react-hook-form'

import { useContactFormSubmission } from '@/hooks/useContactFormSubmission.hook'
import {
    CONTACT_SOURCES,
    PROCEDURE_OPTIONS,
} from '@/lib/types/forms/contact-form.type'

import type { LpDictionary, LpLang } from './lp-copy'
import { LP_THANK_YOU_PATH } from './lp-config'
import {
    type LpFormErrorField,
    type LpFormValues,
    lpFormSchema,
} from './lp-form-schema'
import { LockIcon, Rich } from './lp-primitives.component'
import {
    buildThankYouUrl,
    LP_PAGE_VARIANT,
    readAttribution,
    trackLpEvent,
} from './lp-tracking'
import type { LpProcedureValue } from './lp-variants'

interface LpConsultationFormProps {
    readonly lang: LpLang
    readonly adVariant: string
    readonly copy: LpDictionary['form']
    /** The procedure to preselect, `''` for the general variant. */
    readonly procedure: LpProcedureValue | ''
}

const FORM_ID = 'lp-consultation-form'

/**
 * The visitor's language as the patient coordinator reads it in the lead. Not
 * page copy: the lead is always read in English.
 */
const LANGUAGE_FOR_STAFF: Readonly<Record<LpLang, string>> = {
    en: 'English',
    es: 'Spanish',
}

const resolver = zodResolver(lpFormSchema) as Resolver<LpFormValues>

interface TextFieldProps {
    readonly id: string
    readonly label: string
    readonly error: string | undefined
    readonly required?: boolean
    readonly half?: boolean
    readonly type: 'text' | 'tel' | 'email'
    readonly autoComplete: string
    readonly inputMode?: 'text' | 'tel' | 'email'
    readonly registration: UseFormRegisterReturn
}

function TextField({
    id,
    label,
    error,
    required = false,
    half = false,
    type,
    autoComplete,
    inputMode,
    registration,
}: TextFieldProps) {
    const errorId = `${id}-error`
    return (
        <div className={`lp-field${half ? ' lp-field--half' : ''}`}>
            <label className='lp-label' htmlFor={id}>
                {label}
                {required && (
                    <span className='lp-req' aria-hidden='true'>
                        *
                    </span>
                )}
            </label>
            <input
                id={id}
                className='lp-input'
                type={type}
                autoComplete={autoComplete}
                inputMode={inputMode}
                aria-required={required}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? errorId : undefined}
                {...registration}
            />
            {error && (
                <p className='lp-field-error' id={errorId}>
                    {error}
                </p>
            )}
        </div>
    )
}

export function LpConsultationForm({
    lang,
    adVariant,
    copy,
    procedure,
}: LpConsultationFormProps) {
    const consentBoxRef = useRef<HTMLDivElement>(null)

    /**
     * The thank-you redirect runs after the request resolves, by which time the
     * visitor may have switched language. Read the values at that moment, not
     * the ones captured when the submission began.
     */
    const context = useRef({ lang, adVariant })
    useEffect(() => {
        context.current = { lang, adVariant }
    })

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LpFormValues>({
        resolver,
        defaultValues: {
            firstName: '',
            lastName: '',
            phone: '',
            email: '',
            procedure,
            consentGiven: false,
            _website: '',
        },
    })

    const {
        submit,
        isSubmitting,
        isSuccess,
        isError,
        formRef,
        trackValidationErrors,
    } = useContactFormSubmission({
        source: CONTACT_SOURCES.LANDING_PAGE,
        enableAnalytics: true,
        analyticsFormName: 'ads_lp_consultation',
        // A full page load, not a client-side transition: the tag
        // container needs a real page view on the thank-you page for
        // its conversion triggers, and the conversion event must fire
        // exactly once from a fresh data layer.
        onSuccess: () => {
            window.location.assign(
                buildThankYouUrl(LP_THANK_YOU_PATH, context.current)
            )
        },
    })

    /** Only the current language's copy is ever shown. */
    const errorFor = (field: LpFormErrorField) =>
        errors[field] ? copy.errors[field] : undefined

    const onValid = async (values: LpFormValues) => {
        trackLpEvent(
            'lp_lead_attempt',
            { lang, adVariant },
            { procedure: values.procedure }
        )

        const firstName = values.firstName.trim()
        const lastName = values.lastName.trim()
        const procedureLabel = PROCEDURE_OPTIONS.find(
            (option) => option.value === values.procedure
        )?.label
        const campaign = readAttribution()

        await submit({
            ...values,
            firstName,
            lastName,
            name: `${firstName} ${lastName}`,
            email: values.email.trim() || undefined,
            procedure: values.procedure || undefined,
            subject: procedureLabel
                ? `Consultation Request: ${procedureLabel}`
                : 'Consultation Request',
            message: [
                `Preferred language: ${LANGUAGE_FOR_STAFF[lang]}`,
                `Ad group: ${adVariant}`,
                `Landing page: ${LP_PAGE_VARIANT}`,
            ].join('\n'),
            // The hook merges the site-wide attribution captured on landing
            // after these, so these only fill in what it did not store: this
            // page keeps its own copy for the session, across reloads and
            // language switches.
            gclid: campaign.gclid || undefined,
            utmSource: campaign.utm_source || undefined,
            utmMedium: campaign.utm_medium || undefined,
            utmCampaign: campaign.utm_campaign || undefined,
            utmContent: campaign.utm_content || undefined,
            utmTerm: campaign.utm_term || undefined,
            referrer: document.referrer || undefined,
            landingPage: window.location.href,
        })
    }

    /**
     * The consent box sits below the button, so when it is the only thing
     * missing, focusing it is not enough to show the visitor why nothing
     * happened.
     */
    const onInvalid = (fieldErrors: FieldErrors<LpFormValues>) => {
        trackValidationErrors(fieldErrors)
        const onlyConsent = Object.keys(fieldErrors).every(
            (field) => field === 'consentGiven'
        )
        if (onlyConsent) {
            consentBoxRef.current?.scrollIntoView({
                block: 'center',
                behavior: 'smooth',
            })
        }
    }

    /**
     * Built per event rather than during render: `onInvalid` reads a ref, and
     * refs are only safe to touch outside render.
     */
    const onSubmit = (event: FormEvent<HTMLFormElement>) => {
        void handleSubmit(onValid, onInvalid)(event)
    }

    const busy = isSubmitting || isSuccess
    const consentInvalid = Boolean(errors.consentGiven)

    return (
        <aside className='card' id='consultation' aria-labelledby='form-title'>
            <div className='card-head'>
                <p className='eyebrow'>{copy.eyebrow}</p>
                <h2 id='form-title'>{copy.title}</h2>
                <p>{copy.subtitle}</p>
            </div>

            <form
                ref={formRef}
                id={FORM_ID}
                className='lp-form'
                noValidate
                aria-labelledby='form-title'
                onSubmit={onSubmit}
            >
                <div className='lp-honeypot' aria-hidden='true'>
                    <label htmlFor='_website_lp'>Website</label>
                    <input
                        id='_website_lp'
                        type='text'
                        tabIndex={-1}
                        autoComplete='off'
                        {...register('_website')}
                    />
                </div>

                <div className='lp-fields'>
                    <TextField
                        id='lp-first-name'
                        label={copy.fieldFirstName}
                        error={errorFor('firstName')}
                        required
                        half
                        type='text'
                        autoComplete='given-name'
                        registration={register('firstName')}
                    />
                    <TextField
                        id='lp-last-name'
                        label={copy.fieldLastName}
                        error={errorFor('lastName')}
                        required
                        half
                        type='text'
                        autoComplete='family-name'
                        registration={register('lastName')}
                    />
                    <TextField
                        id='lp-phone'
                        label={copy.fieldPhone}
                        error={errorFor('phone')}
                        required
                        type='tel'
                        autoComplete='tel'
                        inputMode='tel'
                        registration={register('phone')}
                    />
                    <TextField
                        id='lp-email'
                        label={copy.fieldEmail}
                        error={errorFor('email')}
                        type='email'
                        autoComplete='email'
                        inputMode='email'
                        registration={register('email')}
                    />

                    <div className='lp-field'>
                        <label className='lp-label' htmlFor='lp-procedure'>
                            {copy.fieldProcedure}
                        </label>
                        <select
                            id='lp-procedure'
                            className='lp-input lp-select'
                            // Server-rendered preselection. The form's own
                            // default holds the same value after hydration.
                            defaultValue={procedure}
                            {...register('procedure')}
                        >
                            <option value=''>
                                {copy.procedurePlaceholder}
                            </option>
                            {copy.procedureOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <button
                    type='submit'
                    className='lp-submit'
                    disabled={busy}
                    aria-busy={busy}
                >
                    {busy ? copy.submitting : copy.submitLabel}
                </button>

                {isError && (
                    <p className='lp-form-error' role='alert'>
                        {copy.errors.submit}
                    </p>
                )}
            </form>

            <div
                className={`consent${consentInvalid ? ' is-invalid' : ''}`}
                ref={consentBoxRef}
            >
                <input
                    id='consentGiven'
                    type='checkbox'
                    form={FORM_ID}
                    aria-invalid={consentInvalid}
                    aria-describedby='consent-error'
                    {...register('consentGiven')}
                />
                <label htmlFor='consentGiven'>
                    <Rich parts={copy.consent} />
                </label>
            </div>
            <p
                id='consent-error'
                className={`consent-error${consentInvalid ? ' is-visible' : ''}`}
                role='alert'
            >
                {consentInvalid ? copy.consentError : ''}
            </p>

            <p className='reassure'>
                <LockIcon />
                <span>{copy.reassure}</span>
            </p>
            <p className='micro'>
                {copy.micro.map((item) => (
                    <span key={item}>{item}</span>
                ))}
            </p>
        </aside>
    )
}
