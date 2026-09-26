import { MDXRemote } from 'next-mdx-remote/rsc'
import type { ElementType } from 'react'
import 'server-only'

import {
    getPostMdxOptions,
    type PostRehypePlugins,
} from '@/lib/blog/post-mdx.util'
import { normalizeMdxSource } from '@/lib/utils/mdx-source.util'

import { getMDXComponents } from './mdx-components'

type PostMarkdownProps = {
    content: string
    className?: string
    /** Components added to the blog set, e.g. the v2 template's split slot. */
    components?: Record<string, ElementType>
    /** Rehype plugins run after heading ids exist, e.g. v2's FAQ grouping. */
    rehypePlugins?: PostRehypePlugins
}

/**
 * Server component that renders MDX to React components using next-mdx-remote.
 * Supports custom React components, GFM tables and syntax highlighting.
 * Headings have IDs (via rehypeSlug) for navigation, but are not rendered as links.
 */
export function PostMarkdown({
    content,
    className = '',
    components,
    rehypePlugins,
}: PostMarkdownProps) {
    const trimmedContent = content?.trim()

    if (!trimmedContent) {
        return null
    }

    // A stray `<` in prose is a compile error that 500s the whole page, so the
    // source is normalised before it reaches the compiler. See the util for why.
    const normalizedContent = normalizeMdxSource(trimmedContent)

    return (
        <div className={className}>
            <MDXRemote
                source={normalizedContent}
                options={getPostMdxOptions(rehypePlugins)}
                components={{ ...getMDXComponents(), ...components }}
            />
        </div>
    )
}
