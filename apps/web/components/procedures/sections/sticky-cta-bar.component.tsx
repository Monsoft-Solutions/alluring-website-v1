import { Phone } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'

import { getPhoneLink } from '@/lib/data/site-config'

type StickyCtaBarProps = {
    /** In-page anchor of the consultation form. */
    bookHref?: string
    bookLabel?: string
    callLabel?: string
    className?: string
}

/**
 * Mobile-only bar pinned to the bottom of the viewport: Book · Call.
 *
 * Replaces a form wall in the middle of the page on small screens; the form
 * itself sits at the end, where `bookHref` points. CSS only — no scroll
 * listener, no client JavaScript. A page may pass a class that animates it
 * in and out with a scroll-driven animation; without one it is visible from
 * first paint. Hidden from `md` up, where the page's own layout carries the
 * call to action.
 *
 * Stone-900 on gold-400 rather than white on gold-500: white on gold-500 is
 * about 3:1, under WCAG AA for text this size.
 *
 * A page that renders this bar needs bottom padding on mobile so the bar
 * never covers its last lines, and should not also show the root layout's
 * floating `MobileCallButton`, which occupies the same corner.
 */
export function StickyCtaBar({
    bookHref = '#book',
    bookLabel = 'Book',
    callLabel = 'Call',
    className,
}: StickyCtaBarProps) {
    return (
        <nav
            aria-label='Book or call'
            className={cn(
                'fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(28,25,23,0.08)] md:hidden',
                className
            )}
        >
            <div className='mx-auto flex max-w-md gap-2.5'>
                <a
                    href={bookHref}
                    className='bg-gold-400 border-gold-400 hover:bg-gold-300 flex h-12 flex-1 items-center justify-center rounded-[4px] border px-4 text-base font-bold text-stone-900 transition-colors'
                >
                    {bookLabel}
                </a>
                <a
                    href={getPhoneLink()}
                    className='flex h-12 flex-1 items-center justify-center gap-2 rounded-[4px] border border-stone-400 bg-white px-4 text-base font-bold text-stone-900 transition-colors hover:border-stone-900'
                >
                    <Phone aria-hidden='true' className='size-[1.125rem]' />
                    {callLabel}
                </a>
            </div>
        </nav>
    )
}
