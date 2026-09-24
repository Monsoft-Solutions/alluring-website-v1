'use client'

/**
 * The questions a paid visitor actually asks, money first (#290): what it
 * costs, whether she can finance it, whether it is safe, the time off, how
 * it works from out of state, and what if she isn't ready.
 *
 * Six answers are too long to read open on a phone, so they are native
 * `<details>` with the first one open: no script, the browser's own keyboard
 * and screen-reader behaviour, and the answers stay in the HTML. There is no
 * structured data to earn here — the page is noindex.
 *
 * The cost answer repeats the settled starting prices (BBL, Lipo 360). They
 * come from the thread's own copy, which the server read from the procedure
 * facts files, so the page never states a price the facts no longer carry:
 * without both, the sentence is dropped.
 */

import { fill } from '@/components/shared/consult-chat/consult-chat.util'

import type { LpDictionary } from './lp-copy'
import { Rich } from './lp-primitives.component'

interface LpFaqProps {
    readonly copy: LpDictionary['faq']
    /** Starting prices by procedure value, already formatted ("$5,500"). */
    readonly prices: Readonly<Record<string, string>>
}

export function LpFaq({ copy, prices }: LpFaqProps) {
    const bbl = prices.bbl
    const lipo = prices.liposuction
    const pricesLine = bbl && lipo ? fill(copy.prices, { bbl, lipo }) : ''

    return (
        <section className='band' id='faq'>
            <div className='wrap'>
                <div className='sec-head reveal'>
                    <p className='eyebrow'>{copy.eyebrow}</p>
                    <h2 className='h2'>
                        <Rich parts={copy.heading} />
                    </h2>
                </div>
                <div className='faq-list reveal'>
                    {copy.items.map((item, index) => (
                        <details
                            className='faq-item'
                            key={item.question}
                            open={index === 0}
                        >
                            <summary>
                                <h3>{item.question}</h3>
                            </summary>
                            <p>
                                {fill(item.answer, { prices: pricesLine })
                                    .replace(/\s{2,}/g, ' ')
                                    .trim()}
                            </p>
                            <span className='tag'>{item.tag}</span>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    )
}
