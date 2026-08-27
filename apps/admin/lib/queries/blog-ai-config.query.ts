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
    /** Model driving the ideation phase (topic generation) */
    ideationModelId: string
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
    /** Autopilot autonomy mode (`off` disables both scheduled jobs) */
    autopilotMode: AutopilotMode
    /** Cadence of the scheduled ideation job (queue top-up) */
    autopilotIdeationCadence: AutopilotCadence
    /** Cadence of the scheduled content job (writes posts) */
    autopilotContentCadence: AutopilotCadence
    /** Posts written per content run (1–3) */
    autopilotPostsPerRun: number
    /** Content runs pause while this many posts sit in Draft */
    autopilotDraftCap: number
    /** Ideation runs top the pending-idea queue up to this size */
    autopilotIdeasPerRun: number
    /** Refresh loop autonomy mode (epic #144; `off` queues nothing) */
    refreshMode: RefreshMode
    /** Posts older than this many months are flagged stale (rule R3) */
    refreshStaleMonths: number
    /** Drift-adjusted 28d position drop that flags decay (rule R1) */
    refreshPositionDropThreshold: number
    /** Days after an applied/dismissed refresh before a post re-queues */
    refreshCooldownDays: number
    /** Auto mode pauses while this many refresh drafts await review */
    refreshDraftCap: number
}

/** Autopilot autonomy modes (mirrors the `autopilot_mode` pg enum) */
export type AutopilotMode = 'off' | 'ideas' | 'full'

/** Autopilot cadence presets (mirrors the `autopilot_cadence` pg enum) */
export type AutopilotCadence = 'daily' | 'weekdays' | 'weekly'

/** Refresh loop autonomy modes (mirrors the `refresh_mode` pg enum) */
export type RefreshMode = 'off' | 'suggest' | 'auto'

/**
 * Code defaults used until an admin saves a configuration.
 *
 * These mirror the column defaults in `blog_ai_config` and the runner defaults
 * in `@workspace/ai/pipelines`.
 */
export const DEFAULT_BLOG_AI_CONFIG: BlogAiConfig = {
    // Review and extraction run through `generateObject`, which reaches OpenRouter as
    // `response_format: json_schema`. Anthropic models ignore that for large schemas and
    // return prose, so a Claude default here would silently break both phases on a fresh
    // install. Ideation and content are `generateText` and would be safe on Claude, but
    // are kept aligned so every phase defaults to one verified model. See issue #195 §8.8.
    ideationModelId: 'x-ai/grok-4.6',
    contentModelId: 'x-ai/grok-4.6',
    reviewModelId: 'x-ai/grok-4.6',
    extractionModelId: 'x-ai/grok-4.6',
    imageModelId: 'gpt-image-2',
    artisticStyleId: null,
    autopilotMode: 'off',
    autopilotIdeationCadence: 'weekly',
    autopilotContentCadence: 'weekly',
    autopilotPostsPerRun: 1,
    autopilotDraftCap: 3,
    autopilotIdeasPerRun: 5,
    refreshMode: 'off',
    refreshStaleMonths: 6,
    refreshPositionDropThreshold: 3,
    refreshCooldownDays: 60,
    refreshDraftCap: 2,
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
        ideationModelId: config.ideationModelId,
        contentModelId: config.contentModelId,
        reviewModelId: config.reviewModelId,
        extractionModelId: config.extractionModelId,
        imageModelId: resolveImageModelId(config.imageModelId),
        artisticStyleId: isArtisticImageStyleId(config.artisticStyleId)
            ? config.artisticStyleId
            : null,
        autopilotMode: config.autopilotMode,
        autopilotIdeationCadence: config.autopilotIdeationCadence,
        autopilotContentCadence: config.autopilotContentCadence,
        autopilotPostsPerRun: config.autopilotPostsPerRun,
        autopilotDraftCap: config.autopilotDraftCap,
        autopilotIdeasPerRun: config.autopilotIdeasPerRun,
        refreshMode: config.refreshMode,
        refreshStaleMonths: config.refreshStaleMonths,
        refreshPositionDropThreshold: config.refreshPositionDropThreshold,
        refreshCooldownDays: config.refreshCooldownDays,
        refreshDraftCap: config.refreshDraftCap,
    }
}
