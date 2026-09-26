'use client'

/**
 * The closing section and the page's own footer.
 *
 * The closing section asks the form's first question again, with every
 * chip (#292): each is a link to the form that also answers it
 * (`LpAnswerLink`), so a visitor who has read to the bottom lands on the
 * form one step in. The phone's sticky bar steps aside while it is on
 * screen, so the question is never asked twice at once.
 *
 * The footer is deliberately minimal — the address, the disclaimer and the
 * legal documents, which open in a dialog on the page rather than on the
 * main site (`lp-legal-dialog.component`). No navigation.
 */

import type { ConsultChatOption } from '@/components/shared/consult-chat/consult-chat.types'
import { getPhoneLink, siteConfig } from '@/lib/data/site-config'

import { LpAnswerLink } from './lp-answer-link.component'
import type { LpDictionary } from './lp-copy'
import { LP_LEGAL_HREFS } from './lp-legal'
import { Rich } from './lp-primitives.component'

/** Its id, so the sticky bar steps aside while it is on screen. */
export const LP_CLOSING_ID = 'closing'

interface LpClosingCtaProps {
    readonly copy: LpDictionary['closing']
    /** The form's procedure options, in its order and language. */
    readonly procedures: readonly ConsultChatOption[]
}

export function LpClosingCta({ copy, procedures }: LpClosingCtaProps) {
    return (
        <section className='cta' id={LP_CLOSING_ID}>
            <div className='wrap cta-in reveal'>
                <h2>
                    <Rich parts={copy.heading} />
                </h2>
                <p className='cta-chips-label' id='closing-chips-label'>
                    {copy.chipsLabel}
                </p>
                <ul className='cta-chips' aria-labelledby='closing-chips-label'>
                    {procedures.map((option) => (
                        <li key={option.value}>
                            <LpAnswerLink
                                option={option}
                                entry='closing'
                                track='cta-bottom-chip'
                            />
                        </li>
                    ))}
                </ul>
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
                        <a href={LP_LEGAL_HREFS.privacy}>{copy.privacy}</a>
                        <a href={LP_LEGAL_HREFS.terms}>{copy.terms}</a>
                        <a href={LP_LEGAL_HREFS.cookies}>{copy.cookies}</a>
                    </nav>
                </div>
                <p className='disclaimer'>{copy.disclaimer}</p>
            </div>
        </footer>
    )
}
