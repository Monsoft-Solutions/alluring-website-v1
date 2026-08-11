/**
 * Blog AI Config Queries
 *
 * Reads the singleton blog pipeline model configuration.
 *
 * @module lib/queries/blog-ai-config
 */
import { db } from '@workspace/db/client'
import { blogAiConfig } from '@workspace/db/schema/blog'
import {
    isArtisticImageStyleId,
    type ArtisticImageStyleId,
} from '@workspace/ai'

import type { ImageModelId } from '@/lib/services/fal-image-generation.service'

/**
 * Resolved blog AI configuration.
 *
 * Always fully populated — the query falls back to code defaults when no row
 * exists yet, so callers never deal with `null`.
 */
export type BlogAiConfig = {
    /** Model driving the content generation phase */
    contentModelId: string
    /** Model driving the review / orchestration phase */
    reviewModelId: string
    /** Model driving the metadata extraction phase (SEO title, FAQs) */
    extractionModelId: string
    /** fal.ai image model used for featured images */
    imageModelId: ImageModelId
    /** Pinned artistic preset, or `null` to let the AI pick per topic */
    artisticStyleId: ArtisticImageStyleId | null
}

/**
 * Code defaults used until an admin saves a configuration.
 *
 * These mirror the column defaults in `blog_ai_config` and the runner defaults
 * in `@workspace/ai/pipelines`.
 */
export const DEFAULT_BLOG_AI_CONFIG: BlogAiConfig = {
    contentModelId: 'claude-opus-5',
    reviewModelId: 'claude-opus-5',
    extractionModelId: 'claude-opus-5',
    imageModelId: 'gpt-image-2',
    artisticStyleId: null,
}

/**
 * Valid image model ids, kept as a plain set so this module stays importable
 * from both server and client component trees.
 */
const IMAGE_MODEL_IDS: readonly ImageModelId[] = [
    'gpt-image-2',
    'gpt-image-1.5',
    'nano-banana-pro',
]

/**
 * Narrow a persisted image model id, falling back to the default.
 *
 * The column is a free-form varchar, so a value written before a model was
 * renamed or removed must not break the pipeline.
 */
function resolveImageModelId(value: string): ImageModelId {
    return IMAGE_MODEL_IDS.includes(value as ImageModelId)
        ? (value as ImageModelId)
        : DEFAULT_BLOG_AI_CONFIG.imageModelId
}

/**
 * Get the blog AI configuration.
 *
 * Returns the singleton row when present. When no row exists this returns the
 * in-code defaults **without writing** — the row is only created once an admin
 * saves from the settings page.
 *
 * @returns The resolved configuration, never null
 */
export async function getBlogAiConfig(): Promise<BlogAiConfig> {
    const [config] = await db.select().from(blogAiConfig).limit(1)

    if (!config) {
        return DEFAULT_BLOG_AI_CONFIG
    }

    return {
        contentModelId: config.contentModelId,
        reviewModelId: config.reviewModelId,
        extractionModelId: config.extractionModelId,
        imageModelId: resolveImageModelId(config.imageModelId),
        artisticStyleId: isArtisticImageStyleId(config.artisticStyleId)
            ? config.artisticStyleId
            : null,
    }
}
