import type {
    ImageMetadata,
    RobotsConfig,
    SEOConfig,
} from '@workspace/seo/config'
import { generateImageMetadata, getCanonicalUrl } from '@workspace/seo/utils'
import type { Metadata } from 'next'

import { isCrawlingAllowed } from '@/lib/utils/crawling'

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

    const base: Metadata = {
        title,
        description,
        openGraph,
        twitter,
        robots,
        metadataBase,
    }

    const merged: Metadata = {
        ...base,
        ...overrides,
        // Handle title merging - support both string and template object
        title: overrides?.title ?? title,
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
