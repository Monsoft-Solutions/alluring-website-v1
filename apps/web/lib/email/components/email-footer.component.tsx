/**
 * Email Footer Component
 *
 * Reusable footer for email templates with contact information.
 * Styled with Tailwind CSS for consistent design.
 *
 * @module lib/email/components/EmailFooter.component
 */
import { Hr, Link, Section, Text } from '@react-email/components'

import { getFullAddress, siteConfig } from '@/lib/data/site-config'

/**
 * Email footer component
 *
 * Displays business contact information, address, and copyright.
 * Uses site configuration for all business data.
 *
 * @example
 * ```tsx
 * <EmailFooter />
 * ```
 */
export function EmailFooter() {
    const currentYear = new Date().getFullYear()

    return (
        <Section className='px-10 py-5'>
            <Hr className='my-5 border-gray-200' />
            <Text className='my-1 text-sm leading-relaxed text-gray-600'>
                <strong>{siteConfig.business.name}</strong>
            </Text>
            <Text className='my-1 text-sm leading-relaxed text-gray-600'>
                {getFullAddress()}
            </Text>
            <Text className='my-1 text-sm leading-relaxed text-gray-600'>
                Email:{' '}
                <Link
                    href={`mailto:${siteConfig.contact.email}`}
                    className='text-blue-500 no-underline'
                >
                    {siteConfig.contact.email}
                </Link>
            </Text>
            <Text className='my-1 text-sm leading-relaxed text-gray-600'>
                Phone:{' '}
                <Link
                    href={`tel:${siteConfig.contact.phone}`}
                    className='text-blue-500 no-underline'
                >
                    {siteConfig.contact.phoneDisplay}
                </Link>
            </Text>
            <Text className='mt-5 text-xs leading-relaxed text-gray-400'>
                © {currentYear} {siteConfig.business.legalName}. All rights
                reserved.
            </Text>
        </Section>
    )
}
