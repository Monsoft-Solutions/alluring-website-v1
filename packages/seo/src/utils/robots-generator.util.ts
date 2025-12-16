/**
 * Robots.txt Generator Utility
 *
 * Provides utilities for generating robots.txt files with environment-aware rules,
 * sitemap references, and proper crawling directives.
 *
 * Best Practices Applied:
 * - No deprecated Host directive (removed in modern implementations)
 * - No Crawl-delay (not widely supported, can hurt crawl rate)
 * - Support for multiple sitemaps (sitemap index + children)
 * - Precise pattern matching (*.json$ instead of *.json)
 * - Social media bots allowed for Open Graph previews
 */
import type { MetadataRoute } from 'next'

import { env } from '../env'

/**
 * Environment types for robots.txt generation
 */
export type RobotsEnvironment =
    | 'production'
    | 'staging'
    | 'development'
    | 'preview'

/**
 * Configuration for robots.txt generation
 */
export type RobotsGeneratorConfig = {
    /** Current environment */
    environment: RobotsEnvironment
    /** Base URL for the site */
    baseUrl: string
    /** Array of sitemap URLs (supports multiple sitemaps) */
    sitemaps?: string[]
    /** @deprecated Use sitemaps array instead. Single sitemap URL for backwards compatibility */
    sitemapUrl?: string
    /** Custom user agents and their rules */
    customRules?: RobotsRule[]
    /** Additional disallowed paths for all environments */
    additionalDisallows?: string[]
}

/**
 * Custom robots rule for specific user agents
 */
export type RobotsRule = {
    /** User agent pattern */
    userAgent: string | string[]
    /** Allowed paths */
    allow?: string[]
    /** Disallowed paths */
    disallow?: string[]
}

/**
 * Local robots rule type for internal array building
 */
type LocalRule = {
    userAgent: string | string[]
    allow?: string | string[]
    disallow?: string | string[]
}

/**
 * Generate robots.txt content based on environment and configuration
 *
 * @param config - Robots generation configuration
 * @returns MetadataRoute.Robots object for Next.js
 *
 * @example
 * ```typescript
 * const robots = generateRobots({
 *   environment: 'production',
 *   baseUrl: 'https://example.com',
 *   sitemaps: ['/sitemap.xml', '/sitemap/blog.xml', '/sitemap/pages.xml']
 * })
 * ```
 */
export function generateRobots(
    config: RobotsGeneratorConfig
): MetadataRoute.Robots {
    const {
        environment,
        baseUrl,
        sitemaps = [],
        sitemapUrl, // Deprecated, for backwards compatibility
        customRules = [],
        additionalDisallows = [],
    } = config

    const normalizedBaseUrl = baseUrl.replace(/\/$/, '')

    // Base disallowed paths for all environments
    // Using *.json$ for precise matching (only files ending in .json)
    const baseDisallows = [
        '/api/',
        '/admin/',
        '/private/',
        '/*.json$',
        ...additionalDisallows,
    ]

    // Environment-specific rules - use LocalRule[] for array operations
    const rules: LocalRule[] = []

    if (environment === 'production') {
        // Production: Allow most crawling with some restrictions
        rules.push({
            userAgent: '*',
            allow: ['/', '/_next/static/', '/_next/image/'],
            disallow: baseDisallows,
        })

        // Add custom rules for production (without duplicating base disallows)
        customRules.forEach((rule) => {
            rules.push({
                userAgent: rule.userAgent,
                allow: rule.allow,
                disallow: rule.disallow,
            })
        })
    } else {
        // Non-production: Block all crawling
        rules.push({
            userAgent: '*',
            disallow: '/',
        })
    }

    // Build sitemap URLs array
    const sitemapUrls: string[] = []

    if (environment === 'production') {
        // Add sitemaps from the new array format
        if (sitemaps.length > 0) {
            sitemaps.forEach((sitemap) => {
                const url = sitemap.startsWith('http')
                    ? sitemap
                    : `${normalizedBaseUrl}${sitemap.startsWith('/') ? sitemap : '/' + sitemap}`
                sitemapUrls.push(url)
            })
        } else if (sitemapUrl) {
            // Fallback to deprecated single sitemap URL
            const url = sitemapUrl.startsWith('http')
                ? sitemapUrl
                : `${normalizedBaseUrl}${sitemapUrl.startsWith('/') ? sitemapUrl : '/' + sitemapUrl}`
            sitemapUrls.push(url)
        } else {
            // Default to /sitemap.xml if nothing specified
            sitemapUrls.push(`${normalizedBaseUrl}/sitemap.xml`)
        }
    }

    // Return single sitemap as string, multiple as array
    // Note: Next.js MetadataRoute.Robots supports both string and string[] for sitemap
    return {
        rules: rules as MetadataRoute.Robots['rules'],
        sitemap:
            sitemapUrls.length === 1
                ? sitemapUrls[0]
                : sitemapUrls.length > 1
                  ? sitemapUrls
                  : undefined,
        // Note: Host directive is deprecated and removed
    }
}

/**
 * Generate robots.txt for different environments with sensible defaults
 *
 * @param environment - Target environment
 * @param baseUrl - Base URL for the site
 * @param sitemaps - Optional array of sitemap URLs
 * @returns MetadataRoute.Robots object
 *
 * @example
 * ```typescript
 * // Production robots
 * const prodRobots = generateRobotsForEnvironment('production', 'https://example.com')
 *
 * // Development robots (blocks all)
 * const devRobots = generateRobotsForEnvironment('development', 'http://localhost:3000')
 *
 * // With multiple sitemaps
 * const robotsWithSitemaps = generateRobotsForEnvironment(
 *   'production',
 *   'https://example.com',
 *   ['/sitemap.xml', '/sitemap/blog.xml']
 * )
 * ```
 */
export function generateRobotsForEnvironment(
    environment: RobotsEnvironment,
    baseUrl: string,
    sitemaps?: string[]
): MetadataRoute.Robots {
    return generateRobots({
        environment,
        baseUrl,
        sitemaps,
    })
}

/**
 * Create custom robots rules for specific use cases
 *
 * These rules are optimized for:
 * - Maximum visibility to major search engines (Google, Bing)
 * - Blocking aggressive SEO crawlers that waste bandwidth
 * - Allowing social media bots for Open Graph previews
 * - AI crawlers blocked to protect content
 *
 * @returns Array of common custom robots rules
 *
 * @example
 * ```typescript
 * const customRules = createCommonRobotsRules()
 * const robots = generateRobots({
 *   environment: 'production',
 *   baseUrl: 'https://example.com',
 *   customRules
 * })
 * ```
 */
export function createCommonRobotsRules(): RobotsRule[] {
    return [
        // Block aggressive SEO crawlers (waste bandwidth, provide little value)
        {
            userAgent: ['AhrefsBot', 'MJ12bot', 'SemrushBot', 'DotBot'],
            disallow: ['/'],
        },
        // Block AI training crawlers (protect content)
        {
            userAgent: [
                'GPTBot',
                'ChatGPT-User',
                'CCBot',
                'anthropic-ai',
                'Claude-Web',
                'Google-Extended',
            ],
            disallow: ['/'],
        },
        // Social media crawlers - allow for Open Graph previews
        {
            userAgent: [
                'facebookexternalhit',
                'Twitterbot',
                'LinkedInBot',
                'Pinterest',
                'Slackbot',
            ],
            allow: ['/', '/_next/static/', '/_next/image/'],
            disallow: ['/admin/', '/api/'],
        },
    ]
}

/**
 * Validate robots configuration for common issues
 *
 * @param config - Robots configuration to validate
 * @returns Array of validation warnings/errors
 *
 * @example
 * ```typescript
 * const config: RobotsGeneratorConfig = {
 *   environment: 'production',
 *   baseUrl: 'https://example.com',
 *   sitemaps: ['/sitemap.xml']
 * }
 *
 * const issues = validateRobotsConfig(config)
 * if (issues.length > 0) {
 *   console.warn('Robots configuration issues:', issues)
 * }
 * ```
 */
export function validateRobotsConfig(config: RobotsGeneratorConfig): string[] {
    const issues: string[] = []

    // Validate base URL
    try {
        new URL(config.baseUrl)
    } catch {
        issues.push(`Invalid baseUrl format: ${config.baseUrl}`)
    }

    // Validate sitemaps array
    if (config.sitemaps) {
        config.sitemaps.forEach((sitemap, index) => {
            try {
                if (sitemap.startsWith('/')) {
                    new URL(sitemap, config.baseUrl)
                } else {
                    new URL(sitemap)
                }
            } catch {
                issues.push(`Invalid sitemap URL at index ${index}: ${sitemap}`)
            }
        })
    }

    // Validate deprecated sitemap URL if provided
    if (config.sitemapUrl) {
        issues.push(
            'sitemapUrl is deprecated, use sitemaps array instead for multiple sitemaps support'
        )
        try {
            if (config.sitemapUrl.startsWith('/')) {
                new URL(config.sitemapUrl, config.baseUrl)
            } else {
                new URL(config.sitemapUrl)
            }
        } catch {
            issues.push(`Invalid sitemapUrl format: ${config.sitemapUrl}`)
        }
    }

    // Validate custom rules
    if (config.customRules) {
        config.customRules.forEach((rule, index) => {
            const userAgents = Array.isArray(rule.userAgent)
                ? rule.userAgent
                : [rule.userAgent]
            if (
                userAgents.length === 0 ||
                userAgents.some((ua) => !ua || ua.trim() === '')
            ) {
                issues.push(`Custom rule ${index}: userAgent is required`)
            }
        })
    }

    // Environment-specific warnings
    if (config.environment !== 'production' && config.customRules?.length) {
        issues.push(
            'Custom rules will be ignored in non-production environments'
        )
    }

    return issues
}

/**
 * Get environment from Next.js environment variables
 *
 * @returns Detected environment
 *
 * @example
 * ```typescript
 * const env = detectEnvironment()
 * const robots = generateRobotsForEnvironment(env, process.env.NEXT_PUBLIC_BASE_URL!)
 * ```
 */
export function detectEnvironment(): RobotsEnvironment {
    const nodeEnv = env.NODE_ENV
    const vercelEnv = env.VERCEL_ENV

    // Vercel-specific environment detection
    if (vercelEnv === 'production') return 'production'
    if (vercelEnv === 'preview') return 'preview'

    // Standard Node.js environment detection
    if (nodeEnv === 'production') return 'production'
    if (nodeEnv === 'development') return 'development'

    // Check for staging indicators
    const url = env.NEXT_PUBLIC_BASE_URL || env.VERCEL_URL
    if (url && (url.includes('staging') || url.includes('dev'))) {
        return 'staging'
    }

    // Default to development
    return 'development'
}

/**
 * Generate robots.txt content as plain text (for debugging/preview)
 *
 * @param robots - MetadataRoute.Robots object
 * @returns Plain text robots.txt content
 *
 * @example
 * ```typescript
 * const robots = generateRobots(config)
 * const textContent = robotsToText(robots)
 * console.log(textContent)
 * ```
 */
export function robotsToText(robots: MetadataRoute.Robots): string {
    const lines: string[] = []

    // Add rules - handle both array and single rule formats
    const rulesArray = Array.isArray(robots.rules)
        ? robots.rules
        : [robots.rules]

    rulesArray.forEach((rule) => {
        // Handle userAgent as string or array
        const userAgents = (
            Array.isArray(rule.userAgent) ? rule.userAgent : [rule.userAgent]
        ).filter((ua): ua is string => Boolean(ua))

        userAgents.forEach((ua) => {
            lines.push(`User-agent: ${ua}`)
        })

        // Handle allow paths
        if (rule.allow) {
            const allowPaths = (
                Array.isArray(rule.allow) ? rule.allow : [rule.allow]
            ).filter((path): path is string => Boolean(path))

            allowPaths.forEach((path) => {
                lines.push(`Allow: ${path}`)
            })
        }

        // Handle disallow paths
        if (rule.disallow) {
            const disallowPaths = (
                Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow]
            ).filter((path): path is string => Boolean(path))

            disallowPaths.forEach((path) => {
                lines.push(`Disallow: ${path}`)
            })
        }

        // Note: Crawl-delay is intentionally not included (not widely supported)

        lines.push('') // Empty line between rules
    })

    // Add sitemaps - handle both string and array formats
    if (robots.sitemap) {
        const sitemaps = Array.isArray(robots.sitemap)
            ? robots.sitemap
            : [robots.sitemap]

        sitemaps.forEach((sitemap: string) => {
            lines.push(`Sitemap: ${sitemap}`)
        })
    }

    // Note: Host directive is intentionally not included (deprecated)

    return lines.join('\n')
}
