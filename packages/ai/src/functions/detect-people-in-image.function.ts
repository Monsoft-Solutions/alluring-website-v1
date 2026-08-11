/**
 * Detect People In Image Function
 *
 * Vision-based QA check for the artistic (people-free) image presets. Answers a
 * single strict question: does this image contain any person, face or human
 * body part?
 *
 * Used by the no-people QA gate after an artistic image is generated. The gate
 * is advisory — it never fails a pipeline on its own.
 *
 * @module @workspace/ai/functions/detect-people-in-image
 */
import { z } from 'zod'

import { coreGenerateObject } from '../core'

/**
 * Default model for vision analysis (must support image inputs)
 */
const DEFAULT_VISION_MODEL_ID = 'gpt-4.1'

/**
 * Structured output for the people-detection check
 */
const peopleDetectionSchema = z.object({
    peopleDetected: z
        .boolean()
        .describe(
            'True if the image contains any person, face, or recognisable human body part'
        ),
    confidence: z
        .enum(['low', 'medium', 'high'])
        .describe('How certain the judgement is'),
    details: z
        .string()
        .describe(
            'One short sentence naming what was seen, or stating that the image contains no people'
        ),
})

/**
 * System prompt for the people-detection check
 */
const PEOPLE_DETECTION_SYSTEM_PROMPT = `You are a strict visual QA inspector for a brand that publishes people-free artistic imagery.

You answer exactly one question: does this image contain any person, face, or human body part?

Count as a person (peopleDetected = true):
- Any human figure, whole or partial, in focus or blurred
- A face or part of a face, including in a reflection
- Hands, fingers, arms, legs, feet, shoulders, a torso, a neck, an ear
- Visible human skin or hair as a subject in the frame
- A recognisable human silhouette, shadow or outline
- A mannequin, doll, bust or statue depicting a human figure
- A photograph or artwork of a person shown within the image

Do NOT count as a person (peopleDetected = false):
- Abstract curves, contour lines or organic shapes that merely evoke a body without depicting one
- Plants, flowers, leaves, stone, fabric, drapery, water, metal, paper, paint
- Purely abstract washes, gradients or geometric fields
- Animals

Be strict but literal: judge what is actually rendered, not what it might symbolise. A flowing contour line that suggests a hip without drawing a body is NOT a person. A recognisable shoulder and neck IS a person, even if cropped.

Set confidence to "low" when the image is ambiguous.`

/**
 * Options for the people-detection check
 */
export type DetectPeopleInImageOptions = {
    /** URL of the image to inspect */
    imageUrl: string
    /** Model ID to use (defaults to gpt-4.1 for vision) */
    modelId?: string
    /** Temperature (defaults to 0 for a deterministic judgement) */
    temperature?: number
}

/**
 * Result of the people-detection check
 */
export type PeopleDetectionResult = z.infer<typeof peopleDetectionSchema>

/**
 * Check whether a generated image contains any person, face or body part
 *
 * @param options - Detection options including the image URL
 * @returns Boolean judgement with confidence and a short explanation
 *
 * @example
 * ```typescript
 * const check = await detectPeopleInImage({
 *   imageUrl: 'https://blob.example.com/blog/bbl-recovery/silk-fold.jpg',
 * })
 *
 * if (check.peopleDetected) {
 *   console.warn(`QA failed: ${check.details}`)
 * }
 * ```
 */
export async function detectPeopleInImage(
    options: DetectPeopleInImageOptions
): Promise<PeopleDetectionResult> {
    const {
        imageUrl,
        modelId = DEFAULT_VISION_MODEL_ID,
        temperature = 0,
    } = options

    const result = await coreGenerateObject({
        modelId,
        schema: peopleDetectionSchema,
        system: PEOPLE_DETECTION_SYSTEM_PROMPT,
        messages: [
            {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: 'Does this image contain any person, face, or human body part? Answer strictly.',
                    },
                    {
                        type: 'image',
                        image: imageUrl,
                    },
                ],
            },
        ],
        temperature,
    })

    return result.object
}
