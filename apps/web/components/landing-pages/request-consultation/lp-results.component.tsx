'use client'

/**
 * Before/after results. Actual patients of Dr. Karlinsky, from the same
 * gallery storage the site's own gallery reads.
 *
 * The ad variant's own procedure leads the grid — someone who clicked a tummy
 * tuck ad should see a tummy tuck first. Only four are visible; the fifth is
 * hidden by CSS unless a variant promotes it into the first four.
 */

import Image from 'next/image'

import { LP_BEFORE_AFTER } from './lp-assets'
import type { LpDictionary } from './lp-copy'
import { LP_LINKS } from './lp-copy'
import { Rich } from './lp-primitives.component'
import type { AdVariant } from './lp-variants'

interface LpResultsProps {
    readonly copy: LpDictionary['results']
    readonly adVariant: AdVariant
}

/** Moves the variant's own procedure to the front, leaving the rest in order. */
function orderForVariant(adVariant: AdVariant) {
    const match = LP_BEFORE_AFTER.find((item) => item.procedure === adVariant)
    if (!match) return LP_BEFORE_AFTER
    return [match, ...LP_BEFORE_AFTER.filter((item) => item !== match)]
}

export function LpResults({ copy, adVariant }: LpResultsProps) {
    return (
        <section className='band' id='results'>
            <div className='wrap'>
                <div className='sec-head reveal'>
                    <p className='eyebrow'>{copy.eyebrow}</p>
                    <h2 className='h2'>
                        <Rich parts={copy.heading} />
                    </h2>
                    <p>{copy.subtitle}</p>
                </div>
                <div className='ba-grid reveal'>
                    {orderForVariant(adVariant).map((item) => {
                        const caption = copy.captions[item.procedure]
                        return (
                            <figure className='ba' key={item.procedure}>
                                <Image
                                    src={item.src}
                                    width={1000}
                                    height={1250}
                                    sizes='(max-width: 860px) 50vw, 25vw'
                                    loading='lazy'
                                    alt={caption?.alt ?? ''}
                                />
                                <figcaption>
                                    <span>{caption?.caption}</span>
                                    <span className='tag'>
                                        {copy.beforeAfterTag}
                                    </span>
                                </figcaption>
                            </figure>
                        )
                    })}
                </div>
                <p className='ba-note'>{copy.note}</p>
                <div className='cta-row'>
                    <a
                        className='btn btn-dark'
                        href='#consultation'
                        data-track='cta-results'
                    >
                        {copy.cta}
                    </a>
                    <a
                        className='link'
                        href={LP_LINKS.gallery}
                        target='_blank'
                        rel='noopener noreferrer'
                    >
                        {copy.link}
                    </a>
                </div>
            </div>
        </section>
    )
}
