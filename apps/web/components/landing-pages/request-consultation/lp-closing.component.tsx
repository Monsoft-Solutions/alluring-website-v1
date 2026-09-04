'use client'

/**
 * The closing CTA, the page's own footer, and the phone-only sticky bar.
 *
 * The footer is deliberately minimal — legal links and the disclaimer, no
 * navigation. The sticky bar hides itself while the form is on screen, so it
 * never competes with the thing it is pointing at.
 */

import { useEffect, useRef, useState } from 'react'

import { getPhoneLink, siteConfig } from '@/lib/data/site-config'

import type { LpDictionary } from './lp-copy'
import { LP_LINKS } from './lp-copy'
import { PhoneIcon, Rich } from './lp-primitives.component'

export function LpClosingCta({ copy }: { copy: LpDictionary['closing'] }) {
    return (
        <section className='cta'>
            <div className='wrap cta-in reveal'>
                <h2>
                    <Rich parts={copy.heading} />
                </h2>
                <p>{copy.body}</p>
                <a
                    className='btn btn-primary'
                    href='#consultation'
                    data-track='cta-bottom'
                >
                    {copy.cta}
                </a>
                <p className='or'>
                    {copy.or}{' '}
                    <a href={getPhoneLink()} data-track='call-bottom'>
                        {siteConfig.contact.phoneDisplay}
                    </a>
                </p>
            </div>
        </section>
    )
}

export function LpFooter({ copy }: { copy: LpDictionary['footer'] }) {
    const { address, city, state, postalCode } = siteConfig.contact
    return (
        <footer className='site'>
            <div className='wrap'>
                <div className='foot-in'>
                    <span>
                        © {new Date().getFullYear()} {siteConfig.business.name}{' '}
                        · {address}, {city}, {state} {postalCode}
                    </span>
                    <nav>
                        <a href={LP_LINKS.privacy}>{copy.privacy}</a>
                        <a href={LP_LINKS.terms}>{copy.terms}</a>
                        <a href={LP_LINKS.cookies}>{copy.cookies}</a>
                    </nav>
                </div>
                <p className='disclaimer'>{copy.disclaimer}</p>
            </div>
        </footer>
    )
}

/**
 * Phone-only call/CTA bar. It watches the form card and steps out of the way
 * while the form is visible.
 */
export function LpStickyBar({ copy }: { copy: LpDictionary['sticky'] }) {
    const [hidden, setHidden] = useState(false)
    const barRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const card = document.getElementById('consultation')
        if (!card) return

        const observer = new IntersectionObserver(
            ([entry]) => setHidden(entry?.isIntersecting ?? false),
            { threshold: 0.15 }
        )
        observer.observe(card)
        return () => observer.disconnect()
    }, [])

    return (
        <div
            className={`sticky${hidden ? ' is-hidden' : ''}`}
            ref={barRef}
            aria-hidden={hidden}
        >
            <a
                className='s-call'
                href={getPhoneLink()}
                data-track='call-sticky'
                tabIndex={hidden ? -1 : undefined}
            >
                <PhoneIcon />
                <span>{copy.call}</span>
            </a>
            <a
                className='s-cta'
                href='#consultation'
                data-track='cta-sticky'
                tabIndex={hidden ? -1 : undefined}
            >
                {copy.cta}
            </a>
        </div>
    )
}
