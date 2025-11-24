import type { ComponentPropsWithoutRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { CalloutBox } from './callout-box.component'

type MDXComponents = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: React.ComponentType<any>
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

        // Custom Image component using Next.js Image (optional)
        img: ({
            src,
            alt,
            width,
            height,
            ...props
        }: ComponentPropsWithoutRef<'img'>) => {
            if (!src || typeof src !== 'string') return null
            return (
                <Image
                    src={src}
                    alt={alt || ''}
                    width={
                        typeof width === 'number'
                            ? width
                            : typeof width === 'string'
                              ? parseInt(width, 10)
                              : 800
                    }
                    height={
                        typeof height === 'number'
                            ? height
                            : typeof height === 'string'
                              ? parseInt(height, 10)
                              : 400
                    }
                    className='rounded-lg'
                    {...props}
                />
            )
        },

        // Custom components available in markdown
        // Example: <CalloutBox type="info">content</CalloutBox>
        CalloutBox,
    }
}
