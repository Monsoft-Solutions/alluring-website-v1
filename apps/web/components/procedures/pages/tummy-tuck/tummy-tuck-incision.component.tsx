import type { ReactNode } from 'react'

export type TummyTuckIncisionType = 'mini' | 'full' | 'extended'

/**
 * Each incision as the sources describe it, on the same outline of the lower
 * abdomen: the hip bones as two dots, the underwear line dashed.
 *
 * - mini: about the length of a C-section scar, centered low, and generally
 *   no cut around the belly button (Cleveland Clinic);
 * - full: from hip bone to hip bone, just above the pubic area, usually with
 *   a scar around the belly button (Cleveland Clinic);
 * - extended: longer, stretching around the flanks, with the belly button
 *   repositioned (Samir Rao, MD, on the ASPS website).
 *
 * Relative, not to scale: the copy beside it carries the only measured
 * figure (the mini's 3 to 6 inches).
 */
const INCISIONS: Record<
    TummyTuckIncisionType,
    { path: string; navel: boolean }
> = {
    mini: { path: 'M80 99 Q100 104 120 99', navel: false },
    full: { path: 'M52 88 Q100 108 148 88', navel: true },
    extended: {
        path: 'M24 66 Q34 84 52 90 Q100 108 148 90 Q166 84 176 66',
        navel: true,
    },
}

/**
 * One incision drawn on the outline, over its line of copy. The drawing is
 * decoration (`aria-hidden`): the text says everything it shows.
 */
export function TummyTuckIncision({
    type,
    children,
}: {
    type: TummyTuckIncisionType
    /** What the drawing shows, in words. */
    children: ReactNode
}) {
    const incision = INCISIONS[type]

    return (
        <span className='block'>
            <svg
                viewBox='0 0 200 124'
                aria-hidden='true'
                focusable='false'
                className='block h-auto w-full max-w-[11rem]'
            >
                {/* The lower abdomen, waist to the top of the thighs. */}
                <path
                    d='M50 4 C46 28 38 48 26 70 C20 84 24 104 40 120 L160 120 C176 104 180 84 174 70 C162 48 154 28 150 4'
                    fill='none'
                    className='stroke-stone-300'
                    strokeWidth='1.5'
                />
                {/* The underwear line. */}
                <path
                    d='M36 92 Q100 122 164 92'
                    fill='none'
                    className='stroke-stone-300'
                    strokeWidth='1.25'
                    strokeDasharray='3 4'
                />
                {/* Hip bones and the belly button. */}
                <circle cx='52' cy='76' r='2' className='fill-stone-400' />
                <circle cx='148' cy='76' r='2' className='fill-stone-400' />
                <circle
                    cx='100'
                    cy='42'
                    r='2.5'
                    fill='none'
                    className='stroke-stone-400'
                    strokeWidth='1.5'
                />
                {incision.navel && (
                    <circle
                        cx='100'
                        cy='42'
                        r='6.5'
                        fill='none'
                        className='stroke-gold-500'
                        strokeWidth='2.5'
                    />
                )}
                <path
                    d={incision.path}
                    fill='none'
                    className='stroke-gold-500'
                    strokeWidth='3'
                    strokeLinecap='round'
                />
            </svg>
            <span className='mt-2 block'>{children}</span>
        </span>
    )
}
