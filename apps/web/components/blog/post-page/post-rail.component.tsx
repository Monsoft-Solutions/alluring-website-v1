import type { TOCHeading } from '@/lib/types/blog/toc.type'

import { PostToc } from './post-toc.component'

type PostRailProps = {
    headings: TOCHeading[]
}

/**
 * The desktop rail beside the post body, from `lg`: the table of contents,
 * sticky under the header and scrollable on its own when a post is long.
 * Phase 2 (#295) adds the procedure's fact card under it.
 */
export function PostRail({ headings }: PostRailProps) {
    return (
        <aside aria-label='Article sidebar' className='hidden lg:block'>
            <div className='sticky top-[calc(var(--announcement-bar-height,0px)+7.5rem)] max-h-[calc(100svh-var(--announcement-bar-height,0px)-9.5rem)] overflow-y-auto pb-6'>
                <PostToc headings={headings} />
            </div>
        </aside>
    )
}
