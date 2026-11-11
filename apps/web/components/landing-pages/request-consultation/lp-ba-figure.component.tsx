/**
 * One before-and-after on the results rail: the photograph whole on a dark
 * mat, its procedure and a "Before · After" tag under it. A photo with the
 * before above the after (the abdomen crops) says so in its tag.
 *
 * Shared by the photos in the page and the ones the tap-to-view card loads,
 * so both rails look the same.
 */

import Image from 'next/image'

import type { LpDictionary } from './lp-copy'
import type { LpPhoto } from './lp-proof'

interface LpBaFigureProps {
    readonly photo: LpPhoto
    readonly copy: LpDictionary['results']
    readonly eager?: boolean
}

export function LpBaFigure({ photo, copy, eager = false }: LpBaFigureProps) {
    const caption = copy.captions[photo.procedure]
    return (
        <figure className='ba'>
            <span className='ba-frame'>
                <Image
                    src={photo.src}
                    fill
                    sizes='(max-width: 640px) 76vw, 300px'
                    loading={eager ? 'eager' : 'lazy'}
                    alt={copy.photoAlts[photo.id] ?? caption?.alt ?? ''}
                />
            </span>
            <figcaption>
                <span>{caption?.caption}</span>
                <span className='tag'>
                    {photo.stacked ? copy.stackedTag : copy.beforeAfterTag}
                </span>
            </figcaption>
        </figure>
    )
}
