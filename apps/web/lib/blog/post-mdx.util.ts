/**
 * Blog post MDX pipeline
 *
 * The compile options every post renders with, plus the two pieces the v2
 * post template (epic #293) adds on top. Kept free of `server-only` so the
 * unit tests compile posts through exactly the pipeline the page uses.
 *
 * @module lib/blog/post-mdx
 */
import type { MDXRemoteProps } from 'next-mdx-remote/rsc'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'

type PostMdxOptions = NonNullable<MDXRemoteProps['options']>

/** Rehype plugins in the shape the MDX compiler accepts. */
export type PostRehypePlugins = NonNullable<
    NonNullable<PostMdxOptions['mdxOptions']>['rehypePlugins']
>

/**
 * The MDX component that marks the post's split point (the CTA marker, or the
 * heading after 40% of the post). The v2 template registers it and renders its
 * mid-post slot there; phase 2 puts the consultation thread in it.
 */
export const POST_SPLIT_SLOT = 'PostSplitSlot'

/**
 * Rejoins the two halves `findCTAInsertionPoint` produced as one document,
 * with the split slot between them.
 *
 * The old template compiles each half on its own, so each half starts a fresh
 * `rehype-slug`. `extractTableOfContents` slugs the whole post once, so a
 * heading repeated across the split (a section title the FAQ asks again) got
 * `-1` in the table of contents and no suffix in the page, and its link went
 * to the first copy. One document means one slugger, the same sequence the
 * table of contents computed.
 *
 * @param beforeCTA - Content before the split point
 * @param afterCTA - Content after it; empty or null puts the slot after the body
 * @returns MDX source with `<PostSplitSlot />` at the split point
 */
export function composePostSource(
    beforeCTA: string,
    afterCTA: string | null
): string {
    return [beforeCTA.trim(), `<${POST_SPLIT_SLOT} />`, afterCTA?.trim() ?? '']
        .filter(Boolean)
        .join('\n\n')
}

/**
 * An FAQ section's h2 id, as `rehype-slug` stamps it: "Frequently asked
 * questions", "FAQ about tummy tuck drains", but also "Quick FAQ: …" and
 * "Blepharoplasty common questions answered".
 */
const FAQ_HEADING_ID = /(^|-)(faqs?|frequently-asked|common-questions)(-|$)/

/** The slice of a hast node this plugin reads and writes. */
type HastNode = {
    type: string
    tagName?: string
    name?: string | null
    properties?: Record<string, unknown>
    children?: HastNode[]
}

function isElement(node: HastNode, tagName: string): boolean {
    return node.type === 'element' && node.tagName === tagName
}

function isSplitSlot(node: HastNode): boolean {
    return node.type === 'mdxJsxFlowElement' && node.name === POST_SPLIT_SLOT
}

/**
 * What closes an FAQ section besides the next h2: a rule or a top-level
 * heading, after which posts put a disclaimer or a closing note (13 do), and
 * a block component such as a `<CalloutBox>`, which is never part of an answer.
 */
function endsFaqSection(node: HastNode): boolean {
    return (
        isElement(node, 'hr') ||
        isElement(node, 'h1') ||
        (node.type === 'mdxJsxFlowElement' && !isSplitSlot(node))
    )
}

function createDiv(className: string, children: HastNode[]): HastNode {
    return {
        type: 'element',
        tagName: 'div',
        properties: { className: [className] },
        children,
    }
}

/**
 * Groups a post's own FAQ into question-and-answer blocks the v2 template
 * styles as cards.
 *
 * Under an FAQ h2 (`FAQ_HEADING_ID`), each h3 and everything up to the next
 * h3 goes into a `div.bp-faq__item`, and the items into one `div.bp-faq`. The
 * next h2 ends the section, and so does anything `endsFaqSection` names. The
 * split slot only closes the current card: questions after it are still the
 * same FAQ. Headings, ids and text are untouched; only wrappers are added. It
 * must run after `rehype-slug`, which stamps the ids it reads.
 *
 * 101 published posts carry an FAQ section written in the body, so the
 * template restyles theirs rather than adding a second one.
 */
export function rehypeFaqSections() {
    return (tree: unknown) => {
        const root = tree as HastNode
        if (!root.children) return

        const children: HastNode[] = []
        let isInFaq = false
        let list: HastNode | null = null
        let item: HastNode | null = null

        for (const node of root.children) {
            if (isElement(node, 'h2') || endsFaqSection(node)) {
                const id = node.properties?.id
                isInFaq =
                    isElement(node, 'h2') &&
                    typeof id === 'string' &&
                    FAQ_HEADING_ID.test(id)
                list = null
                item = null
                children.push(node)
                continue
            }

            if (isSplitSlot(node)) {
                list = null
                item = null
                children.push(node)
                continue
            }

            if (isInFaq && isElement(node, 'h3')) {
                if (!list) {
                    list = createDiv('bp-faq', [])
                    children.push(list)
                }
                item = createDiv('bp-faq__item', [node])
                list.children?.push(item)
                continue
            }

            if (item) {
                item.children?.push(node)
                continue
            }

            children.push(node)
        }

        root.children = children
    }
}

/**
 * The compile options for a post body.
 *
 * With no argument this is exactly what every post has always rendered with.
 * Extra plugins run after `rehype-slug`, so they can read heading ids, and
 * before highlighting.
 *
 * @param extraRehypePlugins - Plugins the v2 template adds (FAQ grouping)
 */
export function getPostMdxOptions(
    extraRehypePlugins: PostRehypePlugins = []
): PostMdxOptions {
    return {
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
                ...extraRehypePlugins,
                rehypeHighlight,
            ],
        },
    }
}
