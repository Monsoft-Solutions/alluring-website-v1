/**
 * Email Button Component
 *
 * Reusable button component for email templates.
 * Styled with Tailwind CSS for consistent design.
 *
 * @module lib/email/components/EmailButton.component
 */
import { Button } from '@react-email/components'

type EmailButtonProps = {
    /**
     * Button link URL
     */
    href: string

    /**
     * Button text
     */
    children: string

    /**
     * Button color variant
     */
    variant?: 'primary' | 'secondary'
}

/**
 * Email button component
 *
 * Styled button with consistent design for email templates using Tailwind CSS.
 * Supports primary (blue) and secondary (gray) color variants.
 *
 * @example
 * ```tsx
 * <EmailButton href="https://example.com/contact" variant="primary">
 *   Contact Us
 * </EmailButton>
 * ```
 */
export function EmailButton({
    href,
    children,
    variant = 'primary',
}: EmailButtonProps) {
    const buttonClass =
        variant === 'primary'
            ? 'block w-full rounded-md bg-blue-500 px-5 py-3 text-center text-base font-semibold text-white no-underline'
            : 'block w-full rounded-md bg-gray-100 px-5 py-3 text-center text-base font-semibold text-gray-900 no-underline'

    return (
        <Button href={href} className={buttonClass}>
            {children}
        </Button>
    )
}
