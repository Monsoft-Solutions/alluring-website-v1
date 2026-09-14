/**
 * The handful of small pieces every section of the landing page draws:
 * the rich-text renderer and the four inline icons.
 *
 * The Google mark comes from the root layout's `<IconSprite />` rather than
 * being inlined again — it is already in the document on every route.
 */

import type { RichText } from './lp-copy'

/**
 * Renders a copy deck entry that carries inline emphasis or a link.
 *
 * The prototype held these as HTML strings and wrote them in with `innerHTML`.
 * Keeping them as data means the same sentence renders through JSX, so nothing
 * on this page ever hands a string to the DOM as markup.
 */
export function Rich({ parts }: { parts: RichText }) {
    return (
        <>
            {parts.map((part, index) => {
                if (typeof part === 'string') return part
                if ('em' in part) return <em key={index}>{part.em}</em>
                if ('b' in part) return <b key={index}>{part.b}</b>
                return (
                    <a
                        key={index}
                        href={part.link.href}
                        target='_blank'
                        rel='noopener noreferrer'
                    >
                        {part.link.label}
                    </a>
                )
            })}
        </>
    )
}

export function PhoneIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            aria-hidden='true'
        >
            <path d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.8.57 2.81.7A2 2 0 0 1 22 16.92z' />
        </svg>
    )
}

export function CheckIcon() {
    return (
        <svg
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2.5'
            strokeLinecap='round'
            strokeLinejoin='round'
            aria-hidden='true'
        >
            <path d='M20 6 9 17l-5-5' />
        </svg>
    )
}

export function LockIcon() {
    return (
        <svg
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            aria-hidden='true'
        >
            <rect width='18' height='11' x='3' y='11' rx='2' />
            <path d='M7 11V7a5 5 0 0 1 10 0v4' />
        </svg>
    )
}

/** Draws the Google "G" from the sprite the root layout already mounts. */
export function GoogleMark() {
    return (
        <svg className='g' viewBox='0 0 24 24' aria-hidden='true'>
            <use href='#icon-google' />
        </svg>
    )
}

/** The five-star run is a text glyph on this page, not an icon. */
export function Stars() {
    return (
        <span className='stars' aria-hidden='true'>
            ★★★★★
        </span>
    )
}
