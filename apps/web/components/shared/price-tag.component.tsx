import type {
    PriceDisplay,
    TypicalRange,
} from '@workspace/shared/claims/pricing'
import { cn } from '@workspace/ui/lib/utils'

type Figure = { list: string; final: string; discounted: boolean }

/**
 * One figure: "$5,500", or, while a discount is on, the list price struck
 * through and then the discounted price. Screen readers hear "was $5,500,
 * now $4,400"; `<del>` alone is not announced by most of them.
 *
 * The struck list price is the 456.062 comparison, real content, so it keeps
 * the text colour (no opacity, which fell to about 3.5:1 on porcelain) and is
 * set apart by its weight and the strike alone.
 */
function PriceFigure({ list, final, discounted }: Figure) {
    if (!discounted) return <>{final}</>
    return (
        <>
            <del className='font-normal decoration-1'>
                <span className='sr-only'>was </span>
                {list}
            </del>{' '}
            <ins className='no-underline'>
                <span className='sr-only'>now </span>
                {final}
            </ins>
        </>
    )
}

/**
 * A price as a page prints it (issue #354). Every visible Alluring price is
 * this component or a claim token in a post, so the two read alike: the
 * figure, or the list price struck through and then the discounted price.
 *
 * Takes a resolved `PriceDisplay` from the pricing resolver
 * (`getProcedurePrices`, `getStartingPrice`, `getLinePrice`); `null` renders
 * nothing, so a procedure with no starting price publishes no figure. It
 * renders no statement: the block that shows discounted prices renders
 * `<DiscountStatement>` once, next to them.
 *
 * No hooks, so it renders on the server and inside a client component that
 * was handed the display as a prop.
 */
export function PriceTag({
    price,
    withSuffix = true,
    className,
}: {
    price: PriceDisplay | null | undefined
    /** Append the unit, e.g. "per breast". */
    withSuffix?: boolean
    className?: string
}) {
    if (!price) return null
    return (
        <span className={cn('whitespace-nowrap', className)}>
            <PriceFigure {...price} />
            {withSuffix && price.suffix ? ` ${price.suffix}` : null}
        </span>
    )
}

/**
 * BBL's "most patients pay between … and …" fragment (canon §5), each end
 * struck through while a discount is on. The range is typical, never a
 * maximum, so there is no "up to" form.
 */
export function PriceRangeText({
    range,
    capitalized = false,
    className,
}: {
    range: TypicalRange | null | undefined
    /** "Most patients …" at the start of a line or sentence. */
    capitalized?: boolean
    className?: string
}) {
    if (!range) return null
    const discounted = range.discounted
    return (
        <span className={className}>
            {capitalized ? 'Most' : 'most'} patients pay between{' '}
            <span className='whitespace-nowrap'>
                <PriceFigure {...range.min} discounted={discounted} />
            </span>{' '}
            and{' '}
            <span className='whitespace-nowrap'>
                <PriceFigure {...range.max} discounted={discounted} />
            </span>
        </span>
    )
}

/**
 * The same range as bare figures, "$5,500–$10,000", for a slot already
 * labelled "Most patients" (a fact table row). Never on its own: the canon
 * publishes the range only with "most patients".
 */
export function PriceRangeFigures({
    range,
    className,
}: {
    range: TypicalRange | null | undefined
    className?: string
}) {
    if (!range) return null
    const discounted = range.discounted
    return (
        <span className={cn('whitespace-nowrap', className)}>
            <PriceFigure {...range.min} discounted={discounted} />–
            <PriceFigure {...range.max} discounted={discounted} />
        </span>
    )
}
