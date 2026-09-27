import { ModuleFactRail } from '@/components/procedures/module-kit/module-layout.component'
import type { PostProcedure } from '@/lib/blog/post-procedure.util'
import { KARLINSKY_NAME } from '@/lib/data/surgeons/karlinsky-credentials.constant'
import type { TOCHeading } from '@/lib/types/blog/toc.type'

import { POST_CONSULT_ID, railCopy } from './post-page.copy'
import { PostToc } from './post-toc.component'

type PostRailProps = {
    headings: TOCHeading[]
    procedure: PostProcedure | null
}

/**
 * The desktop rail beside the post body, from `lg`, sticky under the header:
 * the table of contents and, for BBL and lipo posts (the two with a settled
 * starting price), the procedure's fact card under it, whose button goes to
 * the thread with the procedure answered.
 *
 * The rail never grows past the screen. The card keeps its full height, and
 * the contents list takes what is left and scrolls on its own, so on a short
 * laptop screen the price and the button stay in view.
 */
export function PostRail({ headings, procedure }: PostRailProps) {
    const price = procedure?.price

    return (
        <aside aria-label='Article sidebar' className='hidden lg:block'>
            <div className='sticky top-[calc(var(--announcement-bar-height,0px)+7.5rem)] flex max-h-[calc(100svh-var(--announcement-bar-height,0px)-9.5rem)] flex-col gap-7'>
                <PostToc headings={headings} />
                {procedure && price && (
                    <div className='shrink-0'>
                        <ModuleFactRail
                            label={railCopy(procedure).label}
                            startingAt={price.startingAt}
                            priceNote={price.note}
                            surgeonName={KARLINSKY_NAME}
                            bookHref={`#${POST_CONSULT_ID}`}
                            bookLabel={railCopy(procedure).bookLabel}
                            bookProcedure={procedure.chatValue}
                            bookCta='blog_rail_price'
                            bookEntry='rail'
                            sticky={false}
                        />
                    </div>
                )}
            </div>
        </aside>
    )
}
