/**
 * Site Configuration Types
 *
 * Comprehensive type definitions for centralized site/business configuration.
 * This provides type safety for all business information used across the application.
 */
import type { LucideIcon } from 'lucide-react'

/**
 * Business hours for a single day or time period
 */
export type BusinessHours = {
    /** Day(s) of the week */
    days: string
    /** Opening time (e.g., "9:00 AM") */
    open: string
    /** Closing time (e.g., "5:00 PM") */
    close: string
    /** Whether this is a special schedule (e.g., holidays) */
    isSpecial?: boolean
    /** Additional notes (e.g., "Closed on holidays") */
    note?: string
}

/**
 * Geographic coordinates
 */
export type Coordinates = {
    /** Latitude */
    lat: number
    /** Longitude */
    lng: number
}

/**
 * Contact information with extended details
 */
export type ContactInfo = {
    /** Business phone number */
    phone: string
    /** Formatted phone number for display (optional) */
    phoneDisplay?: string
    /** Business email address */
    email: string
    /** Support email (if different from main) */
    supportEmail?: string
    /** Physical address */
    address: string
    /** Address line 2 (suite, floor, etc.) */
    addressLine2?: string
    /** City */
    city?: string
    /** State/Province */
    state?: string
    /** Postal/ZIP code */
    postalCode?: string
    /** Country */
    country?: string
    /** Geographic coordinates (latitude/longitude) */
    coordinates?: Coordinates
    /** Business hours */
    businessHours?: BusinessHours[]
    /** Support hours (if different from business hours) */
    supportHours?: BusinessHours[]
    /** Timezone (e.g., "America/New_York") */
    timezone?: string
}

/**
 * Social media platform link
 */
export type SocialLink = {
    /** Platform identifier (github, twitter, linkedin, etc.) */
    platform: string
    /** Full URL to the social profile */
    url: string
    /** Display label */
    label?: string
    /** Icon component (optional, can be mapped separately) */
    icon?: LucideIcon
}

/**
 * Brand assets and visual identity
 */
export type BrandAssets = {
    /** Path to main logo */
    logo: string
    /** Alt text for logo */
    logoAlt: string
    /** Path to favicon */
    favicon?: string
    /** Path to Apple touch icon */
    appleTouchIcon?: string
    /** Path to default Open Graph image */
    ogImage: string
}

/**
 * SEO defaults and metadata
 */
export type SEODefaults = {
    /** Base site URL (no trailing slash) */
    siteUrl: string
    /** Site name/title */
    siteName: string
    /** Site description */
    siteDescription: string
    /** Keywords for SEO */
    keywords?: string[]
    /** Default locale (e.g., "en-US") */
    locale?: string
    /** Twitter handle (with @ prefix) */
    twitterHandle?: string
    /** Facebook App ID */
    facebookAppId?: string
    /** Enable search engine indexing */
    enableIndexing?: boolean
}

/**
 * Business/Organization information
 */
export type BusinessInfo = {
    /** Business/brand name */
    name: string
    /** Legal business name */
    legalName?: string
    /** Short tagline or slogan */
    tagline?: string
    /** Full business description */
    description: string
    /** Year founded */
    foundedYear?: number
    /** Founder names */
    founders?: string[]
    /** Type of organization (e.g., "Corporation", "LLC") */
    organizationType?: string
}

/**
 * Trust statistics for displaying business credibility metrics
 * Used in CTA sections and trust badges
 */
export type TrustStats = {
    /** Number of patients (e.g., "5,000+") */
    patients: string
    /** Years of experience (e.g., "15+") */
    years: string
    /** Certification percentage (e.g., "100%") */
    certified: string
    /** Star rating (e.g., "4.9" or "5.0") */
    rating: string
    /** Accreditation body (e.g., "AAAASF") */
    accreditation?: string
}

/**
 * Complete site configuration
 *
 * Central source of truth for all business and site information.
 * Update this configuration when creating websites for new clients.
 */
export type SiteConfig = {
    /** Business/organization information */
    business: BusinessInfo
    /** Contact information */
    contact: ContactInfo
    /** Social media links */
    social: SocialLink[]
    /** Brand assets and visual identity */
    brand: BrandAssets
    /** SEO defaults and metadata */
    seo: SEODefaults
    /** Trust statistics for credibility metrics */
    trustStats?: TrustStats
}
