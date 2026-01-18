/**
 * Footer Data
 *
 * Configuration for footer sections and links.
 * Company name is pulled from centralized site-config.
 */
import { businessInfo, siteConfig } from '@/lib/data/site-config'
import type { NavigationSection } from '@/lib/types/navigation.type'

export const footerSections: NavigationSection[] = [
    {
        title: 'Get Started',
        items: [
            {
                label: 'Free Consultation',
                href: '/free-consultation',
                external: false,
            },
            {
                label: 'Miami Patients',
                href: '/free-consultation/miami',
                external: false,
            },
            {
                label: 'Out-of-Town Patients',
                href: '/fly-in-consultation',
                external: false,
            },
        ],
    },
    {
        title: 'For You',
        items: [
            {
                label: 'Mommy Makeover',
                href: '/mommy-makeover-consultation',
                external: false,
            },
            {
                label: 'After Weight Loss',
                href: '/after-weight-loss-consultation',
                external: false,
            },
            {
                label: 'BBL Miami',
                href: '/bbl-miami',
                external: false,
            },
            {
                label: 'Brides',
                href: '/bridal-consultation',
                external: false,
            },
            {
                label: 'En Español',
                href: '/consulta-gratis',
                external: false,
            },
        ],
    },
    {
        title: 'Company',
        items: [
            { label: 'About', href: '/about', external: false },
            {
                label: 'Financing',
                href: '/plastic-surgery-financing-miami',
                external: false,
            },
            {
                label: 'BMI Calculator',
                href: '/bmi-calculator',
                external: false,
            },
            { label: 'Blog', href: '/blog', external: false },
            { label: 'Gallery', href: '/gallery', external: false },
            { label: 'Contact', href: '/contact-us', external: false },
        ],
    },
    {
        title: 'Resources',
        items: [
            {
                label: 'GitHub',
                href:
                    siteConfig.social.find((s) => s.platform === 'github')
                        ?.url ?? '',
                external: true,
            },
        ],
    },
    {
        title: 'Legal',
        items: [
            { label: 'Privacy Policy', href: '/privacy', external: false },
            { label: 'Terms of Service', href: '/terms', external: false },
            { label: 'Cookie Policy', href: '/cookies', external: false },
        ],
    },
]

/**
 * Copyright text using centralized business name
 */
export const copyrightText = `© ${new Date().getFullYear()} ${businessInfo.name}. All rights reserved.`
