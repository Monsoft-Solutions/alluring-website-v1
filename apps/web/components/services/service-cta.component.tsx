/**
 * ServiceCTA Component
 *
 * A call-to-action section specifically designed for service pages.
 * Wraps the existing CTASection component with service-specific props.
 *
 * Features:
 * - Reuses existing CTASection component for consistency
 * - Service-specific messaging and conversion actions
 * - Primary button (required) and optional secondary button
 * - Multiple background variants
 * - Responsive layout with centered alignment
 *
 * @example
 * ```tsx
 * <ServiceCTA
 *   heading="Ready to Get Started?"
 *   description="Let's discuss your project requirements"
 *   primaryButton={{ text: "Contact Us", href: "/contact" }}
 *   secondaryButton={{ text: "Learn More", href: "/about" }}
 *   variant="accent"
 * />
 * ```
 */
import type { ServiceCTA as ServiceCTAType } from '@/lib/types/services/service-cta.type'

import { CTASection } from '../shared/cta-section.component'

/**
 * ServiceCTA Component Props
 *
 * Extends the ServiceCTA type with additional variant option
 */
export type ServiceCTAProps = ServiceCTAType & {
    /**
     * Background variant for the CTA section
     * @default "accent"
     */
    readonly variant?: 'default' | 'muted' | 'accent' | 'primary'

    /**
     * Optional section ID for anchor links
     */
    readonly id?: string

    /**
     * Optional additional CSS classes
     */
    readonly className?: string
}

/**
 * ServiceCTA Component
 *
 * Renders a prominent call-to-action section at the end of service pages.
 * Uses the existing CTASection component with service-specific configuration.
 */
export function ServiceCTA({
    heading,
    description,
    primaryButton,
    secondaryButton,
    variant = 'accent',
    id = 'cta',
    className,
}: ServiceCTAProps) {
    return (
        <CTASection
            heading={heading}
            description={description}
            primaryButton={{
                text: primaryButton.text,
                href: primaryButton.href,
                variant: 'default',
            }}
            secondaryButton={
                secondaryButton
                    ? {
                          text: secondaryButton.text,
                          href: secondaryButton.href,
                          variant: 'outline',
                      }
                    : undefined
            }
            variant={variant}
            align='center'
            id={id}
            className={className}
        />
    )
}
