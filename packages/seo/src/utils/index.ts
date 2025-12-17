/**
 * Utilities Module
 *
 * Re-exports all SEO utility functions.
 */

export { buildUrl, getAbsoluteUrl, getCanonicalUrl } from './url.util'
export { escapeJsonForHtml, sanitizeForJsonLd } from './sanitize.util'
export { generateImageMetadata } from './image.util'

// Sitemap utilities
export {
    generateSitemapEntries,
    convertToNextjsSitemap,
    splitSitemapEntries,
    generateSitemapIndex,
    createStaticRoutes,
    validateSitemapEntries,
    generateSitemapXml,
    escapeXml,
    type SitemapConfig,
} from './sitemap-generator.util'

// Robots.txt utilities
export {
    generateRobots,
    generateRobotsForEnvironment,
    createCommonRobotsRules,
    validateRobotsConfig,
    detectEnvironment,
    robotsToText,
    type RobotsGeneratorConfig,
    type RobotsEnvironment,
    type RobotsRule,
} from './robots-generator.util'
