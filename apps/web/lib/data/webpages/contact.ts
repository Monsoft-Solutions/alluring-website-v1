/**
 * Contact Page Data
 *
 * Data structures and content for the contact page sections.
 * Contact information is pulled from centralized site-config.
 */
import { Mail, MapPin, Phone } from 'lucide-react'

import {
    contactInfo,
    getEmailLink,
    getFullAddress,
    getPhoneLink,
} from '@/lib/data/site-config'
import type { ContactFormSectionProps } from '@/lib/types/sections/contact-form-section.type'
import type { ContactHeroSectionProps } from '@/lib/types/sections/contact-hero-section.type'
import type { ContactInfoSectionProps } from '@/lib/types/sections/contact-info-section.type'

/**
 * Contact Hero Section Content
 */
export const contactHeroData: Omit<ContactHeroSectionProps, 'id'> = {
    badge: 'Get In Touch',
    headline: "Let's build your website.",
    description:
        'Questions about Keel? Need a quote? Send us a message. We respond within 24 hours.',
    enableAnimations: true,
}

/**
 * Contact Form Section Content
 */
export const contactFormData: Omit<ContactFormSectionProps, 'id'> = {
    badge: 'Send a Message',
    headline: 'Get In Touch',
    description:
        'Fill out the form. We respond within 24 hours on business days.',
}

/**
 * Contact Info Section Content
 * Uses centralized contact information from site-config
 */
export const contactInfoData: Omit<ContactInfoSectionProps, 'id'> = {
    badge: 'Contact Information',
    headline: 'Other Ways to Reach Us',
    description:
        'Prefer phone or email? Contact us directly using the information below.',
    contactItems: [
        {
            icon: Phone,
            title: 'Phone',
            value: contactInfo.phoneDisplay || contactInfo.phone,
            href: getPhoneLink(),
            ariaLabel: `Call us at ${contactInfo.phoneDisplay || contactInfo.phone}`,
        },
        {
            icon: Mail,
            title: 'Email',
            value: contactInfo.email,
            href: getEmailLink(),
            ariaLabel: `Email us at ${contactInfo.email}`,
        },
        {
            icon: MapPin,
            title: 'Address',
            value: getFullAddress(),
            ariaLabel: 'Our address',
        },
    ],
}

/**
 * Final CTA Section Content (for end of contact page)
 */
export const contactCTAData = {
    title: 'Ready to Start Building?',
    description:
        'Get Keel documentation. View pricing and features. Or schedule a call to discuss your project.',
    primaryButton: {
        text: 'View Documentation',
        href: '/docs',
    },
    secondaryButton: {
        text: 'See Features',
        href: '/#features',
    },
    variant: 'accent' as const,
}
