import Image from 'next/image'

import type { ProcedureContentImage } from '@/lib/types/procedure.type'

type ProcedureImageMDXProps = {
    readonly image: ProcedureContentImage
}

/**
 * Procedure Image MDX Component
 *
 * Renders inline images within procedure markdown content.
 * Designed to integrate seamlessly with prose styling.
 *
 * Usage in markdown:
 * ```mdx
 * <ProcedureImage id="breast-enhancement" />
 * ```
 */
export function ProcedureImageMDX({ image }: ProcedureImageMDXProps) {
    const { src, alt, caption } = image

    return (
        <figure className='not-prose my-10 overflow-hidden rounded-2xl bg-stone-100'>
            <div className='relative aspect-3/2 overflow-hidden'>
                <Image
                    src={src}
                    alt={alt}
                    fill
                    className='object-cover transition-transform duration-500 hover:scale-105'
                    sizes='(max-width: 768px) 100vw, 768px'
                />
            </div>
            {caption && (
                <figcaption className='bg-stone-50 px-4 py-3 text-center text-sm font-light text-stone-600 italic'>
                    {caption}
                </figcaption>
            )}
        </figure>
    )
}
