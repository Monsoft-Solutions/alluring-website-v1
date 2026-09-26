'use client'

/**
 * The surgeon section, after the results.
 *
 * The objection a paid visitor has by this point is "who is actually going
 * to operate on me", and the answer is the promise every ad makes, in one
 * line: the surgeon you meet is the surgeon who operates. v6 (#292) drops
 * the stats row — its procedure counts had no source on file — and the
 * button; the sticky bar asks the form's question instead.
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
                <div className='surgeon-copy reveal'>
                    <p className='eyebrow'>{copy.eyebrow}</p>
                    <h2 className='h2'>
                        <Rich parts={copy.heading} />
                    </h2>
                    <p className='role'>{copy.role}</p>
                    <p className='lead'>{copy.lead}</p>
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
                </div>
            </div>
        </section>
    )
}
