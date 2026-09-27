import type { PostProcedure } from '@/lib/blog/post-procedure.util'
import { PRICE_VARIABLES } from '@/lib/data/pricing-copy.constant'

import { POST_CONSULT_ID, priceCta, STRIP_COPY } from './post-page.copy'

type PostProcedureStripProps = {
    procedure: PostProcedure
    /** Google rating and review count; the rating chip hides without one. */
    rating: { value: number; count: number } | null
}

/**
 * The procedure behind the question, right under the answer: its settled
 * starting price (BBL and Lipo 360 only), its typical recovery, the practice's
 * Google rating, and the post's first way into the consultation thread. The
 * link answers the thread's first question with this procedure on the way,
 * so the reader lands on step 2.
 */
export function PostProcedureStrip({
    procedure,
    rating,
}: PostProcedureStripProps) {
    const { price } = procedure

    return (
        <div className='bp-strip'>
            <ul
                aria-label={STRIP_COPY.listLabel(procedure)}
                className='flex flex-wrap gap-2'
            >
                {price && (
                    <li className='bp-chip bp-chip--price'>
                        {STRIP_COPY.price(price)}
                    </li>
                )}
                {procedure.recovery && (
                    <li className='bp-chip'>
                        <span className='sr-only'>
                            {STRIP_COPY.recoveryLabel}
                        </span>
                        {procedure.recovery}
                    </li>
                )}
                {rating && rating.count > 0 && (
                    <li className='bp-chip'>
                        <span aria-hidden='true' className='text-gold-600'>
                            ★
                        </span>{' '}
                        {STRIP_COPY.rating(rating.value, rating.count)}
                    </li>
                )}
            </ul>

            <a
                href={`#${POST_CONSULT_ID}`}
                data-consult-procedure={procedure.chatValue}
                data-consult-entry='strip'
                data-cta='blog_strip_price'
                className='bp-strip__link'
            >
                {priceCta(procedure)} <span aria-hidden='true'>→</span>
            </a>

            {price && (
                <p className='mt-2 max-w-[34rem] text-[0.8125rem] leading-snug text-stone-600'>
                    {PRICE_VARIABLES}
                </p>
            )}
        </div>
    )
}
