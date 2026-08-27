/**
 * Blog URL Utility
 *
 * The publish-date-based URL rule (root /{slug} before 2026, /blog/{slug}
 * after) lives in @workspace/shared so apps/admin and packages/ai apply the
 * same rule. This module re-exports it for the existing web call sites.
 */
// `@workspace/shared/utils`, not the package root — please keep it that way.
// Blog post cards are client components and reach this module for their href.
// The root barrel also re-exports `schemas/gallery`, whose AI-analysis schemas
// import zod, so going through it shipped 48.8 KiB brotli of validator — every
// locale included — to `/blog`, a route with no form on it (issue #210).
export {
    getBlogPostUrl,
    getBlogPostAbsoluteUrl,
    usesBlogPrefix,
} from '@workspace/shared/utils'
