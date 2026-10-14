'use client'

/**
 * "Request my consultation", pinned to the bottom of the screen once the
 * hero form has scrolled away — so the one ask is always a thumb away — and
 * out of the way whenever it would be noise: while the form is on screen,
 * while the closing band (which has its own button) is, and while the
 * keyboard is open.
 *
 * It also owns the page's "go to the form" links (`data-drk-focus`): plain
 * `#drk-request` anchors that work without scripting, upgraded here to
 * scroll to the form and focus its first empty field.
 */

import { useEffect, useState } from 'react'

import { DRK_FORM_ID } from './drk-config'
import { focusDrkForm } from './drk-focus'

interface DrkStickyCtaProps {
    readonly label: string
    /** Sections whose presence on screen hides the bar. */
    readonly hideWhile: readonly string[]
}

const TYPING = 'input:not([type=checkbox]), select, textarea'

export function DrkStickyCta({ label, hideWhile }: DrkStickyCtaProps) {
    const [blocked, setBlocked] = useState(true)
    const [typing, setTyping] = useState(false)

    useEffect(() => {
        const watched = [DRK_FORM_ID, ...hideWhile].flatMap((id) => {
            const element = document.getElementById(id)
            return element ? [element] : []
        })
        if (!watched.length || !('IntersectionObserver' in window)) return

        const onScreen = new Map<Element, boolean>(
            watched.map((element) => [element, false])
        )
        // Starts hidden: the form is the first thing on screen.
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    onScreen.set(entry.target, entry.isIntersecting)
                }
                setBlocked([...onScreen.values()].some(Boolean))
            },
            { threshold: 0.05 }
        )
        for (const element of watched) observer.observe(element)
        return () => observer.disconnect()
    }, [hideWhile])

    // A field with focus means the keyboard is (or is about to be) open.
    useEffect(() => {
        const onFocusIn = (event: FocusEvent) => {
            if (event.target instanceof Element && event.target.matches(TYPING))
                setTyping(true)
        }
        const onFocusOut = () => setTyping(false)
        document.addEventListener('focusin', onFocusIn)
        document.addEventListener('focusout', onFocusOut)
        return () => {
            document.removeEventListener('focusin', onFocusIn)
            document.removeEventListener('focusout', onFocusOut)
        }
    }, [])

    useEffect(() => {
        const onClick = (event: MouseEvent) => {
            if (!(event.target instanceof Element)) return
            const link = event.target.closest('[data-drk-focus]')
            if (!link) return
            event.preventDefault()
            focusDrkForm()
        }
        document.addEventListener('click', onClick)
        return () => document.removeEventListener('click', onClick)
    }, [])

    const visible = !blocked && !typing

    return (
        <div
            className={`drk-sticky${visible ? ' is-visible' : ''}`}
            inert={!visible}
        >
            <a
                href={`#${DRK_FORM_ID}`}
                className='drk-btn drk-btn--gold drk-sticky__btn'
                data-drk-focus=''
                data-cta='drk_sticky'
            >
                {label}
            </a>
        </div>
    )
}
