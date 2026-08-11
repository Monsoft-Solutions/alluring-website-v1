/**
 * Table of Contents Utility
 *
 * Extracts h2/h3 headings from markdown content for the on-page table of
 * contents. Heading IDs are produced with `github-slugger` — the exact slugger
 * `rehype-slug` uses when it stamps IDs on the rendered HTML — so TOC anchors
 * always resolve to a real heading, including headings containing apostrophes,
 * ampersands, links or bold text.
 */
import GithubSlugger from 'github-slugger'

import type { TOCHeading } from '@/lib/types/blog/toc.type'

/** ATX heading: up to three leading spaces, 1-6 hashes, then the text */
const HEADING_PATTERN = /^ {0,3}(#{1,6})\s+(.*)$/

/** Fenced code block delimiter (``` or ~~~) */
const CODE_FENCE_PATTERN = /^\s*(```|~~~)/

/** Heading levels surfaced in the table of contents */
const TOC_LEVELS = [2, 3]

/**
 * Reduces markdown heading source to the plain text a reader sees.
 *
 * `rehype-slug` slugs the text content of the rendered heading, so formatting
 * markers have to be removed before slugging or the IDs desync (e.g.
 * "**Recovery** Timeline" must slug as "recovery-timeline", not
 * "-recovery-timeline").
 */
function toPlainHeadingText(markdown: string): string {
    return (
        markdown
            // Images render as <img> and contribute no text content
            .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
            // Inline and reference links keep only their label
            .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
            .replace(/\[([^\]]*)\]\[[^\]]*\]/g, '$1')
            // Inline code keeps its contents
            .replace(/`+([^`]*)`+/g, '$1')
            // Emphasis / strong / strikethrough markers
            .replace(/\*\*\*([^*]+)\*\*\*/g, '$1')
            .replace(/\*\*([^*]+)\*\*/g, '$1')
            .replace(/\*([^*]+)\*/g, '$1')
            .replace(/___([^_]+)___/g, '$1')
            .replace(/__([^_]+)__/g, '$1')
            .replace(/(?<!\w)_([^_]+)_(?!\w)/g, '$1')
            .replace(/~~([^~]+)~~/g, '$1')
            // Inline HTML / JSX tags
            .replace(/<[^>]+>/g, '')
            // Escaped characters (\* renders as *)
            .replace(/\\([\\`*_{}[\]()#+\-.!~])/g, '$1')
            // Optional ATX closing sequence ("## Heading ##")
            .replace(/\s+#+\s*$/, '')
            .replace(/\s+/g, ' ')
            .trim()
    )
}

/**
 * Extract headings from markdown content for the table of contents.
 *
 * Every heading level feeds the slugger (matching rehype-slug, which walks all
 * headings in document order and appends -1/-2 suffixes to repeats), while only
 * h2/h3 are returned for display.
 *
 * @param content - Raw markdown/MDX body of the post
 * @returns Ordered h2/h3 headings with IDs matching the rendered HTML
 */
export function extractTableOfContents(content: string): TOCHeading[] {
    const headings: TOCHeading[] = []
    const slugger = new GithubSlugger()
    let isInCodeFence = false

    for (const line of content.split('\n')) {
        // Headings inside fenced code blocks are literal text, not headings
        if (CODE_FENCE_PATTERN.test(line)) {
            isInCodeFence = !isInCodeFence
            continue
        }
        if (isInCodeFence) continue

        const match = HEADING_PATTERN.exec(line)
        if (!match?.[1] || !match[2]) continue

        const text = toPlainHeadingText(match[2])
        if (!text) continue

        // Consume a slug for every heading so duplicate suffixes line up
        const id = slugger.slug(text)
        const level = match[1].length

        if (TOC_LEVELS.includes(level)) {
            headings.push({ id, text, level })
        }
    }

    return headings
}
