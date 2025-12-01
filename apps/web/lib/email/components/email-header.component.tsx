/**
 * Email Header Component
 *
 * Reusable header for email templates with logo, tagline, and business name.
 * Styled with Alluring Plastic Surgery brand colors (Stone + Gold palette).
 *
 * @module lib/email/components/EmailHeader.component
 */
import { Heading, Img, Section, Text } from '@react-email/components'

import { siteConfig } from '@/lib/data/site-config'

type EmailHeaderProps = {
    /**
     * Optional title to display below logo
     */
    title?: string

    /**
     * Whether to show the business tagline
     * @default true
     */
    showTagline?: boolean
}

/**
 * Email header component
 *
 * Displays business logo, tagline, and optional title.
 * Uses site configuration for logo and business name.
 * Features gold accent border for luxury aesthetic.
 *
 * @example
 * ```tsx
 * <EmailHeader title="Thank You for Reaching Out" />
 * ```
 */
export function EmailHeader({ title, showTagline = true }: EmailHeaderProps) {
    const logoUrl = `${siteConfig.seo.siteUrl}${siteConfig.brand.logo}`

    return (
        <Section className='border-b-4 border-b-[#D4AF37] bg-stone-50 px-10 py-8 text-center'>
            <Img
                src={logoUrl}
                alt={siteConfig.brand.logoAlt}
                width='180'
                height='60'
                className='mx-auto block'
            />
            {showTagline && (
                <Text className='m-0 mt-3 text-xs font-medium tracking-widest text-stone-500 uppercase'>
                    {siteConfig.business.tagline}
                </Text>
            )}
            {title && (
                <Heading
                    className='m-0 mt-6 text-2xl leading-tight font-semibold text-stone-900'
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                    {title}
                </Heading>
            )}
        </Section>
    )
}
