'use client'

/**
 * The thank-you page for the consultation thread (#274).
 *
 * It greets the visitor by first name, says we will text, and — in the
 * evening and at weekends, when two thirds of these leads arrive — says the
 * office is closed and when the text will come. Then it asks five optional
 * one-tap questions. Each answer is saved to the lead the visitor just sent
 * (`PATCH /api/contact`, authorised by the token the thread stored) and
 * reaches the CRM through N8N. None of it goes to analytics.
 *
 * Everything personal comes from `sessionStorage`, written by the thread just
 * before the redirect — never from the URL. The server renders the unnamed
 * greeting without the questions; both appear once the page is running.
 *
 * Marked `translate="no"` with its own Spanish, like the thread: Google
 * Translate rewrites text nodes React keeps re-rendering.
 */

import { Check, Clock } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import {
    type FormEvent,
    useEffect,
    useRef,
    useState,
    useSyncExternalStore,
} from 'react'

import type {
    ConsultChatLang,
    ConsultChatLead,
} from '@/components/shared/consult-chat/consult-chat.types'
import { fill } from '@/components/shared/consult-chat/consult-chat.util'
import { usePageLanguage } from '@/components/shared/consult-chat/use-page-language.hook'
import {
    LEAD_CONSULT_TYPES,
    LEAD_FINANCING_INTEREST,
    LEAD_HEARD_FROM,
    LEAD_TEXT_TIMES,
    type LeadConsultType,
    type LeadFinancingInterest,
    type LeadHeardFrom,
    type LeadTextTime,
} from '@/lib/constants/lead-fields'
import { getPhoneLink, getSmsLink, siteConfig } from '@/lib/data/site-config'
import { officeStatus } from '@/lib/utils/office-hours.util'

interface Answers {
    readonly consultType?: LeadConsultType
    readonly financingInterest?: LeadFinancingInterest
    readonly preferredContactTime?: LeadTextTime
    readonly email?: string
    readonly heardFrom?: LeadHeardFrom
}

/** The thread's stored lead, plus the answers given on this page. */
interface StoredLead extends ConsultChatLead {
    readonly answers?: Answers
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

const SAVE_DELAY_MS = 700
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const COPY = {
    en: {
        eyebrow: 'Request received',
        headingNamed: 'Got it, {name}.',
        heading: 'Got it.',
        body: 'We’ll text you within 24 hours to book your free consultation. Keep an eye on your messages.',
        closed: 'Our Miami office is closed right now, so expect our text {when} after {time} ET{local}.',
        today: 'today',
        tomorrow: 'tomorrow',
        yourTime: ' ({time} your time)',
        questionsTitle: 'Help us prepare',
        questionsNote:
            'Optional. A few taps and your coordinator comes ready. Each answer saves on its own.',
        consultType: 'Video or in person?',
        consultTypes: { video: 'Video', 'in-person': 'In person in Miami' },
        financing: 'Interested in financing?',
        financingOptions: { yes: 'Yes', no: 'No', 'not-sure': 'Not sure' },
        textTime: 'Best time to text you?',
        textTimes: {
            morning: 'Morning',
            afternoon: 'Afternoon',
            evening: 'Evening',
        },
        email: 'Want your quote by email too?',
        emailPlaceholder: 'you@email.com',
        emailSave: 'Save',
        emailError: 'Enter a valid email address.',
        heard: 'How did you hear about us?',
        heardOptions: {
            instagram: 'Instagram',
            tiktok: 'TikTok',
            google: 'Google',
            friend: 'A friend',
            other: 'Other',
        },
        saving: 'Saving…',
        saved: 'Saved to your request',
        saveError: 'That didn’t save. Please try again.',
        nextTitle: 'What happens next',
        next: [
            'We text you to answer your first questions and find a time.',
            'Your free consultation — in person in Miami, or by video from anywhere in the U.S.',
            'Your price and your dates, in writing, with no obligation.',
        ],
        textUs: 'Questions before then? Text us at',
        callUs: 'Questions before then? Call',
    },
    es: {
        eyebrow: 'Solicitud recibida',
        headingNamed: 'Listo, {name}.',
        heading: 'Listo.',
        body: 'Te escribimos por texto en menos de 24 horas para agendar tu consulta gratis. Pendiente a tus mensajes.',
        closed: 'Nuestra oficina en Miami está cerrada ahora, así que espera nuestro mensaje {when} después de las {time} (hora del Este){local}.',
        today: 'hoy',
        tomorrow: 'mañana',
        yourTime: ' ({time} en tu hora)',
        questionsTitle: 'Ayúdanos a prepararnos',
        questionsNote:
            'Opcional. Unos toques y tu coordinadora llega preparada. Cada respuesta se guarda sola.',
        consultType: '¿Por video o en persona?',
        consultTypes: {
            video: 'Por video',
            'in-person': 'En persona en Miami',
        },
        financing: '¿Te interesa financiar?',
        financingOptions: { yes: 'Sí', no: 'No', 'not-sure': 'No sé' },
        textTime: '¿A qué hora prefieres que te escribamos?',
        textTimes: {
            morning: 'En la mañana',
            afternoon: 'En la tarde',
            evening: 'En la noche',
        },
        email: '¿Quieres tu cotización por correo también?',
        emailPlaceholder: 'tu@correo.com',
        emailSave: 'Guardar',
        emailError: 'Escribe un correo válido.',
        heard: '¿Cómo nos conociste?',
        heardOptions: {
            instagram: 'Instagram',
            tiktok: 'TikTok',
            google: 'Google',
            friend: 'Una amiga o amigo',
            other: 'Otro',
        },
        saving: 'Guardando…',
        saved: 'Guardado en tu solicitud',
        saveError: 'No se guardó. Inténtalo de nuevo.',
        nextTitle: 'Lo que sigue',
        next: [
            'Te escribimos para responder tus primeras preguntas y buscar una fecha.',
            'Tu consulta gratis: en persona en Miami o por video desde cualquier lugar de EE. UU.',
            'Tu precio y tus fechas, por escrito y sin compromiso.',
        ],
        textUs: '¿Preguntas antes? Escríbenos al',
        callUs: '¿Preguntas antes? Llama al',
    },
} as const

const NOTHING = ''
const noSubscription = () => () => {}

function readStoredRaw(key: string): string {
    try {
        return window.sessionStorage.getItem(key) ?? NOTHING
    } catch {
        return NOTHING
    }
}

function parseStored(raw: string): StoredLead | null {
    if (!raw) return null
    try {
        const value = JSON.parse(raw) as Partial<StoredLead>
        const lead =
            typeof value.lead?.id === 'string' &&
            typeof value.lead.token === 'string'
                ? { id: value.lead.id, token: value.lead.token }
                : undefined
        return {
            firstName:
                typeof value.firstName === 'string' ? value.firstName : '',
            lead,
            answers:
                value.answers && typeof value.answers === 'object'
                    ? value.answers
                    : undefined,
        }
    } catch {
        return null
    }
}

/** "9:00 AM" in a time zone, in the page's language. */
function clockTime(
    instant: Date,
    lang: ConsultChatLang,
    timeZone?: string
): string {
    return new Intl.DateTimeFormat(lang === 'es' ? 'es-US' : 'en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone,
    }).format(instant)
}

/** The after-hours line, or null while the office is open. */
function useClosedNotice(lang: ConsultChatLang): string | null {
    // Read once the page is running: the server cannot know the visitor's
    // clock, and the answer only changes at opening time.
    const status = useSyncExternalStore(
        noSubscription,
        () => cachedStatus(),
        () => null
    )
    if (!status || status.open) return null

    const copy = COPY[lang]
    const officeZone = siteConfig.contact.timezone
    const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const officeTime = clockTime(status.opensAt, lang, officeZone)
    const localTime = clockTime(status.opensAt, lang, localZone)
    const when =
        status.daysAhead === 0
            ? copy.today
            : status.daysAhead === 1
              ? copy.tomorrow
              : new Intl.DateTimeFormat(lang === 'es' ? 'es-US' : 'en-US', {
                    weekday: 'long',
                    timeZone: officeZone,
                }).format(status.opensAt)
    return fill(copy.closed, {
        when,
        time: officeTime,
        local:
            localTime === officeTime
                ? ''
                : fill(copy.yourTime, { time: localTime }),
    })
}

let statusCache: ReturnType<typeof officeStatus> | undefined
/** Stable between renders, as `useSyncExternalStore` requires. */
function cachedStatus() {
    if (statusCache === undefined) statusCache = officeStatus()
    return statusCache
}

/**
 * Lines a page can replace in its own voice. The ads landing page says
 * "private" where the site says "free" (see its `lp-copy.ts`).
 */
export interface ConsultationThankYouCopyOverride {
    readonly body?: string
    readonly next?: readonly string[]
}

export function ConsultationThankYou({
    leadStorageKey,
    copyOverride,
    compact = false,
    lang: langProp,
}: {
    /** Where the thread stored the lead (`ConsultChat`'s `leadStorageKey`). */
    readonly leadStorageKey: string
    readonly copyOverride?: Readonly<
        Partial<Record<ConsultChatLang, ConsultationThankYouCopyOverride>>
    >
    /**
     * Less room above the heading, for a page with its own static header
     * rather than the site's fixed one.
     */
    readonly compact?: boolean
    /**
     * The page's own language, for a page that sets it itself (the ads
     * landing page). Without it the section follows Google Translate.
     */
    readonly lang?: ConsultChatLang
}) {
    const pageLang = usePageLanguage()
    const lang = langProp ?? pageLang
    const copy = { ...COPY[lang], ...copyOverride?.[lang] }

    const raw = useSyncExternalStore(
        noSubscription,
        () => readStoredRaw(leadStorageKey),
        () => NOTHING
    )
    const stored = parseStored(raw)
    const name = stored?.firstName.trim()
    const closedNotice = useClosedNotice(lang)

    const smsLink = getSmsLink()
    const textDisplay =
        siteConfig.contact.textPhoneDisplay ?? siteConfig.contact.textPhone

    return (
        <section
            id='thank-you-hero'
            aria-labelledby='thank-you-title'
            className={cn(
                'relative overflow-hidden bg-stone-900 px-4 pb-16 sm:pb-24',
                compact ? 'pt-12 sm:pt-16' : 'pt-28 sm:pt-36'
            )}
            translate='no'
        >
            <div
                className='pointer-events-none absolute inset-0'
                aria-hidden='true'
            >
                <div className='absolute inset-0 bg-linear-to-br from-stone-900 via-stone-800 to-stone-900' />
                <div className='bg-gold-600/10 absolute -top-[20%] left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full blur-3xl' />
            </div>

            <div className='relative mx-auto max-w-xl'>
                <p className='text-gold-400 flex items-center gap-2 text-[11px] font-bold tracking-[0.18em] uppercase'>
                    <span className='grid h-5 w-5 place-items-center rounded-full bg-emerald-500/20 text-emerald-400'>
                        <Check className='h-3 w-3' aria-hidden='true' />
                    </span>
                    {copy.eyebrow}
                </p>
                <h1
                    id='thank-you-title'
                    className='mt-4 font-serif text-4xl leading-tight text-stone-50 sm:text-5xl'
                >
                    {name ? fill(copy.headingNamed, { name }) : copy.heading}
                </h1>
                <p className='mt-4 text-lg leading-relaxed text-stone-200'>
                    {copy.body}
                </p>
                {closedNotice && (
                    <p className='mt-4 flex gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-relaxed text-stone-300'>
                        <Clock
                            className='text-gold-400 mt-0.5 h-4 w-4 flex-none'
                            aria-hidden='true'
                        />
                        {closedNotice}
                    </p>
                )}

                {stored?.lead && (
                    <LeadQuestions
                        lang={lang}
                        lead={stored.lead}
                        storageKey={leadStorageKey}
                        stored={stored}
                    />
                )}

                <div className='mt-10'>
                    <h2 className='text-gold-400 text-[11px] font-bold tracking-[0.18em] uppercase'>
                        {copy.nextTitle}
                    </h2>
                    <ol className='mt-4 grid gap-3'>
                        {copy.next.map((item, index) => (
                            <li
                                key={item}
                                className='flex gap-3 text-base leading-relaxed text-stone-300'
                            >
                                <span className='text-gold-400 w-4 flex-none font-serif text-xl leading-6'>
                                    {index + 1}
                                </span>
                                {item}
                            </li>
                        ))}
                    </ol>
                </div>

                <p className='mt-10 text-sm text-stone-400'>
                    {smsLink ? (
                        <>
                            {copy.textUs}{' '}
                            <a
                                href={smsLink}
                                className='text-gold-400 font-semibold underline underline-offset-2'
                            >
                                {textDisplay}
                            </a>
                        </>
                    ) : (
                        <>
                            {copy.callUs}{' '}
                            <a
                                href={getPhoneLink()}
                                className='text-gold-400 font-semibold underline underline-offset-2'
                            >
                                {siteConfig.contact.phoneDisplay}
                            </a>
                        </>
                    )}
                </p>
            </div>
        </section>
    )
}

function LeadQuestions({
    lang,
    lead,
    storageKey,
    stored,
}: {
    readonly lang: ConsultChatLang
    readonly lead: NonNullable<ConsultChatLead['lead']>
    readonly storageKey: string
    readonly stored: StoredLead
}) {
    const copy = COPY[lang]
    const [local, setLocal] = useState<Answers | null>(null)
    const answers = local ?? stored.answers ?? {}
    const [emailDraft, setEmailDraft] = useState<string | null>(null)
    const email = emailDraft ?? answers.email ?? ''
    const [emailInvalid, setEmailInvalid] = useState(false)
    const [saveState, setSaveState] = useState<SaveState>('idle')

    const latest = useRef<Answers>(answers)
    const dirty = useRef(false)
    const timer = useRef<number | undefined>(undefined)

    /**
     * Sends every answer so far; the last save for a lead is the full one.
     * Always `keepalive`, so a save already on its way survives the visitor
     * leaving the page (the payload is far below the keepalive limit).
     */
    const flush = async () => {
        window.clearTimeout(timer.current)
        if (!dirty.current) return
        dirty.current = false
        setSaveState('saving')
        try {
            const response = await fetch('/api/contact', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...lead, ...latest.current }),
                keepalive: true,
            })
            if (!response.ok) throw new Error(`HTTP ${response.status}`)
            setSaveState('saved')
        } catch {
            dirty.current = true
            setSaveState('error')
        }
    }

    // A tap in the last moment before leaving still reaches the lead.
    useEffect(() => {
        const onHide = () => void flush()
        window.addEventListener('pagehide', onHide)
        return () => {
            window.removeEventListener('pagehide', onHide)
            window.clearTimeout(timer.current)
        }
        // `flush` reads refs only; binding it once is intended.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const answer = (patch: Answers) => {
        const next = { ...answers, ...patch }
        setLocal(next)
        latest.current = next
        dirty.current = true
        try {
            window.sessionStorage.setItem(
                storageKey,
                JSON.stringify({ ...stored, answers: next })
            )
        } catch {
            // Answers still save to the lead; a reload just forgets the taps.
        }
        window.clearTimeout(timer.current)
        timer.current = window.setTimeout(() => void flush(), SAVE_DELAY_MS)
    }

    const saveEmail = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const value = email.trim()
        if (!EMAIL_PATTERN.test(value)) {
            setEmailInvalid(true)
            return
        }
        setEmailInvalid(false)
        answer({ email: value })
    }

    return (
        <div className='mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6'>
            <div className='flex flex-wrap items-baseline justify-between gap-2'>
                <h2 className='font-serif text-2xl text-stone-50'>
                    {copy.questionsTitle}
                </h2>
                <p
                    className='min-h-5 text-xs font-semibold text-stone-400'
                    role='status'
                    aria-live='polite'
                >
                    {saveState === 'saving' && copy.saving}
                    {saveState === 'saved' && (
                        <span className='inline-flex items-center gap-1 text-emerald-400'>
                            <Check className='h-3.5 w-3.5' aria-hidden='true' />
                            {copy.saved}
                        </span>
                    )}
                    {saveState === 'error' && (
                        <span className='text-red-300'>{copy.saveError}</span>
                    )}
                </p>
            </div>
            <p className='mt-1 text-sm text-stone-400'>{copy.questionsNote}</p>

            <div className='mt-5 grid gap-6'>
                <ChipQuestion
                    id='consult-type'
                    question={copy.consultType}
                    options={LEAD_CONSULT_TYPES}
                    labels={copy.consultTypes}
                    selected={answers.consultType}
                    onPick={(consultType) => answer({ consultType })}
                />
                <ChipQuestion
                    id='financing'
                    question={copy.financing}
                    options={LEAD_FINANCING_INTEREST}
                    labels={copy.financingOptions}
                    selected={answers.financingInterest}
                    onPick={(financingInterest) =>
                        answer({ financingInterest })
                    }
                />
                <ChipQuestion
                    id='text-time'
                    question={copy.textTime}
                    options={LEAD_TEXT_TIMES}
                    labels={copy.textTimes}
                    selected={answers.preferredContactTime}
                    onPick={(preferredContactTime) =>
                        answer({ preferredContactTime })
                    }
                />

                <form noValidate onSubmit={saveEmail}>
                    <label
                        htmlFor='thank-you-email'
                        className='text-sm font-semibold text-stone-100'
                    >
                        {copy.email}
                    </label>
                    <div className='mt-3 flex gap-2'>
                        <input
                            id='thank-you-email'
                            type='email'
                            inputMode='email'
                            autoComplete='email'
                            enterKeyHint='done'
                            placeholder={copy.emailPlaceholder}
                            value={email}
                            onChange={(event) => {
                                setEmailDraft(event.target.value)
                                setEmailInvalid(false)
                            }}
                            aria-invalid={emailInvalid}
                            aria-describedby={
                                emailInvalid
                                    ? 'thank-you-email-error'
                                    : undefined
                            }
                            className='focus:border-gold-400 focus:ring-gold-400/25 h-12 min-w-0 flex-1 rounded-xl border border-white/15 bg-black/30 px-4 text-base text-stone-50 placeholder:text-stone-500 focus:ring-2 focus:outline-none aria-invalid:border-red-400'
                        />
                        <button
                            type='submit'
                            className='border-gold-500/50 text-gold-300 hover:bg-gold-500/10 h-12 rounded-xl border px-5 text-sm font-bold'
                        >
                            {copy.emailSave}
                        </button>
                    </div>
                    {emailInvalid && (
                        <p
                            id='thank-you-email-error'
                            className='mt-2 text-sm text-red-300'
                        >
                            {copy.emailError}
                        </p>
                    )}
                </form>

                <ChipQuestion
                    id='heard-from'
                    question={copy.heard}
                    options={LEAD_HEARD_FROM}
                    labels={copy.heardOptions}
                    selected={answers.heardFrom}
                    onPick={(heardFrom) => answer({ heardFrom })}
                />
            </div>
        </div>
    )
}

function ChipQuestion<T extends string>({
    id,
    question,
    options,
    labels,
    selected,
    onPick,
}: {
    readonly id: string
    readonly question: string
    readonly options: readonly T[]
    readonly labels: Readonly<Record<T, string>>
    readonly selected: T | undefined
    readonly onPick: (value: T) => void
}) {
    const labelId = `thank-you-q-${id}`
    return (
        <div>
            <p id={labelId} className='text-sm font-semibold text-stone-100'>
                {question}
            </p>
            <div
                role='group'
                aria-labelledby={labelId}
                className='mt-3 flex flex-wrap gap-2'
            >
                {options.map((option) => {
                    const pressed = selected === option
                    return (
                        <button
                            key={option}
                            type='button'
                            aria-pressed={pressed}
                            onClick={() => onPick(option)}
                            className={`min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors ${
                                pressed
                                    ? 'from-gold-300 to-gold-500 border-transparent bg-linear-to-br text-stone-950'
                                    : 'border-gold-500/40 hover:border-gold-400 text-[#f5e8c9]'
                            }`}
                        >
                            {labels[option]}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
