'use client'

/**
 * Flying in, as the short view its sitelink opens (`?s=fly-in`): v6 (#292)
 * takes the band off the short page, and the FAQ's "not in Miami" answer
 * carries it there. Three lines, and the question strip above asks the rest.
 *
 * What is promised here is clinical and nothing else: a video consultation,
 * dates in writing before flights are booked, how many nights to stay before
 * she is cleared to fly home. The practice does not coordinate travel — no
 * flights, no lodging, no recovery house — so do not let "concierge"
 * language back in.
 */

import type { LpDictionary } from './lp-copy'

interface LpFlyInProps {
    readonly copy: LpDictionary['flyIn']
}

export function LpFlyIn({ copy }: LpFlyInProps) {
    return (
        <section className='band flyin flyin--short' id='fly-in'>
            <div className='wrap flyin-in'>
                <div>
                    <p className='eyebrow'>{copy.eyebrow}</p>
                    <h2 className='h2'>{copy.heading}</h2>
                </div>
                <ul>
                    {copy.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                    ))}
                </ul>
            </div>
        </section>
    )
}
