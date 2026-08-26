import type {
    ImageMetadata,
    RobotsConfig,
    SEOConfig,
} from '@workspace/seo/config'
import { generateImageMetadata, getCanonicalUrl } from '@workspace/seo/utils'
import type { Metadata } from 'next'

import { isCrawlingAllowed } from '@/lib/utils/crawling'
import { siteConfig } from '@/lib/data/site-config'
import { clampMetaDescription } from '@/lib/seo/meta-description.util'

function mapRobots(robots?: RobotsConfig): Metadata['robots'] {
    // If crawling is not allowed, force noindex, nofollow
    if (!isCrawlingAllowed()) {
        return {
            index: false,
            follow: false,
            noarchive: true,
            nosnippet: true,
            noimageindex: true,
            googleBot: {
                index: false,
                follow: false,
                noarchive: true,
                nosnippet: true,
                noimageindex: true,
            },
        }
    }

    if (!robots) return undefined
    const { index, follow, noarchive, nosnippet, noimageindex, notranslate } =
        robots
    return {
        index,
        follow,
        noarchive,
        nosnippet,
        noimageindex,
        notranslate,
        googleBot: {
            index,
            follow,
            noarchive,
            nosnippet,
            noimageindex,
            'max-video-preview': -1,
            'max-image-preview': 'large' as const,
            'max-snippet': -1,
        },
    }
}

function mapImages(
    images?: ImageMetadata[]
): NonNullable<Metadata['openGraph']>['images'] | undefined {
    if (!images || images.length === 0) return undefined
    return images.map((img) => generateImageMetadata(img))
}

export function toNextMetadata(
    config: SEOConfig,
    overrides?: Partial<Metadata> & { canonical?: string }
): Metadata {
    const title = config.defaultMetadata.title
    const description = config.defaultMetadata.description
    const locale = config.locale ?? config.defaultMetadata.locale

    const openGraph = config.openGraph
        ? {
              type: config.openGraph.type,
              siteName: config.openGraph.siteName,
              locale: config.openGraph.locale ?? locale,
              images: mapImages(config.openGraph.images),
          }
        : undefined

    const twitter = config.twitter
        ? {
              card: config.twitter.cardType,
              site: config.twitter.site,
              creator: config.twitter.creator ?? config.twitter.handle,
          }
        : undefined

    const robots = mapRobots(config.robots)

    // Ensure we have a valid siteUrl for metadataBase
    const siteUrl = config.environment?.siteUrl ?? config.siteUrl
    if (!siteUrl) {
        throw new Error(
            'SEO config missing siteUrl. Please set NEXT_PUBLIC_SITE_URL environment variable or configure siteUrl in site-config.ts'
        )
    }

    let metadataBase: URL
    try {
        metadataBase = new URL(siteUrl)
    } catch {
        throw new Error(
            `Invalid siteUrl in SEO config: "${siteUrl}". Please provide a valid URL.`
        )
    }

    // Build verification object from site config
    const verification: Metadata['verification'] = {}
    if (siteConfig.seo.verification?.google) {
        verification.google = siteConfig.seo.verification.google
    }
    if (siteConfig.seo.verification?.bing) {
        // Bing verification is critical for ChatGPT visibility
        verification.other = {
            ...verification.other,
            'msvalidate.01': siteConfig.seo.verification.bing,
        }
    }
    if (siteConfig.seo.verification?.yandex) {
        verification.yandex = siteConfig.seo.verification.yandex
    }

    const base: Metadata = {
        title,
        description,
        openGraph,
        twitter,
        robots,
        metadataBase,
        verification:
            Object.keys(verification).length > 0 ? verification : undefined,
    }

    const merged: Metadata = {
        ...base,
        ...overrides,
        // Handle title merging - support both string and template object
        title: overrides?.title ?? title,
        // Clamped so Google doesn't cut it mid-word. Only the meta description
        // is clamped — Open Graph descriptions get more room and keep theirs.
        description: clampMetaDescription(
            typeof overrides?.description === 'string'
                ? overrides.description
                : description
        ),
        openGraph: {
            ...(base.openGraph ?? {}),
            ...(overrides?.openGraph ?? {}),
        },
        twitter: {
            ...(base.twitter ?? {}),
            ...(overrides?.twitter ?? {}),
        },
        robots: mergeRobots(base.robots, overrides?.robots),
    }

    // Handle alternates (canonical, prev, next)
    if (overrides?.canonical || overrides?.alternates) {
        merged.alternates = {
            ...(overrides?.alternates ?? {}),
        }

        // Set canonical URL (prefer from alternates, fallback to canonical prop)
        if (overrides?.canonical && !merged.alternates.canonical) {
            merged.alternates.canonical = getCanonicalUrl(overrides.canonical)
        }
    }

    return merged
}

function mergeRobots(
    baseRobots: Metadata['robots'],
    overrideRobots: Metadata['robots']
): Metadata['robots'] {
    if (overrideRobots === undefined) return baseRobots

    const isObject = (v: unknown): v is Record<string, unknown> =>
        v !== null && typeof v === 'object'

    if (isObject(baseRobots) && isObject(overrideRobots)) {
        return { ...baseRobots, ...overrideRobots }
    }

    // If either is not an object (e.g., string), prefer the override value
    return overrideRobots
}
