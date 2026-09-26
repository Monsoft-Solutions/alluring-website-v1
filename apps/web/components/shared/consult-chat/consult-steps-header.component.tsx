/**
 * The form header both consultation forms can wear (#292): a title, how long
 * it takes, and the three steps by name, marked done, current or next.
 *
 * It replaces the thread's messaging-app header (avatar, name, online dot) on
 * the ads landing page, where that header read as a chat with a person the
 * visitor had not asked to talk to. Screen readers hear "Step 2 of 3" rather
 * than three list items.
 */

import type { ConsultChatCopy } from './consult-chat.types'
import { fill } from './consult-chat.util'
import { FLOW_LAST_STEP, type FlowStep } from './consult-flow.logic'

interface ConsultStepsHeaderProps {
    /** Class prefix: `cc` in the thread, `ck` in the card. */
    readonly prefix: string
    readonly titleId: string
    readonly copy: ConsultChatCopy
    readonly step: FlowStep
}

export function ConsultStepsHeader({
    prefix,
    titleId,
    copy,
    step,
}: ConsultStepsHeaderProps) {
    const c = (name: string) => `${prefix}-${name}`
    const header = copy.formHeader
    return (
        <header className={c('steps')}>
            <div className={c('steps__top')}>
                <h2 id={titleId} className={c('steps__title')}>
                    {copy.title}
                </h2>
                {header && (
                    <span className={c('steps__time')} aria-hidden='true'>
                        {step === FLOW_LAST_STEP
                            ? header.lastStep
                            : header.time}
                    </span>
                )}
            </div>
            <span className={c('sr')}>
                {fill(copy.stepLabel, { n: String(step + 1) })}
            </span>
            {header && (
                <ol className={c('steps__list')} aria-hidden='true'>
                    {header.steps.map((label, index) => (
                        <li
                            key={label}
                            className={
                                index < step
                                    ? 'is-done'
                                    : index === step
                                      ? 'is-current'
                                      : undefined
                            }
                        >
                            {label}
                        </li>
                    ))}
                </ol>
            )}
        </header>
    )
}
