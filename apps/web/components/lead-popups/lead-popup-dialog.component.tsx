/**
 * LeadPopupDialog
 *
 * The lead popup itself, fetched only once a trigger fires
 * (`lead-popups.component.tsx`). On a phone it is a bottom sheet; from `md`
 * a centred card. Either way it is a native modal `<dialog>`: it sits in the
 * top layer above the header, the chat bubble and the call button, keeps
 * focus inside, and closes on Escape and on Android's back gesture.
 *
 * Two steps, like the consultation thread it borrows its voice from:
 *
 * 1. The offer — the promotion, or "your questions, answered by text" — and
 *    one button. Tapping it is a cheap first yes, and it keeps the sheet
 *    short enough to leave the page visible behind it.
 * 2. Name, mobile number and the SMS consent every other lead form asks for,
 *    so the coordinators may text these leads too.
 *
 * A lead goes through the site's contact pipeline
 * (`useContactFormSubmission` → `/api/contact`) under its old source
 * (`exit-intent` or `promo-modal`), with a staff note and the promotion's
 * title, then lands on the consultation thank-you page with a full page load
 * (the tag container needs a real page view there).
 *
 * No react-hook-form or zod: validation is the thread's light check, and the
 * server runs the real one. That keeps this chunk small on a slow phone.
 */
'use client'

import { cn } from '@workspace/ui/lib/utils'
import { ArrowRight, Check, Clock, Lock, X } from 'lucide-react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
    type FormEvent,
    type FocusEvent,
    type MouseEvent,
    type ReactNode,
    useEffect,
    useId,
    useRef,
    useState,
} from 'react'
import { flushSync } from 'react-dom'

import { Rich } from '@/components/landing-pages/request-consultation/lp-primitives.component'
import { PromotionMarkdownClient } from '@/components/promotions/promotion-markdown.component'
import type {
    ConsultChatLang,
    ConsultChatLead,
} from '@/components/shared/consult-chat/consult-chat.types'
import {
    formatPhone,
    nationalDigits,
    splitName,
    visitorTimeZone,
} from '@/components/shared/consult-chat/consult-chat.util'
import {
    SITE_CHAT_LEAD_KEY,
    SITE_CHAT_THANK_YOU_PATH,
} from '@/components/shared/consult-chat/site-chat.constants'
import { usePageLanguage } from '@/components/shared/consult-chat/use-page-language.hook'
import { useContactFormSubmission } from '@/hooks/useContactFormSubmission.hook'
import { trackEvent } from '@/lib/analytics/analytics.client'
import {
    LEAD_FORM_EVENTS,
    trackLeadFormEvent,
} from '@/lib/analytics/lead-form-tracking'
import type { ContactSource } from '@/lib/types/forms/contact-form.type'

import { LEAD_POPUP_COPY } from './lead-popup-copy'
import type {
    LeadPopupKind,
    LeadPopupPromotion,
    LeadPopupTrigger,
} from './lead-popup.types'

/** The lead sources these popups have always reported. */
const SOURCES: Record<LeadPopupKind, ContactSource> = {
    exit_intent: 'exit-intent',
    promo_modal: 'promo-modal',
}

/** How the popup opened, for the staff note. */
const TRIGGER_NOTES: Record<LeadPopupTrigger, string> = {
    exit_intent: 'pointer leaving the page (desktop)',
    scroll_up: 'scrolling back up (phone)',
    timer: 'time on the site',
}

/**
 * Pages written in Spanish. The root layout still marks them `lang="en"`,
 * so the page's language alone would put an English popup over them.
 */
const SPANISH_PAGES = ['/consulta-gratis'] as const

/** Collapsed height of the promotion's details, in lines. */
const EXCERPT_LINES = 3

type Step = 'offer' | 'contact'
type Field = 'name' | 'phone' | 'consent'
type DismissMethod = 'close_button' | 'backdrop' | 'escape' | 'no_thanks'

export type LeadPopupDialogProps = {
    kind: LeadPopupKind
    /** Present when `kind` is `promo_modal`. */
    promotion: LeadPopupPromotion | null
    /** Which trigger opened the popup, for the impression event. */
    trigger: LeadPopupTrigger
    /** The visitor closed it. */
    onClose: () => void
}

export function LeadPopupDialog({
    kind,
    promotion,
    trigger,
    onClose,
}: LeadPopupDialogProps) {
    const pageLang = usePageLanguage()
    const pathname = usePathname()
    const lang: ConsultChatLang =
        pageLang === 'es' ||
        SPANISH_PAGES.some((page) => pathname?.startsWith(page))
            ? 'es'
            : 'en'
    const copy = LEAD_POPUP_COPY[lang]
    const offer = kind === 'promo_modal' ? promotion : null
    const source = SOURCES[kind]

    const id = useId()
    const titleId = `${id}-title`
    const fieldId = (name: string) => `${id}-${name}`

    const [step, setStep] = useState<Step>('offer')
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [consent, setConsent] = useState(false)
    const [errors, setErrors] = useState<ReadonlySet<Field>>(new Set())

    const dialogRef = useRef<HTMLDialogElement>(null)
    const nameRef = useRef<HTMLInputElement>(null)
    const phoneRef = useRef<HTMLInputElement>(null)
    const honeypotRef = useRef<HTMLInputElement>(null)
    const firstNameRef = useRef('')
    const pressedBackdrop = useRef(false)

    const {
        submit,
        isSubmitting,
        isSuccess,
        isError,
        formRef,
        trackValidationErrors,
    } = useContactFormSubmission({
        source,
        onSuccess: (result) => {
            const lead: ConsultChatLead = {
                firstName: firstNameRef.current,
                ...(result.lead && { lead: result.lead }),
            }
            try {
                window.sessionStorage.setItem(
                    SITE_CHAT_LEAD_KEY,
                    JSON.stringify(lead)
                )
            } catch {
                // The thank-you page falls back to a greeting without a name.
            }
            window.location.assign(`${SITE_CHAT_THANK_YOU_PATH}?hl=${lang}`)
        },
    })

    // Opens as a modal and locks the page behind it while it is up.
    useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog) return
        if (!dialog.open) dialog.showModal()
        // Focus starts on the dialog itself, so a screen reader announces
        // its title and no focus ring lands on a button nobody pressed.
        dialog.focus({ preventScroll: true })
        const root = document.documentElement
        const overflow = root.style.overflow
        root.style.overflow = 'hidden'
        return () => {
            root.style.overflow = overflow
            if (dialog.open) dialog.close()
        }
    }, [])

    // Keeps the sheet above the on-screen keyboard. A fixed element sits on
    // the layout viewport, which the keyboard does not shrink on iOS (nor on
    // Android by default), so the sheet follows the visual viewport instead.
    useEffect(() => {
        const dialog = dialogRef.current
        const viewport = window.visualViewport
        if (!dialog || !viewport) return
        const update = () => {
            const keyboard = Math.max(
                0,
                window.innerHeight - viewport.height - viewport.offsetTop
            )
            dialog.style.setProperty('--lp-keyboard', `${keyboard}px`)
            dialog.style.setProperty('--lp-viewport', `${viewport.height}px`)
        }
        update()
        viewport.addEventListener('resize', update)
        viewport.addEventListener('scroll', update)
        return () => {
            viewport.removeEventListener('resize', update)
            viewport.removeEventListener('scroll', update)
        }
    }, [])

    // The view counts once this chunk has mounted: a popup the visitor can
    // actually see, not one whose code was still on its way.
    const hasTracked = useRef(false)
    useEffect(() => {
        if (hasTracked.current) return
        hasTracked.current = true
        trackEvent('popup_view', {
            popup_name: kind,
            trigger_type: trigger,
            ...(offer && { promotion_id: offer.id }),
        })
    }, [kind, trigger, offer])

    /** Only the visitor's own close counts; a lead navigates away instead. */
    const dismiss = (method: DismissMethod) => {
        trackEvent('popup_dismiss', {
            popup_name: kind,
            method,
            step,
            ...(offer && { promotion_id: offer.id }),
        })
        onClose()
    }

    // A tap on the dimmed page closes the popup. The press must start there
    // too, or a text selection dragged out of a field would close it.
    const onPointerDown = (event: MouseEvent<HTMLDialogElement>) => {
        pressedBackdrop.current = event.target === event.currentTarget
    }
    const onClick = (event: MouseEvent<HTMLDialogElement>) => {
        if (pressedBackdrop.current && event.target === event.currentTarget) {
            dismiss('backdrop')
        }
        pressedBackdrop.current = false
    }

    const toContact = () => {
        trackLeadFormEvent(LEAD_FORM_EVENTS.STEP, source, {
            step: 'offer',
            step_index: 1,
        })
        // Rendered and focused inside the tap, so a phone opens its keyboard
        // on the name field straight away.
        flushSync(() => setStep('contact'))
        nameRef.current?.focus()
    }

    /** Scrolls a field into view once the keyboard has finished opening. */
    const revealField = (event: FocusEvent<HTMLInputElement>) => {
        const field = event.currentTarget
        window.setTimeout(() => field.scrollIntoView({ block: 'nearest' }), 300)
    }

    const clearError = (field: Field) => {
        if (!errors.has(field)) return
        const next = new Set(errors)
        next.delete(field)
        setErrors(next)
    }

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const fullName = name.trim().replace(/\s+/g, ' ')
        const national = nationalDigits(phone)
        const invalid = new Set<Field>()
        if (fullName.length < 2) invalid.add('name')
        if (!national) invalid.add('phone')
        if (!consent) invalid.add('consent')
        setErrors(invalid)
        if (!national || invalid.size) {
            trackValidationErrors([...invalid])
            if (invalid.has('name')) nameRef.current?.focus()
            else if (invalid.has('phone')) phoneRef.current?.focus()
            return
        }

        const { firstName, lastName } = splitName(fullName)
        firstNameRef.current = firstName
        const timeZone = visitorTimeZone()

        await submit({
            firstName,
            lastName: lastName || undefined,
            name: fullName,
            phone: formatPhone(national),
            consentGiven: true,
            _website: honeypotRef.current?.value ?? '',
            subject: offer
                ? `Promotion lead: ${offer.title}`
                : 'Popup lead: questions by text',
            message: [
                offer
                    ? `Promotion popup: ${offer.title}`
                    : 'Popup: questions answered by text, then a free consultation',
                `Opened by: ${TRIGGER_NOTES[trigger]}`,
                `Page: ${window.location.pathname}`,
                `Preferred language: ${lang === 'es' ? 'Spanish' : 'English'}`,
                ...(timeZone
                    ? [
                          `Visitor time zone: ${timeZone.zone}${timeZone.short ? ` (${timeZone.short})` : ''}`,
                      ]
                    : []),
            ].join('\n'),
            // Stored on the lead and sent to the CRM; never to analytics.
            language: lang,
            offer: offer?.title,
            timeZone: timeZone?.zone,
        })
    }

    const busy = isSubmitting || isSuccess
    const invalid = (field: Field) => errors.has(field)

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby={titleId}
            tabIndex={-1}
            // Google Translate rewrites text nodes React keeps re-rendering;
            // the popup carries its own Spanish instead.
            translate='no'
            onCancel={(event) => {
                event.preventDefault()
                dismiss('escape')
            }}
            onPointerDown={onPointerDown}
            onClick={onClick}
            className={cn(
                // A bottom sheet on phones, riding above the keyboard.
                'fixed inset-x-0 top-auto bottom-[var(--lp-keyboard,0px)] m-0 w-full max-w-none',
                'max-h-[calc(var(--lp-viewport,100dvh)-0.75rem)] overflow-y-auto overscroll-contain',
                'rounded-t-[1.75rem] border-0 bg-stone-900 p-0 text-stone-50 outline-none',
                'shadow-[0_-24px_60px_-20px_rgb(0_0_0/0.6)]',
                // stone-950 at 70%, written out: `::backdrop` only inherits
                // custom properties from Safari 17.4 / Chrome 122, so the
                // token would leave older phones with no dimming at all.
                'backdrop:bg-[rgb(19_12_9/0.7)]',
                'motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-10 motion-safe:duration-300',
                // A centred card from md.
                'md:inset-0 md:m-auto md:h-fit md:max-h-[calc(100dvh-3rem)] md:w-[min(31rem,calc(100%-3rem))] md:rounded-[1.75rem]',
                'md:motion-safe:slide-in-from-bottom-4 md:motion-safe:zoom-in-95 md:shadow-[0_40px_90px_-30px_rgb(0_0_0/0.7)]'
            )}
        >
            <div
                ref={formRef}
                className='relative px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-7 sm:pt-7'
            >
                {/* Champagne light from the top edge, and a hairline. */}
                <div
                    aria-hidden='true'
                    className='pointer-events-none absolute inset-x-0 top-0 h-48 rounded-t-[1.75rem] bg-[radial-gradient(120%_100%_at_50%_0%,rgb(228_201_157/0.16),transparent_70%)]'
                />
                <div
                    aria-hidden='true'
                    className='via-gold-300/60 absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent to-transparent'
                />

                <button
                    type='button'
                    onClick={() => dismiss('close_button')}
                    className='focus-visible:outline-gold-300 absolute top-2.5 right-2.5 z-10 grid size-11 place-items-center rounded-full text-stone-300 transition-colors hover:bg-white/10 hover:text-stone-50 focus-visible:outline-2 sm:top-4 sm:right-4'
                    aria-label={copy.close}
                >
                    <X className='size-5' aria-hidden='true' />
                </button>

                <div className='relative'>
                    {step === 'offer' ? (
                        offer ? (
                            <PromoOffer
                                offer={offer}
                                copy={copy}
                                titleId={titleId}
                            />
                        ) : (
                            <ConsultOffer copy={copy} titleId={titleId} />
                        )
                    ) : (
                        <>
                            {offer ? (
                                <PromoRecap offer={offer} copy={copy} />
                            ) : (
                                <Coordinator copy={copy} />
                            )}
                            <h2
                                id={titleId}
                                className='mt-5 pr-8 font-serif text-[1.625rem] leading-[1.1] text-stone-50'
                            >
                                {offer ? copy.promo.ask : copy.consult.ask}
                            </h2>
                        </>
                    )}

                    {step === 'offer' ? (
                        <>
                            <PrimaryButton onClick={toContact}>
                                {offer ? copy.promo.yes : copy.consult.yes}
                            </PrimaryButton>
                            <button
                                type='button'
                                onClick={() => dismiss('no_thanks')}
                                className='mx-auto mt-1 block min-h-11 px-4 text-sm text-stone-400 underline-offset-4 transition-colors hover:text-stone-200 hover:underline'
                            >
                                {copy.noThanks}
                            </button>
                        </>
                    ) : (
                        <form
                            noValidate
                            onSubmit={onSubmit}
                            aria-labelledby={titleId}
                            className='mt-5'
                        >
                            <div
                                aria-hidden='true'
                                className='absolute -left-[9999px] h-0 overflow-hidden'
                            >
                                <label htmlFor={fieldId('website')}>
                                    Website
                                </label>
                                <input
                                    id={fieldId('website')}
                                    ref={honeypotRef}
                                    type='text'
                                    name='_website'
                                    tabIndex={-1}
                                    autoComplete='off'
                                />
                            </div>

                            <div className='grid gap-4'>
                                <TextField
                                    id={fieldId('name')}
                                    label={copy.fieldName}
                                    error={
                                        invalid('name')
                                            ? copy.errors.name
                                            : undefined
                                    }
                                >
                                    <input
                                        id={fieldId('name')}
                                        ref={nameRef}
                                        type='text'
                                        name='name'
                                        autoComplete='name'
                                        autoCapitalize='words'
                                        enterKeyHint='next'
                                        value={name}
                                        disabled={busy}
                                        onFocus={revealField}
                                        onChange={(event) => {
                                            setName(event.target.value)
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
                                        className={inputClass}
                                    />
                                </TextField>

                                <TextField
                                    id={fieldId('phone')}
                                    label={copy.fieldPhone}
                                    error={
                                        invalid('phone')
                                            ? copy.errors.phone
                                            : undefined
                                    }
                                >
                                    <input
                                        id={fieldId('phone')}
                                        ref={phoneRef}
                                        type='tel'
                                        name='phone'
                                        inputMode='tel'
                                        autoComplete='tel'
                                        enterKeyHint='send'
                                        placeholder='(305) 555-0123'
                                        value={phone}
                                        disabled={busy}
                                        onFocus={revealField}
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
                                        className={inputClass}
                                    />
                                </TextField>
                            </div>

                            <div
                                className={cn(
                                    '-mx-2.5 mt-3 flex gap-3 rounded-xl border border-transparent p-2.5',
                                    invalid('consent') &&
                                        'border-red-300/70 bg-red-300/5'
                                )}
                            >
                                <input
                                    id={fieldId('consent')}
                                    type='checkbox'
                                    checked={consent}
                                    disabled={busy}
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
                                    className='accent-gold-300 mt-0.5 size-5 shrink-0'
                                />
                                <label
                                    htmlFor={fieldId('consent')}
                                    className='text-[0.6875rem] leading-normal text-stone-400 [&_a]:text-stone-200 [&_a]:underline [&_a]:underline-offset-2'
                                >
                                    <Rich parts={copy.consent} />
                                </label>
                            </div>
                            {invalid('consent') && (
                                <p
                                    id={fieldId('consent-error')}
                                    className='mt-1 text-[0.8125rem] text-red-300'
                                >
                                    {copy.errors.consent}
                                </p>
                            )}

                            <PrimaryButton type='submit' busy={busy}>
                                {busy
                                    ? copy.submitting
                                    : offer
                                      ? copy.promo.submit
                                      : copy.consult.submit}
                            </PrimaryButton>

                            {isError && (
                                <p
                                    role='alert'
                                    className='mt-3 text-center text-[0.8125rem] text-red-300'
                                >
                                    {copy.errors.submit}
                                </p>
                            )}

                            <p className='mt-3 flex items-center justify-center gap-1.5 text-xs text-stone-400'>
                                <Lock className='size-3.5' aria-hidden='true' />
                                {copy.reassure}
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </dialog>
    )
}

type Copy = (typeof LEAD_POPUP_COPY)['en']

/** 16 px and up, so iOS never zooms into the field. */
const inputClass = cn(
    'mt-1.5 h-13 w-full rounded-xl border border-white/15 bg-stone-950/55 px-4 text-[1.0625rem] text-stone-50',
    'placeholder:text-stone-500 transition-[border-color,box-shadow] duration-150',
    'focus:border-gold-300 focus:ring-gold-300/25 focus:ring-2 focus:outline-none',
    'aria-invalid:border-red-300/80 disabled:opacity-60',
    'autofill:shadow-[inset_0_0_0_1000px_var(--stone-950)] autofill:[-webkit-text-fill-color:var(--stone-50)]'
)

function TextField({
    id,
    label,
    error,
    children,
}: {
    id: string
    label: string
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

/** Champagne pill with the arrow in an ink disc: the brand's CTA on dark. */
function PrimaryButton({
    type = 'button',
    busy = false,
    onClick,
    children,
}: {
    type?: 'button' | 'submit'
    busy?: boolean
    onClick?: () => void
    children: ReactNode
}) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={busy}
            aria-busy={busy}
            className='bg-gold-300 hover:bg-gold-200 focus-visible:outline-gold-300 mt-6 flex min-h-14 w-full items-center justify-between gap-3 rounded-full py-2 pr-2 pl-6 text-left text-base font-semibold text-stone-950 shadow-[0_18px_40px_-22px_rgb(228_201_157/0.7)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-3 disabled:opacity-80'
        >
            {children}
            <span
                aria-hidden='true'
                className='text-gold-300 grid size-10 shrink-0 place-items-center rounded-full bg-stone-950'
            >
                <ArrowRight className='size-4.5' />
            </span>
        </button>
    )
}

/** Who answers: the same "patient care" identity the thread uses. */
function Coordinator({ copy }: { copy: Copy }) {
    return (
        <div className='flex items-center gap-3 pr-12'>
            <span
                aria-hidden='true'
                className='from-gold-200 to-gold-500 ring-gold-300/70 grid size-11 shrink-0 place-items-center rounded-full bg-linear-140 font-serif text-xl text-stone-950 ring-1 ring-offset-2 ring-offset-stone-900'
            >
                A
            </span>
            <span className='min-w-0'>
                <span className='block text-[0.9375rem] font-semibold text-stone-50'>
                    {copy.coordinator}
                </span>
                <span className='flex items-center gap-1.5 text-[0.8125rem] text-stone-300'>
                    <span
                        aria-hidden='true'
                        className='size-1.5 rounded-full bg-emerald-400'
                    />
                    {copy.status}
                </span>
            </span>
        </div>
    )
}

/** Step 1 without a promotion: questions answered by text. */
function ConsultOffer({ copy, titleId }: { copy: Copy; titleId: string }) {
    const [lead, emphasis] = copy.consult.title
    return (
        <>
            <Coordinator copy={copy} />
            <h2
                id={titleId}
                className='mt-6 font-serif text-[2.125rem] leading-[1.02] tracking-[-0.01em] text-stone-50'
            >
                {lead}
                <em className='text-gold-300'>{emphasis}</em>
            </h2>
            <p className='mt-3 text-base leading-relaxed text-stone-300'>
                {copy.consult.body}
            </p>
            <ul className='mt-5 grid gap-2.5 text-[0.9375rem] text-stone-200'>
                {copy.consult.points.map((point) => (
                    <li key={point} className='flex items-center gap-3'>
                        <span
                            aria-hidden='true'
                            className='border-gold-300/50 text-gold-300 grid size-6 shrink-0 place-items-center rounded-full border'
                        >
                            <Check className='size-3.5' />
                        </span>
                        {point}
                    </li>
                ))}
            </ul>
        </>
    )
}

/** The promotion's image in the brand's arch. */
function OfferArch({
    offer,
    className,
    sizes,
}: {
    offer: LeadPopupPromotion
    className: string
    sizes: string
}) {
    if (!offer.imageUrl) return null
    return (
        <div
            className={cn(
                'ring-gold-300/35 relative shrink-0 overflow-hidden rounded-t-full rounded-b-lg bg-stone-800 ring-1',
                className
            )}
        >
            <Image
                src={offer.imageUrl}
                alt={offer.imageAlt || offer.title}
                fill
                sizes={sizes}
                className='object-cover object-top'
            />
        </div>
    )
}

function DaysLeft({ days, copy }: { days: number | null; copy: Copy }) {
    if (days === null || days <= 0) return null
    return (
        <p className='border-gold-300/35 text-gold-200 mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.8125rem] font-medium'>
            <Clock className='size-3.5' aria-hidden='true' />
            {copy.promo.daysLeft(days)}
        </p>
    )
}

/** Step 1 with a promotion: the offer, its deadline and its details. */
function PromoOffer({
    offer,
    copy,
    titleId,
}: {
    offer: LeadPopupPromotion
    copy: Copy
    titleId: string
}) {
    const detailsId = useId()
    const detailsRef = useRef<HTMLDivElement>(null)
    const [expanded, setExpanded] = useState(false)
    const [overflows, setOverflows] = useState(false)

    // The toggle only appears when the details are longer than the clamp.
    // Measured by an observer: this effect runs before the parent's opens
    // the dialog, while it still has no layout, and fonts can land later.
    useEffect(() => {
        const details = detailsRef.current
        if (!details) return
        const observer = new ResizeObserver(() => {
            if (details.clientHeight === 0) return
            // Once clamped, it stays toggleable: expanding it ends the
            // overflow, and "Show less" must not vanish with it.
            if (details.scrollHeight > details.clientHeight + 1) {
                setOverflows(true)
            }
        })
        observer.observe(details)
        return () => observer.disconnect()
    }, [])

    return (
        <>
            <div className='flex items-center gap-4 pr-10 md:gap-5'>
                <OfferArch
                    offer={offer}
                    className='h-30 w-24 md:h-40 md:w-32'
                    sizes='(min-width: 768px) 128px, 96px'
                />
                <div className='min-w-0'>
                    <h2
                        id={titleId}
                        // The title is the practice's own English copy, so
                        // the page translator may take it.
                        translate='yes'
                        className='font-serif text-[1.625rem] leading-[1.08] text-stone-50 md:text-[1.875rem]'
                    >
                        {offer.title}
                    </h2>
                    <DaysLeft days={offer.daysRemaining} copy={copy} />
                </div>
            </div>

            {offer.excerpt && (
                <div className='mt-5'>
                    <div
                        id={detailsId}
                        ref={detailsRef}
                        translate='yes'
                        style={
                            expanded
                                ? undefined
                                : { maxHeight: `${EXCERPT_LINES * 1.625}em` }
                        }
                        className={cn(
                            'overflow-hidden text-[0.9375rem] leading-relaxed text-stone-300 [&_p]:m-0 [&_strong]:text-stone-100',
                            !expanded &&
                                overflows &&
                                'mask-b-from-40% mask-b-to-100%'
                        )}
                    >
                        <PromotionMarkdownClient content={offer.excerpt} />
                    </div>
                    {overflows && (
                        <button
                            type='button'
                            aria-expanded={expanded}
                            aria-controls={detailsId}
                            onClick={() => setExpanded((open) => !open)}
                            className='text-gold-300 mt-1.5 min-h-9 text-sm font-semibold underline underline-offset-4'
                        >
                            {expanded ? copy.promo.less : copy.promo.more}
                        </button>
                    )}
                </div>
            )}
        </>
    )
}

/** Step 2 with a promotion: which offer the number is for. */
function PromoRecap({
    offer,
    copy,
}: {
    offer: LeadPopupPromotion
    copy: Copy
}) {
    return (
        <div className='flex items-center gap-3 pr-12'>
            <OfferArch offer={offer} className='h-14 w-11' sizes='44px' />
            <div className='min-w-0'>
                <p
                    translate='yes'
                    className='line-clamp-2 text-[0.9375rem] leading-snug font-semibold text-stone-50'
                >
                    {offer.title}
                </p>
                {offer.daysRemaining !== null && offer.daysRemaining > 0 && (
                    <p className='text-gold-200 mt-0.5 flex items-center gap-1.5 text-[0.8125rem]'>
                        <Clock className='size-3.5' aria-hidden='true' />
                        {copy.promo.daysLeft(offer.daysRemaining)}
                    </p>
                )}
            </div>
        </div>
    )
}
