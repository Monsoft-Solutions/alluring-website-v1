'use client'

/**
 * A procedure chip anywhere on the page that answers the form's first
 * question: the closing section's chips and a sitelink view's question strip
 * (#292).
 *
 * The form answers the tap itself (it listens for `data-consult-procedure`
 * links, and reads `data-consult-entry` for the funnel's `entry_point`); this
 * only decides where the page lands. A smooth anchor scroll is still running
 * when the form scrolls its next question into view, and the two together
 * can leave the question off screen. Landing on the form's end at once keeps
 * the next question and its answers in view.
 */

import type { ConsultChatOption } from '@/components/shared/consult-chat/consult-chat.types'

import { LP_CHAT_ID } from './lp-config'

function landOnFormEnd(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    document
        .getElementById(LP_CHAT_ID)
        ?.scrollIntoView({ block: 'end', behavior: 'instant' })
}

interface LpAnswerLinkProps {
    readonly option: ConsultChatOption
    /** `closing`, `strip`: where the chip sits, for `entry_point`. */
    readonly entry: string
    /** `data-track` placement for the page's own CTA events. */
    readonly track: string
}

export function LpAnswerLink({ option, entry, track }: LpAnswerLinkProps) {
    return (
        <a
            href={`#${LP_CHAT_ID}`}
            data-consult-procedure={option.value}
            data-consult-entry={entry}
            data-track={track}
            onClick={landOnFormEnd}
            className={option.value === 'other' ? 'chip chip--quiet' : 'chip'}
        >
            {option.label}
        </a>
    )
}
