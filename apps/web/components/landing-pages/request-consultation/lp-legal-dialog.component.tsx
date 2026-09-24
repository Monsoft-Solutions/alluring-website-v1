'use client'

/**
 * Privacy, Terms and Cookies, opened in a dialog instead of on the main site.
 *
 * A paid landing page must show them — the consent under the thread names
 * the first two, and Google Ads expects a privacy policy wherever personal
 * data is collected — but a link out is a way off the page that rarely comes
 * back. So every link to one of the three stays a real link (crawlers and a
 * page without scripting still reach the document) and a click on it is
 * caught here and opened on the page.
 *
 * One listener on the document catches them wherever they are: the footer,
 * the consent inside the consultation thread, or a link between the
 * documents themselves. The documents and the markdown renderer are only
 * downloaded when a visitor opens one (`lp-legal-document.component`).
 */

import { useEffect, useRef, useState } from 'react'

import type { LpDictionary } from './lp-copy'
import {
    LP_LEGAL_HREFS,
    LP_LEGAL_NEW_TAB_ATTR,
    legalDocFor,
    type LpLegalDoc,
} from './lp-legal'
import { LpLegalDocument } from './lp-legal-document.component'

import './lp-legal.css'

interface LpLegalDialogProps {
    readonly copy: LpDictionary['footer']
}

export function LpLegalDialog({ copy }: LpLegalDialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const [doc, setDoc] = useState<LpLegalDoc | null>(null)

    useEffect(() => {
        const onClick = (event: MouseEvent) => {
            if (!(event.target instanceof Element)) return
            const link = event.target.closest<HTMLAnchorElement>('a[href]')
            if (link?.hasAttribute(LP_LEGAL_NEW_TAB_ATTR)) return
            const next = link && legalDocFor(link.getAttribute('href') ?? '')
            if (!next) return
            // A modified click would open the document in another tab, which
            // is still a way off the page. Every click opens it here.
            event.preventDefault()
            setDoc(next)
            const dialog = dialogRef.current
            if (dialog && !dialog.open) dialog.showModal()
        }
        // Capture, so the link is caught before a click handler on the way
        // down (a consent label, a tracker) can act on it.
        document.addEventListener('click', onClick, true)
        return () => document.removeEventListener('click', onClick, true)
    }, [])

    const close = () => dialogRef.current?.close()

    return (
        <dialog
            ref={dialogRef}
            className='lp-legal'
            aria-labelledby='lp-legal-title'
            // A click on the backdrop lands on the dialog element itself.
            onClick={(event) => {
                if (event.target === event.currentTarget) close()
            }}
        >
            <div className='lp-legal-in'>
                <header className='lp-legal-head'>
                    <h2 id='lp-legal-title'>{doc ? copy.titles[doc] : ''}</h2>
                    <button
                        type='button'
                        className='lp-legal-close'
                        onClick={close}
                        aria-label={copy.close}
                    >
                        <svg
                            viewBox='0 0 24 24'
                            width='18'
                            height='18'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            aria-hidden='true'
                        >
                            <path d='M6 6l12 12M18 6 6 18' />
                        </svg>
                    </button>
                </header>
                <div className='lp-legal-body'>
                    {doc && (
                        <LpLegalDocument
                            doc={doc}
                            href={LP_LEGAL_HREFS[doc]}
                            loadingLabel={copy.loading}
                            errorLabel={copy.loadError}
                            openInTabLabel={copy.openInTab}
                        />
                    )}
                </div>
            </div>
        </dialog>
    )
}
