/**
 * Extract Metadata — soft length caps
 *
 * The metadata schema's caps (70-character title tag, 170-character
 * description, 300-character excerpt) are display preferences, not
 * correctness invariants: Google truncates a long description itself, and
 * a 331-character excerpt is not a broken post. Before issue #223 they were
 * enforced as hard validation and a single over-long sentence failed a
 * twelve-minute pipeline run.
 *
 * `coreGenerateObject` first gives the model one repair retry against the
 * strict schema, which usually yields a properly rewritten shorter field.
 * Only when that also misses does the salvage here take over: parse the
 * rejected answer leniently, cut prose at a sentence or word boundary, slice
 * the tag list, clamp the reading time, and hand back an object that passes
 * the strict schema.
 *
 * @module @workspace/ai/functions/extract-metadata.coercion.util
 */
import { z } from 'zod'

import { truncateAtWordBoundary } from '../core/soft-caps.util'

// The cut lives in core now, where every schema's soft caps use it;
// re-exported so existing imports from this module keep working.
export { truncateAtWordBoundary }

// ============================================
// Limits
// ============================================

/** The strict caps the coerced object must satisfy. */
export const METADATA_LIMITS = {
    metaTitle: 70,
    metaDescription: 170,
    excerpt: 300,
    maxTags: 7,
    readingTimeMin: 1,
    readingTimeMax: 30,
} as const

// ============================================
// Shapes
// ============================================

/** The shape the model must at least produce for salvage to be possible. */
const lenientMetadataSchema = z.object({
    metaTitle: z.string().min(1),
    metaDescription: z.string().min(1),
    excerpt: z.string(),
    suggestedTags: z.array(z.string()).min(1),
    readingTimeMinutes: z.coerce.number(),
    suggestedCategory: z.string().min(1),
})

export type LenientMetadata = z.infer<typeof lenientMetadataSchema>

// ============================================
// Coercion + salvage
// ============================================

/** Bring a leniently parsed answer inside every strict cap. */
export function coerceContentMetadata(raw: LenientMetadata): LenientMetadata {
    const tags = [...new Set(raw.suggestedTags.map((tag) => tag.trim()))]
        .filter((tag) => tag.length > 0)
        .slice(0, METADATA_LIMITS.maxTags)

    const readingTime = Number.isFinite(raw.readingTimeMinutes)
        ? Math.round(raw.readingTimeMinutes)
        : METADATA_LIMITS.readingTimeMin

    return {
        metaTitle: truncateAtWordBoundary(
            raw.metaTitle,
            METADATA_LIMITS.metaTitle
        ),
        metaDescription: truncateAtWordBoundary(
            raw.metaDescription,
            METADATA_LIMITS.metaDescription
        ),
        excerpt: truncateAtWordBoundary(raw.excerpt, METADATA_LIMITS.excerpt),
        suggestedTags: tags,
        readingTimeMinutes: Math.min(
            Math.max(readingTime, METADATA_LIMITS.readingTimeMin),
            METADATA_LIMITS.readingTimeMax
        ),
        suggestedCategory: raw.suggestedCategory.trim(),
    }
}

/**
 * Build the `salvage` hook for `coreGenerateObject`: parse the rejected text
 * leniently, coerce it, and accept it only if it now passes the strict
 * schema. Anything structurally broken (missing fields, wrong types, a title
 * still under its minimum after the cut) returns null and the original error
 * propagates.
 */
export function createMetadataSalvage<TStrict extends z.ZodType>(
    strictSchema: TStrict
): (rejectedText: string) => z.infer<TStrict> | null {
    return (rejectedText) => {
        let parsed: unknown
        try {
            parsed = JSON.parse(rejectedText)
        } catch {
            return null
        }

        const lenient = lenientMetadataSchema.safeParse(parsed)
        if (!lenient.success) return null

        const strict = strictSchema.safeParse(
            coerceContentMetadata(lenient.data)
        )
        return strict.success ? (strict.data as z.infer<TStrict>) : null
    }
}
