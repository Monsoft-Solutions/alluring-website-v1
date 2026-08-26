import { MDXRemote, type MDXRemoteProps } from 'next-mdx-remote/rsc'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import 'server-only'

import { normalizeMdxSource } from '@/lib/utils/mdx-source.util'

import { getMDXComponents } from './mdx-components'

type PostMarkdownProps = {
    content: string
    className?: string
}

/**
 * Server component that renders MDX to React components using next-mdx-remote.
 * Supports custom React components, GFM tables and syntax highlighting.
 * Headings have IDs (via rehypeSlug) for navigation, but are not rendered as links.
 */
export function PostMarkdown({ content, className = '' }: PostMarkdownProps) {
    const trimmedContent = content?.trim()

    if (!trimmedContent) {
        return null
    }

    // A stray `<` in prose is a compile error that 500s the whole page, so the
    // source is normalised before it reaches the compiler. See the util for why.
    const normalizedContent = normalizeMdxSource(trimmedContent)

    const mdxOptions: MDXRemoteProps['options'] = {
        mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
                // Note: We don't use rehype-sanitize here because:
                // 1. Blog content is first-party — authored by our own AI
                //    pipeline and reviewed by admins before publishing, the
                //    same trust level as procedure content
                // 2. Sanitization strips custom MDX components (<Figure />,
                //    <QuickAnswer />, <CalloutBox />) and <figure>/<figcaption>,
                //    which makes captions and rich blocks impossible
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
                components={getMDXComponents()}
            />
        </div>
    )
}
