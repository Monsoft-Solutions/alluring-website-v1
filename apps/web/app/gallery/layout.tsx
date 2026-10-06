import type { ReactNode } from 'react'

import { GalleryAgeGate } from '@/components/gallery-page/gallery-age-gate.component'
import { GALLERY_AGE_SCRIPT } from '@/components/gallery-page/gallery-age-gate.constant'

import '@/components/gallery-page/gallery-page.css'

/**
 * Every gallery page sits behind the 18+ confirmation: patient photos and
 * videos are blurred until the visitor answers (see GalleryAgeGate).
 */
export default function GalleryLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <script dangerouslySetInnerHTML={{ __html: GALLERY_AGE_SCRIPT }} />
            {/* Without JavaScript the gate can't open, so show the media */}
            <noscript>
                <style>
                    {
                        '[data-age-gated] img,[data-age-gated] video{filter:none!important}'
                    }
                </style>
            </noscript>
            {/* The gate sits inside .gp-page for its colour tokens; the
                blur only touches img and video, so it stays sharp */}
            <div data-age-gated className='gp-page'>
                {children}
                <GalleryAgeGate />
            </div>
        </>
    )
}
