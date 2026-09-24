'use client'

/**
 * Price & financing (#290), third on the page: every ad says "Financing
 * Options Available", and v4 never mentioned financing.
 *
 * It grew out of v4's "What you leave with". The written-summary card stays
 * — candidacy, the all-inclusive price, payment, recovery, dates — because
 * the figure in writing is the amount she would finance, so the two belong
 * together. Then the three steps, in their real order: the figure, the
 * lender, the date.
 *
 * What it won't say: no payment amount, APR or term (Truth in Lending), no
 * "everyone qualifies", no credit-score floor. The partners and the process
 * only.
 *
 * The button never links to a lender: that would take the visitor off the
 * page before the conversion. It jumps to the thread like every other CTA,
 * and `data-consult-financing` tells the thread to save the lead with
 * `financing_interest = yes`, so the coordinator's first text can carry the
 * pre-qualification link.
 */

import Image from 'next/image'

import { FINANCING_PARTNERS } from '@/lib/data/site-config'

import { LP_LOGO } from './lp-assets'
import { LP_CHAT_ID } from './lp-config'
import type { LpDictionary } from './lp-copy'
import { Rich } from './lp-primitives.component'

interface LpFinancingProps {
    readonly copy: LpDictionary['financing']
}

export function LpFinancing({ copy }: LpFinancingProps) {
    return (
        <section className='band financing' id='financing'>
            <div className='wrap financing-in'>
                <div className='fin-intro reveal'>
                    <p className='eyebrow'>{copy.eyebrow}</p>
                    <h2 className='h2'>
                        <Rich parts={copy.heading} />
                    </h2>
                    <p className='sub'>{copy.body}</p>
                </div>

                <div className='sheet reveal' aria-label={copy.sheetLabel}>
                    <div className='sheet-head'>
                        <div>
                            <p className='t'>{copy.sheetTitle}</p>
                            <p className='st'>{copy.sheetSubtitle}</p>
                        </div>
                        <Image
                            src={LP_LOGO.src}
                            width={LP_LOGO.width}
                            height={LP_LOGO.height}
                            alt=''
                            aria-hidden='true'
                            loading='lazy'
                        />
                    </div>
                    <p className='sheet-name'>
                        <span>{copy.sheetName}</span>
                        <i />
                        <span>{copy.sheetPlace}</span>
                    </p>
                    <dl>
                        {copy.rows.map((row) => (
                            <div className='row' key={row.term}>
                                <dt>{row.term}</dt>
                                <dd>
                                    <Rich parts={row.value} />
                                </dd>
                            </div>
                        ))}
                    </dl>
                    <p className='sheet-foot'>
                        <span>{copy.sheetFootLeft}</span>
                        <span>{copy.sheetFootRight}</span>
                    </p>
                </div>

                <ol className='fin-steps reveal'>
                    {copy.steps.map((step) => (
                        <li key={step.title}>
                            <b>{step.title}</b>
                            <span>{step.body}</span>
                        </li>
                    ))}
                </ol>

                <div className='fin-foot reveal'>
                    <ul className='partners' aria-label={copy.partnersLabel}>
                        {FINANCING_PARTNERS.map((partner) => (
                            <li key={partner}>{partner}</li>
                        ))}
                    </ul>
                    <a
                        className='btn btn-dark'
                        href={`#${LP_CHAT_ID}`}
                        data-consult-financing='yes'
                        data-track='cta-financing'
                    >
                        {copy.cta}
                    </a>
                    <p className='fine'>{copy.fine}</p>
                </div>
            </div>
        </section>
    )
}
