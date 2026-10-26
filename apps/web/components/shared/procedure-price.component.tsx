import 'server-only'

import { PriceTag } from '@/components/shared/price-tag.component'
import { getLinePrice, getStartingPrice } from '@/lib/queries/pricing.query'

/**
 * A procedure's price read straight from the pricing resolver (issue #354),
 * for a server component that has no `ProcedurePrices` in hand: the
 * starting price, or one price-sheet line. Struck through while a discount
 * is on; renders nothing when the procedure publishes no figure.
 *
 * The block around it renders `<DiscountStatement>` once
 * (`getDiscountStatementText()`), the way the procedure pages do.
 *
 * @example
 * <p>Lipo 360 starts at <ProcedurePrice procedure='lipo' />.</p>
 * <p>A full tummy tuck is <ProcedurePrice procedure='tummy-tuck' line='full' />.</p>
 */
export async function ProcedurePrice({
    procedure,
    line,
    withSuffix,
    className,
}: {
    /** Claim key (`bbl`) or web page slug */
    procedure: string
    /** A price-sheet line key; the starting line when omitted */
    line?: string
    withSuffix?: boolean
    className?: string
}) {
    const price = line
        ? await getLinePrice(procedure, line)
        : await getStartingPrice(procedure)
    return (
        <PriceTag price={price} withSuffix={withSuffix} className={className} />
    )
}
