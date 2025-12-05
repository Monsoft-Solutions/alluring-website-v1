/**
 * Cache Tag Definitions
 *
 * Re-exports cache tags from the shared package.
 * This file exists for backwards compatibility with existing imports.
 *
 * @see @workspace/shared/cache for the source of truth
 */

export {
    CACHE_TAGS,
    ALLOWED_STATIC_TAGS,
    DYNAMIC_TAG_PREFIXES,
    isValidCacheTag,
    getAllPromotionTags,
} from '@workspace/shared/cache'

export type { StaticCacheTag, DynamicTagPrefix } from '@workspace/shared/cache'
