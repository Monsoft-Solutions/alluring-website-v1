/**
 * Blog MDX Components
 *
 * Component map handed to MDXRemote for blog post content. Beyond the plain
 * markdown overrides (links, images, GFM tables) it exposes the rich blocks
 * content writers can drop into a post: <Figure />, <QuickAnswer /> and
 * <CalloutBox />.
 */
import type { ComponentPropsWithoutRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import type { MDX_RENDERER_COMPONENTS } from '@workspace/shared/content'

import { QuickAnswer } from '@/components/shared/quick-answer.component'
import {
    CONTENT_IMAGE_SIZES,
    DEFAULT_CONTENT_IMAGE_HEIGHT,
    DEFAULT_CONTENT_IMAGE_WIDTH,
    toImageDimension,
} from '@/lib/utils/image-dimension.util'

import { CalloutBox } from './callout-box.component'
import { Figure } from './figure.component'

type MDXComponents = {
    [key: string]: React.ElementType
}

/**
 * Every component named in the shared MDX contract, resolved to its
 * implementation.
 *
 * Typed as a total record over the contract's names, so adding a component to
 * `MDX_RENDERER_COMPONENTS` without implementing it here is a type error rather
 * than a runtime "Expected component X to be defined" on a live post. The AI
 * package builds the writer's vocabulary from the same list, which is what
 * keeps the two sides from drifting apart.
 */
const CONTRACT_COMPONENTS: Record<
    (typeof MDX_RENDERER_COMPONENTS)[number],
    React.ElementType
> = {
    // <Figure src="..." alt="..." width={1200} height={800} caption="..." />
    Figure,
    // <CalloutBox type="info">content</CalloutBox>
    CalloutBox,
    // <QuickAnswer question="..." answer="..." details="..." />
    // Placed by the renderer from blog_post.quick_answer, not written by the
    // content writer — see the MDX contract.
    QuickAnswer,
}

export function getMDXComponents(): MDXComponents {
    return {
        // Custom Link component using Next.js Link
        a: ({ href, children, ...props }: ComponentPropsWithoutRef<'a'>) => {
            // External links
            if (href?.startsWith('http')) {
                return (
                    <Link
                        href={href}
                        target='_blank'
                        rel='noopener noreferrer'
                        {...props}
                    >
                        {children}
                    </Link>
                )
            }
            // Internal links
            return <Link href={href || '#'}>{children}</Link>
        },

        // Custom Image component using Next.js Image.
        // Honors width/height/sizes when the source declares them, so images
        // that ship real dimensions are not forced into the 800x400 default.
        img: ({
            src,
            alt,
            width,
            height,
            sizes,
            ...props
        }: ComponentPropsWithoutRef<'img'>) => {
            if (!src || typeof src !== 'string') return null

            return (
                <Image
                    src={src}
                    alt={alt || 'Blog post image'}
                    width={toImageDimension(width, DEFAULT_CONTENT_IMAGE_WIDTH)}
                    height={toImageDimension(
                        height,
                        DEFAULT_CONTENT_IMAGE_HEIGHT
                    )}
                    sizes={sizes || CONTENT_IMAGE_SIZES}
                    className='rounded-lg'
                    loading='lazy'
                    {...props}
                />
            )
        },

        // GFM tables — wrapped so wide comparison tables scroll on mobile
        // instead of collapsing into unreadable one-word columns.
        table: (props: ComponentPropsWithoutRef<'table'>) => (
            <div className='my-8 overflow-x-auto rounded-xl border border-stone-200'>
                <table
                    className='w-full min-w-[30rem] border-collapse text-left text-sm'
                    {...props}
                />
            </div>
        ),

        thead: (props: ComponentPropsWithoutRef<'thead'>) => (
            <thead className='bg-stone-50' {...props} />
        ),

        tr: (props: ComponentPropsWithoutRef<'tr'>) => (
            <tr
                className='border-b border-stone-100 last:border-b-0'
                {...props}
            />
        ),

        th: (props: ComponentPropsWithoutRef<'th'>) => (
            <th
                className='border-b border-stone-200 px-4 py-3 font-sans text-xs font-bold tracking-[0.12em] text-stone-500 uppercase md:px-5 md:py-3.5'
                {...props}
            />
        ),

        td: (props: ComponentPropsWithoutRef<'td'>) => (
            <td
                className='px-4 py-3 align-top leading-relaxed text-stone-700 md:px-5 md:py-4'
                {...props}
            />
        ),

        // Custom components available in markdown, from the shared contract
        ...CONTRACT_COMPONENTS,
    }
}
