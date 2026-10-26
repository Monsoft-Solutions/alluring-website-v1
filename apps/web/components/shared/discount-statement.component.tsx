import { cn } from '@workspace/ui/lib/utils'

/**
 * The Fla. Stat. 456.062 statement (issue #354). A discounted fee is an
 * advertisement that must carry it, so every block that shows a discounted
 * price renders this once, next to the prices. The text is the one the
 * admin Pricing page stores (`pricing_settings.discount_statement`); the
 * resolver returns it only while a discount is on, so `null` renders
 * nothing.
 *
 * Server component; no client JavaScript.
 */
export function DiscountStatement({
    statement,
    tone = 'light',
    className,
}: {
    statement: string | null | undefined
    /** `dark` on a stone-900 band. */
    tone?: 'light' | 'dark'
    className?: string
}) {
    if (!statement) return null
    return (
        <p
            data-claims='discount-statement'
            className={cn(
                'max-w-[41.25rem] text-sm leading-relaxed',
                tone === 'dark' ? 'text-stone-300' : 'text-stone-600',
                className
            )}
        >
            {statement}
        </p>
    )
}
