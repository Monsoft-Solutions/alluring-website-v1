/**
 * Navigation Data
 *
 * Configuration for site navigation.
 * Contact info and social links are re-exported from centralized site-config.
 */
import {
    getFullAddress,
    contactInfo as siteContactInfo,
    socialLinks as siteSocialLinks,
} from '@/lib/data/site-config'
import type { NavigationItem } from '@/lib/types/navigation.type'

/**
 * Main navigation items
 */
export const mainNavigation: NavigationItem[] = [
    { label: 'Home', href: '/', external: false },
    { label: 'About', href: '/about', external: false },
    { label: 'Blog', href: '/blog', external: false },
    { label: 'Contact', href: '/contact', external: false },
]

/**
 * Contact information
 * Re-exported from centralized site config for backward compatibility
 */
export const contactInfo = {
    phone: siteContactInfo.phone,
    email: siteContactInfo.email,
    address: getFullAddress(),
}

/**
 * Social media links
 * Re-exported from centralized site config for backward compatibility
 */
export const socialLinks = siteSocialLinks
