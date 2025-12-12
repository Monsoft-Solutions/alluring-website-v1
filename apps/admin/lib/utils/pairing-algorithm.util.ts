/**
 * Before/After Pairing Algorithm Utilities
 *
 * Functions for matching before/after images based on procedure, body area, and patient similarity.
 *
 * @module lib/utils/pairing-algorithm
 */
import type { GalleryMediaAIAnalysis } from '@workspace/shared/schemas/gallery'
import type {
    DetectedPair,
    UnpairedMedia,
    AISuggestedGroup,
} from '@/lib/actions/instagram-analysis.action'

/**
 * Generate unique ID for detected pairs
 *
 * @returns A unique pair identifier
 */
export function generatePairId(): string {
    return `pair-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Calculate similarity score between two patient descriptions
 *
 * Compares gender, body type, skin tone, and age range to determine
 * if two images are likely of the same patient.
 *
 * @param a - First patient description
 * @param b - Second patient description
 * @returns Similarity score between 0 and 1 (1 being identical)
 */
export function calculatePatientSimilarity(
    a: GalleryMediaAIAnalysis['patientDescription'],
    b: GalleryMediaAIAnalysis['patientDescription']
): number {
    if (!a || !b) return 0.5 // Default if no patient info

    let score = 0
    let factors = 0

    // Gender match (most important)
    if (a.gender === b.gender) {
        score += 0.4
    }
    factors += 0.4

    // Body type match
    if (a.bodyType && b.bodyType && a.bodyType === b.bodyType) {
        score += 0.2
    }
    factors += 0.2

    // Skin tone match
    if (a.skinTone && b.skinTone && a.skinTone === b.skinTone) {
        score += 0.2
    }
    factors += 0.2

    // Age range match
    if (
        a.estimatedAgeRange &&
        b.estimatedAgeRange &&
        a.estimatedAgeRange === b.estimatedAgeRange
    ) {
        score += 0.2
    }
    factors += 0.2

    return score / factors
}

type MediaWithAnalysis = {
    mediaId: string
    mediaUrl: string
    analysis: GalleryMediaAIAnalysis
    postId: string
    postCode: string
    aiSuggestedGroups: AISuggestedGroup[]
}

/**
 * Pair before/after images based on procedure, body area, and patient similarity
 *
 * Algorithm:
 * 1. Groups images by procedure + body area
 * 2. Within each group, finds best matches based on patient similarity
 * 3. Requires minimum similarity threshold of 0.5
 *
 * @param beforeImages - Array of before images with AI analysis
 * @param afterImages - Array of after images with AI analysis
 * @returns Object containing detected pairs and unpaired media
 */
export function pairBeforeAfterImages(
    beforeImages: MediaWithAnalysis[],
    afterImages: MediaWithAnalysis[]
): {
    pairs: DetectedPair[]
    unpairedBefore: UnpairedMedia[]
    unpairedAfter: UnpairedMedia[]
} {
    const pairs: DetectedPair[] = []
    const usedBeforeIds = new Set<string>()
    const usedAfterIds = new Set<string>()

    // Group images by procedure + bodyArea
    const beforeByKey = new Map<string, MediaWithAnalysis[]>()
    const afterByKey = new Map<string, MediaWithAnalysis[]>()

    for (const img of beforeImages) {
        const key = `${img.analysis.detectedProcedure || 'unknown'}-${img.analysis.bodyArea}`
        if (!beforeByKey.has(key)) beforeByKey.set(key, [])
        beforeByKey.get(key)!.push(img)
    }

    for (const img of afterImages) {
        const key = `${img.analysis.detectedProcedure || 'unknown'}-${img.analysis.bodyArea}`
        if (!afterByKey.has(key)) afterByKey.set(key, [])
        afterByKey.get(key)!.push(img)
    }

    // Match within each procedure+bodyArea group
    for (const [key, befores] of beforeByKey) {
        const afters = afterByKey.get(key) || []

        for (const before of befores) {
            if (usedBeforeIds.has(before.mediaId)) continue

            let bestMatch: MediaWithAnalysis | null = null
            let bestScore = 0

            for (const after of afters) {
                if (usedAfterIds.has(after.mediaId)) continue

                const similarity = calculatePatientSimilarity(
                    before.analysis.patientDescription,
                    after.analysis.patientDescription
                )

                if (similarity > bestScore) {
                    bestScore = similarity
                    bestMatch = after
                }
            }

            // Require minimum similarity threshold
            if (bestMatch && bestScore >= 0.5) {
                // Use AI suggestions from before image (primary)
                const aiSuggestedGroups = before.aiSuggestedGroups
                const aiPrimaryGroup =
                    aiSuggestedGroups.length > 0 && aiSuggestedGroups[0]
                        ? aiSuggestedGroups[0].slug
                        : null

                pairs.push({
                    id: generatePairId(),
                    type: 'paired',
                    beforeMediaId: before.mediaId,
                    beforeMediaUrl: before.mediaUrl,
                    afterMediaId: bestMatch.mediaId,
                    afterMediaUrl: bestMatch.mediaUrl,
                    procedureSlug: before.analysis.detectedProcedure ?? null,
                    bodyArea: before.analysis.bodyArea,
                    confidence: bestScore,
                    aiSuggestedGroups,
                    aiPrimaryGroup,
                })

                usedBeforeIds.add(before.mediaId)
                usedAfterIds.add(bestMatch.mediaId)
            }
        }
    }

    // Collect unpaired images
    const unpairedBefore: UnpairedMedia[] = beforeImages
        .filter((img) => !usedBeforeIds.has(img.mediaId))
        .map((img) => ({
            mediaId: img.mediaId,
            mediaUrl: img.mediaUrl,
            beforeAfterType: 'before' as const,
            procedureSlug: img.analysis.detectedProcedure ?? null,
            bodyArea: img.analysis.bodyArea,
            postId: img.postId,
            postCode: img.postCode,
            aiSuggestedGroups: img.aiSuggestedGroups,
            aiAnalysis: img.analysis,
        }))

    const unpairedAfter: UnpairedMedia[] = afterImages
        .filter((img) => !usedAfterIds.has(img.mediaId))
        .map((img) => ({
            mediaId: img.mediaId,
            mediaUrl: img.mediaUrl,
            beforeAfterType: 'after' as const,
            procedureSlug: img.analysis.detectedProcedure ?? null,
            bodyArea: img.analysis.bodyArea,
            postId: img.postId,
            postCode: img.postCode,
            aiSuggestedGroups: img.aiSuggestedGroups,
            aiAnalysis: img.analysis,
        }))

    return { pairs, unpairedBefore, unpairedAfter }
}
