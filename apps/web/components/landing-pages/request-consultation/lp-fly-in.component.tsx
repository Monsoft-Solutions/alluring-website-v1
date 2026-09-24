'use client'

/**
 * The fly-in section, for patients travelling to Miami from elsewhere in the
 * US.
 *
 * What is promised here is clinical and nothing else: a video consultation,
 * dates in writing before flights are booked, how many nights to stay before
 * she is cleared to fly home, a bilingual team. The practice does not
 * coordinate travel — no flights, no lodging, no recovery house — so do not
 * let "concierge" language back in.
 */

import type { LpDictionary } from './lp-copy'

interface LpFlyInProps {
    readonly copy: LpDictionary['flyIn']
}

export function LpFlyIn({ copy }: LpFlyInProps) {
    return (
        <section className='band flyin' id='fly-in'>
            <div className='wrap flyin-in'>
                <div className='reveal'>
                    <p className='eyebrow'>{copy.eyebrow}</p>
                    <h2 className='h2'>{copy.heading}</h2>
                    <p className='sub'>{copy.subtitle}</p>
                    <div className='cta-row'>
                        <a
                            className='btn btn-ghost'
                            href='#consultation'
                            data-track='cta-flyin'
                        >
                            {copy.cta}
                        </a>
                    </div>
                </div>
                <ul className='reveal'>
                    {copy.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                    ))}
                </ul>
            </div>
        </section>
    )
}
