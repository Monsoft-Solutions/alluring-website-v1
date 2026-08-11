/**
 * No-People Image QA Gate
 *
 * Post-generation guard for the artistic image presets. Runs a vision check on
 * the rendered image and, if a person slipped in, regenerates ONCE with the
 * people-free constraint reinforced.
 *
 * The gate is advisory by design: it never throws and never fails a pipeline on
 * its own. A stubborn image is kept and flagged so the admin UI can surface it
 * for human review.
 *
 * @module @workspace/ai/pipelines/no-people-image-qa
 */
import { detectPeopleInImage } from '../functions/detect-people-in-image.function'
import {
    buildReinforcedNegativePrompt,
    type ArtisticImageStyleId,
} from '../constants/image-style.constant'

/**
 * A generated image as seen by the QA gate
 */
export type QaGateImage = {
    /** Publicly reachable URL the vision model can fetch */
    url: string
    width?: number
    height?: number
}

/**
 * Options for the no-people QA gate
 */
export type NoPeopleQaGateOptions = {
    /** The image that was just generated */
    image: QaGateImage
    /** Artistic preset the image was generated from */
    styleId: ArtisticImageStyleId
    /** Prompt used to generate the image */
    prompt: string
    /**
     * Regenerate with a reinforced prompt. Return `null` if regeneration is
     * unavailable or produced nothing — the gate then keeps the original image.
     */
    regenerate: (reinforcedPrompt: string) => Promise<QaGateImage | null>
    /** Vision model override (defaults to the detector's own default) */
    visionModelId?: string
}

/**
 * Result of the no-people QA gate
 */
export type NoPeopleQaGateResult = {
    /** The image to keep — the retry when it passed, otherwise the original */
    image: QaGateImage
    /** Prompt that produced {@link image} */
    prompt: string
    /** True when the kept image still appears to contain a person */
    peopleDetected: boolean
    /** True when a reinforced regeneration was attempted */
    regenerated: boolean
    /** Short explanation from the vision check, when available */
    details?: string
}

/**
 * Run the no-people QA gate over a freshly generated artistic image
 *
 * Flow: inspect → if clean, return → otherwise regenerate once with the
 * negatives reinforced → inspect again → return the best available image with
 * `peopleDetected` reflecting the kept image.
 *
 * Any error in the check itself is swallowed and reported as `peopleDetected:
 * false`, because a broken QA call must never block publishing.
 *
 * @param options - The generated image, its preset and a regeneration callback
 * @returns The image to keep plus the QA verdict
 *
 * @example
 * ```typescript
 * const qa = await runNoPeopleQaGate({
 *   image: { url: blobUrl, width: 1536, height: 1024 },
 *   styleId: 'botanical-still-life',
 *   prompt,
 *   regenerate: async (reinforced) => generateWithFal(reinforced),
 * })
 *
 * if (qa.peopleDetected) {
 *   console.warn('[QA] Image still contains a person after retry')
 * }
 * ```
 */
export async function runNoPeopleQaGate(
    options: NoPeopleQaGateOptions
): Promise<NoPeopleQaGateResult> {
    const { image, styleId, prompt, regenerate, visionModelId } = options

    try {
        const firstCheck = await detectPeopleInImage({
            imageUrl: image.url,
            modelId: visionModelId,
        })

        if (!firstCheck.peopleDetected) {
            console.log('[No-People QA] Passed on first attempt')

            return {
                image,
                prompt,
                peopleDetected: false,
                regenerated: false,
                details: firstCheck.details,
            }
        }

        console.warn(
            `[No-People QA] Person detected (${firstCheck.confidence} confidence): ${firstCheck.details}. Regenerating once with reinforced constraints.`
        )

        const reinforcedPrompt = buildReinforcedNegativePrompt(prompt, styleId)
        const retryImage = await regenerate(reinforcedPrompt)

        if (!retryImage) {
            console.warn(
                '[No-People QA] Regeneration returned no image; keeping the original and flagging it'
            )

            return {
                image,
                prompt,
                peopleDetected: true,
                regenerated: true,
                details: firstCheck.details,
            }
        }

        const secondCheck = await detectPeopleInImage({
            imageUrl: retryImage.url,
            modelId: visionModelId,
        })

        if (secondCheck.peopleDetected) {
            console.warn(
                `[No-People QA] Person still detected after retry: ${secondCheck.details}. Keeping the image and flagging it for review.`
            )
        } else {
            console.log('[No-People QA] Passed after reinforced regeneration')
        }

        return {
            image: retryImage,
            prompt: reinforcedPrompt,
            peopleDetected: secondCheck.peopleDetected,
            regenerated: true,
            details: secondCheck.details,
        }
    } catch (error) {
        // QA is advisory. A failed check must never block the phase.
        console.error(
            '[No-People QA] Check failed, keeping the original image:',
            error instanceof Error ? error.message : 'Unknown error'
        )

        return {
            image,
            prompt,
            peopleDetected: false,
            regenerated: false,
        }
    }
}
