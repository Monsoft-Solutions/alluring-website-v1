import { MDXRemote, type MDXRemoteProps } from 'next-mdx-remote/rsc'
import rehypeHighlight from 'rehype-highlight'
import rehypeSanitize from 'rehype-sanitize'
import { defaultSchema } from 'rehype-sanitize'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import 'server-only'

import { getMDXComponents } from './mdx-components'

type PostMarkdownProps = {
    content: string
    className?: string
}

// Extend sanitize schema to allow syntax highlighting classes
const sanitizeSchema = {
    ...defaultSchema,
    attributes: {
        ...defaultSchema.attributes,
        code: [...(defaultSchema.attributes?.code || []), 'className'],
        pre: [...(defaultSchema.attributes?.pre || []), 'className'],
        span: [...(defaultSchema.attributes?.span || []), 'className'],
        div: [...(defaultSchema.attributes?.div || []), 'className'],
        a: [...(defaultSchema.attributes?.a || []), 'className', 'href', 'id'],
        h1: [...(defaultSchema.attributes?.h1 || []), 'id'],
        h2: [...(defaultSchema.attributes?.h2 || []), 'id'],
        h3: [...(defaultSchema.attributes?.h3 || []), 'id'],
        h4: [...(defaultSchema.attributes?.h4 || []), 'id'],
        h5: [...(defaultSchema.attributes?.h5 || []), 'id'],
        h6: [...(defaultSchema.attributes?.h6 || []), 'id'],
    },
}

/**
 * Server component that renders MDX to React components using next-mdx-remote.
 * Supports custom React components and syntax highlighting.
 * Headings have IDs (via rehypeSlug) for navigation, but are not rendered as links.
 * Content is sanitized using rehype-sanitize to prevent XSS attacks.
 */
export async function PostMarkdown({
    content,
    className = '',
}: PostMarkdownProps) {
    const normalizedContent = content?.trim()

    if (!normalizedContent) {
        return null
    }

    const mdxOptions: MDXRemoteProps['options'] = {
        mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
                [rehypeSanitize, sanitizeSchema],
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
