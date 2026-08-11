/**
 * Blog URL Utility
 *
 * The publish-date-based URL rule (root /{slug} before 2026, /blog/{slug}
 * after) lives in @workspace/shared so apps/admin and packages/ai apply the
 * same rule. This module re-exports it for the existing web call sites.
 */
export {
    getBlogPostUrl,
    getBlogPostAbsoluteUrl,
    usesBlogPrefix,
} from '@workspace/shared'
