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
 * Underneath it is an ordinary form posting through the site's contact
 * pipeline (`useContactFormSubmission` → `/api/contact`), so it reports the
 * shared lead funnel (#272) and every lead lands tagged with its page's
 * source. The procedure and timeline go into the staff note and the lead
 * record, never into analytics.
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
    useSyncExternalStore,
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

import { publishConsultChatProgress } from './consult-chat-progress'
import type {
    ConsultChatCopy,
    ConsultChatLang,
    ConsultChatLead,
    ConsultChatStaffLabels,
} from './consult-chat.types'
import {
    fill,
    formatPhone,
    labelOf,
    nationalDigits,
    parseSavedThread,
    prefersReducedMotion,
    readSavedThreadRaw,
    type SavedThread,
    splitName,
    visitorTimeZone,
    writeSavedThread,
} from './consult-chat.util'

type Step = 0 | 1 | 2
type ErrorField = 'name' | 'phone' | 'consent'

const STEP_NAMES = ['procedure', 'timeline', 'contact'] as const
const TOTAL_STEPS = STEP_NAMES.length
const LAST_STEP: Step = 2
const TYPING_MS = 700

interface Answers {
    readonly procedure: string
    readonly timeline: string
}

/** Everything the visitor has told the thread, and where they are in it. */
interface Thread {
    readonly step: Step
    readonly answers: Answers
    readonly name: string
}

const noSubscription = () => () => {}

/** The first step after `from` still missing an answer. */
function nextOpenStep(from: number, answers: Answers): Step {
    const done = [Boolean(answers.procedure), Boolean(answers.timeline)]
    for (let index = from + 1; index < LAST_STEP; index++) {
        if (!done[index]) return index as Step
    }
    return LAST_STEP
}

/** A saved thread, with answers the current options no longer offer dropped. */
function restoreThread(
    saved: SavedThread | null,
    copy: ConsultChatCopy
): Thread | null {
    if (!saved) return null
    const offered = (options: ConsultChatCopy['procedures'], value: string) =>
        options.some((option) => option.value === value) ? value : ''
    const answers = {
        procedure: offered(copy.procedures, saved.procedure),
        timeline: offered(copy.timelines, saved.timeline),
    }
    if (!answers.procedure && !answers.timeline && !saved.name) return null
    return { step: nextOpenStep(-1, answers), answers, name: saved.name }
}

const EMPTY_THREAD: Thread = {
    step: 0,
    answers: { procedure: '', timeline: '' },
    name: '',
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
    /** `sessionStorage` key the thank-you page reads the lead from. */
    readonly leadStorageKey: string
    /** Subject line staff see, given the procedure's English label. */
    readonly subject: (procedureLabel: string) => string
    /** Lines added to the top of the staff note (who, which page, offer). */
    readonly noteLines: readonly string[]
    /** Title of the promotion shown with the thread, stored on the lead. */
    readonly offer?: string
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
    /**
     * Merged into both `dataLayerEvents` pushes: the ads landing page adds its
     * page version and ad group, which its conversion reporting splits by.
     */
    readonly dataLayerContext?: Readonly<Record<string, string>>
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
    offer,
    intro,
    defaultProcedure = '',
    classPrefix = 'cc',
    dataLayerEvents,
    dataLayerContext,
}: ConsultChatProps) {
    const c = (name: string) => `${classPrefix}-${name}`
    const titleId = `${id}-title`
    const qId = (step: Step) => `${id}-q-${STEP_NAMES[step]}`
    const fieldId = (name: string) => `${id}-${name}`
    const threadKey = `consult-chat:${id}`

    // Until the visitor touches the thread, it shows what they told it
    // earlier in this tab. The server always renders a fresh thread.
    const savedRaw = useSyncExternalStore(
        noSubscription,
        () => readSavedThreadRaw(threadKey),
        () => ''
    )
    const [touched, setTouched] = useState<Thread | null>(null)
    const thread =
        touched ??
        restoreThread(parseSavedThread(savedRaw), copy) ??
        EMPTY_THREAD
    const { step, answers, name } = thread

    const [typing, setTyping] = useState(false)
    const [phone, setPhone] = useState('')
    const [consent, setConsent] = useState(false)
    const [errors, setErrors] = useState<ReadonlySet<ErrorField>>(new Set())

    const composerRef = useRef<HTMLDivElement>(null)
    const phoneRef = useRef<HTMLInputElement>(null)
    const honeypotRef = useRef<HTMLInputElement>(null)
    const interacted = useRef(false)
    const typingTimer = useRef<number | undefined>(undefined)

    /** Read when the request resolves, not when it began. */
    const firstNameRef = useRef('')

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
        onSuccess: (result) => {
            writeSavedThread(threadKey, null)
            const lead: ConsultChatLead = {
                firstName: firstNameRef.current,
                ...(result.lead && { lead: result.lead }),
            }
            try {
                window.sessionStorage.setItem(
                    leadStorageKey,
                    JSON.stringify(lead)
                )
            } catch {
                // The thank-you page falls back to a greeting without a name.
            }
            const separator = thankYouPath.includes('?') ? '&' : '?'
            window.location.assign(`${thankYouPath}${separator}hl=${lang}`)
        },
    })

    useEffect(() => () => window.clearTimeout(typingTimer.current), [])

    /** The sticky bar and the closing block read how far the visitor has got. */
    const answered = [answers.procedure, answers.timeline].filter(
        Boolean
    ).length
    useEffect(() => {
        publishConsultChatProgress({ id, answered, total: TOTAL_STEPS })
    }, [answered, id])

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

    const update = (next: Thread) => {
        setTouched(next)
        writeSavedThread(threadKey, { ...next.answers, name: next.name })
    }

    const goTo = (target: Step, withTyping: boolean, next: Thread = thread) => {
        interacted.current = true
        update({ ...next, step: target })
        if (!withTyping || prefersReducedMotion()) return
        setTyping(true)
        window.clearTimeout(typingTimer.current)
        typingTimer.current = window.setTimeout(
            () => setTyping(false),
            TYPING_MS
        )
    }

    const answer = (from: Step, patch: Partial<Answers>) => {
        const next = { ...thread, answers: { ...answers, ...patch } }
        // Which step was answered is worth reporting; the answer is not.
        // Procedure interest and names stay out of the data layer, where
        // every tag in the container can read them (#272).
        if (dataLayerEvents) {
            pushDataLayer({
                event: dataLayerEvents.step,
                step: STEP_NAMES[from],
                lang,
                ...dataLayerContext,
            })
        }
        trackLeadFormEvent(LEAD_FORM_EVENTS.STEP, formName, {
            step: STEP_NAMES[from],
            step_index: from + 1,
        })
        goTo(nextOpenStep(from, next.answers), true, next)
    }

    /**
     * A link elsewhere on the page can answer the first question for the
     * visitor: `<a href="#<id>" data-consult-procedure="bbl">` (the home
     * page's hero chips and procedure picker). The link still jumps to the
     * thread; the thread just opens on its next question, with the reply to
     * that procedure already given. Values the thread doesn't offer are
     * ignored, so a stale link falls back to the plain jump.
     */
    const answerRef = useRef(answer)
    useEffect(() => {
        answerRef.current = answer
    })
    useEffect(() => {
        const onClick = (event: MouseEvent) => {
            if (!(event.target instanceof Element)) return
            const link = event.target.closest<HTMLAnchorElement>(
                `a[href="#${id}"][data-consult-procedure]`
            )
            const value = link?.dataset.consultProcedure
            if (!value) return
            if (!copy.procedures.some((option) => option.value === value)) {
                return
            }
            answerRef.current(0, { procedure: value })
        }
        document.addEventListener('click', onClick)
        return () => document.removeEventListener('click', onClick)
    }, [id, copy.procedures])

    const invalid = (field: ErrorField) => errors.has(field)

    /** An error goes away as soon as the visitor starts fixing it. */
    const clearError = (field: ErrorField) => {
        if (!errors.has(field)) return
        const next = new Set(errors)
        next.delete(field)
        setErrors(next)
    }

    const submitLead = async () => {
        const fullName = name.trim().replace(/\s+/g, ' ')
        const national = nationalDigits(phone)
        const nextErrors = new Set<ErrorField>()
        if (fullName.length < 2) nextErrors.add('name')
        if (!national) nextErrors.add('phone')
        if (!consent) nextErrors.add('consent')
        setErrors(nextErrors)
        if (!national || nextErrors.size) {
            trackValidationErrors([...nextErrors])
            return
        }

        const { firstName, lastName } = splitName(fullName)
        firstNameRef.current = firstName
        if (dataLayerEvents) {
            pushDataLayer({
                event: dataLayerEvents.attempt,
                lang,
                method: 'text',
                ...dataLayerContext,
            })
        }

        const procedureLabel = labelOf(staff.procedures, answers.procedure)
        const campaign = readAttribution()
        const timeZone = visitorTimeZone()

        await submit({
            firstName,
            lastName: lastName || undefined,
            name: fullName,
            phone: formatPhone(national),
            procedure: answers.procedure,
            consentGiven: true,
            _website: honeypotRef.current?.value ?? '',
            subject: subject(procedureLabel),
            message: [
                ...noteLines,
                `Procedure: ${procedureLabel}`,
                `Timeline: ${labelOf(staff.timelines, answers.timeline)}`,
                `Preferred language: ${lang === 'es' ? 'Spanish' : 'English'}`,
                ...(timeZone
                    ? [
                          `Visitor time zone: ${timeZone.zone}${timeZone.short ? ` (${timeZone.short})` : ''}`,
                      ]
                    : []),
            ].join('\n'),
            // Stored on the lead and sent to the CRM; never to analytics.
            timeline: answers.timeline,
            language: lang,
            offer,
            timeZone: timeZone?.zone,
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
        if (step === LAST_STEP) void submitLead()
    }

    const busy = isSubmitting || isSuccess
    const showQuestion = (index: Step) =>
        step > index || (step === index && !typing)
    const selectedProcedure = answers.procedure || defaultProcedure
    const reply = procedureReply(copy, answers.procedure)

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
                        onChange={() => goTo(1, false)}
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

                    {step === LAST_STEP && (
                        <div className={c('fields')}>
                            <div
                                className={`${c('field')} ${c('field--wide')}`}
                            >
                                <label htmlFor={fieldId('name')}>
                                    {copy.fieldName}
                                </label>
                                <input
                                    id={fieldId('name')}
                                    type='text'
                                    autoComplete='name'
                                    autoCapitalize='words'
                                    enterKeyHint='next'
                                    value={name}
                                    onChange={(event) => {
                                        update({
                                            ...thread,
                                            name: event.target.value,
                                        })
                                        clearError('name')
                                    }}
                                    onKeyDown={(event) => {
                                        // Enter moves on to the number
                                        // rather than sending half a form.
                                        if (event.key !== 'Enter') return
                                        event.preventDefault()
                                        phoneRef.current?.focus()
                                    }}
                                    aria-invalid={invalid('name')}
                                    aria-describedby={
                                        invalid('name')
                                            ? fieldId('name-error')
                                            : undefined
                                    }
                                />
                                {invalid('name') && (
                                    <p
                                        className={c('error')}
                                        id={fieldId('name-error')}
                                    >
                                        {copy.errors.name}
                                    </p>
                                )}
                            </div>

                            <div
                                className={`${c('field')} ${c('field--wide')}`}
                            >
                                <label htmlFor={fieldId('phone')}>
                                    {copy.fieldPhone}
                                </label>
                                <input
                                    id={fieldId('phone')}
                                    ref={phoneRef}
                                    type='tel'
                                    inputMode='tel'
                                    autoComplete='tel'
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
