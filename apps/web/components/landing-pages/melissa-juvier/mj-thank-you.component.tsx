'use client'

/**
 * The confirmation after a request from Melissa's page.
 *
 * It greets the visitor by first name and repeats the contact method they
 * chose. Both come from `sessionStorage`, written by the chat form just before
 * the redirect — never from the URL, so no name reaches analytics. The server
 * renders the unnamed greeting, and it stays that way when storage is empty.
 */

import Image from 'next/image'
import { useSyncExternalStore } from 'react'

import { fill, MJ_AVATAR, MJ_LEAD_STORAGE_KEY, MJ_PAGE_PATH } from './mj-config'
import type { MjDictionary, MjLang } from './mj-copy'

interface StoredLead {
    readonly firstName: string
    readonly method: 'text' | 'call'
}

const NOTHING = ''

function subscribe(): () => void {
    return () => {}
}

/** The raw string, so the snapshot is stable between renders. */
function readStored(): string {
    try {
        return window.sessionStorage.getItem(MJ_LEAD_STORAGE_KEY) ?? NOTHING
    } catch {
        return NOTHING
    }
}

function parse(raw: string): StoredLead | null {
    if (!raw) return null
    try {
        const value = JSON.parse(raw) as Partial<StoredLead>
        return {
            firstName:
                typeof value.firstName === 'string' ? value.firstName : '',
            method: value.method === 'call' ? 'call' : 'text',
        }
    } catch {
        return null
    }
}

interface MjThankYouProps {
    readonly lang: MjLang
    readonly copy: MjDictionary['thankYou']
}

export function MjThankYou({ lang, copy }: MjThankYouProps) {
    const raw = useSyncExternalStore(subscribe, readStored, () => NOTHING)
    const lead = parse(raw)
    const name = lead?.firstName.trim()

    return (
        <main className='mj-ty'>
            <span className='mj-closing__avatar'>
                <Image
                    src={MJ_AVATAR.src}
                    width={MJ_AVATAR.width}
                    height={MJ_AVATAR.height}
                    sizes='96px'
                    alt=''
                    priority
                />
            </span>
            <p className='mj-eyebrow mj-eyebrow--light'>
                <span className='mj-dot' aria-hidden='true' />
                {copy.eyebrow}
            </p>
            <h1 className='mj-h2 mj-h2--light mj-ty__title'>
                {name ? fill(copy.headingNamed, { name }) : copy.heading}
            </h1>
            <p className='mj-ty__body'>{copy.body[lead?.method ?? 'text']}</p>

            <div className='mj-ty__next'>
                <h2 className='mj-eyebrow mj-eyebrow--light'>
                    {copy.nextTitle}
                </h2>
                <ol>
                    {copy.next.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ol>
            </div>

            <p className='mj-ty__sign'>
                <span>{copy.signoff}</span>
                <span className='mj-letter__name'>Melissa</span>
            </p>

            <a
                className='mj-link mj-ty__back'
                href={`${MJ_PAGE_PATH}?hl=${lang}`}
            >
                ← {copy.back}
            </a>
        </main>
    )
}
