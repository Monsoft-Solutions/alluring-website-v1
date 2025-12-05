/**
 * Chat Markdown Component
 *
 * Renders markdown content in chat messages with compact, chat-optimized styling.
 * Uses react-markdown for client-side rendering with the project's stone/gold design system.
 *
 * @module components/chat/chat-markdown
 */
'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@workspace/ui/lib/utils'

type ChatMarkdownProps = {
    content: string
    className?: string
}

/**
 * Renders markdown content with chat-optimized prose styling.
 * Designed for compact display within chat bubbles.
 */
export function ChatMarkdown({ content, className }: ChatMarkdownProps) {
    return (
        <div
            className={cn(
                // Base prose with stone palette
                'prose prose-sm prose-stone max-w-none',
                // Compact paragraph spacing
                'prose-p:my-1.5 prose-p:leading-relaxed',
                // Compact heading styles
                'prose-headings:my-2 prose-headings:font-semibold',
                'prose-h1:text-base prose-h2:text-sm prose-h3:text-sm',
                // Compact list spacing
                'prose-ul:my-1.5 prose-ul:pl-4 prose-ol:my-1.5 prose-ol:pl-4',
                'prose-li:my-0.5',
                // Code styling
                'prose-code:bg-stone-200 prose-code:text-stone-800',
                'prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs',
                'prose-code:before:content-none prose-code:after:content-none',
                // Code block styling
                'prose-pre:bg-stone-800 prose-pre:text-stone-100',
                'prose-pre:p-3 prose-pre:my-2 prose-pre:rounded-lg prose-pre:text-xs',
                'prose-pre:overflow-x-auto',
                // Link styling with gold accent
                'prose-a:text-gold-600 prose-a:no-underline hover:prose-a:underline',
                // Blockquote styling
                'prose-blockquote:border-l-2 prose-blockquote:border-gold-400',
                'prose-blockquote:pl-3 prose-blockquote:my-2 prose-blockquote:italic',
                // Strong/bold text
                'prose-strong:text-stone-900 prose-strong:font-semibold',
                // Table styling
                'prose-table:text-xs prose-th:p-1.5 prose-td:p-1.5',
                // First/last element margin handling
                '[&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
                className
            )}
        >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
    )
}
