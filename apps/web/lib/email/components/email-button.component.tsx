/**
 * Email Button Component
 *
 * Reusable button component for email templates.
 * Styled with Alluring Plastic Surgery brand colors (Gold + Stone palette).
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
     * - primary: Gold background (luxury CTA)
     * - secondary: Stone background (subtle action)
     */
    variant?: 'primary' | 'secondary'
}

/**
 * Email button component
 *
 * Styled button with consistent luxury design for email templates.
 * Uses Alluring Plastic Surgery brand colors:
 * - Primary: Gold background with dark text (main CTAs)
 * - Secondary: Stone background with dark text (secondary actions)
 *
 * @example
 * ```tsx
 * <EmailButton href="https://alluringplasticsurgery.com/contact" variant="primary">
 *   Schedule Your Consultation
 * </EmailButton>
 * ```
 */
export function EmailButton({
    href,
    children,
    variant = 'primary',
}: EmailButtonProps) {
    // Using inline styles with hex colors for maximum email client compatibility
    const baseStyles = {
        display: 'block',
        width: '100%',
        padding: '14px 24px',
        borderRadius: '8px',
        textAlign: 'center' as const,
        fontSize: '15px',
        fontWeight: 600,
        textDecoration: 'none',
        letterSpacing: '0.025em',
    }

    const variantStyles =
        variant === 'primary'
            ? {
                  backgroundColor: '#D4AF37', // Gold-500
                  color: '#1c1917', // Stone-900
                  border: '2px solid #D4AF37',
              }
            : {
                  backgroundColor: '#f5f5f4', // Stone-100
                  color: '#1c1917', // Stone-900
                  border: '2px solid #e7e5e4', // Stone-200
              }

    return (
        <Button href={href} style={{ ...baseStyles, ...variantStyles }}>
            {children}
        </Button>
    )
}
