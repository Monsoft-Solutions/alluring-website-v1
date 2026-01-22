/**
 * Promotion Markdown Components
 *
 * Lightweight markdown renderers for promotion excerpts and descriptions.
 * Supports headers (h1-h4), bold, italic, links, and lists with stone/gold styling.
 *
 * Two versions:
 * - PromotionMarkdown: Server component for SSR (PromotionCard, detail page)
 * - PromotionMarkdownClient: Client component for modals
 */

type MarkdownProps = {
    /** The markdown content to render */
    content: string
    /** Additional CSS classes */
    className?: string
}

/**
 * Parse simple markdown and convert to React elements
 * Supports: # headers, **bold**, *italic*, [links](url), - lists
 */
function parseMarkdown(text: string): React.ReactNode[] {
    const elements: React.ReactNode[] = []
    let keyIndex = 0

    // Split by lines for list detection
    const lines = text.split('\n')
    let currentList: string[] = []

    const flushList = () => {
        if (currentList.length > 0) {
            elements.push(
                <ul
                    key={`list-${keyIndex++}`}
                    className='my-2 space-y-1 pl-4 text-inherit'
                >
                    {currentList.map((item, i) => (
                        <li
                            key={i}
                            className="before:text-gold-500 relative pl-2 before:absolute before:-left-3 before:content-['•']"
                        >
                            {parseInline(item)}
                        </li>
                    ))}
                </ul>
            )
            currentList = []
        }
    }

    for (const line of lines) {
        const trimmed = line.trim()

        // Check for list items
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            currentList.push(trimmed.slice(2))
            continue
        }

        // Flush any pending list
        flushList()

        // Skip empty lines
        if (!trimmed) {
            elements.push(<br key={`br-${keyIndex++}`} />)
            continue
        }

        // Check for headers (h1-h4)
        const headerMatch = trimmed.match(/^(#{1,4})\s+(.+)$/)
        if (headerMatch && headerMatch[1] && headerMatch[2]) {
            const level = headerMatch[1].length
            const headerContent = headerMatch[2]
            const headerStyles: Record<number, string> = {
                1: 'text-2xl font-serif font-semibold text-stone-900 mt-6 mb-3',
                2: 'text-xl font-serif font-semibold text-stone-900 mt-5 mb-2',
                3: 'text-lg font-semibold text-stone-800 mt-4 mb-2',
                4: 'text-base font-semibold text-stone-700 mt-3 mb-1',
            }
            const style = headerStyles[level] ?? headerStyles[4]

            // Render appropriate heading level
            if (level === 1) {
                elements.push(
                    <h1 key={`h1-${keyIndex++}`} className={style}>
                        {parseInline(headerContent)}
                    </h1>
                )
            } else if (level === 2) {
                elements.push(
                    <h2 key={`h2-${keyIndex++}`} className={style}>
                        {parseInline(headerContent)}
                    </h2>
                )
            } else if (level === 3) {
                elements.push(
                    <h3 key={`h3-${keyIndex++}`} className={style}>
                        {parseInline(headerContent)}
                    </h3>
                )
            } else {
                elements.push(
                    <h4 key={`h4-${keyIndex++}`} className={style}>
                        {parseInline(headerContent)}
                    </h4>
                )
            }
            continue
        }

        // Regular paragraph
        elements.push(
            <p key={`p-${keyIndex++}`} className='mb-2'>
                {parseInline(trimmed)}
            </p>
        )
    }

    // Flush remaining list
    flushList()

    return elements
}

/**
 * Parse inline markdown elements (bold, italic, links)
 */
function parseInline(text: string): React.ReactNode[] {
    const elements: React.ReactNode[] = []
    let remaining = text
    let keyIndex = 0

    // Regex patterns for inline elements
    const patterns = [
        // Links: [text](url)
        {
            regex: /\[([^\]]+)\]\(([^)]+)\)/,
            render: (match: RegExpMatchArray) => {
                const linkText = match[1] ?? ''
                const linkUrl = match[2] ?? ''
                const isExternal = linkUrl.startsWith('http')
                return (
                    <a
                        key={`link-${keyIndex++}`}
                        href={linkUrl}
                        className='text-gold-500 hover:text-gold-400 underline underline-offset-2 transition-colors'
                        target={isExternal ? '_blank' : undefined}
                        rel={isExternal ? 'noopener noreferrer' : undefined}
                    >
                        {linkText}
                    </a>
                )
            },
        },
        // Bold: **text** or __text__
        {
            regex: /\*\*([^*]+)\*\*|__([^_]+)__/,
            render: (match: RegExpMatchArray) => (
                <strong key={`bold-${keyIndex++}`} className='font-semibold'>
                    {match[1] ?? match[2]}
                </strong>
            ),
        },
        // Italic: *text* or _text_
        {
            regex: /\*([^*]+)\*|_([^_]+)_/,
            render: (match: RegExpMatchArray) => (
                <em key={`italic-${keyIndex++}`} className='italic'>
                    {match[1] ?? match[2]}
                </em>
            ),
        },
    ]

    while (remaining) {
        let earliestMatch: {
            index: number
            match: RegExpMatchArray
            render: (m: RegExpMatchArray) => React.ReactNode
        } | null = null

        // Find the earliest matching pattern
        for (const pattern of patterns) {
            const match = remaining.match(pattern.regex)
            if (
                match &&
                match.index !== undefined &&
                (!earliestMatch || match.index < earliestMatch.index)
            ) {
                earliestMatch = {
                    index: match.index,
                    match,
                    render: pattern.render,
                }
            }
        }

        if (earliestMatch) {
            // Add text before the match
            if (earliestMatch.index > 0) {
                elements.push(remaining.slice(0, earliestMatch.index))
            }

            // Add the rendered element
            elements.push(earliestMatch.render(earliestMatch.match))

            // Continue with remaining text
            remaining = remaining.slice(
                earliestMatch.index + earliestMatch.match[0].length
            )
        } else {
            // No more matches, add remaining text
            elements.push(remaining)
            break
        }
    }

    return elements
}

/**
 * Server Component - Promotion Markdown Renderer
 *
 * Use for PromotionCard (listings) and promotion detail pages.
 */
export function PromotionMarkdown({ content, className = '' }: MarkdownProps) {
    if (!content) return null

    return (
        <div className={`promotion-markdown ${className}`}>
            {parseMarkdown(content)}
        </div>
    )
}

/**
 * Client Component - Promotion Markdown Renderer
 *
 * Use for PromoModal and other client-side contexts.
 * Identical rendering logic, just marked as client component.
 */
export function PromotionMarkdownClient({
    content,
    className = '',
}: MarkdownProps) {
    if (!content) return null

    return (
        <div className={`promotion-markdown ${className}`}>
            {parseMarkdown(content)}
        </div>
    )
}
