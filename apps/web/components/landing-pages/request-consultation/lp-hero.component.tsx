'use client'

/**
 * Hero: the argument on the left, the consultation form on the right, on a
 * champagne ground. On a phone the form follows a short headline block, so
 * its first question and every procedure chip are on the first screen — at
 * 390 × 664, the height Safari leaves, not only at 844 (#292).
 *
 * The four children of `.hero-copy` are staggered by `:nth-child` in
 * landing.css — adding or reordering one changes the animation, so keep the
 * order: eyebrow, headline, lede, trust.
 *
 * The trust row answers the two things the ads promise before the form asks
 * anything (#290): who operates, and whether she can pay over time. Since v6
 * it is one line on a 390px phone — the rating, "your surgeon operates",
 * "financing" — so the form's chips sit above Safari's toolbar. The board
 * credential is in the surgeon section, where it has room for the wording
 * Florida requires.
 *
 * No price here, and none in the form: the FAQ keeps the settled starting
 * prices; see the REGISTER note in `lp-copy.ts`.
 */

import { fill } from '@/components/shared/consult-chat/consult-chat.util'
import { getPhoneLink, siteConfig } from '@/lib/data/site-config'

import type { LpDictionary, LpLang } from './lp-copy'
import { CheckIcon, GoogleMark } from './lp-primitives.component'
import type { VariantCopy } from './lp-variants'

interface LpHeroProps {
    readonly lang: LpLang
    readonly copy: LpDictionary['hero']
    readonly variant: VariantCopy
    readonly rating: string
    readonly reviewCount: string
    readonly onSelectLang: (lang: LpLang) => void
    /** The consultation form, rendered by the page so this stays presentational. */
    readonly form: React.ReactNode
}

export function LpHero({
    lang,
    copy,
    variant,
    rating,
    reviewCount,
    onSelectLang,
    form,
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
                            <span>
                                <b>{rating}</b>{' '}
                                {fill(copy.trustGoogle, { count: reviewCount })}
                            </span>
                        </li>
                        <li>
                            <CheckIcon />
                            <span>{copy.trustSurgeon}</span>
                        </li>
                        <li>
                            <CheckIcon />
                            <span>{copy.trustFinancing}</span>
                        </li>
                    </ul>
                </div>

                <div className='hero-thread'>
                    {form}
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
