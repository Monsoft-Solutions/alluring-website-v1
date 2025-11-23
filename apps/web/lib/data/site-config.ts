/**
 * Site Configuration
 *
 * CENTRAL SOURCE OF TRUTH for all business and site information.
 *
 * 🎯 UPDATE THIS FILE when creating websites for new clients.
 *
 * This configuration is used across:
 * - SEO metadata and Open Graph tags
 * - Contact pages and forms
 * - Footer and header components
 * - Social media links
 * - Structured data (Schema.org)
 */
import { env } from '@/env'
import type { SiteConfig } from '@/lib/types/site-config.type'

/**
 * Get the site URL from environment variable
 * Falls back to a default value if not set
 *
 * Note: VERCEL_URL is server-only and cannot be accessed here.
 * Always set NEXT_PUBLIC_SITE_URL in your environment variables.
 */
function getSiteUrl(): string {
    // Use NEXT_PUBLIC_SITE_URL or fallback to default
    if (env.NEXT_PUBLIC_SITE_URL) {
        return env.NEXT_PUBLIC_SITE_URL
    }

    return 'https://alluringplasticsurgery.com' // Fallback for local development
}

/**
 * Main Site Configuration
 *
 * Update all values below for each new client/project.
 */
export const siteConfig: SiteConfig = {
    /**
     * Business Information
     */
    business: {
        name: 'Alluring Plastic Surgery',
        legalName: 'Alluring Plastic Surgery',
        tagline: 'Luxury Surgeries Made Affordable',
        description:
            'World-class aesthetic procedures in Miami combining high-end results with flexible financing and personalized care. Where luxury meets affordability.',
        foundedYear: undefined,
        founders: undefined,
        organizationType: 'Medical Practice',
    },

    /**
     * Contact Information
     */
    contact: {
        phone: '+1-786-305-8649',
        phoneDisplay: '+1 (786) 305-8649',
        email: 'info@alluringplasticsurgery.com',
        supportEmail: 'info@alluringplasticsurgery.com',
        address: '8435 SW 24th St',
        addressLine2: undefined,
        city: 'Miami',
        state: 'FL',
        postalCode: '33155',
        country: 'United States',
        timezone: 'America/New_York',

        // Business hours
        businessHours: [
            {
                days: 'Monday - Friday',
                open: '9:00 AM',
                close: '5:00 PM',
            },
            {
                days: 'Saturday',
                open: '9:00 AM',
                close: '3:00 PM',
            },
            {
                days: 'Sunday',
                open: 'Closed',
                close: 'Closed',
                note: 'Closed on Sundays and public holidays',
            },
        ],

        // Support hours (if different from business hours)
        supportHours: [
            {
                days: 'Monday - Friday',
                open: '9:00 AM',
                close: '5:00 PM',
            },
            {
                days: 'Saturday',
                open: '9:00 AM',
                close: '3:00 PM',
            },
        ],
    },

    /**
     * Social Media Links
     */
    social: [
        {
            platform: 'facebook',
            url: 'https://facebook.com/alluringplasticsurgery',
            label: 'Facebook',
        },
        {
            platform: 'instagram',
            url: 'https://instagram.com/alluringplasticsurgery',
            label: 'Instagram',
        },
        {
            platform: 'tiktok',
            url: 'https://tiktok.com/@alluringplasticsurgery',
            label: 'TikTok',
        },
    ],

    /**
     * Brand Assets
     */
    brand: {
        logo: '/logo.png',
        logoAlt: 'Alluring Plastic Surgery Logo',
        favicon: '/favicon.png',
        appleTouchIcon: '/apple-touch-icon.png',
        ogImage: '/og-image.jpg',
    },

    /**
     * SEO Defaults
     */
    seo: {
        siteUrl: getSiteUrl(), // Dynamically from environment
        siteName: 'Alluring Plastic Surgery',
        siteDescription:
            'Luxury cosmetic and plastic surgery clinic in Miami. Board-certified surgeons specializing in BBL, breast augmentation, tummy tuck, liposuction, mommy makeover, and facial procedures. Where luxury meets affordability.',
        keywords: [
            'plastic surgery Miami',
            'cosmetic surgery Miami',
            'BBL Miami',
            'Brazilian Butt Lift',
            'breast augmentation Miami',
            'tummy tuck Miami',
            'liposuction Miami',
            'mommy makeover Miami',
            'facial surgery Miami',
            'cosmetic gynecology',
            'alluring plastic surgery',
            'Miami plastic surgeon',
        ],
        locale: 'en-US',
        twitterHandle: '@alluringplasticsurgery',
        facebookAppId: '',
        enableIndexing: true,
    },
}

/**
 * Helper function to get full address string
 */
export function getFullAddress(): string {
    const { address, addressLine2, city, state, postalCode, country } =
        siteConfig.contact

    const parts = [
        address,
        addressLine2,
        city && state ? `${city}, ${state}` : city || state,
        postalCode,
        country,
    ].filter(Boolean)

    return parts.join(', ')
}

/**
 * Helper function to get formatted phone number for tel: links
 */
export function getPhoneLink(): string {
    return `tel:${siteConfig.contact.phone.replace(/[\s()-]/g, '')}`
}

/**
 * Helper function to get email link
 */
export function getEmailLink(): string {
    return `mailto:${siteConfig.contact.email}`
}

/**
 * Helper function to get support email link
 */
export function getSupportEmailLink(): string {
    return `mailto:${siteConfig.contact.supportEmail || siteConfig.contact.email}`
}

/**
 * Export individual sections for convenience
 */
export const businessInfo = siteConfig.business
export const contactInfo = siteConfig.contact
export const socialLinks = siteConfig.social
export const brandAssets = siteConfig.brand
export const seoDefaults = siteConfig.seo
