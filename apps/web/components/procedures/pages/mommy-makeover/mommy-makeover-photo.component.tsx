import Image from 'next/image'
import { cn } from '@workspace/ui/lib/utils'

import {
    AI_MODEL_LABEL,
    type ModuleImage,
} from '@/components/procedures/module-kit/module-ui.constant'

/**
 * An editorial render inside a section, always labelled as a model and always
 * apart from the results section. By default it fills the reading column; with
 * `arch` it is the site's arch window, a 4:5 crop that sits beside text from
 * `md`.
 */
export function MommyMakeoverPhoto({
    image,
    arch = false,
    className,
}: {
    image: ModuleImage
    arch?: boolean
    className?: string
}) {
    return (
        <figure
            className={cn(
                arch && 'w-full max-w-[17.5rem] shrink-0 md:w-60',
                className
            )}
        >
            <div
                className={cn(
                    'pm-unveil overflow-hidden bg-stone-200',
                    arch
                        ? 'aspect-[4/5] rounded-t-full rounded-b-[0.625rem]'
                        : 'rounded-t-[3rem] rounded-b-[0.625rem] md:rounded-t-[5rem]'
                )}
            >
                <Image
                    src={image.src}
                    alt={image.alt}
                    width={image.width}
                    height={image.height}
                    sizes={
                        arch
                            ? // A 3:2 file cropped to 4:5 fills the frame's height.
                              '(min-width: 768px) 450px, 525px'
                            : '(min-width: 768px) 720px, calc(100vw - 40px)'
                    }
                    className={cn(
                        'block w-full',
                        arch ? 'h-full object-cover' : 'h-auto'
                    )}
                />
            </div>
            <figcaption className='mt-2.5 text-right text-[0.8125rem] leading-[1.4] text-stone-500'>
                {AI_MODEL_LABEL}
            </figcaption>
        </figure>
    )
}
