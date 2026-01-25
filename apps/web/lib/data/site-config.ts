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
    const url = env.NEXT_PUBLIC_SITE_URL?.trim()
    if (url && url.length > 0) {
        // Validate URL format
        try {
            new URL(url)
            return url
        } catch {
            // Invalid URL, use fallback
        }
    }

    return 'https://www.alluringplasticsurgery.com' // Fallback for local development
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
        // Google Place ID - used for Google Reviews link
        // Find at: https://developers.google.com/maps/documentation/places/web-service/place-id
        googlePlaceId: undefined,
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
        coordinates: {
            lat: 25.7529,
            lng: -80.3309,
        },
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
        // Search engine verification codes
        // Obtain from respective webmaster tools dashboards
        verification: {
            google: undefined, // Google Search Console
            bing: undefined, // Bing Webmaster Tools - IMPORTANT for ChatGPT visibility
            yandex: undefined, // Yandex Webmaster
        },
    },

    /**
     * Trust Statistics
     * Business credibility metrics displayed in CTA sections and trust badges
     */
    trustStats: {
        patients: '5,000+',
        years: '15+',
        certified: '100%',
        rating: '4.9',
        accreditation: 'Double Board-Certified',
    },

    /**
     * Legal Information
     * Copyright and licensing details for structured data schemas
     */
    legal: {
        copyrightHolder: 'Alluring Plastic Surgery',
        defaultImageLicense:
            'https://creativecommons.org/licenses/by-nc-nd/4.0/',
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
 * Helper function to build Google Maps embed URL
 * Uses coordinates if available, otherwise falls back to address
 */
export function getMapEmbedUrl(): string {
    const { coordinates } = siteConfig.contact
    const address = getFullAddress()

    if (coordinates) {
        // Use coordinates-based embed URL (more reliable)
        // Format: https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d[zoom]!2d[lng]!3d[lat]!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s[place_id]!2s[address]!5e0!3m2!1sen!2sus!4v[version]!5m2!1sen!2sus
        // Simplified version using coordinates and address
        const encodedAddress = encodeURIComponent(address)
        return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3594.0477!2d${coordinates.lng}!3d${coordinates.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88d9b82dc3d8d25d%3A0x45e7c6ee8f91b6d5!2s${encodedAddress}!5e0!3m2!1sen!2sus!4v1699999999999!5m2!1sen!2sus`
    }

    // Fallback to address-only embed URL
    const encodedAddress = encodeURIComponent(address)
    return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3594.0477!2d-80.3309!3d25.7529!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88d9b82dc3d8d25d%3A0x45e7c6ee8f91b6d5!2s${encodedAddress}!5e0!3m2!1sen!2sus!4v1699999999999!5m2!1sen!2sus`
}

/**
 * Financing Partners
 *
 * Canonical list of financing partners used across the site.
 * Normalized partner names for consistent display.
 * Based on: https://www.alluringplasticsurgery.com/plastic-surgery-financing-miami/
 */
export const FINANCING_PARTNERS = [
    'Cherry',
    'CareCredit',
    'United Credit',
] as const

/**
 * Helper function to format financing partners as a comma-separated string
 * Returns format: "Cherry, CareCredit, and United Credit"
 */
export function getFinancingPartnersString(): string {
    const partners = [...FINANCING_PARTNERS] // Convert readonly tuple to array

    if (partners.length === 0) {
        return ''
    }
    if (partners.length === 1) {
        return partners[0]!
    }
    if (partners.length === 2) {
        return `${partners[0]!} and ${partners[1]!}`
    }
    // For 3+ partners: "Partner1, Partner2, and Partner3"
    const lastPartner = partners[partners.length - 1]!
    const otherPartners = partners.slice(0, -1).join(', ')
    return `${otherPartners}, and ${lastPartner}`
}

/**
 * Export individual sections for convenience
 */
export const businessInfo = siteConfig.business
export const contactInfo = siteConfig.contact
export const socialLinks = siteConfig.social
export const brandAssets = siteConfig.brand
export const seoDefaults = siteConfig.seo
export const trustStats = siteConfig.trustStats
