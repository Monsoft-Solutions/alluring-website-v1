import type { ReactNode } from 'react'
import { cn } from '@workspace/ui/lib/utils'

type HomeEyebrowProps = {
    /** The section's number on the page's path (`HOME_SECTION_INDEX`). */
    index: string
    children: ReactNode
    className?: string
}

/**
 * The line above a section heading: its number in Fraunces italic, a hairline
 * that draws itself as the section arrives, and the section's name. The
 * number is decoration, so assistive technology hears only the name.
 * Colours come from the band it sits on (`hp-dark` or not).
 */
export function HomeEyebrow({ index, children, className }: HomeEyebrowProps) {
    return (
        <p className={cn('hp-eyebrow', className)}>
            <span className='hp-eyebrow__index' aria-hidden='true'>
                {index}
            </span>
            <span className='hp-eyebrow__rule hp-draw-x' aria-hidden='true' />
            <span>{children}</span>
        </p>
    )
}
