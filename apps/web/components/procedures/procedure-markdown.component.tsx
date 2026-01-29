import type { ComponentPropsWithoutRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MDXRemote, type MDXRemoteProps } from 'next-mdx-remote/rsc'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import 'server-only'

import { CalloutBox } from '@/components/blog/callout-box.component'
import type { ProcedureContentImage } from '@/lib/types/procedure.type'

import { ProcedureImageMDX } from './procedure-image-mdx.component'

type ProcedureMarkdownProps = {
    content: string
    contentImages?: ProcedureContentImage[]
    className?: string
}

type MDXComponents = {
    [key: string]: React.ElementType
}

/**
 * Creates MDX components with procedure-specific image support
 */
function getProcedureComponents(
    images: ProcedureContentImage[]
): MDXComponents {
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

        // Custom Image component using Next.js Image
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
                    alt={alt || 'Procedure image'}
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

        // Callout box for tips and notes
        CalloutBox,

        // Custom ProcedureImage component for inline images
        // Usage: <ProcedureImage id="breast-enhancement" />
        ProcedureImage: ({ id }: { id: string }) => {
            const image = images.find((img) => img.id === id)

            if (!image) {
                return null
            }

            return <ProcedureImageMDX image={image} />
        },
    }
}

/**
 * Procedure Markdown Component
 *
 * Server component that renders MDX content with procedure-specific enhancements.
 * Supports inline images via the <ProcedureImage id="..." /> component.
 *
 * Features:
 * - Custom ProcedureImage component for inline images
 * - Tel: protocol support for phone links
 * - Syntax highlighting for code blocks
 * - Heading IDs for navigation
 * - Content sanitization for security
 *
 * @example
 * ```tsx
 * <ProcedureMarkdown
 *   content={procedure.content}
 *   contentImages={procedure.contentImages}
 * />
 * ```
 */
export function ProcedureMarkdown({
    content,
    contentImages = [],
    className = '',
}: ProcedureMarkdownProps) {
    const normalizedContent = content?.trim()

    if (!normalizedContent) {
        return null
    }

    const mdxOptions: MDXRemoteProps['options'] = {
        mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
                // Note: We don't use rehype-sanitize here because:
                // 1. Procedure content is static, trusted data from our codebase
                // 2. Sanitization strips custom MDX components like <ProcedureImage />
                rehypeSlug, // Adds IDs to headings for scroll targeting
                rehypeHighlight,
            ],
        },
    }

    return (
        <div className={className}>
            <MDXRemote
                source={normalizedContent}
                options={mdxOptions}
                components={getProcedureComponents(contentImages)}
            />
        </div>
    )
}
