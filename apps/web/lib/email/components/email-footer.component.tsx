/**
 * Email Footer Component
 *
 * Reusable footer for email templates with contact information,
 * quick links to useful site resources, and social media links.
 * Styled with Alluring Plastic Surgery brand colors (Stone + Gold palette).
 *
 * @module lib/email/components/EmailFooter.component
 */
import { Column, Hr, Link, Row, Section, Text } from '@react-email/components'

import { getFullAddress, siteConfig } from '@/lib/data/site-config'

/**
 * Quick links to useful site resources
 */
const quickLinks = [
    { label: 'Our Procedures', path: '/procedures' },
    { label: 'Financing Options', path: '/plastic-surgery-financing-miami' },
    { label: 'About Our Surgeons', path: '/about' },
    { label: 'Read Our Blog', path: '/blog' },
]

/**
 * Email footer component
 *
 * Displays quick links to site resources, business contact information,
 * social media links, address, and copyright.
 * Uses site configuration for all business data.
 *
 * @example
 * ```tsx
 * <EmailFooter />
 * ```
 */
export function EmailFooter() {
    const currentYear = new Date().getFullYear()
    const siteUrl = siteConfig.seo.siteUrl

    return (
        <Section className='bg-stone-50 px-10 py-8'>
            {/* Quick Links Section */}
            <Text className='m-0 mb-4 text-center text-xs font-semibold tracking-widest text-stone-500 uppercase'>
                Explore More
            </Text>
            <Row className='mb-6'>
                {quickLinks.map((link, index) => (
                    <Column key={link.path} className='text-center'>
                        <Link
                            href={`${siteUrl}${link.path}`}
                            className='text-sm font-medium text-[#D4AF37] no-underline'
                        >
                            {link.label}
                        </Link>
                        {index < quickLinks.length - 1 && (
                            <Text className='m-0 inline text-stone-300'>
                                {' '}
                                ·{' '}
                            </Text>
                        )}
                    </Column>
                ))}
            </Row>

            <Hr className='my-6 border-stone-200' />

            {/* Social Media Links */}
            <Text className='m-0 mb-3 text-center text-sm text-stone-600'>
                Follow us for before &amp; after photos, tips, and updates
            </Text>
            <Text className='m-0 mb-6 text-center'>
                {siteConfig.social.map((social, index) => (
                    <span key={social.platform}>
                        <Link
                            href={social.url}
                            className='text-sm font-medium text-[#D4AF37] no-underline'
                        >
                            {social.label}
                        </Link>
                        {index < siteConfig.social.length - 1 && (
                            <span className='text-stone-300'> · </span>
                        )}
                    </span>
                ))}
            </Text>

            <Hr className='my-6 border-stone-200' />

            {/* Contact Information */}
            <Text className='m-0 mb-1 text-center text-sm font-semibold text-stone-700'>
                {siteConfig.business.name}
            </Text>
            <Text className='m-0 mb-3 text-center text-sm text-stone-500'>
                {getFullAddress()}
            </Text>

            <Text className='m-0 mb-1 text-center text-sm text-stone-600'>
                <Link
                    href={`tel:${siteConfig.contact.phone}`}
                    className='font-medium text-[#D4AF37] no-underline'
                >
                    {siteConfig.contact.phoneDisplay}
                </Link>
                {' · '}
                <Link
                    href={`mailto:${siteConfig.contact.email}`}
                    className='font-medium text-[#D4AF37] no-underline'
                >
                    {siteConfig.contact.email}
                </Link>
            </Text>

            {/* Business Hours */}
            <Text className='m-0 mt-3 text-center text-xs text-stone-400'>
                Mon-Fri: 9AM-5PM · Sat: 9AM-3PM
            </Text>

            <Hr className='my-6 border-stone-200' />

            {/* Copyright */}
            <Text className='m-0 text-center text-xs text-stone-400'>
                © {currentYear} {siteConfig.business.legalName}. All rights
                reserved.
            </Text>
            <Text className='m-0 mt-2 text-center text-xs text-stone-400'>
                <Link
                    href={`${siteUrl}/privacy`}
                    className='text-stone-400 no-underline'
                >
                    Privacy Policy
                </Link>
                {' · '}
                <Link
                    href={`${siteUrl}/terms`}
                    className='text-stone-400 no-underline'
                >
                    Terms of Service
                </Link>
            </Text>
        </Section>
    )
}
