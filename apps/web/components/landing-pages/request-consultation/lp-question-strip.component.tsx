'use client'

/**
 * The question strip (#292): a one-row card that asks the form's first
 * question above the section a sitelink opened (`?s=`).
 *
 * A sitelink visitor lands on the section she clicked, below the hero, and
 * 25 of them (22% of paid visits, 24–26 Sep) sent nothing: the form was
 * above the screen. The strip puts the question in front of her; a chip
 * answers it and brings her to the form at the second step.
 */

import type { ConsultChatOption } from '@/components/shared/consult-chat/consult-chat.types'

import { LpAnswerLink } from './lp-answer-link.component'
import type { LpDictionary } from './lp-copy'

/** Its id, so the sticky bar steps aside while it is on screen. */
export const LP_STRIP_ID = 'question-strip'

interface LpQuestionStripProps {
    readonly copy: LpDictionary['strip']
    /** The form's procedure options, in its order and language. */
    readonly procedures: readonly ConsultChatOption[]
}

export function LpQuestionStrip({ copy, procedures }: LpQuestionStripProps) {
    return (
        <section
            className='qstrip'
            id={LP_STRIP_ID}
            aria-labelledby={`${LP_STRIP_ID}-label`}
        >
            <div className='wrap'>
                <div className='qstrip-card'>
                    <p className='qstrip-q'>
                        <span id={`${LP_STRIP_ID}-label`}>{copy.question}</span>
                        <span className='qstrip-hint'>{copy.hint}</span>
                    </p>
                    <ul className='qstrip-chips'>
                        {procedures.map((option) => (
                            <li key={option.value}>
                                <LpAnswerLink
                                    option={option}
                                    entry='strip'
                                    track='cta-strip-chip'
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    )
}
