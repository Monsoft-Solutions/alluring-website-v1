'use client'

/**
 * Before/after results, right under the hero: results are what a paid
 * visitor checks first, and the old page made her scroll past the surgeon
 * section to reach four of them.
 *
 * A swipeable rail rather than a link to the gallery. The curated pairs lead,
 * the gallery's photographs follow (see `lp-proof.ts`), and the ad group's
 * procedure comes first — someone who clicked a tummy tuck ad sees tummy
 * tucks. Photographs are shown whole on a dark mat: a before-and-after pair
 * cropped to fill a frame loses half of its point.
 */

import Image from 'next/image'

import type { LpDictionary } from './lp-copy'
import { Rich } from './lp-primitives.component'
import type { LpPhoto } from './lp-proof'

interface LpResultsProps {
    readonly copy: LpDictionary['results']
    readonly photos: readonly LpPhoto[]
}

export function LpResults({ copy, photos }: LpResultsProps) {
    return (
        <section className='band results' id='results'>
            <div className='wrap'>
                <div className='sec-head reveal'>
                    <p className='eyebrow'>{copy.eyebrow}</p>
                    <h2 className='h2'>
                        <Rich parts={copy.heading} />
                    </h2>
                    <p>{copy.subtitle}</p>
                </div>
            </div>

            <ul className='rail ba-rail' aria-label={copy.railLabel}>
                {photos.map((photo, index) => {
                    const caption = copy.captions[photo.procedure]
                    return (
                        <li key={photo.id}>
                            <figure className='ba'>
                                <span className='ba-frame'>
                                    <Image
                                        src={photo.src}
                                        fill
                                        sizes='(max-width: 640px) 76vw, 300px'
                                        loading={index < 2 ? 'eager' : 'lazy'}
                                        alt={photo.alt ?? caption?.alt ?? ''}
                                    />
                                </span>
                                <figcaption>
                                    <span>{caption?.caption}</span>
                                    <span className='tag'>
                                        {copy.beforeAfterTag}
                                    </span>
                                </figcaption>
                            </figure>
                        </li>
                    )
                })}
            </ul>

            <div className='wrap'>
                <p className='rail-hint' aria-hidden='true'>
                    {copy.swipeHint} <span>→</span>
                </p>
                <p className='ba-note'>{copy.note}</p>
                <div className='cta-row'>
                    <a
                        className='btn btn-dark'
                        href='#consultation'
                        data-track='cta-results'
                    >
                        {copy.cta}
                    </a>
                </div>
            </div>
        </section>
    )
}
