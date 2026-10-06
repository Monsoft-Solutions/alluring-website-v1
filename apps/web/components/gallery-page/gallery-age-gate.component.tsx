'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'

import { AGE_OK_KEY } from './gallery-age-gate.constant'

/**
 * The gallery's 18+ confirmation.
 *
 * The gallery shows real patients' bodies, unclothed or in underwear, so
 * every gallery page asks once per browser. Until the visitor answers, the
 * photos and videos stay blurred by CSS (`[data-age-gated]` in
 * gallery-page.css); they are still in the HTML for search engines.
 * Escape does not dismiss it: the visitor either confirms or leaves.
 */
export function GalleryAgeGate() {
    const dialogRef = useRef<HTMLDialogElement>(null)

    useEffect(() => {
        if (document.documentElement.hasAttribute('data-age-ok')) return
        dialogRef.current?.showModal()
    }, [])

    const confirm = () => {
        try {
            localStorage.setItem(AGE_OK_KEY, '1')
        } catch {
            // Private mode: the answer holds for this page view only
        }
        document.documentElement.setAttribute('data-age-ok', '')
        dialogRef.current?.close()
    }

    return (
        <dialog
            ref={dialogRef}
            className='gp-gate'
            aria-labelledby='age-gate-title'
            aria-describedby='age-gate-body'
            onCancel={(event) => event.preventDefault()}
        >
            <div className='flex flex-col gap-5 p-7 md:p-9'>
                <p className='gp-eyebrow'>Before &amp; after gallery</p>
                <h2
                    id='age-gate-title'
                    className='gp-display text-[2rem] leading-[1.05] text-balance'
                >
                    Are you <em>18</em> or older?
                </h2>
                <p
                    id='age-gate-body'
                    className='text-[0.975rem] leading-relaxed text-[var(--gp-ink-2)]'
                >
                    This gallery shows real patients before and after surgery,
                    including bodies in underwear or unclothed. Please confirm
                    you are 18 or older to see the photos and videos.
                </p>
                <div className='mt-1 flex flex-col gap-3 sm:flex-row'>
                    <button
                        type='button'
                        onClick={confirm}
                        className='inline-flex flex-1 items-center justify-center rounded-full bg-[var(--gp-ink)] px-6 py-3 text-[0.95rem] font-medium text-[var(--gp-porcelain)] transition hover:bg-[var(--gp-ink-2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gp-bronze)]'
                        autoFocus
                    >
                        Yes, I&apos;m 18 or older
                    </button>
                    <Link
                        href='/'
                        className='inline-flex flex-1 items-center justify-center rounded-full border border-[var(--gp-line)] px-6 py-3 text-[0.95rem] text-[var(--gp-ink)] transition hover:border-[var(--gp-champagne-2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gp-bronze)]'
                    >
                        No, take me back
                    </Link>
                </div>
            </div>
        </dialog>
    )
}
