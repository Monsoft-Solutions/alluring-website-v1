'use client'

/**
 * Mobile-only "Message Melissa" bar.
 *
 * It stays out of the way while the hero or the chat itself is on screen —
 * a button pointing at a form the visitor can already see is noise — and
 * slides in everywhere else, so the next step is always one thumb away.
 */

import Image from 'next/image'
import { useEffect, useState } from 'react'

import { MJ_AVATAR, MJ_CHAT_ID } from './mj-config'

interface MjStickyCtaProps {
    readonly cta: string
    readonly note: string
    /** Id of the hero section. */
    readonly heroId: string
}

export function MjStickyCta({ cta, note, heroId }: MjStickyCtaProps) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const hero = document.getElementById(heroId)
        const chat = document.getElementById(MJ_CHAT_ID)
        if (!hero || !chat || !('IntersectionObserver' in window)) return

        const onScreen = new Map<Element, boolean>([
            [hero, true],
            [chat, false],
        ])
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    onScreen.set(entry.target, entry.isIntersecting)
                }
                setVisible(![...onScreen.values()].some(Boolean))
            },
            { threshold: 0.12 }
        )
        observer.observe(hero)
        observer.observe(chat)
        return () => observer.disconnect()
    }, [heroId])

    return (
        <div
            className={`mj-sticky${visible ? ' is-visible' : ''}`}
            inert={!visible}
        >
            <a href={`#${MJ_CHAT_ID}`} className='mj-sticky__link'>
                <span className='mj-sticky__avatar'>
                    <Image
                        src={MJ_AVATAR.src}
                        width={MJ_AVATAR.width}
                        height={MJ_AVATAR.height}
                        sizes='40px'
                        alt=''
                    />
                </span>
                <span className='mj-sticky__text'>
                    <strong>{cta}</strong>
                    <small>{note}</small>
                </span>
                <span className='mj-sticky__arrow' aria-hidden='true'>
                    →
                </span>
            </a>
        </div>
    )
}
