'use client'

/**
 * The consultation form card, and everything that makes the Loquent embed look
 * and behave like part of this page.
 *
 * The embed renders into a shadow root, which is why the work here is
 * imperative rather than declarative. Three things happen:
 *
 *   1. A stylesheet is adopted into that root, restyling fields, labels and
 *      the button. If Loquent renames its classes the form falls back to its
 *      own look and keeps working — nothing about submission depends on these
 *      styles.
 *   2. The "Preferred Language" select is set from the page language and
 *      hidden; "Procedure of Interest" is filled from the ad variant, but only
 *      while it is empty, so a visitor's own choice is never overwritten.
 *   3. The submit request is intercepted to gate it on the consent checkbox
 *      and to redirect to the thank-you page on success.
 *
 * Opening the shadow root has to happen before Loquent creates it, which is
 * earlier than any React effect can run — see `lp-shadow-patch.ts`, whose
 * snippet the page emits inline ahead of everything else.
 */

import { useCallback, useEffect, useRef, useState } from 'react'

import type { LpDictionary, LpLang } from './lp-copy'
import {
    LOQUENT_FORM_ID,
    LOQUENT_LANGUAGE_VALUE,
    LOQUENT_SUBMIT_PATH,
    LP_THANK_YOU_PATH,
    RELABEL_FIELDS,
} from './lp-config'
import { LockIcon, Rich } from './lp-primitives.component'
import type { LoquentShadowBridge } from './lp-shadow-patch'
import { buildThankYouUrl, trackLpEvent } from './lp-tracking'

interface LpConsultationFormProps {
    readonly lang: LpLang
    readonly adVariant: string
    readonly copy: LpDictionary['form']
    /** The Loquent option value to preselect, `''` for the general variant. */
    readonly procedure: string
}

const FONT = 'var(--font-lato), Arial, sans-serif'

/**
 * The stylesheet adopted into the embed's shadow root.
 *
 * Two things live here and nowhere else: the two-column name row (the first
 * two fields opt out of the full-width default), and the button label, written
 * through `::after` so it follows the page language.
 */
function embedCss(submitLabel: string): string {
    return [
        `:host{font-family:${FONT}!important}`,
        '.lq-card{padding:12px 24px 2px!important;border:0!important;box-shadow:none!important;background:transparent!important;border-radius:0!important}',
        '.lq-header,.lq-title,.lq-intro,.lq-powered{display:none!important}',
        '.lq-fields{display:grid!important;grid-template-columns:1fr 1fr;gap:12px!important}',
        '.lq-fields>*{grid-column:1/-1}',
        '.lq-fields>.lq-field:nth-child(1),.lq-fields>.lq-field:nth-child(2){grid-column:auto}',
        '.lq-field{gap:6px!important}',
        `.lq-label{font-family:${FONT}!important;font-size:11px!important;font-weight:700!important;letter-spacing:.16em!important;text-transform:uppercase!important;color:#57534d!important}`,
        '.lq-req{color:#8f8049!important}',
        `.lq-input{font-family:${FONT}!important;font-size:16px!important;color:#0c0a09!important;background:#fff!important;border:1px solid #d6d3d1!important;border-radius:5px!important;padding:13px 14px!important;line-height:1.3!important}`,
        '.lq-input::placeholder{color:#a6a09b!important}',
        '.lq-input:focus,.lq-input:focus-visible{border-color:#a59557!important;box-shadow:0 0 0 3px rgba(165,149,87,.22)!important}',
        '.lq-select{padding-right:40px!important}',
        `.lq-submit{font-family:${FONT}!important;background:#bfaf79!important;color:#0c0a09!important;border-radius:4px!important;box-shadow:none!important;margin-top:10px!important;min-height:58px;padding:0 20px!important;letter-spacing:.18em;text-transform:uppercase;font-weight:700!important;transition:background-color .35s!important}`,
        '.lq-submit:hover{background:#a59557!important;filter:none!important}',
        '.lq-submit:not([disabled]):not(.is-loading){font-size:0!important;line-height:0!important}',
        `.lq-submit:not([disabled]):not(.is-loading)::after{content:${JSON.stringify(submitLabel)};font-size:13px;line-height:1.2;font-weight:700;letter-spacing:.18em;text-transform:uppercase}`,
        `.lq-field-error,.lq-form-error{font-family:${FONT}!important;font-size:12.5px!important;color:#b3261e!important}`,
        '.lq-field:has(option[value="Spanish"]){display:none!important}',
        '@media (max-width:480px){.lq-card{padding:10px 18px 0!important}}',
    ].join('')
}

/** Finds the select that owns an option with this exact value. */
function findSelect(
    root: ShadowRoot,
    optionValue: string
): HTMLSelectElement | null {
    for (const option of root.querySelectorAll('select option')) {
        if ((option as HTMLOptionElement).value === optionValue) {
            return option.parentElement as HTMLSelectElement
        }
    }
    return null
}

/**
 * Sets a select the way a person would.
 *
 * The native value setter is called directly because the embed is a React tree
 * of its own: assigning `.value` would be swallowed by React's own property
 * descriptor and the change would never reach the form's state.
 */
function setSelect(element: HTMLSelectElement | null, value: string): void {
    if (!element || element.value === value) return
    const canSet = Array.from(element.options).some(
        (option) => option.value === value
    )
    if (!canSet) return

    const descriptor = Object.getOwnPropertyDescriptor(
        HTMLSelectElement.prototype,
        'value'
    )
    descriptor?.set?.call(element, value)
    element.dispatchEvent(new Event('input', { bubbles: true }))
    element.dispatchEvent(new Event('change', { bubbles: true }))
}

/**
 * Retranslates a field label without disturbing the required-marker element
 * Loquent appends after the text node.
 */
function setLabel(input: Element | null | undefined, text: string): void {
    const field = input?.closest('.lq-field')
    const label = field?.querySelector('.lq-label')
    if (!label) return

    let node = label.firstChild
    if (!node || node.nodeType !== Node.TEXT_NODE) {
        node = document.createTextNode('')
        label.insertBefore(node, label.firstChild)
    }
    const next = node.nextSibling
    const want = text + (next && next.nodeType === Node.ELEMENT_NODE ? ' ' : '')
    if (node.nodeValue !== want) node.nodeValue = want
}

export function LpConsultationForm({
    lang,
    adVariant,
    copy,
    procedure,
}: LpConsultationFormProps) {
    const [consentGiven, setConsentGiven] = useState(false)
    const [consentInvalid, setConsentInvalid] = useState(false)
    const consentInputRef = useRef<HTMLInputElement>(null)
    const consentBoxRef = useRef<HTMLDivElement>(null)

    /**
     * The shadow-root observers and the fetch hook below outlive any single
     * render, so they read the current values through a ref rather than
     * closing over them. Written in an effect, not during render: a render
     * React discards must not leave its values behind here.
     */
    const latest = useRef({ lang, adVariant, copy, procedure, consentGiven })
    useEffect(() => {
        latest.current = { lang, adVariant, copy, procedure, consentGiven }
    })

    /** The adopted stylesheet, kept so a language switch can rewrite it. */
    const styleTarget = useRef<{
        root: ShadowRoot
        sheet: CSSStyleSheet | null
        style: HTMLStyleElement | null
    } | null>(null)

    const applyEmbedStyles = useCallback(() => {
        const target = styleTarget.current
        if (!target) return
        const css = embedCss(latest.current.copy.submitLabel)
        if (target.sheet) target.sheet.replaceSync(css)
        else if (target.style) target.style.textContent = css
    }, [])

    /**
     * `force` is true when the page language changed: the language select is
     * re-synced even though it already holds a value.
     */
    const syncEmbed = useCallback((root: ShadowRoot, force: boolean) => {
        const { lang: currentLang, procedure: currentProcedure } =
            latest.current

        const languageSelect = findSelect(root, LOQUENT_LANGUAGE_VALUE.es)
        if (languageSelect && (force || !languageSelect.value)) {
            setSelect(languageSelect, LOQUENT_LANGUAGE_VALUE[currentLang])
        }

        const procedureSelect = findSelect(root, 'Mommy Makeover')
        if (procedureSelect && currentProcedure && !procedureSelect.value) {
            setSelect(procedureSelect, currentProcedure)
        }

        if (!RELABEL_FIELDS) return
        const { copy: currentCopy } = latest.current
        const textInputs = root.querySelectorAll('input[type=text]:not([name])')
        setLabel(textInputs[0], currentCopy.fieldFirstName)
        setLabel(textInputs[1], currentCopy.fieldLastName)
        setLabel(root.querySelector('input[type=tel]'), currentCopy.fieldPhone)
        setLabel(
            root.querySelector('input[type=email]'),
            currentCopy.fieldEmail
        )
        setLabel(procedureSelect, currentCopy.fieldProcedure)
    }, [])

    /** Styling and field syncing, from the moment the embed's root exists. */
    useEffect(() => {
        const bridge: LoquentShadowBridge = (window.__apsLoquent ??= {})

        const observers: MutationObserver[] = []
        let syncTimer: ReturnType<typeof setTimeout> | undefined

        const attach = (root: ShadowRoot) => {
            let sheet: CSSStyleSheet | null = null
            let style: HTMLStyleElement | null = null
            const css = embedCss(latest.current.copy.submitLabel)

            try {
                sheet = new CSSStyleSheet()
                sheet.replaceSync(css)
                root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet]
            } catch {
                // No constructable stylesheets: fall back to a <style> node and
                // put it back whenever the embed re-renders over it.
                style = document.createElement('style')
                style.textContent = css
                root.appendChild(style)
                const keepAlive = new MutationObserver(() => {
                    if (style && !style.isConnected) root.appendChild(style)
                })
                keepAlive.observe(root, { childList: true })
                observers.push(keepAlive)
            }
            styleTarget.current = { root, sheet, style }

            // The embed re-renders as the visitor types; debounce the re-sync
            // so a keystroke does not cost a full field sweep.
            const watcher = new MutationObserver(() => {
                clearTimeout(syncTimer)
                syncTimer = setTimeout(() => syncEmbed(root, false), 60)
            })
            watcher.observe(root, { childList: true, subtree: true })
            observers.push(watcher)

            syncEmbed(root, true)
        }

        if (bridge.root) attach(bridge.root)
        else bridge.onRoot = attach

        return () => {
            clearTimeout(syncTimer)
            for (const observer of observers) observer.disconnect()
            if (bridge.onRoot === attach) delete bridge.onRoot
            // The shadow root outlives this component (the patch fires once, so
            // a remount reattaches to the same root). Take our stylesheet back
            // out, or a remount stacks a second identical copy on it.
            const target = styleTarget.current
            if (target?.sheet) {
                target.root.adoptedStyleSheets =
                    target.root.adoptedStyleSheets.filter(
                        (sheet) => sheet !== target.sheet
                    )
            }
            target?.style?.remove()
            styleTarget.current = null
        }
    }, [syncEmbed])

    /** A language switch rewrites the button label and the field labels. */
    useEffect(() => {
        applyEmbedStyles()
        const target = styleTarget.current
        if (target) syncEmbed(target.root, true)
    }, [lang, applyEmbedStyles, syncEmbed])

    /** Consent gate and post-submit redirect, wired to the request itself. */
    useEffect(() => {
        const nativeFetch = window.fetch

        const patched: typeof window.fetch = (input, init) => {
            const url =
                typeof input === 'string'
                    ? input
                    : input instanceof URL
                      ? input.href
                      : input.url
            if (!url.includes(LOQUENT_SUBMIT_PATH)) {
                return nativeFetch(input, init)
            }

            const context = {
                lang: latest.current.lang,
                adVariant: latest.current.adVariant,
            }

            if (!latest.current.consentGiven) {
                setConsentInvalid(true)
                consentBoxRef.current?.scrollIntoView({
                    block: 'center',
                    behavior: 'smooth',
                })
                consentInputRef.current?.focus()
                return Promise.reject(
                    new Error(latest.current.copy.consentError)
                )
            }

            setConsentInvalid(false)
            trackLpEvent('lp_lead_attempt', context, {
                procedure: latest.current.procedure,
            })

            return nativeFetch(input, init).then((response) => {
                if (response.ok) {
                    window.location.href = buildThankYouUrl(
                        LP_THANK_YOU_PATH,
                        context
                    )
                }
                return response
            })
        }

        window.fetch = patched
        return () => {
            // Only unwind if nothing else patched fetch on top of ours.
            if (window.fetch === patched) window.fetch = nativeFetch
        }
    }, [])

    return (
        <aside className='card' id='consultation' aria-labelledby='form-title'>
            <div className='card-head'>
                <p className='eyebrow'>{copy.eyebrow}</p>
                <h2 id='form-title'>{copy.title}</h2>
                <p>{copy.subtitle}</p>
            </div>

            {/*
                Fields, labels and dropdown options live in Loquent
                (Website → Forms → "Evaluation - Landing Page"). The site tag
                loaded by the root layout mounts the embed into this slot.
                Attribution needs no hidden inputs: the tag reads gclid /
                wbraid / gbraid / utm_* off the URL itself.
            */}
            <div data-loquent-form={LOQUENT_FORM_ID} />

            <div
                className={`consent${consentInvalid ? ' is-invalid' : ''}`}
                ref={consentBoxRef}
            >
                <input
                    id='consentGiven'
                    name='consentGiven'
                    type='checkbox'
                    value='yes'
                    ref={consentInputRef}
                    checked={consentGiven}
                    onChange={(event) => {
                        setConsentGiven(event.target.checked)
                        if (event.target.checked) setConsentInvalid(false)
                    }}
                />
                <label htmlFor='consentGiven'>
                    <Rich parts={copy.consent} />
                </label>
            </div>
            <p
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
