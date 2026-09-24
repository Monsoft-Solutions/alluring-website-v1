'use client'

/**
 * The closing section and the page's own footer.
 *
 * The closing section asks the thread's first question itself: each chip is
 * a link to the thread that also answers it (`data-consult-procedure`, read
 * by `ConsultChat`), so a visitor who has read to the bottom lands on the
 * thread one step in, with the reply to her procedure already given.
 *
 * The footer is deliberately minimal — the address, the disclaimer and the
 * legal documents, which open in a dialog on the page rather than on the
 * main site (`lp-legal-dialog.component`). No navigation.
 */

import type { ConsultChatOption } from '@/components/shared/consult-chat/consult-chat.types'
import { getPhoneLink, siteConfig } from '@/lib/data/site-config'

import { LP_CHAT_ID } from './lp-config'
import type { LpDictionary } from './lp-copy'
import { LP_LEGAL_HREFS } from './lp-legal'
import { Rich } from './lp-primitives.component'

/**
 * The thread answers the tap itself (it listens for `data-consult-procedure`
 * links); this only decides where the page lands. A smooth anchor scroll up
 * from the bottom of the page is still running when the thread scrolls its
 * next question into view, and the two together leave the reply to her
 * procedure above the screen. Landing on the thread's end at once keeps the
 * reply, the next question and its chips in view.
 */
function landOnThreadEnd(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    document
        .getElementById(LP_CHAT_ID)
        ?.scrollIntoView({ block: 'end', behavior: 'instant' })
}

/** Chips shown: the first six of the thread's own, which lead with the ad group's. */
const CLOSING_CHIPS = 6

interface LpClosingCtaProps {
    readonly copy: LpDictionary['closing']
    /** The thread's procedure options, in its order and language. */
    readonly procedures: readonly ConsultChatOption[]
}

export function LpClosingCta({ copy, procedures }: LpClosingCtaProps) {
    const chips = procedures
        .filter((option) => option.value !== 'other')
        .slice(0, CLOSING_CHIPS)
    const other = procedures.find((option) => option.value === 'other')

    return (
        <section className='cta'>
            <div className='wrap cta-in reveal'>
                <h2>
                    <Rich parts={copy.heading} />
                </h2>
                <p>{copy.body}</p>
                <p className='cta-chips-label' id='closing-chips-label'>
                    {copy.chipsLabel}
                </p>
                <ul className='cta-chips' aria-labelledby='closing-chips-label'>
                    {[...chips, ...(other ? [other] : [])].map((option) => (
                        <li key={option.value}>
                            <a
                                href={`#${LP_CHAT_ID}`}
                                data-consult-procedure={option.value}
                                data-track='cta-bottom-chip'
                                onClick={landOnThreadEnd}
                                className={
                                    option.value === 'other'
                                        ? 'chip chip--quiet'
                                        : 'chip'
                                }
                            >
                                {option.label}
                            </a>
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
