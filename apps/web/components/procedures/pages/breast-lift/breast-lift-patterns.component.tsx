export type BreastLiftPattern =
    | 'crescent'
    | 'periareolar'
    | 'vertical'
    | 'anchor'

/**
 * Each incision as the sources describe it, drawn on the same two marks: the
 * areola as a circle and the breast crease as a dashed curve under it. No
 * outline of a body: the marks are enough to show where each scar runs, and
 * the copy beside each drawing says it in words.
 *
 * - crescent: a half-moon along the top of the areola;
 * - periareolar: a ring around the areola (the "donut" lift);
 * - vertical: the ring, then straight down to the crease (the "lollipop");
 * - anchor: the lollipop, plus a line along the crease (the "inverted T").
 */
function PatternGlyph({ pattern }: { pattern: BreastLiftPattern }) {
    const ring = pattern !== 'crescent'
    const vertical = pattern === 'vertical' || pattern === 'anchor'

    return (
        <svg
            viewBox='0 0 120 120'
            aria-hidden='true'
            focusable='false'
            className='block size-24 shrink-0 md:size-28'
        >
            {/* The breast crease. */}
            <path
                d='M14 96 Q60 110 106 96'
                fill='none'
                className='stroke-stone-400'
                strokeWidth='1.75'
                strokeDasharray='4 4'
            />
            {/* The areola. */}
            <circle
                cx='60'
                cy='46'
                r='12'
                className='fill-stone-700 stroke-stone-300'
                strokeWidth='1.5'
            />
            {pattern === 'crescent' && (
                <path
                    d='M45 40 Q60 22 75 40'
                    fill='none'
                    className='stroke-gold-400'
                    strokeWidth='3'
                    strokeLinecap='round'
                />
            )}
            {ring && (
                <circle
                    cx='60'
                    cy='46'
                    r='15'
                    fill='none'
                    className='stroke-gold-400'
                    strokeWidth='3'
                />
            )}
            {vertical && (
                <path
                    d='M60 61 L60 101'
                    fill='none'
                    className='stroke-gold-400'
                    strokeWidth='3'
                    strokeLinecap='round'
                />
            )}
            {pattern === 'anchor' && (
                <path
                    d='M30 99 Q60 108 90 99'
                    fill='none'
                    className='stroke-gold-400'
                    strokeWidth='3'
                    strokeLinecap='round'
                />
            )}
        </svg>
    )
}

const PATTERNS: {
    pattern: BreastLiftPattern
    name: string
    scar: string
    suits: string
}[] = [
    {
        pattern: 'crescent',
        name: 'Crescent',
        scar: 'A half-moon along the top edge of the areola.',
        suits: 'For minor sagging, often with implants. Less common, and it lifts the least.',
    },
    {
        pattern: 'periareolar',
        name: 'Around the areola, or donut',
        scar: 'A ring around the areola only.',
        suits: 'For mild sagging, or areolas that are uneven.',
    },
    {
        pattern: 'vertical',
        name: 'Vertical, or lollipop',
        scar: 'Around the areola, then straight down to the breast crease.',
        suits: 'For moderate sagging.',
    },
    {
        pattern: 'anchor',
        name: 'Anchor, or inverted T',
        scar: 'The lollipop, plus a line along the crease.',
        suits: 'For severe sagging, or a lift with a reduction: the greatest lift, and the most scarring.',
    },
]

/**
 * The breast lift page's signature scene: the four incision patterns, from
 * the smallest scar to the longest, and what each one lifts. More lift needs
 * a longer scar, which is the trade every breast lift makes, so the drawing
 * sits in the safety band beside the risks.
 *
 * The drawings are decoration (`aria-hidden`); the names, the scars and who
 * each suits are real text, read, translated and quoted like the rest of
 * the page. Not to scale. Which technique each of the practice's prices
 * covers is an owner question, so nothing here names a price.
 */
export function BreastLiftPatternsDiagram() {
    return (
        <figure aria-label='The four breast lift incisions, from the shortest scar to the longest'>
            <p className='text-sm font-semibold tracking-[0.08em] text-stone-300 uppercase'>
                Four lifts, four scars
            </p>
            <ol className='mt-4 border border-stone-700 bg-[#191614] px-4 md:px-5'>
                {PATTERNS.map((item) => (
                    <li
                        key={item.pattern}
                        className='flex items-center gap-4 border-t border-stone-700 py-4 first:border-t-0 md:gap-5'
                    >
                        <PatternGlyph pattern={item.pattern} />
                        <div>
                            <p className='text-[1.0625rem] leading-[1.4] font-bold text-stone-50'>
                                {item.name}
                            </p>
                            <p className='mt-1 text-[0.9375rem] leading-[1.5] text-stone-300'>
                                {item.scar} {item.suits}
                            </p>
                        </div>
                    </li>
                ))}
            </ol>
            <ul className='mt-4 flex flex-wrap gap-x-5 gap-y-2'>
                <li className='flex items-center gap-2 text-sm text-stone-400'>
                    <span
                        aria-hidden='true'
                        className='block size-3 rounded-full border-[1.5px] border-stone-300 bg-stone-700'
                    />
                    Areola
                </li>
                <li className='flex items-center gap-2 text-sm text-stone-400'>
                    <span
                        aria-hidden='true'
                        className='bg-gold-400 block h-0.5 w-5'
                    />
                    Incision
                </li>
                <li className='flex items-center gap-2 text-sm text-stone-400'>
                    <span
                        aria-hidden='true'
                        className='block w-5 border-t-[1.5px] border-dashed border-stone-400'
                    />
                    Breast crease
                </li>
            </ul>
            <figcaption className='mt-3.5 text-sm leading-[1.45] text-stone-400'>
                Not to scale. From The Aesthetic Society and Cleveland Clinic;
                The Aesthetic Society adds that the more incisions a surgeon
                makes, the more the breast can be reshaped. Your surgeon
                recommends one at your exam.
            </figcaption>
        </figure>
    )
}
