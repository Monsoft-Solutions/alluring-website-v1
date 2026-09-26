'use client'

/**
 * useConsultFlow — the consultation request's state and behaviour, shared by
 * every way of drawing it: the text thread (`ConsultChat`) and the tap card
 * (`ConsultCard`, the ads landing page's test arm, #292).
 *
 * It owns the steps and answers (through the per-form store, so two views of
 * one form stay in step), the name and number, validation, the page's links
 * that answer for the visitor, progress for sticky bars, the funnel events
 * and the send. The components only draw.
 *
 * Links elsewhere on the page can answer for the visitor: a procedure chip
 * (`<a href="#<id>" data-consult-procedure="bbl">`) answers the first
 * question, and a financing CTA (`data-consult-financing="yes"`) saves the
 * lead with `financing_interest = yes` and tells the coordinator in the note.
 * `data-consult-entry` names where the link sits (`bar`, `closing`, `strip`)
 * for the funnel's `entry_point`.
 *
 * Underneath it is an ordinary form posting through the site's contact
 * pipeline (`useContactFormSubmission` → `/api/contact`), so it reports the
 * shared lead funnel (#272) and every lead lands tagged with its page's
 * source. The procedure and timeline go into the staff note and the lead
 * record, never into analytics.
 */

import {
    type FormEvent,
    useCallback,
    useEffect,
    useRef,
    useState,
    useSyncExternalStore,
} from 'react'

import {
    pushDataLayer,
    readAttribution,
} from '@/components/landing-pages/request-consultation/lp-tracking'
import { useContactFormSubmission } from '@/hooks/useContactFormSubmission.hook'
import {
    LEAD_FORM_EVENTS,
    type LeadFormContextParams,
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
    formatPhone,
    labelOf,
    nationalDigits,
    parseSavedThread,
    prefersReducedMotion,
    readSavedThreadRaw,
    splitName,
    visitorTimeZone,
} from './consult-chat.util'
import {
    flowStorageKey,
    useFlowThread,
    writeFlowThread,
} from './consult-flow-store'
import {
    answeredCount,
    answerStep,
    CHECKBOX_CONSENT,
    type ConsultConsent,
    EMPTY_THREAD,
    FLOW_LAST_STEP,
    FLOW_STEP_NAMES,
    FLOW_TOTAL_STEPS,
    type FlowAnswers,
    type FlowStep,
    type FlowStepName,
    type FlowThread,
    restoreThread,
} from './consult-flow.logic'

export type FlowErrorField = 'name' | 'phone' | 'consent'

/** Default pause before the next question, as if the coordinator typed it. */
export const DEFAULT_TYPING_MS = 700

const noSubscription = () => () => {}

/** One answer, for pages that log answers in their own database (#292). */
export interface ConsultFlowAnswer {
    readonly step: Exclude<FlowStepName, 'contact'>
    /** The option value (`bbl`, `1-3-months`), never a label. */
    readonly answer: string
    /** `form`, or where the link that answered sits (`bar`, `closing`, …). */
    readonly entry: string
}

export interface ConsultFlowOptions {
    /** Section id — every CTA on the page links here. */
    readonly id: string
    readonly lang: ConsultChatLang
    readonly copy: ConsultChatCopy
    readonly staff: ConsultChatStaffLabels
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
    /** Title of the promotion shown with the form, stored on the lead. */
    readonly offer?: string
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
    /** Pause before the next question after a tap; 0 moves on at once. */
    readonly typingMs?: number
    /** How the visitor agrees to be texted. The site-wide checkbox by default. */
    readonly consent?: ConsultConsent
    /** Merged into every funnel event (the test arm and page version). */
    readonly analyticsParams?: LeadFormContextParams
    /**
     * `first-answer`: `lead_form_start` fires on the first answer rather
     * than on any touch, which a thumb scrolling past the form also counts.
     */
    readonly startOn?: 'interaction' | 'first-answer'
    /** `entry_point` for answers given in the form itself. */
    readonly entryName?: string
    /** Stored on the lead: which page version and form arm sent it. */
    readonly leadVariants?: {
        readonly page: string
        readonly form: string
    }
    /**
     * Keeps the send button above the phone's keyboard while the number is
     * typed: once the keyboard is open the page scrolls it into view.
     */
    readonly keepSendAboveKeyboard?: boolean
    /** Every answer, as it is given. */
    readonly onAnswer?: (answer: ConsultFlowAnswer) => void
}

export function useConsultFlow(options: ConsultFlowOptions) {
    const {
        id,
        lang,
        copy,
        staff,
        source,
        formName,
        thankYouPath,
        leadStorageKey,
        subject,
        noteLines,
        offer,
        dataLayerEvents,
        dataLayerContext,
        typingMs = DEFAULT_TYPING_MS,
        consent: consentMode = CHECKBOX_CONSENT,
        analyticsParams,
        startOn = 'interaction',
        entryName = 'form',
        leadVariants,
        keepSendAboveKeyboard = false,
        onAnswer,
    } = options

    const titleId = `${id}-title`
    const qId = (step: FlowStep) => `${id}-q-${FLOW_STEP_NAMES[step]}`
    const fieldId = (name: string) => `${id}-${name}`

    // Until the visitor touches the form, it shows what they told it earlier
    // in this tab. The server always renders a fresh form.
    const savedRaw = useSyncExternalStore(
        noSubscription,
        () => readSavedThreadRaw(flowStorageKey(id)),
        () => ''
    )
    const touched = useFlowThread(id)
    const thread: FlowThread =
        touched ??
        restoreThread(parseSavedThread(savedRaw), copy) ??
        EMPTY_THREAD
    const { step, answers, name } = thread

    const [typing, setTyping] = useState(false)
    const [phone, setPhoneValue] = useState('')
    const [consentChecked, setConsentChecked] = useState(false)
    const [errors, setErrors] = useState<ReadonlySet<FlowErrorField>>(new Set())

    const composerRef = useRef<HTMLDivElement>(null)
    const phoneRef = useRef<HTMLInputElement>(null)
    const sendRef = useRef<HTMLButtonElement>(null)
    const honeypotRef = useRef<HTMLInputElement>(null)
    const interacted = useRef(false)
    const typingTimer = useRef<number | undefined>(undefined)

    /** Read when the request resolves, not when it began. */
    const firstNameRef = useRef('')
    const financingRef = useRef(false)

    const addError = useCallback((field: FlowErrorField) => {
        setErrors((current) => new Set(current).add(field))
    }, [])

    const {
        submit,
        isSubmitting,
        isSuccess,
        isError,
        formRef,
        trackValidationErrors,
        trackStart,
    } = useContactFormSubmission({
        source,
        enableAnalytics: true,
        analyticsFormName: formName,
        analyticsParams,
        startOn,
        onFieldError: (field) => {
            if (field === 'phone') addError('phone')
            else if (field === 'name' || field === 'firstName') {
                addError('name')
            }
        },
        onSuccess: (result) => {
            writeFlowThread(id, null)
            const lead: ConsultChatLead = {
                firstName: firstNameRef.current,
                ...(result.lead && { lead: result.lead }),
                ...(financingRef.current && {
                    answers: { financingInterest: 'yes' },
                }),
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
    const answered = answeredCount(answers)
    useEffect(() => {
        publishConsultChatProgress({ id, answered, total: FLOW_TOTAL_STEPS })
    }, [answered, id])

    /**
     * After the next question appears, put the visitor's focus on its first
     * control and keep the controls on screen. Never on first render: the
     * page must not scroll itself before anyone has touched it.
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

    const update = (next: FlowThread) => writeFlowThread(id, next)

    const goTo = (
        target: FlowStep,
        withTyping: boolean,
        next: FlowThread = thread
    ) => {
        interacted.current = true
        update({ ...next, step: target })
        if (!withTyping || typingMs <= 0 || prefersReducedMotion()) return
        setTyping(true)
        window.clearTimeout(typingTimer.current)
        typingTimer.current = window.setTimeout(
            () => setTyping(false),
            typingMs
        )
    }

    const answer = (
        from: Exclude<FlowStep, 2>,
        patch: Partial<FlowAnswers>,
        entry: string = entryName
    ) => {
        const next = answerStep(thread, from, patch)
        const stepName = FLOW_STEP_NAMES[from]
        // Which step was answered is worth reporting; the answer is not.
        // Procedure interest and names stay out of the data layer, where
        // every tag in the container can read them (#272).
        if (dataLayerEvents) {
            pushDataLayer({
                event: dataLayerEvents.step,
                step: stepName,
                lang,
                ...dataLayerContext,
            })
        }
        if (startOn === 'first-answer') trackStart()
        trackLeadFormEvent(LEAD_FORM_EVENTS.STEP, formName, {
            ...analyticsParams,
            step: stepName,
            step_index: from + 1,
            entry_point: entry,
        })
        onAnswer?.({
            step: stepName,
            answer: next.answers[stepName],
            entry,
        })
        goTo(next.step, true, next)
    }

    /** Change: back to a step, keeping the later answers. */
    const change = (target: FlowStep) => goTo(target, false)

    const setName = (value: string) => {
        update({ ...thread, name: value })
        clearError('name')
    }

    const setPhone = (value: string) => {
        setPhoneValue(formatPhone(value))
        clearError('phone')
    }

    const setConsent = (checked: boolean) => {
        setConsentChecked(checked)
        clearError('consent')
    }

    // The page's links answer for the visitor; see the module comment.
    const answerRef = useRef(answer)
    const markFinancingRef = useRef(() => {})
    useEffect(() => {
        answerRef.current = answer
        markFinancingRef.current = () => {
            if (!thread.financing) update({ ...thread, financing: true })
        }
    })
    useEffect(() => {
        const onClick = (event: MouseEvent) => {
            if (!(event.target instanceof Element)) return
            const link = event.target.closest<HTMLAnchorElement>(
                `a[href="#${id}"]`
            )
            if (!link) return
            if (link.dataset.consultFinancing === 'yes') {
                markFinancingRef.current()
            }
            const value = link.dataset.consultProcedure
            if (!value) return
            if (!copy.procedures.some((option) => option.value === value)) {
                return
            }
            answerRef.current(
                0,
                { procedure: value },
                link.dataset.consultEntry || 'link'
            )
        }
        document.addEventListener('click', onClick)
        return () => document.removeEventListener('click', onClick)
    }, [id, copy.procedures])

    /**
     * On a phone the keyboard covers the lower half of the screen, and the
     * send button with it. Once it has opened (the visual viewport shrinks),
     * scroll just enough to bring the button above it.
     */
    const onPhoneFocus = () => {
        if (!keepSendAboveKeyboard) return
        const viewport = window.visualViewport
        if (!viewport) return
        const reveal = () => {
            const button = sendRef.current
            if (!button) return
            const bottom = button.getBoundingClientRect().bottom
            const visibleBottom = viewport.offsetTop + viewport.height
            const overlap = bottom + 12 - visibleBottom
            if (overlap > 0) {
                window.scrollBy({
                    top: overlap,
                    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
                })
            }
        }
        const startHeight = viewport.height
        const onResize = () => {
            if (viewport.height >= startHeight) return
            viewport.removeEventListener('resize', onResize)
            window.clearTimeout(fallback)
            reveal()
        }
        viewport.addEventListener('resize', onResize)
        // No resize (a keyboard already open, or none at all): check once.
        const fallback = window.setTimeout(() => {
            viewport.removeEventListener('resize', onResize)
            reveal()
        }, 450)
    }

    const invalid = (field: FlowErrorField) => errors.has(field)

    /** An error goes away as soon as the visitor starts fixing it. */
    function clearError(field: FlowErrorField) {
        if (!errors.has(field)) return
        const next = new Set(errors)
        next.delete(field)
        setErrors(next)
    }

    const tapConsent = consentMode.method === 'tap'

    const submitLead = async () => {
        const fullName = name.trim().replace(/\s+/g, ' ')
        const national = nationalDigits(phone)
        const nextErrors = new Set<FlowErrorField>()
        if (fullName.length < 2) nextErrors.add('name')
        if (!national) nextErrors.add('phone')
        if (!tapConsent && !consentChecked) nextErrors.add('consent')
        setErrors(nextErrors)
        if (!national || nextErrors.size) {
            trackValidationErrors([...nextErrors])
            return
        }

        const { firstName, lastName } = splitName(fullName)
        firstNameRef.current = firstName
        financingRef.current = thread.financing
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
            consentMethod: consentMode.method,
            ...(consentMode.method === 'tap' && {
                consentVersion: consentMode.version,
            }),
            ...(leadVariants && {
                pageVariant: leadVariants.page,
                formVariant: leadVariants.form,
            }),
            _website: honeypotRef.current?.value ?? '',
            subject: subject(procedureLabel),
            message: [
                ...noteLines,
                `Procedure: ${procedureLabel}`,
                `Timeline: ${labelOf(staff.timelines, answers.timeline)}`,
                ...(thread.financing
                    ? ['Financing: asked about financing on the page']
                    : []),
                `Preferred language: ${lang === 'es' ? 'Spanish' : 'English'}`,
                ...(timeZone
                    ? [
                          `Visitor time zone: ${timeZone.zone}${timeZone.short ? ` (${timeZone.short})` : ''}`,
                      ]
                    : []),
            ].join('\n'),
            // Stored on the lead and sent to the CRM; never to analytics.
            timeline: answers.timeline,
            financingInterest: thread.financing ? 'yes' : undefined,
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
        if (step === FLOW_LAST_STEP) void submitLead()
    }

    return {
        // Ids
        titleId,
        qId,
        fieldId,
        // State
        thread,
        step,
        answers,
        name,
        phone,
        typing,
        consentChecked,
        tapConsent,
        invalid,
        busy: isSubmitting || isSuccess,
        isError,
        // Refs
        formRef,
        composerRef,
        phoneRef,
        sendRef,
        honeypotRef,
        // Actions
        answer,
        change,
        setName,
        setPhone,
        setConsent,
        onPhoneFocus,
        onSubmit,
    }
}

export type ConsultFlow = ReturnType<typeof useConsultFlow>

type FlowRefName =
    | 'formRef'
    | 'composerRef'
    | 'phoneRef'
    | 'sendRef'
    | 'honeypotRef'

/**
 * The flow without its refs. Components take the refs out first (`const {
 * formRef, …, ...flow } = useConsultFlow()`) and hand them to the elements
 * they belong to: an object holding refs can't be read during render.
 */
export type ConsultFlowState = Omit<ConsultFlow, FlowRefName>
