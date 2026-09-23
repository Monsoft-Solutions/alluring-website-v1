'use client'

/**
 * "Message Melissa" — the consultation request, written as a text thread.
 *
 * Visitors arrive from Melissa's bio link, where they already talk to her in
 * DMs, so the form borrows that shape: she asks one question at a time and
 * the first two answers are a single tap. A tap is a cheaper first yes than
 * a name, and by the time the thread asks for a phone number the visitor has
 * already answered twice.
 *
 * Underneath it is an ordinary form posting through the site's contact
 * pipeline (`useContactFormSubmission` → `/api/contact`) with its own lead
 * source, so every request from this page lands tagged as hers. Validation
 * here is deliberately light — the server runs the real phone and consent
 * checks — so the page ships without zod or libphonenumber.
 */

import Image from 'next/image'
import {
    type FormEvent,
    type ReactNode,
    useEffect,
    useRef,
    useState,
} from 'react'

import { useContactFormSubmission } from '@/hooks/useContactFormSubmission.hook'

import type { MjDictionary, MjLang, MjOption } from './mj-copy'
import {
    fill,
    MJ_AVATAR,
    MJ_CHAT_ID,
    MJ_LEAD_STORAGE_KEY,
    MJ_PAGE_PATH,
    MJ_SOURCE,
    MJ_THANK_YOU_PATH,
} from './mj-config'
import { Rich } from '../request-consultation/lp-primitives.component'
import {
    pushDataLayer,
    readAttribution,
} from '../request-consultation/lp-tracking'

type Step = 0 | 1 | 2 | 3
type Method = 'text' | 'call'
type ErrorField = 'firstName' | 'lastName' | 'phone' | 'consent'

const STEP_NAMES = ['procedure', 'timeline', 'name', 'contact'] as const
const TYPING_MS = 700

/** The English labels, because the lead is always read in English. */
interface StaffLabels {
    readonly procedures: readonly MjOption[]
    readonly timelines: readonly MjOption[]
}

interface MjChatFormProps {
    readonly lang: MjLang
    readonly copy: MjDictionary['chat']
    readonly staff: StaffLabels
}

interface Answers {
    readonly procedure: string
    readonly timeline: string
    readonly firstName: string
    readonly lastName: string
}

const labelOf = (options: readonly MjOption[], value: string) =>
    options.find((option) => option.value === value)?.label ?? value

/** US numbers only: ten digits, or eleven with the leading country code. */
function nationalDigits(value: string): string | null {
    const digits = value.replace(/\D/g, '')
    const national =
        digits.length === 11 && digits.startsWith('1')
            ? digits.slice(1)
            : digits
    return /^[2-9]\d{2}[2-9]\d{6}$/.test(national) ? national : null
}

/** Formats as the visitor types: (305) 555-0123. */
function formatPhone(value: string): string {
    let digits = value.replace(/\D/g, '')
    if (digits.length === 11 && digits.startsWith('1')) digits = digits.slice(1)
    digits = digits.slice(0, 10)
    if (digits.length < 4) return digits
    if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

function prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function Bubble({
    from,
    children,
    onChange,
    changeLabel,
}: {
    readonly from: 'melissa' | 'you'
    readonly children: ReactNode
    readonly onChange?: () => void
    readonly changeLabel?: string
}) {
    return (
        <li className={`mj-bubble mj-bubble--${from}`}>
            <p>{children}</p>
            {onChange && (
                <button
                    type='button'
                    className='mj-bubble__change'
                    onClick={onChange}
                >
                    {changeLabel}
                </button>
            )}
        </li>
    )
}

function Chips({
    labelledBy,
    options,
    selected,
    onPick,
}: {
    readonly labelledBy: string
    readonly options: readonly MjOption[]
    readonly selected: string
    readonly onPick: (value: string) => void
}) {
    return (
        <div className='mj-chips' role='group' aria-labelledby={labelledBy}>
            {options.map((option) => (
                <button
                    key={option.value}
                    type='button'
                    className='mj-chip'
                    aria-pressed={selected === option.value}
                    onClick={() => onPick(option.value)}
                >
                    {option.label}
                </button>
            ))}
        </div>
    )
}

export function MjChatForm({ lang, copy, staff }: MjChatFormProps) {
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
    const [method, setMethod] = useState<Method>('text')
    const [consent, setConsent] = useState(false)
    const [errors, setErrors] = useState<ReadonlySet<ErrorField>>(new Set())

    const composerRef = useRef<HTMLDivElement>(null)
    const honeypotRef = useRef<HTMLInputElement>(null)
    const interacted = useRef(false)
    const typingTimer = useRef<number | undefined>(undefined)

    /** Read when the request resolves, not when it began. */
    const leadRef = useRef({ firstName: '', method: 'text' as Method })

    const { submit, isSubmitting, isSuccess, isError } =
        useContactFormSubmission({
            source: MJ_SOURCE,
            enableAnalytics: true,
            analyticsFormName: 'melissa_juvier_chat',
            // A full page load, so the tag container sees a real page view
            // on the thank-you page, as it does for the ads landing page.
            onSuccess: () => {
                try {
                    window.sessionStorage.setItem(
                        MJ_LEAD_STORAGE_KEY,
                        JSON.stringify(leadRef.current)
                    )
                } catch {
                    // The thank-you page falls back to a greeting without a name.
                }
                window.location.assign(`${MJ_THANK_YOU_PATH}?hl=${lang}`)
            },
        })

    useEffect(() => () => window.clearTimeout(typingTimer.current), [])

    /**
     * After Melissa "sends" the next question, put the visitor's focus on its
     * first control and keep the composer on screen. Never on first render:
     * the page must not scroll itself before anyone has touched it.
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
        // The taps are worth reporting; the visitor's name never goes into
        // the data layer.
        pushDataLayer({
            event: 'mj_chat_step',
            step: STEP_NAMES[from],
            lang,
            ...(patch.procedure ? { procedure: patch.procedure } : {}),
            ...(patch.timeline ? { timeline: patch.timeline } : {}),
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
        if (nextErrors.size) return
        answer(2, { firstName: firstName.trim(), lastName: lastName.trim() })
    }

    const submitLead = async () => {
        const national = nationalDigits(phone)
        const nextErrors = new Set<ErrorField>()
        if (!national) nextErrors.add('phone')
        if (!consent) nextErrors.add('consent')
        setErrors(nextErrors)
        if (!national || nextErrors.size) return

        leadRef.current = { firstName: answers.firstName, method }
        pushDataLayer({ event: 'mj_lead_attempt', lang, method })

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
            subject: `Melissa Juvier lead: ${procedureLabel}`,
            message: [
                'Coordinator: Melissa Juvier (her personal page)',
                `Procedure: ${procedureLabel}`,
                `Timeline: ${labelOf(staff.timelines, answers.timeline)}`,
                `Prefers: ${method === 'text' ? 'Text' : 'Call'}`,
                `Preferred language: ${lang === 'es' ? 'Spanish' : 'English'}`,
                `Landing page: ${MJ_PAGE_PATH}`,
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
    const questionId = `mj-q-${STEP_NAMES[step]}`
    const showQuestion = (index: Step) =>
        step > index || (step === index && !typing)

    return (
        <section
            id={MJ_CHAT_ID}
            className='mj-chat'
            aria-labelledby='mj-chat-title'
        >
            <header className='mj-chat__head'>
                <span className='mj-chat__avatar'>
                    <Image
                        src={MJ_AVATAR.src}
                        width={MJ_AVATAR.width}
                        height={MJ_AVATAR.height}
                        sizes='48px'
                        alt=''
                    />
                </span>
                <span className='mj-chat__who'>
                    <h2 id='mj-chat-title' className='mj-chat__title'>
                        {copy.title}
                    </h2>
                    <span className='mj-chat__status'>
                        <span className='mj-dot' aria-hidden='true' />
                        {copy.status}
                    </span>
                </span>
                <span className='mj-chat__step' aria-hidden='true'>
                    {fill(copy.stepLabel, { n: String(step + 1) })}
                </span>
            </header>

            <div className='mj-chat__progress' aria-hidden='true'>
                <span
                    style={{
                        width: `${((step + (typing ? 0 : 1)) / 4) * 100}%`,
                    }}
                />
            </div>

            <ol className='mj-thread' aria-live='polite'>
                <Bubble from='melissa'>{copy.greeting}</Bubble>
                <li className='mj-bubble mj-bubble--melissa'>
                    <p id='mj-q-procedure'>{copy.qProcedure}</p>
                </li>

                {step > 0 && answers.procedure && (
                    <Bubble
                        from='you'
                        onChange={() => goTo(0, false)}
                        changeLabel={copy.change}
                    >
                        {labelOf(copy.procedures, answers.procedure)}
                    </Bubble>
                )}
                {step >= 1 && showQuestion(1) && (
                    <li className='mj-bubble mj-bubble--melissa'>
                        <p id='mj-q-timeline'>{copy.qTimeline}</p>
                    </li>
                )}

                {step > 1 && answers.timeline && (
                    <Bubble
                        from='you'
                        onChange={() => goTo(1, false)}
                        changeLabel={copy.change}
                    >
                        {labelOf(copy.timelines, answers.timeline)}
                    </Bubble>
                )}
                {step >= 2 && showQuestion(2) && (
                    <li className='mj-bubble mj-bubble--melissa'>
                        <p id='mj-q-name'>{copy.qName}</p>
                    </li>
                )}

                {step > 2 && answers.firstName && (
                    <Bubble
                        from='you'
                        onChange={() => goTo(2, false)}
                        changeLabel={copy.change}
                    >
                        {answers.firstName} {answers.lastName}
                    </Bubble>
                )}
                {step >= 3 && showQuestion(3) && (
                    <li className='mj-bubble mj-bubble--melissa'>
                        <p id='mj-q-contact'>
                            {fill(copy.qContact, { name: answers.firstName })}
                        </p>
                    </li>
                )}

                {typing && (
                    <li className='mj-bubble mj-bubble--melissa mj-bubble--typing'>
                        <span className='mj-sr'>{copy.typing}</span>
                        <span className='mj-typing' aria-hidden='true'>
                            <i />
                            <i />
                            <i />
                        </span>
                    </li>
                )}
            </ol>

            <form
                className='mj-composer'
                noValidate
                aria-labelledby={questionId}
                onSubmit={onSubmit}
            >
                <div className='mj-honeypot' aria-hidden='true'>
                    <label htmlFor='_website_mj'>Website</label>
                    <input
                        id='_website_mj'
                        ref={honeypotRef}
                        type='text'
                        name='_website'
                        tabIndex={-1}
                        autoComplete='off'
                    />
                </div>

                <div
                    ref={composerRef}
                    className={`mj-composer__body${typing ? ' is-waiting' : ''}`}
                    inert={typing}
                >
                    {step === 0 && (
                        <Chips
                            labelledBy='mj-q-procedure'
                            options={copy.procedures}
                            selected={answers.procedure}
                            onPick={(procedure) => answer(0, { procedure })}
                        />
                    )}

                    {step === 1 && (
                        <Chips
                            labelledBy='mj-q-timeline'
                            options={copy.timelines}
                            selected={answers.timeline}
                            onPick={(timeline) => answer(1, { timeline })}
                        />
                    )}

                    {step === 2 && (
                        <div className='mj-fields'>
                            <div className='mj-field'>
                                <label htmlFor='mj-first'>
                                    {copy.fieldFirstName}
                                </label>
                                <input
                                    id='mj-first'
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
                                            ? 'mj-first-error'
                                            : undefined
                                    }
                                />
                                {invalid('firstName') && (
                                    <p className='mj-error' id='mj-first-error'>
                                        {copy.errors.firstName}
                                    </p>
                                )}
                            </div>
                            <div className='mj-field'>
                                <label htmlFor='mj-last'>
                                    {copy.fieldLastName}
                                </label>
                                <input
                                    id='mj-last'
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
                                            ? 'mj-last-error'
                                            : undefined
                                    }
                                />
                                {invalid('lastName') && (
                                    <p className='mj-error' id='mj-last-error'>
                                        {copy.errors.lastName}
                                    </p>
                                )}
                            </div>
                            <button type='submit' className='mj-send'>
                                {copy.next}
                                <ArrowIcon />
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className='mj-fields'>
                            <div className='mj-field mj-field--wide'>
                                <label htmlFor='mj-phone'>
                                    {copy.fieldPhone}
                                </label>
                                <input
                                    id='mj-phone'
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
                                            ? 'mj-phone-error'
                                            : undefined
                                    }
                                />
                                {invalid('phone') && (
                                    <p className='mj-error' id='mj-phone-error'>
                                        {copy.errors.phone}
                                    </p>
                                )}
                            </div>

                            <fieldset className='mj-method'>
                                <legend>{copy.methodLegend}</legend>
                                {copy.methods.map((option) => (
                                    <label key={option.value}>
                                        <input
                                            type='radio'
                                            name='mj-method'
                                            value={option.value}
                                            checked={method === option.value}
                                            onChange={() =>
                                                setMethod(
                                                    option.value as Method
                                                )
                                            }
                                        />
                                        <span>{option.label}</span>
                                    </label>
                                ))}
                            </fieldset>

                            <div
                                className={`mj-consent${invalid('consent') ? ' is-invalid' : ''}`}
                            >
                                <input
                                    id='mj-consent'
                                    type='checkbox'
                                    checked={consent}
                                    onChange={(event) => {
                                        setConsent(event.target.checked)
                                        clearError('consent')
                                    }}
                                    aria-invalid={invalid('consent')}
                                    aria-describedby={
                                        invalid('consent')
                                            ? 'mj-consent-error'
                                            : undefined
                                    }
                                />
                                <label htmlFor='mj-consent'>
                                    <Rich parts={copy.consent} />
                                </label>
                            </div>
                            {invalid('consent') && (
                                <p className='mj-error' id='mj-consent-error'>
                                    {copy.errors.consent}
                                </p>
                            )}

                            <button
                                type='submit'
                                className='mj-send mj-send--final'
                                disabled={busy}
                                aria-busy={busy}
                            >
                                {busy ? copy.submitting : copy.submit}
                                <ArrowIcon />
                            </button>

                            {isError && (
                                <p className='mj-error' role='alert'>
                                    {copy.errors.submit}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </form>

            <p className='mj-chat__reassure'>
                <LockIcon />
                {copy.reassure}
            </p>
        </section>
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
