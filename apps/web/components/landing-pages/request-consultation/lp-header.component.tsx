'use client'

/**
 * The landing page's own header. The site's global header and footer are
 * suppressed on `/lp/*` (see `conditional-layout.component.tsx`): a paid
 * landing page has exactly one job, and site navigation is a way out of it.
 *
 * What survives is a logo that leaves to the main site, the language toggle,
 * the phone number, and the CTA that scrolls to the form.
 */

import Image from 'next/image'

import { getPhoneLink, siteConfig } from '@/lib/data/site-config'

import {
    LP_LANGUAGES,
    LP_LINKS,
    type LpDictionary,
    type LpLang,
} from './lp-copy'
import { LP_LOGO } from './lp-assets'
import { PhoneIcon } from './lp-primitives.component'

interface LpHeaderProps {
    readonly lang: LpLang
    readonly copy: LpDictionary['header']
    readonly onSelectLang: (lang: LpLang) => void
}

export function LpHeader({ lang, copy, onSelectLang }: LpHeaderProps) {
    return (
        <header className='hdr'>
            <div className='wrap hdr-in'>
                <a
                    className='brand'
                    href={LP_LINKS.home}
                    aria-label={siteConfig.business.name}
                >
                    <Image
                        src={LP_LOGO.src}
                        width={LP_LOGO.width}
                        height={LP_LOGO.height}
                        alt={siteConfig.business.name}
                        priority
                    />
                </a>
                <div className='hdr-r'>
                    <div
                        className='lang'
                        role='group'
                        aria-label={copy.langLabel}
                    >
                        {LP_LANGUAGES.map((option) => (
                            <button
                                key={option}
                                type='button'
                                aria-pressed={option === lang}
                                onClick={() => onSelectLang(option)}
                            >
                                {option.toUpperCase()}
                            </button>
                        ))}
                    </div>
                    <a
                        className='tel'
                        href={getPhoneLink()}
                        data-track='call-header'
                    >
                        <PhoneIcon />
                        <span>
                            <span className='tel-word'>{copy.callWord}</span>
                            {siteConfig.contact.phoneDisplay}
                        </span>
                    </a>
                    <a
                        className='btn btn-primary btn-sm hdr-cta'
                        href='#consultation'
                        data-track='cta-header'
                    >
                        {copy.cta}
                    </a>
                </div>
            </div>
        </header>
    )
}
