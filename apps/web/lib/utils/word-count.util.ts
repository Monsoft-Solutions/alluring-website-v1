/**
 * Word Count Utility
 *
 * Counts the words a reader actually sees in a markdown/MDX document, so
 * `wordCount` in structured data reflects the article instead of an estimate
 * derived from reading time.
 */

/** Matches a token containing at least one letter or digit */
const WORD_PATTERN = /[\p{L}\p{N}]/u

/**
 * Strips markdown/MDX syntax down to readable prose.
 */
function toPlainText(content: string): string {
    return (
        content
            // Fenced code blocks and inline code are not prose
            .replace(/```[\s\S]*?```/g, ' ')
            .replace(/~~~[\s\S]*?~~~/g, ' ')
            .replace(/`[^`]*`/g, ' ')
            // HTML comments (CTA markers, editor notes)
            .replace(/<!--[\s\S]*?-->/g, ' ')
            // Images contribute no readable text; links keep their label
            .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
            .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
            // HTML / JSX tags (attribute values are not prose)
            .replace(/<[^>]+>/g, ' ')
            // Block markers: headings, quotes, list bullets, table pipes
            .replace(/^ {0,3}#{1,6}\s+/gm, ' ')
            .replace(/^ {0,3}>\s?/gm, ' ')
            .replace(/^\s*[-*+]\s+/gm, ' ')
            .replace(/^\s*\d+[.)]\s+/gm, ' ')
            .replace(/^\s*[-:|\s]{3,}$/gm, ' ')
            .replace(/\|/g, ' ')
            // Inline emphasis markers
            .replace(/[*_~]{1,3}/g, '')
            // HTML entities render as a single glyph, not a word
            .replace(/&[a-z]+;/gi, ' ')
    )
}

/**
 * Counts the readable words in markdown/MDX content.
 *
 * @param content - Raw markdown/MDX body
 * @returns Number of words a reader would see in the rendered article
 */
export function countMarkdownWords(content: string): number {
    if (!content) return 0

    return toPlainText(content)
        .split(/\s+/)
        .filter((token) => WORD_PATTERN.test(token)).length
}
