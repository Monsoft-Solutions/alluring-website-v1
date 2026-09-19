import type { ReactNode } from 'react'
import { cn } from '@workspace/ui/lib/utils'

import { formatProcedurePrice } from '@/components/procedures/procedure-pricing.component'
import type { ProcedurePricing } from '@/lib/types/procedure.type'

type PriceRangeProps = Pick<ProcedurePricing, 'startingAt' | 'upTo'> & {
    /** Label for the typical range, e.g. "Most patients". */
    rangeLabel?: string
    /** Terms under the figures: estimates, personalization, financing. */
    children?: ReactNode
    className?: string
}

/**
 * A procedure's starting price and typical range, as figures.
 *
 * Takes the same numbers as `procedure.pricing`, which also drive the `Offer`
 * in the structured-data graph, so the two cannot disagree. The wording
 * around the figures — that ranges are estimates, that the price is
 * personalized, that financing exists — is the caller's, passed as children.
 *
 * Server component; no client JavaScript.
 */
export function PriceRange({
    startingAt,
    upTo,
    rangeLabel = 'Most patients',
    children,
    className,
}: PriceRangeProps) {
    return (
        <div className={cn('tabular-nums', className)}>
            <dl className='grid gap-6 sm:grid-cols-2'>
                <div>
                    <dt className='text-xs font-bold tracking-[0.14em] text-stone-500 uppercase'>
                        Starting at
                    </dt>
                    <dd className='mt-1 font-serif text-4xl text-stone-900 md:text-5xl'>
                        {formatProcedurePrice(startingAt)}
                    </dd>
                </div>
                {upTo !== undefined && upTo > startingAt && (
                    <div>
                        <dt className='text-xs font-bold tracking-[0.14em] text-stone-500 uppercase'>
                            {rangeLabel}
                        </dt>
                        <dd className='mt-1 font-serif text-4xl text-stone-900 md:text-5xl'>
                            {formatProcedurePrice(startingAt)}–
                            {formatProcedurePrice(upTo)}
                        </dd>
                    </div>
                )}
            </dl>
            {children && (
                <div className='mt-4 text-sm leading-relaxed text-stone-600'>
                    {children}
                </div>
            )}
        </div>
    )
}
