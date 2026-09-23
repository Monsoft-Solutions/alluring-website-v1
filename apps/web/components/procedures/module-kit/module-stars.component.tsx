import { cn } from '@workspace/ui/lib/utils'

const STAR_PATH =
    'M12 2.6l2.84 5.9 6.46.86-4.72 4.5 1.18 6.42L12 17.2l-5.76 3.08 1.18-6.42-4.72-4.5 6.46-.86z'

const STAR_ID = 'pm-star'

/**
 * The star shape, defined once per page. Every `ModuleStars` row draws five
 * `<use>` references to it rather than five copies of the path.
 */
export function ModuleStarSprite() {
    return (
        <svg aria-hidden='true' className='absolute size-0 overflow-hidden'>
            <defs>
                <path id={STAR_ID} d={STAR_PATH} />
            </defs>
        </svg>
    )
}

function StarRow({ filled }: { filled: boolean }) {
    return (
        <svg
            viewBox='0 0 120 24'
            aria-hidden='true'
            className='block h-full w-[5em]'
            fill={filled ? 'currentColor' : 'none'}
            stroke='currentColor'
            strokeWidth={filled ? 0 : 1.3}
        >
            {[0, 24, 48, 72, 96].map((x) => (
                <use key={x} href={`#${STAR_ID}`} x={x} />
            ))}
        </svg>
    )
}

/**
 * A star rating out of five, filled to the exact value (4.7 fills 94%).
 * Needs `ModuleStarSprite` on the page. Sized by font size: five stars are 5em
 * wide and 1em tall.
 */
export function ModuleStars({
    rating,
    className,
}: {
    rating: number
    className?: string
}) {
    const share = Math.max(0, Math.min(5, rating)) / 5

    return (
        <span
            role='img'
            aria-label={`${rating} out of 5 stars`}
            className={cn(
                'text-gold-600 relative inline-block h-[1em] w-[5em] shrink-0',
                className
            )}
        >
            <StarRow filled={false} />
            <span
                className='absolute inset-y-0 left-0 overflow-hidden'
                style={{ width: `${share * 100}%` }}
            >
                <StarRow filled />
            </span>
        </span>
    )
}
