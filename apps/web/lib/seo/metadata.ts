import type {
    ImageMetadata,
    RobotsConfig,
    SEOConfig,
} from '@workspace/seo/config'
import { generateImageMetadata, getCanonicalUrl } from '@workspace/seo/utils'
import type { Metadata } from 'next'

function mapRobots(robots?: RobotsConfig): Metadata['robots'] | undefined {
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

    const base: Metadata = {
        title,
        description,
        openGraph,
        twitter,
        robots,
        metadataBase: new URL(config.environment?.siteUrl ?? config.siteUrl),
    }

    const merged: Metadata = {
        ...base,
        ...overrides,
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

    // Only set canonical URL when explicitly provided
    if (overrides?.canonical) {
        merged.alternates = {
            canonical: getCanonicalUrl(overrides.canonical),
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
