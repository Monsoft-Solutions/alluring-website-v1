'use client'

/**
 * Hero: the argument on the left, the consultation thread on the right, on a
 * champagne ground. On a phone the thread follows a short headline block, so
 * its first question and the procedure chips are on the first screen — the
 * old form's submit button sat 980px down, below it.
 *
 * The four children of `.hero-copy` are staggered by `:nth-child` in
 * landing.css — adding or reordering one changes the animation, so keep the
 * order: eyebrow, headline, lede, trust.
 *
 * There is no financing chip and no price here. The thread's reply to the
 * first tap gives the starting price where one is settled; see the REGISTER
 * note in `lp-copy.ts`.
 */

import { fill } from '@/components/shared/consult-chat/consult-chat.util'
import { getPhoneLink, siteConfig } from '@/lib/data/site-config'

import type { LpDictionary, LpLang } from './lp-copy'
import { CheckIcon, GoogleMark, Stars } from './lp-primitives.component'
import type { VariantCopy } from './lp-variants'

interface LpHeroProps {
    readonly lang: LpLang
    readonly copy: LpDictionary['hero']
    readonly variant: VariantCopy
    readonly rating: string
    readonly reviewCount: string
    readonly onSelectLang: (lang: LpLang) => void
    /** The consultation thread, rendered by the page so this stays presentational. */
    readonly thread: React.ReactNode
}

export function LpHero({
    lang,
    copy,
    variant,
    rating,
    reviewCount,
    onSelectLang,
    thread,
}: LpHeroProps) {
    const otherLang: LpLang = lang === 'en' ? 'es' : 'en'

    return (
        <section className='hero'>
            <div className='wrap hero-in'>
                <div className='hero-copy'>
                    <p className='eyebrow'>{copy.eyebrow}</p>
                    <h1>
                        <span>{variant.headline}</span>
                        <em>{variant.headlineEm}</em>
                    </h1>
                    <p className='lede'>{variant.lede}</p>
                    <ul className='trust'>
                        <li>
                            <GoogleMark />
                            <Stars />
                            <span>
                                <b>{rating}</b>{' '}
                                {fill(copy.trustGoogle, { count: reviewCount })}
                            </span>
                        </li>
                        <li>
                            <CheckIcon />
                            <span>{copy.trustBoard}</span>
                        </li>
                        <li>
                            <CheckIcon />
                            <span>{copy.trustAaaasf}</span>
                        </li>
                    </ul>
                </div>

                <div className='hero-thread'>
                    {thread}
                    <p className='hero-alt'>
                        {copy.callAlt}{' '}
                        <a href={getPhoneLink()} data-track='call-hero'>
                            {siteConfig.contact.phoneDisplay}
                        </a>
                    </p>
                    <p className='nudge'>
                        {copy.nudge.question}{' '}
                        <button
                            type='button'
                            onClick={() => onSelectLang(otherLang)}
                        >
                            {copy.nudge.action}
                        </button>
                    </p>
                </div>
            </div>
        </section>
    )
}
