'use client'

/**
 * The questions a paid visitor actually asks, money first (#290): what it
 * costs, whether she can finance it, how it works from out of state, whether
 * it is safe, and what if she isn't ready. v6 (#292) drops the time-off
 * question and closes them all: the page is for the few who look, and five
 * question lines are shorter to scroll past than one open answer.
 *
 * Native `<details>`: no script, the browser's own keyboard and
 * screen-reader behaviour, and the answers stay in the HTML. There is no
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
                    {copy.items.map((item) => (
                        <details className='faq-item' key={item.question}>
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
