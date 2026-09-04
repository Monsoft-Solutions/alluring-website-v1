'use client'

/**
 * Hero: the argument on the left, the form on the right, on a champagne
 * ground. There is no hero photograph — the page leads with the claim and the
 * ask, which also puts the form title on the first screen of a phone without
 * any scrolling.
 *
 * The six children of `.hero-copy` are staggered by `:nth-child` in
 * landing.css — adding or reordering one changes the animation, so keep the
 * order: eyebrow, headline, lede, trust, nudge, badges.
 *
 * There is no financing chip. A weekly payment is the one element that told
 * this audience the page was selling on price; see the REGISTER note in
 * `lp-copy.ts`.
 */

import Image from 'next/image'

import { LP_BADGES } from './lp-assets'
import type { LpDictionary, LpLang } from './lp-copy'
import { CheckIcon, GoogleMark, Rich, Stars } from './lp-primitives.component'
import type { VariantCopy } from './lp-variants'

interface LpHeroProps {
    readonly lang: LpLang
    readonly copy: LpDictionary['hero']
    readonly variant: VariantCopy
    readonly onSelectLang: (lang: LpLang) => void
    /** The form card, rendered by the page so this stays presentational. */
    readonly form: React.ReactNode
}

export function LpHero({
    lang,
    copy,
    variant,
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
                            <Stars />
                            <span>
                                <Rich parts={copy.trustGoogle} />
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
                    <p className='nudge'>
                        {copy.nudge.question}{' '}
                        <button
                            type='button'
                            onClick={() => onSelectLang(otherLang)}
                        >
                            {copy.nudge.action}
                        </button>
                    </p>
                    <ul className='badges' aria-label={copy.badgesLabel}>
                        {LP_BADGES.map((badge) => (
                            <li key={badge.src}>
                                <Image
                                    src={badge.src}
                                    alt={badge.alt}
                                    width={badge.width}
                                    height={badge.height}
                                    loading='lazy'
                                />
                            </li>
                        ))}
                    </ul>
                </div>

                {form}
            </div>
        </section>
    )
}
