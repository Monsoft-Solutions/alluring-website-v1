'use client'

/**
 * "In writing" — the signature section.
 *
 * The right-hand card is laid out as the written summary a patient actually
 * leaves the free consultation with: candidacy, all-inclusive price, monthly
 * payment, recovery plan, dates, surgeon. Every line is a claim already
 * published on the site; nothing here was invented for the ad.
 */

import Image from 'next/image'

import { LP_LOGO } from './lp-assets'
import type { LpDictionary } from './lp-copy'
import { Rich } from './lp-primitives.component'

interface LpWritingProps {
    readonly copy: LpDictionary['writing']
}

export function LpWriting({ copy }: LpWritingProps) {
    return (
        <section className='band writing'>
            <div className='wrap writing-in'>
                <div className='reveal'>
                    <p className='eyebrow'>{copy.eyebrow}</p>
                    <h2 className='h2'>
                        <Rich parts={copy.heading} />
                    </h2>
                    <p className='sub'>{copy.body}</p>
                    <a
                        className='btn btn-primary'
                        href='#consultation'
                        data-track='cta-writing'
                    >
                        {copy.cta}
                    </a>
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
            </div>
        </section>
    )
}
