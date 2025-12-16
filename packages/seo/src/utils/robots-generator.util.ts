/**
 * Robots.txt Generator Utility
 *
 * Provides utilities for generating robots.txt files with environment-aware rules,
 * sitemap references, and proper crawling directives.
 */
import MetadataRoute from 'next'

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
    /** Custom sitemap URL (optional, defaults to /sitemap.xml) */
    sitemapUrl?: string
    /** Crawl delay in seconds (optional) */
    crawlDelay?: number
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
    userAgent: string
    /** Allowed paths */
    allow?: string[]
    /** Disallowed paths */
    disallow?: string[]
    /** Crawl delay for this user agent */
    crawlDelay?: number
}

/**
 * Local robots rule type for internal array building
 */
type LocalRule = {
    userAgent: string | string[]
    allow?: string | string[]
    disallow?: string | string[]
    crawlDelay?: number
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
 *   baseUrl: 'https://example.com'
 * })
 * ```
 */
export function generateRobots(
    config: RobotsGeneratorConfig
): MetadataRoute.Robots {
    const {
        environment,
        baseUrl,
        sitemapUrl,
        crawlDelay,
        customRules = [],
        additionalDisallows = [],
    } = config

    // Base disallowed paths for all environments
    const baseDisallows = [
        '/api/*',
        '/admin/*',
        '/private/*',
        '*.json',
        ...additionalDisallows,
    ]

    // Environment-specific rules - use LocalRule[] for array operations
    const rules: LocalRule[] = []

    if (environment === 'production') {
        // Production: Allow most crawling with some restrictions
        rules.push({
            userAgent: '*',
            allow: ['/', '/_next/static/*', '/_next/image/*'],
            disallow: baseDisallows,
            crawlDelay: crawlDelay,
        })

        // Add custom rules for production
        customRules.forEach((rule) => {
            rules.push({
                userAgent: rule.userAgent,
                allow: rule.allow,
                disallow: [...(rule.disallow || []), ...baseDisallows],
                crawlDelay: rule.crawlDelay || crawlDelay,
            })
        })
    } else {
        // Non-production: Block all crawling
        rules.push({
            userAgent: '*',
            disallow: '/',
        })
    }

    // Generate sitemap URL
    const finalSitemapUrl = sitemapUrl
        ? sitemapUrl.startsWith('http')
            ? sitemapUrl
            : `${baseUrl.replace(/\/$/, '')}${sitemapUrl.startsWith('/') ? sitemapUrl : '/' + sitemapUrl}`
        : `${baseUrl.replace(/\/$/, '')}/sitemap.xml`

    return {
        rules: rules as MetadataRoute.Robots['rules'],
        sitemap: environment === 'production' ? finalSitemapUrl : undefined,
        host: environment === 'production' ? baseUrl : undefined,
    }
}

/**
 * Generate robots.txt for different environments with sensible defaults
 *
 * @param environment - Target environment
 * @param baseUrl - Base URL for the site
 * @returns MetadataRoute.Robots object
 *
 * @example
 * ```typescript
 * // Production robots
 * const prodRobots = generateRobotsForEnvironment('production', 'https://example.com')
 *
 * // Development robots (blocks all)
 * const devRobots = generateRobotsForEnvironment('development', 'http://localhost:3000')
 * ```
 */
export function generateRobotsForEnvironment(
    environment: RobotsEnvironment,
    baseUrl: string
): MetadataRoute.Robots {
    return generateRobots({
        environment,
        baseUrl,
        crawlDelay: environment === 'production' ? 1 : undefined,
    })
}

/**
 * Create custom robots rules for specific use cases
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
        // Google-specific rules
        {
            userAgent: 'Googlebot',
            allow: ['/', '/_next/static/*', '/_next/image/*'],
            disallow: ['/search', '/admin'],
            crawlDelay: 1,
        },
        // Bing-specific rules
        {
            userAgent: 'Bingbot',
            allow: ['/', '/_next/static/*', '/_next/image/*'],
            disallow: ['/search', '/admin'],
            crawlDelay: 2,
        },
        // Block aggressive crawlers
        {
            userAgent: 'AhrefsBot',
            disallow: ['/'],
        },
        {
            userAgent: 'MJ12bot',
            disallow: ['/'],
        },
        // Social media crawlers - allow but with restrictions
        {
            userAgent: 'facebookexternalhit',
            allow: ['/', '/_next/static/*', '/_next/image/*'],
            disallow: ['/admin', '/api'],
        },
        {
            userAgent: 'Twitterbot',
            allow: ['/', '/_next/static/*', '/_next/image/*'],
            disallow: ['/admin', '/api'],
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
 *   baseUrl: 'https://example.com'
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

    // Validate sitemap URL if provided
    if (config.sitemapUrl) {
        try {
            // Check if it's a relative or absolute URL
            if (config.sitemapUrl.startsWith('/')) {
                // Relative URL - validate with base URL
                new URL(config.sitemapUrl, config.baseUrl)
            } else {
                // Absolute URL
                new URL(config.sitemapUrl)
            }
        } catch {
            issues.push(`Invalid sitemapUrl format: ${config.sitemapUrl}`)
        }
    }

    // Validate crawl delay
    if (config.crawlDelay !== undefined && config.crawlDelay < 0) {
        issues.push(
            `Crawl delay must be non-negative, got: ${config.crawlDelay}`
        )
    }

    // Validate custom rules
    if (config.customRules) {
        config.customRules.forEach((rule, index) => {
            if (!rule.userAgent || rule.userAgent.trim() === '') {
                issues.push(`Custom rule ${index}: userAgent is required`)
            }

            if (rule.crawlDelay !== undefined && rule.crawlDelay < 0) {
                issues.push(
                    `Custom rule ${index}: crawlDelay must be non-negative`
                )
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

    rulesArray.forEach((rule: RobotsRule) => {
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

        if (rule.crawlDelay) {
            lines.push(`Crawl-delay: ${rule.crawlDelay}`)
        }

        lines.push('') // Empty line between rules
    })

    // Add sitemap
    if (robots.sitemap) {
        lines.push(`Sitemap: ${robots.sitemap}`)
    }

    // Add host
    if (robots.host) {
        lines.push(`Host: ${robots.host}`)
    }

    return lines.join('\n')
}
