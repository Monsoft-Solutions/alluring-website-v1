'use client'

/**
 * ConsultChat — the consultation request written as a text thread.
 *
 * Built for Melissa's bio-link page and shared from there (#274): the
 * coordinator asks one question at a time and the first two answers are a
 * single tap. A tap is a cheaper first yes than a name, and by the time the
 * thread asks for a phone number the visitor has already answered twice.
 *
 * Underneath it is an ordinary form posting through the site's contact
 * pipeline (`useContactFormSubmission` → `/api/contact`), so it reports the
 * shared lead funnel (#272) and every lead lands tagged with its page's
 * source. The procedure and timeline go into the staff note, never into
 * analytics.
 *
 * Styling is the page's job. Every class is `<prefix>-<name>`: Melissa's page
 * keeps its own `mj-*` sheet, and site pages use `consult-chat.css` (`cc-*`).
 */

import {
    type FormEvent,
    type ReactNode,
    useEffect,
    useRef,
    useState,
} from 'react'

import { Rich } from '@/components/landing-pages/request-consultation/lp-primitives.component'
import {
    pushDataLayer,
    readAttribution,
} from '@/components/landing-pages/request-consultation/lp-tracking'
import { useContactFormSubmission } from '@/hooks/useContactFormSubmission.hook'
import {
    LEAD_FORM_EVENTS,
    trackLeadFormEvent,
} from '@/lib/analytics/lead-form-tracking'
import type { ContactSource } from '@/lib/types/forms/contact-form.type'

import {
    CONSULT_CHAT_PROGRESS_EVENT,
    type ConsultChatCopy,
    type ConsultChatLang,
    type ConsultChatLead,
    type ConsultChatMethod,
    type ConsultChatProgressDetail,
    type ConsultChatStaffLabels,
} from './consult-chat.types'
import {
    fill,
    formatPhone,
    labelOf,
    nationalDigits,
    prefersReducedMotion,
} from './consult-chat.util'

type Step = 0 | 1 | 2 | 3
type ErrorField = 'firstName' | 'lastName' | 'phone' | 'consent'

const STEP_NAMES = ['procedure', 'timeline', 'name', 'contact'] as const
const TOTAL_STEPS = STEP_NAMES.length
const TYPING_MS = 700

interface Answers {
    readonly procedure: string
    readonly timeline: string
    readonly firstName: string
    readonly lastName: string
}

export interface ConsultChatProps {
    /** Section id — every CTA on the page links here. */
    readonly id: string
    readonly lang: ConsultChatLang
    readonly copy: ConsultChatCopy
    readonly staff: ConsultChatStaffLabels
    /** Avatar in the thread header: a photo or a monogram. */
    readonly avatar: ReactNode
    readonly source: ContactSource
    /** `form_name` on the lead funnel events. */
    readonly formName: string
    /** Full page load after success, so the tag container sees the page view. */
    readonly thankYouPath: string
    /** `sessionStorage` key the thank-you page reads the first name from. */
    readonly leadStorageKey: string
    /** Subject line staff see, given the procedure's English label. */
    readonly subject: (procedureLabel: string) => string
    /** Lines added to the top of the staff note (who, which page, offer). */
    readonly noteLines: readonly string[]
    /** Extra coordinator bubbles between the greeting and the first question. */
    readonly intro?: ReactNode
    /** Pre-selects a procedure chip (still one tap to confirm). */
    readonly defaultProcedure?: string
    /** Class prefix for every element (`mj` on Melissa's page, `cc` on site pages). */
    readonly classPrefix?: string
    /** Legacy dataLayer event names Melissa's page already reports. */
    readonly dataLayerEvents?: {
        readonly step: string
        readonly attempt: string
    }
}

export function ConsultChat({
    id,
    lang,
    copy,
    staff,
    avatar,
    source,
    formName,
    thankYouPath,
    leadStorageKey,
    subject,
    noteLines,
    intro,
    defaultProcedure = '',
    classPrefix = 'cc',
    dataLayerEvents,
}: ConsultChatProps) {
    const c = (name: string) => `${classPrefix}-${name}`
    const titleId = `${id}-title`
    const qId = (step: Step) => `${id}-q-${STEP_NAMES[step]}`
    const fieldId = (name: string) => `${id}-${name}`

    const [step, setStep] = useState<Step>(0)
    const [typing, setTyping] = useState(false)
    const [answers, setAnswers] = useState<Answers>({
        procedure: '',
        timeline: '',
        firstName: '',
        lastName: '',
    })
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [phone, setPhone] = useState('')
    const [method, setMethod] = useState<ConsultChatMethod>('text')
    const [consent, setConsent] = useState(false)
    const [errors, setErrors] = useState<ReadonlySet<ErrorField>>(new Set())

    const composerRef = useRef<HTMLDivElement>(null)
    const honeypotRef = useRef<HTMLInputElement>(null)
    const interacted = useRef(false)
    const typingTimer = useRef<number | undefined>(undefined)

    /** Read when the request resolves, not when it began. */
    const leadRef = useRef<ConsultChatLead>({ firstName: '', method: 'text' })

    const {
        submit,
        isSubmitting,
        isSuccess,
        isError,
        formRef,
        trackValidationErrors,
    } = useContactFormSubmission({
        source,
        enableAnalytics: true,
        analyticsFormName: formName,
        onSuccess: () => {
            try {
                window.sessionStorage.setItem(
                    leadStorageKey,
                    JSON.stringify(leadRef.current)
                )
            } catch {
                // The thank-you page falls back to a greeting without a name.
            }
            const separator = thankYouPath.includes('?') ? '&' : '?'
            window.location.assign(`${thankYouPath}${separator}hl=${lang}`)
        },
    })

    useEffect(() => () => window.clearTimeout(typingTimer.current), [])

    /** Sticky bars read how far the visitor has got. */
    useEffect(() => {
        const answered = [
            answers.procedure,
            answers.timeline,
            answers.firstName && answers.lastName,
        ].filter(Boolean).length
        window.dispatchEvent(
            new CustomEvent<ConsultChatProgressDetail>(
                CONSULT_CHAT_PROGRESS_EVENT,
                { detail: { id, answered, total: TOTAL_STEPS } }
            )
        )
    }, [answers, id])

    /**
     * After the coordinator "sends" the next question, put the visitor's
     * focus on its first control and keep the composer on screen. Never on
     * first render: the page must not scroll itself before anyone has
     * touched it.
     */
    useEffect(() => {
        if (typing || !interacted.current) return
        const composer = composerRef.current
        if (!composer) return
        composer.scrollIntoView({
            block: 'nearest',
            behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        })
        composer
            .querySelector<HTMLElement>('input:not([type=checkbox]), button')
            ?.focus({ preventScroll: true })
    }, [step, typing])

    /** The first step after `from` still missing an answer. */
    const nextOpenStep = (from: Step, next: Answers): Step => {
        const done = [
            Boolean(next.procedure),
            Boolean(next.timeline),
            Boolean(next.firstName && next.lastName),
        ]
        for (let index = from + 1; index < 3; index++) {
            if (!done[index]) return index as Step
        }
        return 3
    }

    const goTo = (target: Step, withTyping: boolean) => {
        interacted.current = true
        setStep(target)
        if (!withTyping || prefersReducedMotion()) return
        setTyping(true)
        window.clearTimeout(typingTimer.current)
        typingTimer.current = window.setTimeout(
            () => setTyping(false),
            TYPING_MS
        )
    }

    const answer = (from: Step, patch: Partial<Answers>) => {
        const next = { ...answers, ...patch }
        setAnswers(next)
        // Which step was answered is worth reporting; the answer is not.
        // Procedure interest and names stay out of the data layer, where
        // every tag in the container can read them (#272).
        if (dataLayerEvents) {
            pushDataLayer({
                event: dataLayerEvents.step,
                step: STEP_NAMES[from],
                lang,
            })
        }
        trackLeadFormEvent(LEAD_FORM_EVENTS.STEP, formName, {
            step: STEP_NAMES[from],
            step_index: from + 1,
        })
        goTo(nextOpenStep(from, next), true)
    }

    const invalid = (field: ErrorField) => errors.has(field)

    /** An error goes away as soon as the visitor starts fixing it. */
    const clearError = (field: ErrorField) => {
        if (!errors.has(field)) return
        const next = new Set(errors)
        next.delete(field)
        setErrors(next)
    }

    const submitName = () => {
        const nextErrors = new Set<ErrorField>()
        if (!firstName.trim()) nextErrors.add('firstName')
        if (!lastName.trim()) nextErrors.add('lastName')
        setErrors(nextErrors)
        if (nextErrors.size) {
            trackValidationErrors([...nextErrors])
            return
        }
        answer(2, { firstName: firstName.trim(), lastName: lastName.trim() })
    }

    const submitLead = async () => {
        const national = nationalDigits(phone)
        const nextErrors = new Set<ErrorField>()
        if (!national) nextErrors.add('phone')
        if (!consent) nextErrors.add('consent')
        setErrors(nextErrors)
        if (!national || nextErrors.size) {
            trackValidationErrors([...nextErrors])
            return
        }

        leadRef.current = { firstName: answers.firstName, method }
        if (dataLayerEvents) {
            pushDataLayer({ event: dataLayerEvents.attempt, lang, method })
        }

        const procedureLabel = labelOf(staff.procedures, answers.procedure)
        const campaign = readAttribution()

        await submit({
            firstName: answers.firstName,
            lastName: answers.lastName,
            name: `${answers.firstName} ${answers.lastName}`,
            phone: formatPhone(national),
            procedure: answers.procedure,
            consentGiven: true,
            _website: honeypotRef.current?.value ?? '',
            subject: subject(procedureLabel),
            message: [
                ...noteLines,
                `Procedure: ${procedureLabel}`,
                `Timeline: ${labelOf(staff.timelines, answers.timeline)}`,
                `Prefers: ${method === 'text' ? 'Text' : 'Call'}`,
                `Preferred language: ${lang === 'es' ? 'Spanish' : 'English'}`,
            ].join('\n'),
            // The hook merges the site-wide attribution after these, so
            // these only fill what it did not capture.
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

    const onSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (step === 2) submitName()
        else if (step === 3) void submitLead()
    }

    const busy = isSubmitting || isSuccess
    const showQuestion = (index: Step) =>
        step > index || (step === index && !typing)
    const selectedProcedure = answers.procedure || defaultProcedure

    // Melissa's sheet names the coordinator's bubbles after her.
    const theirs = `${c('bubble')} ${c(classPrefix === 'mj' ? 'bubble--melissa' : 'bubble--them')}`

    return (
        <section
            ref={formRef}
            id={id}
            className={c('chat')}
            aria-labelledby={titleId}
            // Google Translate rewrites text nodes in place, which breaks a
            // thread React keeps re-rendering. The copy is translated here.
            translate='no'
        >
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
                        width: `${((step + (typing ? 0 : 1)) / TOTAL_STEPS) * 100}%`,
                    }}
                />
            </div>

            <ol className={c('thread')} aria-live='polite'>
                <li className={theirs}>
                    <p>{copy.greeting}</p>
                </li>
                {intro}
                <li className={theirs}>
                    <p id={qId(0)}>{copy.qProcedure}</p>
                </li>

                {step > 0 && answers.procedure && (
                    <YouBubble
                        c={c}
                        changeLabel={copy.change}
                        onChange={() => goTo(0, false)}
                    >
                        {labelOf(copy.procedures, answers.procedure)}
                    </YouBubble>
                )}
                {step >= 1 && showQuestion(1) && (
                    <li className={theirs}>
                        <p id={qId(1)}>{copy.qTimeline}</p>
                    </li>
                )}

                {step > 1 && answers.timeline && (
                    <YouBubble
                        c={c}
                        changeLabel={copy.change}
                        onChange={() => goTo(1, false)}
                    >
                        {labelOf(copy.timelines, answers.timeline)}
                    </YouBubble>
                )}
                {step >= 2 && showQuestion(2) && (
                    <li className={theirs}>
                        <p id={qId(2)}>{copy.qName}</p>
                    </li>
                )}

                {step > 2 && answers.firstName && (
                    <YouBubble
                        c={c}
                        changeLabel={copy.change}
                        onChange={() => goTo(2, false)}
                    >
                        {answers.firstName} {answers.lastName}
                    </YouBubble>
                )}
                {step >= 3 && showQuestion(3) && (
                    <li className={theirs}>
                        <p id={qId(3)}>
                            {fill(copy.qContact, { name: answers.firstName })}
                        </p>
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

            <form
                className={c('composer')}
                noValidate
                aria-labelledby={qId(step)}
                onSubmit={onSubmit}
            >
                <div className={c('honeypot')} aria-hidden='true'>
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
                            onPick={(procedure) => answer(0, { procedure })}
                        />
                    )}

                    {step === 1 && (
                        <Chips
                            c={c}
                            labelledBy={qId(1)}
                            options={copy.timelines}
                            selected={answers.timeline}
                            onPick={(timeline) => answer(1, { timeline })}
                        />
                    )}

                    {step === 2 && (
                        <div className={c('fields')}>
                            <div className={c('field')}>
                                <label htmlFor={fieldId('first')}>
                                    {copy.fieldFirstName}
                                </label>
                                <input
                                    id={fieldId('first')}
                                    type='text'
                                    autoComplete='given-name'
                                    enterKeyHint='next'
                                    value={firstName}
                                    onChange={(event) => {
                                        setFirstName(event.target.value)
                                        clearError('firstName')
                                    }}
                                    aria-invalid={invalid('firstName')}
                                    aria-describedby={
                                        invalid('firstName')
                                            ? fieldId('first-error')
                                            : undefined
                                    }
                                />
                                {invalid('firstName') && (
                                    <p
                                        className={c('error')}
                                        id={fieldId('first-error')}
                                    >
                                        {copy.errors.firstName}
                                    </p>
                                )}
                            </div>
                            <div className={c('field')}>
                                <label htmlFor={fieldId('last')}>
                                    {copy.fieldLastName}
                                </label>
                                <input
                                    id={fieldId('last')}
                                    type='text'
                                    autoComplete='family-name'
                                    enterKeyHint='next'
                                    value={lastName}
                                    onChange={(event) => {
                                        setLastName(event.target.value)
                                        clearError('lastName')
                                    }}
                                    aria-invalid={invalid('lastName')}
                                    aria-describedby={
                                        invalid('lastName')
                                            ? fieldId('last-error')
                                            : undefined
                                    }
                                />
                                {invalid('lastName') && (
                                    <p
                                        className={c('error')}
                                        id={fieldId('last-error')}
                                    >
                                        {copy.errors.lastName}
                                    </p>
                                )}
                            </div>
                            <button type='submit' className={c('send')}>
                                {copy.next}
                                <ArrowIcon />
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className={c('fields')}>
                            <div
                                className={`${c('field')} ${c('field--wide')}`}
                            >
                                <label htmlFor={fieldId('phone')}>
                                    {copy.fieldPhone}
                                </label>
                                <input
                                    id={fieldId('phone')}
                                    type='tel'
                                    inputMode='tel'
                                    autoComplete='tel-national'
                                    enterKeyHint='send'
                                    placeholder='(305) 555-0123'
                                    value={phone}
                                    onChange={(event) => {
                                        setPhone(
                                            formatPhone(event.target.value)
                                        )
                                        clearError('phone')
                                    }}
                                    aria-invalid={invalid('phone')}
                                    aria-describedby={
                                        invalid('phone')
                                            ? fieldId('phone-error')
                                            : undefined
                                    }
                                />
                                {invalid('phone') && (
                                    <p
                                        className={c('error')}
                                        id={fieldId('phone-error')}
                                    >
                                        {copy.errors.phone}
                                    </p>
                                )}
                            </div>

                            <fieldset className={c('method')}>
                                <legend>{copy.methodLegend}</legend>
                                {copy.methods.map((option) => (
                                    <label key={option.value}>
                                        <input
                                            type='radio'
                                            name={fieldId('method')}
                                            value={option.value}
                                            checked={method === option.value}
                                            onChange={() =>
                                                setMethod(
                                                    option.value as ConsultChatMethod
                                                )
                                            }
                                        />
                                        <span>{option.label}</span>
                                    </label>
                                ))}
                            </fieldset>

                            <div
                                className={`${c('consent')}${invalid('consent') ? ' is-invalid' : ''}`}
                            >
                                <input
                                    id={fieldId('consent')}
                                    type='checkbox'
                                    checked={consent}
                                    onChange={(event) => {
                                        setConsent(event.target.checked)
                                        clearError('consent')
                                    }}
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
                                <p
                                    className={c('error')}
                                    id={fieldId('consent-error')}
                                >
                                    {copy.errors.consent}
                                </p>
                            )}

                            <button
                                type='submit'
                                className={`${c('send')} ${c('send--final')}`}
                                disabled={busy}
                                aria-busy={busy}
                            >
                                {busy ? copy.submitting : copy.submit}
                                <ArrowIcon />
                            </button>

                            {isError && (
                                <p className={c('error')} role='alert'>
                                    {copy.errors.submit}
                                </p>
                            )}
                        </div>
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

function ArrowIcon() {
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

function LockIcon() {
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
