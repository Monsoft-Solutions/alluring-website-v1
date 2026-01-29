import { cn } from '@workspace/ui/lib/utils'
import Image from 'next/image'

import type { ProcedureContentImage } from '@/lib/types/procedure.type'

type ProcedureContentImageProps = {
    readonly image: ProcedureContentImage
    readonly className?: string
}

/**
 * Procedure Content Image Component
 *
 * Renders inline images within procedure content sections.
 * Supports multiple display variants for flexible layout options.
 *
 * Variants:
 * - full-width: Spans the full container width
 * - half: Takes half the container (for side-by-side layouts)
 * - float-right: Floats to the right with text wrapping
 * - float-left: Floats to the left with text wrapping
 */
export function ProcedureContentImage({
    image,
    className,
}: ProcedureContentImageProps) {
    const { src, alt, caption, variant = 'full-width' } = image

    const variantStyles: Record<NonNullable<typeof variant>, string> = {
        'full-width': 'w-full',
        half: 'w-full md:w-1/2',
        'float-right': 'w-full sm:w-1/2 sm:float-right sm:ml-8 sm:mb-4',
        'float-left': 'w-full sm:w-1/2 sm:float-left sm:mr-8 sm:mb-4',
    }

    return (
        <figure
            className={cn(
                'my-8 overflow-hidden rounded-xl',
                variantStyles[variant],
                className
            )}
        >
            <div className='relative aspect-3/2 overflow-hidden rounded-xl bg-stone-100'>
                <Image
                    src={src}
                    alt={alt}
                    fill
                    className='object-cover transition-transform duration-500 hover:scale-105'
                    sizes={
                        variant === 'full-width'
                            ? '(max-width: 768px) 100vw, 800px'
                            : '(max-width: 640px) 100vw, 400px'
                    }
                />
            </div>
            {caption && (
                <figcaption className='mt-3 text-center text-sm font-light text-stone-500 italic'>
                    {caption}
                </figcaption>
            )}
        </figure>
    )
}
