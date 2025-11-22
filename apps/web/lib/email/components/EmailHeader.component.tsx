/**
 * Email Header Component
 *
 * Reusable header for email templates with logo and business name.
 * Styled with Tailwind CSS for consistent design.
 *
 * @module lib/email/components/EmailHeader.component
 */
import { Heading, Img, Section } from '@react-email/components'

import { siteConfig } from '@/lib/data/site-config'

type EmailHeaderProps = {
    /**
     * Optional title to display below logo
     */
    title?: string
}

/**
 * Email header component
 *
 * Displays business logo and optional title.
 * Uses site configuration for logo and business name.
 *
 * @example
 * ```tsx
 * <EmailHeader title="Contact Form Notification" />
 * ```
 */
export function EmailHeader({ title }: EmailHeaderProps) {
    const logoUrl = `${siteConfig.seo.siteUrl}${siteConfig.brand.logo}`

    return (
        <Section className='border-border border-b px-10 py-5 text-center'>
            <Img
                src={logoUrl}
                alt={siteConfig.brand.logoAlt}
                width='150'
                height='50'
                className='mx-auto block'
            />
            {title && (
                <Heading className='text-foreground m-0 mt-4 text-2xl leading-tight font-semibold'>
                    {title}
                </Heading>
            )}
        </Section>
    )
}
