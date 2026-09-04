'use client'

/**
 * The surgeon section, immediately after the form.
 *
 * It sits this high on purpose: the objection a paid visitor has at this point
 * is "who is actually going to operate on me", and the answer — you meet the
 * surgeon, not a commission-paid closer — is the page's strongest claim.
 */

import Image from 'next/image'

import { LP_SURGEON_PORTRAIT } from './lp-assets'
import type { LpDictionary } from './lp-copy'
import { Rich } from './lp-primitives.component'

interface LpSurgeonProps {
    readonly copy: LpDictionary['surgeon']
}

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
                    <blockquote>{copy.quote}</blockquote>
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
