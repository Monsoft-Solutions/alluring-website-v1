/**
 * Sprite Icons
 *
 * Draw the symbols defined by {@link IconSprite} (mounted in the root layout).
 * Each icon is a `<use>` reference rather than a fresh copy of the path data,
 * which is what keeps review-heavy pages from spending a third of their HTML
 * on repeated SVG geometry.
 *
 * The win here is document size, not bundle size: `ReviewCard` is a client
 * component, so importing these pulls them into its client chunk like any
 * other module. They stay dependency-free markup so that costs a few hundred
 * bytes — and it still removes `lucide-react`'s `Star` from that chunk.
 */

// ============================================================================
// Star
// ============================================================================

type StarIconProps = {
    /** Sizing/colour utilities, e.g. `h-4 w-4 fill-yellow-400 text-yellow-400` */
    readonly className?: string
}

function StarIcon({ className }: StarIconProps) {
    return (
        <svg
            className={className}
            // Hollow by default, exactly as Lucide's `<Star>` renders. A
            // `fill-*` utility in `className` is CSS on this same element and
            // so overrides this attribute, which is how a filled star gets its
            // colour — the value then inherits into the symbol's path.
            fill='none'
            aria-hidden='true'
            focusable='false'
        >
            <use href='#icon-star' />
        </svg>
    )
}

// ============================================================================
// Star rating
// ============================================================================

type StarRatingProps = {
    /** Number of filled stars, 0–5 */
    readonly rating: number
    /** Tailwind size utilities applied to each star. Defaults to `h-4 w-4`. */
    readonly size?: string
    /** Spacing between stars. Defaults to `gap-0.5`. */
    readonly gap?: string
    /**
     * Accessible label for the row. Rendered as visually hidden text so the
     * rating is announced once instead of as five anonymous graphics.
     */
    readonly label?: string
}

/**
 * A five-star row, `rating` of them filled.
 *
 * The stars themselves are `aria-hidden`; the rating reaches assistive tech
 * through `label`.
 */
export function StarRating({
    rating,
    size = 'h-4 w-4',
    gap = 'gap-0.5',
    label,
}: StarRatingProps) {
    const filled = Math.round(rating)

    return (
        <div className={`flex items-center ${gap}`}>
            <span className='sr-only'>
                {label ?? `Rated ${rating} out of 5 stars`}
            </span>
            {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon
                    key={i}
                    className={`${size} ${
                        i < filled
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-stone-300'
                    }`}
                />
            ))}
        </div>
    )
}

// ============================================================================
// Google mark
// ============================================================================

type GoogleIconProps = {
    /** Sizing utilities. Defaults to `h-4 w-4`. */
    readonly className?: string
}

/** The Google "G", drawn from the sprite. */
export function GoogleIcon({ className = 'h-4 w-4' }: GoogleIconProps) {
    return (
        <svg className={className} aria-hidden='true' focusable='false'>
            <use href='#icon-google' />
        </svg>
    )
}
