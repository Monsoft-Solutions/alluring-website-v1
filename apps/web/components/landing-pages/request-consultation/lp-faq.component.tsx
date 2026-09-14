'use client'

/**
 * The three objections that actually stop a paid visitor from booking: safety,
 * recovery time, and not being ready yet.
 *
 * Deliberately not an accordion. Three short answers read faster open than a
 * control the visitor has to discover and click, and there is no structured
 * data to earn here — the page is noindex.
 */

import type { LpDictionary } from './lp-copy'
import { Rich } from './lp-primitives.component'

interface LpFaqProps {
    readonly copy: LpDictionary['faq']
}

export function LpFaq({ copy }: LpFaqProps) {
    return (
        <section className='band' id='faq'>
            <div className='wrap'>
                <div className='sec-head reveal'>
                    <p className='eyebrow'>{copy.eyebrow}</p>
                    <h2 className='h2'>
                        <Rich parts={copy.heading} />
                    </h2>
                </div>
                <div className='faq-grid reveal'>
                    {copy.items.map((item) => (
                        <article className='faq-item' key={item.question}>
                            <h3>{item.question}</h3>
                            <p>{item.answer}</p>
                            <span className='tag'>{item.tag}</span>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}
