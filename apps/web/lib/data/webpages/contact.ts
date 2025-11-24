/**
 * Contact Page Data
 *
 * Data structures and content for the contact page sections.
 * Contact information is pulled from centralized site-config.
 *
 * Note: Most contact page components now have their own data embedded.
 * This file contains shared data and legacy compatibility exports.
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
 * Contact Hero Section Content (Legacy)
 * Note: ContactHeroForm component has its own content
 */
export const contactHeroData: Omit<ContactHeroSectionProps, 'id'> = {
    badge: 'Start Your Journey',
    headline: 'Your Transformation Begins Here',
    description:
        "Schedule your private consultation with our board-certified surgeons. We'll discuss your goals, answer every question, and create a personalized plan for your aesthetic journey.",
    enableAnimations: true,
}

/**
 * Contact Form Section Content (Legacy)
 * Note: ContactHeroForm component has its own content
 */
export const contactFormData: Omit<ContactFormSectionProps, 'id'> = {
    badge: 'Request Consultation',
    headline: 'Schedule Your Visit',
    description:
        'Fill out the form below and our concierge will contact you within 24 hours to schedule your consultation.',
}

/**
 * Contact Info Section Content
 * Uses centralized contact information from site-config
 */
export const contactInfoData: Omit<ContactInfoSectionProps, 'id'> = {
    badge: 'Contact Information',
    headline: 'Other Ways to Reach Us',
    description:
        'Prefer to call or visit? Use the information below to connect with our team directly.',
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
 * Final CTA Section Content
 * Encourages visitors to take the next step
 */
export const contactCTAData = {
    title: 'Ready to Begin Your Transformation?',
    description:
        'Explore our procedures or view before & after results to learn more about what we can achieve together.',
    primaryButton: {
        text: 'View Procedures',
        href: '/procedures',
    },
    secondaryButton: {
        text: 'See Results',
        href: '/#before-after',
    },
    variant: 'accent' as const,
}
