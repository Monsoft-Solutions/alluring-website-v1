/**
 * ConsentNotice — the line above every lead form's submit button (#350).
 *
 * Sending the form is the consent to be called and texted, so there is no
 * checkbox: this notice says so, in the visitor's language, right before
 * the button. Give it an `id` and point the button's `aria-describedby` at
 * it, so a screen reader reads the terms with the button.
 *
 * Readable on purpose — body-sized text in the band's own ink, not legal
 * grey. The words live in `lib/constants/lead-consent.ts`, versioned; a form
 * that renders this notice sends `SUBMIT_CONSENT`.
 *
 * Renders on the server or inside a client form alike.
 */

import { cn } from '@workspace/ui/lib/utils'

import {
    type ConsentLang,
    consentNoticeParts,
} from '@/lib/constants/lead-consent'
import { getPhoneLink } from '@/lib/data/site-config'

export interface ConsentNoticeProps {
    readonly id?: string
    readonly lang?: ConsentLang
    /**
     * `dark` for cocoa and espresso bands, `light` for porcelain ones,
     * `inherit` when the surrounding stylesheet colours and sizes it (the
     * consultation thread's `cc-consent-line`).
     */
    readonly tone?: 'dark' | 'light' | 'inherit'
    readonly className?: string
}

const TEXT =
    'text-[0.875rem] leading-relaxed sm:text-[0.9375rem] [&_a]:underline [&_a]:underline-offset-2'
const TONES = {
    dark: `${TEXT} text-stone-200 [&_a]:text-gold-300 [&_a:hover]:text-gold-200`,
    light: `${TEXT} text-stone-700 [&_a]:text-gold-700 [&_a:hover]:text-gold-800`,
    inherit: '',
} as const

/** Relative, so the ads LP's legal dialog catches them on its subdomain. */
const PRIVACY_HREF = '/privacy'
const TERMS_HREF = '/terms'

export function ConsentNotice({
    id,
    lang = 'en',
    tone = 'dark',
    className,
}: ConsentNoticeProps) {
    const parts = consentNoticeParts(lang)
    return (
        <p
            id={id}
            data-consent-notice=''
            className={cn(TONES[tone], className) || undefined}
        >
            {parts.beforePhone}
            <a href={getPhoneLink()} className='whitespace-nowrap'>
                {parts.phone}
            </a>
            {parts.afterPhone}{' '}
            <a href={PRIVACY_HREF} target='_blank' rel='noopener noreferrer'>
                {parts.privacy}
            </a>
            {' · '}
            <a href={TERMS_HREF} target='_blank' rel='noopener noreferrer'>
                {parts.terms}
            </a>
        </p>
    )
}
