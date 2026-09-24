'use client'

/**
 * The surgeon section, after price & financing.
 *
 * The objection a paid visitor has by this point is "who is actually going
 * to operate on me", and the answer is the promise every ad makes: the
 * surgeon you meet plans your surgery, performs it and sees you at
 * follow-up. v5 (#290) leads with that line and drops the general quote,
 * which said nothing she could check and cost a phone screen of scrolling.
 *
 * Credentials are the ones checked at the issuing bodies and worded per
 * Florida Rule 64B8-11.001 (`karlinsky-credentials.constant.ts`): her name
 * with MD, and only boards that need no Florida statement. The badges are
 * the same two: the American Board of Surgery and the American College of
 * Surgeons.
 */

import Image from 'next/image'

import { LP_SURGEON_PORTRAIT } from './lp-assets'
import type { LpDictionary } from './lp-copy'
import { Rich } from './lp-primitives.component'

interface LpSurgeonProps {
    readonly copy: LpDictionary['surgeon']
}

const SURGEON_BADGES = [
    {
        src: '/images/certifications/abs-board-certified.png',
        alt: 'American Board of Surgery, Board Certified',
        width: 1713,
        height: 424,
    },
    {
        src: '/images/certifications/facs-fellow.svg',
        alt: 'Fellow, American College of Surgeons',
        width: 237,
        height: 74,
    },
] as const

export function LpSurgeon({ copy }: LpSurgeonProps) {
    return (
        <section className='surgeon on-dark' id='surgeon'>
            <div className='wrap surgeon-in'>
                <div className='portrait reveal'>
                    <Image
                        src={LP_SURGEON_PORTRAIT.src}
                        width={LP_SURGEON_PORTRAIT.width}
                        height={LP_SURGEON_PORTRAIT.height}
                        alt={copy.portraitAlt}
                        sizes='(max-width: 860px) 300px, 400px'
                        loading='lazy'
                    />
                </div>
                <div className='reveal'>
                    <p className='eyebrow'>{copy.eyebrow}</p>
                    <h2 className='h2'>
                        <Rich parts={copy.heading} />
                    </h2>
                    <p className='role'>{copy.role}</p>
                    <p className='lead'>{copy.lead}</p>
                    <div className='stats'>
                        {copy.stats.map((stat) => (
                            <div className='stat' key={stat.label}>
                                {/*
                                    The number is a bare text node, not a
                                    <span>: `.stat span` in landing.css is a
                                    descendant selector and would shrink it to
                                    the label's 10.5px. Only the star, which
                                    has its own higher-specificity rule, can
                                    be an element here.
                                */}
                                <b>
                                    {stat.value}
                                    {stat.star ? (
                                        <span className='star'>★</span>
                                    ) : null}
                                </b>
                                <span>{stat.label}</span>
                            </div>
                        ))}
                    </div>
                    <ul className='creds'>
                        {copy.credentials.map((credential) => (
                            <li key={credential}>{credential}</li>
                        ))}
                    </ul>
                    <ul className='seals' aria-label={copy.badgesLabel}>
                        {SURGEON_BADGES.map((badge) => (
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
                    <a
                        className='btn btn-primary'
                        href='#consultation'
                        data-track='cta-surgeon'
                    >
                        {copy.cta}
                    </a>
                </div>
            </div>
        </section>
    )
}
