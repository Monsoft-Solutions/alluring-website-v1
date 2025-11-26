/**
 * Financing Page Type Definitions
 *
 * Type definitions for the financing page components and data structures.
 * Includes types for financing partners, hero section, how it works steps,
 * and procedure categories.
 *
 * Note: Icon types use string identifiers to allow SSR pages to pass data
 * to client components without serialization issues.
 */

/**
 * Financing partner information
 */
export type FinancingPartner = {
    /**
     * Unique identifier for the partner
     */
    readonly id: string

    /**
     * Partner display name
     */
    readonly name: string

    /**
     * Short tagline describing the partner's offering
     */
    readonly tagline: string

    /**
     * Detailed description of the partner's financing options
     */
    readonly description: string

    /**
     * Key benefits/features (3-4 bullet points)
     */
    readonly benefits: readonly string[]

    /**
     * Highlight stats (e.g., "0% APR", "Up to $25,000")
     */
    readonly highlights: readonly FinancingHighlight[]

    /**
     * Partner logo URL (optional)
     */
    readonly logoUrl?: string

    /**
     * External application URL
     */
    readonly applyUrl?: string

    /**
     * Accent color for the card (CSS class or color value)
     */
    readonly accentColor?: string
}

/**
 * Highlight stat for financing partner
 */
export type FinancingHighlight = {
    /**
     * Label for the highlight (e.g., "APR")
     */
    readonly label: string

    /**
     * Value for the highlight (e.g., "0%")
     */
    readonly value: string

    /**
     * Optional icon name (e.g., "CheckCircle", "Zap")
     */
    readonly icon?: string
}

/**
 * Trust indicator for hero section
 */
export type FinancingTrustIndicator = {
    /**
     * Icon name (e.g., "Percent", "Zap", "Shield")
     */
    readonly icon: string

    /**
     * Primary text (e.g., "0% APR")
     */
    readonly text: string

    /**
     * Supporting label (e.g., "Available")
     */
    readonly label: string
}

/**
 * Hero section props
 */
export type FinancingHeroProps = {
    /**
     * Eyebrow/badge text
     */
    readonly badge?: string

    /**
     * Main headline
     */
    readonly headline: string

    /**
     * Subheadline or tagline
     */
    readonly subheadline?: string

    /**
     * Description paragraph
     */
    readonly description: string

    /**
     * Trust indicators displayed below description
     */
    readonly trustIndicators: readonly FinancingTrustIndicator[]

    /**
     * Primary CTA button
     */
    readonly primaryCta: {
        readonly text: string
        readonly href: string
    }

    /**
     * Secondary CTA button
     */
    readonly secondaryCta?: {
        readonly text: string
        readonly href: string
    }

    /**
     * Background image URL
     */
    readonly backgroundImage?: string

    /**
     * Optional section ID
     */
    readonly id?: string

    /**
     * Additional CSS classes
     */
    readonly className?: string
}

/**
 * How it works step
 */
export type FinancingStep = {
    /**
     * Step number (1-based)
     */
    readonly step: number

    /**
     * Step title
     */
    readonly title: string

    /**
     * Step description
     */
    readonly description: string

    /**
     * Icon name for the step (e.g., "UserCheck", "FileCheck")
     */
    readonly icon: string

    /**
     * Duration/time estimate (optional)
     */
    readonly duration?: string
}

/**
 * How it works section props
 */
export type FinancingHowItWorksProps = {
    /**
     * Section badge/eyebrow
     */
    readonly badge?: string

    /**
     * Section title
     */
    readonly title: string

    /**
     * Section description
     */
    readonly description?: string

    /**
     * Steps in the process
     */
    readonly steps: readonly FinancingStep[]

    /**
     * Background variant
     */
    readonly variant?: 'default' | 'muted'

    /**
     * Optional section ID
     */
    readonly id?: string

    /**
     * Additional CSS classes
     */
    readonly className?: string
}

/**
 * Procedure category for financing
 */
export type FinancingProcedureCategory = {
    /**
     * Category identifier
     */
    readonly id: string

    /**
     * Category display name
     */
    readonly name: string

    /**
     * Category icon name (e.g., "Smile", "Heart", "Sparkles")
     */
    readonly icon: string

    /**
     * Procedures in this category
     */
    readonly procedures: readonly FinancingProcedureItem[]
}

/**
 * Individual procedure item
 */
export type FinancingProcedureItem = {
    /**
     * Procedure name
     */
    readonly name: string

    /**
     * URL slug for the procedure page
     */
    readonly slug: string

    /**
     * Starting price (optional, for display)
     */
    readonly startingPrice?: string

    /**
     * Estimated monthly payment (optional)
     */
    readonly monthlyFrom?: string
}

/**
 * Procedures section props
 */
export type FinancingProceduresProps = {
    /**
     * Section badge/eyebrow
     */
    readonly badge?: string

    /**
     * Section title
     */
    readonly title: string

    /**
     * Section description
     */
    readonly description?: string

    /**
     * Procedure categories
     */
    readonly categories: readonly FinancingProcedureCategory[]

    /**
     * Background variant
     */
    readonly variant?: 'default' | 'muted'

    /**
     * Optional section ID
     */
    readonly id?: string

    /**
     * Additional CSS classes
     */
    readonly className?: string
}

/**
 * Partners section props
 */
export type FinancingPartnersProps = {
    /**
     * Section badge/eyebrow
     */
    readonly badge?: string

    /**
     * Section title
     */
    readonly title: string

    /**
     * Section description
     */
    readonly description?: string

    /**
     * Financing partners
     */
    readonly partners: readonly FinancingPartner[]

    /**
     * Background variant
     */
    readonly variant?: 'default' | 'muted'

    /**
     * Optional section ID
     */
    readonly id?: string

    /**
     * Additional CSS classes
     */
    readonly className?: string
}

/**
 * Complete financing page data
 */
export type FinancingPageData = {
    /**
     * Hero section data
     */
    readonly hero: Omit<FinancingHeroProps, 'id' | 'className'>

    /**
     * Partners section data
     */
    readonly partners: Omit<
        FinancingPartnersProps,
        'id' | 'className' | 'variant'
    >

    /**
     * How it works section data
     */
    readonly howItWorks: Omit<
        FinancingHowItWorksProps,
        'id' | 'className' | 'variant'
    >

    /**
     * Procedures section data
     */
    readonly procedures: Omit<
        FinancingProceduresProps,
        'id' | 'className' | 'variant'
    >

    /**
     * CTA section data
     */
    readonly cta: {
        readonly heading: string
        readonly description: string
        readonly eyebrow?: string
        readonly primaryButton: {
            readonly text: string
            readonly href: string
        }
        readonly secondaryButton?: {
            readonly text: string
            readonly href: string
        }
    }
}

/**
 * SEO metadata for financing page
 */
export type FinancingSeoData = {
    readonly title: string
    readonly description: string
    readonly keywords: readonly string[]
    readonly canonical: string
}
