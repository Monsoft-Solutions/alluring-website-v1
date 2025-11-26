/**
 * Blog Page Data
 *
 * All content and configuration for the blog landing page.
 * Includes hero section, category configuration, and CTA content.
 *
 * Following the site's luxury aesthetic with stone/gold palette.
 */
import { getPhoneLink, siteConfig } from '@/lib/data/site-config'

/**
 * Blog page SEO metadata
 */
export const blogSeoData = {
    title: `Plastic Surgery Blog | Expert Insights & Patient Education | ${siteConfig.business.name}`,
    description: `Expert articles on plastic surgery procedures, recovery tips, and patient education from Miami's trusted board-certified surgeons. BBL, breast augmentation, tummy tuck & more.`,
    keywords: [
        'plastic surgery blog miami',
        'cosmetic surgery education',
        'BBL recovery tips',
        'breast augmentation guide',
        'tummy tuck recovery',
        'mommy makeover information',
        'plastic surgery before and after',
        'cosmetic procedure guide',
        'board certified plastic surgeon miami',
        'plastic surgery patient education',
    ],
    canonical: '/blog',
}

/**
 * Hero section content
 */
export const blogHeroData = {
    badge: 'Expert Insights',
    headline: 'Your Guide to Confident Transformation',
    subheadline: 'Knowledge is Beautiful',
    description:
        'Expert articles, recovery guides, and insider knowledge from our board-certified surgeons. Everything you need to make informed decisions about your aesthetic journey.',
    backgroundImage: '/images/hero-beautiful-latin-woman.jpg',
}

/**
 * Blog categories for navigation
 */
export const blogCategories = [
    { name: 'All Articles', slug: 'all' },
    { name: 'Procedures', slug: 'procedures' },
    { name: 'Recovery Tips', slug: 'recovery' },
    { name: 'Patient Stories', slug: 'patient-stories' },
    { name: 'Expert Advice', slug: 'expert-advice' },
]

/**
 * Featured section content
 */
export const blogFeaturedSectionData = {
    badge: 'Latest Article',
    title: 'Featured Post',
}

/**
 * Articles grid section content
 */
export const blogArticlesSectionData = {
    badge: 'Knowledge Hub',
    title: 'All Articles',
    description:
        'Explore our collection of expert articles covering procedures, recovery, and everything you need to know about your transformation journey.',
}

/**
 * CTA section content
 */
export const blogCtaData = {
    eyebrow: 'Ready to Learn More?',
    heading: 'Schedule Your Free Consultation',
    description:
        'Have questions about a procedure you read about? Our board-certified surgeons are here to provide personalized guidance and answer all your questions.',
    primaryButton: {
        text: 'Book Consultation',
        href: '/contact-us',
    },
    secondaryButton: {
        text: `Call ${siteConfig.contact.phoneDisplay}`,
        href: getPhoneLink(),
    },
}

/**
 * Complete blog page data export
 */
export const blogPageData = {
    seo: blogSeoData,
    hero: blogHeroData,
    categories: blogCategories,
    featuredSection: blogFeaturedSectionData,
    articlesSection: blogArticlesSectionData,
    cta: blogCtaData,
}
