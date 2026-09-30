'use client'

/**
 * Tummy tuck prices, on the tummy tuck view only (#316), right under the
 * hero: the ads quote the mini tummy tuck's price, and the visitor they bring
 * checks it first. Five rows from the practice's price sheet, each with the
 * sheet's own description, then the one line that matters: the surgeon
 * decides which tummy tuck at the exam, and the price comes in writing.
 *
 * No inclusion claim: what each price covers is still open with the owner
 * (see `tummy-tuck.facts.ts`). Only the minis are described as "no muscle
 * repair", because only they are on the sheet.
 */

import { fill } from '@/components/shared/consult-chat/consult-chat.util'

import { LP_CHAT_ID } from './lp-config'
import type { LpDictionary } from './lp-copy'
import type { LpPrices } from './lp-prices'
import { Rich } from './lp-primitives.component'

/** Its id, for `lp_section_view`. */
export const LP_PRICES_ID = 'prices'

interface LpPriceListProps {
    readonly copy: LpDictionary['prices']
    readonly prices: LpPrices['tummyTuck']
}

export function LpPriceList({ copy, prices }: LpPriceListProps) {
    return (
        <section
            className='band prices'
            id={LP_PRICES_ID}
            aria-labelledby={`${LP_PRICES_ID}-h`}
        >
            <div className='wrap'>
                <div className='sec-head'>
                    <p className='eyebrow'>{copy.eyebrow}</p>
                    <h2 className='h2' id={`${LP_PRICES_ID}-h`}>
                        <Rich parts={copy.heading} />
                    </h2>
                </div>
                <ul className='price-list'>
                    {copy.rows.map((row) => (
                        <li key={row.type}>
                            <div className='price-row'>
                                <h3>{row.label}</h3>
                                <p className='price-amount'>
                                    {fill(copy.from, {
                                        price: prices[row.type],
                                    })}
                                </p>
                            </div>
                            <p className='price-note'>{row.note}</p>
                        </li>
                    ))}
                </ul>
                <div className='price-foot'>
                    <p className='price-fine'>{copy.fine}</p>
                    <a
                        className='fin-link'
                        href={`#${LP_CHAT_ID}`}
                        data-track='cta-prices'
                    >
                        {copy.cta}
                    </a>
                </div>
            </div>
        </section>
    )
}
