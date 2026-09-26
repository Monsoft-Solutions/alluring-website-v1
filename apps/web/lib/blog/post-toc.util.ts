import type { TOCHeading } from '@/lib/types/blog/toc.type'

/**
 * The entries the v2 post template's table of contents lists: the post's h2
 * sections, or every heading when a post has no h2.
 *
 * Sub-headings stay out. An FAQ section alone adds six to ten questions, and
 * a checklist post repeats "Questions to Ask" under every step, which turns a
 * list meant for jumping into a second copy of the article.
 *
 * @param headings - Every h2/h3 from `extractTableOfContents`
 */
export function getTocSections(headings: TOCHeading[]): TOCHeading[] {
    const sections = headings.filter((heading) => heading.level === 2)
    return sections.length > 0 ? sections : headings
}
