/**
 * Figure Component
 *
 * Captioned image block for blog content, available inside MDX as
 * `<Figure src="..." alt="..." width={1200} height={800} caption="..." />`.
 *
 * Renders semantic `<figure>` / `<figcaption>` markup so the caption is
 * programmatically tied to the image — captions are a strong relevance signal
 * for image search and for LLMs summarizing the article.
 *
 * Server component: no interactivity, fully server-rendered.
 */
import Image from 'next/image'

import {
    CONTENT_IMAGE_SIZES,
    DEFAULT_CONTENT_IMAGE_HEIGHT,
    DEFAULT_CONTENT_IMAGE_WIDTH,
    toImageDimension,
} from '@/lib/utils/image-dimension.util'

type FigureProps = {
    /** Absolute or root-relative image URL */
    src: string
    /** Descriptive alt text (required for accessibility and image SEO) */
    alt: string
    /** Intrinsic width in pixels — strings are accepted from raw MDX attributes */
    width?: number | string
    /** Intrinsic height in pixels — strings are accepted from raw MDX attributes */
    height?: number | string
    /** Caption rendered under the image */
    caption?: string
    /** Opt out of lazy loading for above-the-fold images */
    priority?: boolean
    /** Optional className for the wrapping figure */
    className?: string
}

/**
 * Renders an optimized, captioned image inside article content.
 */
export function Figure({
    src,
    alt,
    width,
    height,
    caption,
    priority = false,
    className,
}: FigureProps) {
    if (!src) return null

    return (
        <figure className={className ? `my-10 ${className}` : 'my-10'}>
            <Image
                src={src}
                alt={alt || ''}
                width={toImageDimension(width, DEFAULT_CONTENT_IMAGE_WIDTH)}
                height={toImageDimension(height, DEFAULT_CONTENT_IMAGE_HEIGHT)}
                sizes={CONTENT_IMAGE_SIZES}
                className='h-auto w-full rounded-xl shadow-lg'
                priority={priority}
                loading={priority ? undefined : 'lazy'}
            />
            {caption && (
                <figcaption className='border-gold-500/40 mt-4 border-l-2 pl-4 text-sm leading-relaxed text-stone-500 not-italic'>
                    {caption}
                </figcaption>
            )}
        </figure>
    )
}
