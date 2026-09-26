import type { ReactNode } from 'react'

import { PostMarkdown } from '@/components/blog/post-markdown.component'
import {
    composePostSource,
    POST_SPLIT_SLOT,
    rehypeFaqSections,
} from '@/lib/blog/post-mdx.util'

type PostBodyProps = {
    /** Content before the split point, from `findCTAInsertionPoint`. */
    beforeCTA: string
    /** Content after it; null or empty puts the slot after the body. */
    afterCTA: string | null
    /** What renders at the split point. Empty in phase 1; the consult thread in #295. */
    slot?: ReactNode
}

/**
 * The post's own text, unchanged, set in the v2 prose styles.
 *
 * Both halves render as one MDX document with the slot between them, so the
 * heading ids come from one `rehype-slug` pass and match the table of
 * contents (see `composePostSource`). The post's own FAQ section is grouped
 * into question cards by `rehypeFaqSections`.
 */
export function PostBody({ beforeCTA, afterCTA, slot }: PostBodyProps) {
    const components = {
        [POST_SPLIT_SLOT]: function PostSplitSlot() {
            if (!slot) return null
            return <div className='bp-slot not-prose'>{slot}</div>
        },
    }

    return (
        <PostMarkdown
            content={composePostSource(beforeCTA, afterCTA)}
            components={components}
            rehypePlugins={[rehypeFaqSections]}
            className='bp-prose prose prose-stone md:prose-lg max-w-none'
        />
    )
}
