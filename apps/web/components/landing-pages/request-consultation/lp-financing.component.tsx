'use client'

/**
 * Price & financing, as the short view its sitelink opens (`?s=financing`).
 *
 * v5 (#290) gave financing a band on the page with a written-summary card
 * and three steps. v6 (#292) takes the band off the short page — every ad
 * already says financing is available, and the hero's trust row repeats it
 * — but the live sitelink still needs a destination, so this is the band
 * cut to what a visitor who asked about paying needs: one figure in writing,
 * how paying works, the partners, the fine print, and the question.
 *
 * What it won't say: no payment amount, APR or term (Truth in Lending), no
 * "everyone qualifies", no credit-score floor.
 *
 * The link never goes to a lender: that would take the visitor off the page
 * before the conversion. It jumps to the form like every other CTA, and
 * `data-consult-financing` tells the form to save the lead with
 * `financing_interest = yes`, so the coordinator's first text can carry the
 * pre-qualification link.
 */

import { FINANCING_PARTNERS } from '@/lib/data/site-config'

import { LP_CHAT_ID } from './lp-config'
import type { LpDictionary } from './lp-copy'
import { Rich } from './lp-primitives.component'

interface LpFinancingProps {
    readonly copy: LpDictionary['financing']
}

export function LpFinancing({ copy }: LpFinancingProps) {
    return (
        <section className='band financing financing--short' id='financing'>
            <div className='wrap financing-in'>
                <div className='fin-intro'>
                    <p className='eyebrow'>{copy.eyebrow}</p>
                    <h2 className='h2'>
                        <Rich parts={copy.heading} />
                    </h2>
                    <p className='sub'>{copy.body}</p>
                </div>

                <div className='fin-foot'>
                    <ul className='partners' aria-label={copy.partnersLabel}>
                        {FINANCING_PARTNERS.map((partner) => (
                            <li key={partner}>{partner}</li>
                        ))}
                    </ul>
                    <p className='fine'>{copy.fine}</p>
                    <a
                        className='fin-link'
                        href={`#${LP_CHAT_ID}`}
                        data-consult-financing='yes'
                        data-track='cta-financing'
                    >
                        {copy.cta}
                    </a>
                </div>
            </div>
        </section>
    )
}
