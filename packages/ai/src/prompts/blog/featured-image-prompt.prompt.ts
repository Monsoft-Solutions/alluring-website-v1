/**
 * Featured Image Prompt Generation
 *
 * Creates art-direction briefs for blog featured images, optimised for
 * openai/gpt-image-2, fal-ai/gpt-image-1.5 and fal-ai/nano-banana-pro.
 *
 * Two paths:
 *
 * 1. **Artistic (default)** — people-free imagery driven by one of the presets
 *    in `constants/image-style.constant.ts`. Structure:
 *    Concept → Composition → Materials & Palette → Light & Mood → Constraints.
 *
 * 2. **Human subject (opt-in)** — only when an admin explicitly chose the
 *    `patient-model` subject in the featured-image dialog and supplied a model
 *    description. Keeps the legacy photography-brief structure.
 *
 * @module @workspace/ai/prompts/blog/featured-image-prompt
 */

import {
    getArtisticStyleNegatives,
    resolveArtisticStyle,
    type ArtisticImageAspectRatio,
} from '../../constants/image-style.constant'

export const FEATURED_IMAGE_PROMPT_SYSTEM = `You are the art director for Alluring Plastic Surgery, a luxury cosmetic surgery clinic in Miami, FL. You write image-generation briefs for openai/gpt-image-2, fal-ai/gpt-image-1.5 and fal-ai/nano-banana-pro.

## Brand Context
- **Tagline**: "Luxury Surgeries Made Affordable"
- **Palette**: warm stone neutrals (bone, cream, oat, taupe, warm greige) with restrained gold or champagne accents
- **Register**: sophisticated, editorial, calm, tactile — the visual language of Kinfolk, Cereal and high-end brand collateral
- **Audience**: women 25-55 researching a high-consideration elective procedure

## The Core Rule
Blog imagery for this brand is **artistic, not photographic-literal, and contains no people**. A person is never the subject. We show materials, botanicals, light and abstract form — never a patient, model, face, body or body part. This is a deliberate brand direction, not a limitation to work around: if a topic seems to "need" a person, find the material or abstract metaphor instead.

The single exception is when the brief you receive includes an explicit **Human Subject** section. That means an art director deliberately opted in, and only then may a person appear.

## Output Structure (Artistic Briefs — the default)

Produce exactly these five sections as level-2 markdown headings:

### ## Concept
2-3 sentences naming the single physical thing in frame and why it carries the article's idea. Be concrete and specific: "a single fold of heavy cream silk collapsing into shadow", not "an abstract representation of transformation". One subject only.

### ## Composition
2-3 sentences on framing: where the subject sits, how much negative space surrounds it, the focal plane, the crop. Name the aspect ratio.

### ## Materials & Palette
2-3 sentences on surface and colour: the actual materials, their finish (honed, matte, raw, polished, translucent), and the exact palette with named tones. Keep to two hues plus one metal note.

### ## Light & Mood
2-3 sentences on the light: direction, quality, falloff, colour temperature, and the emotional register it produces.

### ## Constraints
A single comma-separated exclusion list. Lead with the people-free exclusions, verbatim, then the preset-specific ones.

## Output Structure (Human Subject Briefs — opt-in only)
When a Human Subject section is present, use these five headings instead:
\`## Scene\`, \`## Subject\`, \`## Details\`, \`## Technical\`, \`## Avoid\`.

## Craft Rules

**Do:**
- Name specific materials and finishes: "honed travertine", "raw linen", "gold leaf", not "luxurious materials"
- Name specific tones: "oat", "bone", "warm greige", "champagne", not "neutral colours"
- Describe light physically: "raking sidelight that turns the veining into topography"
- Put the most important element first in every section
- Keep the whole brief tight — roughly 130-180 words across all five sections

**Don't:**
- Use render-farm filler: "ultra-detailed", "masterpiece", "8K", "hyper-realistic", "award-winning"
- Use empty adjectives: "beautiful", "stunning", "perfect", "amazing"
- Contradict yourself (bright and moody, minimal and ornate)
- Describe anything that could resolve into a human figure — including silhouettes, reflections, shadows of people, mannequins or statues
- Ask for any text, lettering, numbers or logos in the image

## Output Format
Return ONLY the structured markdown brief with its five level-2 headings.
No preamble, no code fences, no commentary.`

/**
 * Featured image customization options for prompt generation
 */
export type FeaturedImagePromptInput = {
    /** Blog post title */
    title: string
    /** AI-generated summary of the blog post */
    summary: string
    /**
     * Artistic preset ID driving the people-free path.
     * Unknown or missing values resolve to the default preset.
     */
    artisticStyleId?: string
    /** Aspect ratio for the target placement (defaults to 16:9) */
    aspectRatio?: ArtisticImageAspectRatio
    /** Scene/environment guidelines (legacy photographic path) */
    sceneGuidelines?: string
    /** Subject type guidelines (legacy photographic path) */
    subjectGuidelines?: string
    /** Image style guidelines (legacy photographic path) */
    styleGuidelines?: string
    /** Lighting/mood guidelines — applied as a modifier on both paths */
    lightingGuidelines?: string
    /** Color palette guidelines — applied as a modifier on both paths */
    colorGuidelines?: string
    /** Composition guidelines — applied as a modifier on both paths */
    compositionGuidelines?: string
    /**
     * Model profile description. Presence of this field is what switches the
     * brief to the opt-in human-subject path.
     */
    modelDescription?: string
    /** Optional keywords for additional context */
    keywords?: string
}

/**
 * Format an optional art-direction modifier as a markdown bullet.
 */
function optionalModifier(label: string, value?: string): string {
    return value ? `\n- **${label}**: ${value}` : ''
}

/**
 * Build the artistic (people-free) brief — the default path.
 */
function buildArtisticBrief(input: FeaturedImagePromptInput): string {
    const {
        title,
        summary,
        artisticStyleId,
        aspectRatio = '16:9',
        lightingGuidelines,
        colorGuidelines,
        compositionGuidelines,
        keywords,
    } = input

    const style = resolveArtisticStyle(artisticStyleId)
    const negatives = getArtisticStyleNegatives(style.id)

    const modifiers = [
        optionalModifier('Lighting lean', lightingGuidelines),
        optionalModifier('Palette lean', colorGuidelines),
        optionalModifier('Composition lean', compositionGuidelines),
    ].join('')

    const modifierSection = modifiers
        ? `\n\n## Secondary Art Direction (optional leanings)\nApply these only where they agree with the style preset. The preset governs subject matter; these adjust emphasis. Ignore any part of them that implies a person, a clinic interior or medical equipment.${modifiers}`
        : ''

    return `Write an art-direction brief for a blog featured image.

## Article
- **Title**: "${title}"
- **Summary**: ${summary}${keywords ? `\n- **Primary keyword**: ${keywords}` : ''}

## Style Preset: ${style.name} (\`${style.id}\`)
${style.promptBlock}${modifierSection}

## Required Exclusions
Reproduce this list, in full, in the \`## Constraints\` section:
${negatives}

## Instructions

Write exactly five sections (roughly 130-180 words in total), each a level-2 heading:

## Concept
Name the ONE physical thing in frame and tie it to the article's idea. Pick the subject from the preset's vocabulary — do not invent a different register. Be concrete.

## Composition
Framing, placement, negative space, focal plane and crop. State the ${aspectRatio} aspect ratio.

## Materials & Palette
Actual materials and finishes, plus named tones. Two hues plus one metal note, in the brand's warm stone range.

## Light & Mood
Direction, quality, falloff, colour temperature, and the emotional register.

## Constraints
The full exclusion list above, comma-separated.

## Requirements
- NO people, faces, bodies, body parts, silhouettes or human shadows anywhere in the image
- NO text, lettering, numbers, logos or watermarks in the image
- NO clinical, surgical or medical-device imagery
- Use specific nouns and named tones, never generic praise words
- Output ONLY the five-section markdown brief — no explanation
- Never mention "the blog post" or "the article"; the brief must stand alone`
}

/**
 * Build the legacy human-subject photography brief — opt-in only.
 *
 * Reached only when an admin explicitly selected the `patient-model` subject
 * and a model description was supplied.
 */
function buildHumanSubjectBrief(input: FeaturedImagePromptInput): string {
    const {
        title,
        summary,
        sceneGuidelines,
        subjectGuidelines,
        styleGuidelines,
        lightingGuidelines,
        colorGuidelines,
        compositionGuidelines,
        modelDescription,
        aspectRatio = '16:9',
        keywords,
    } = input

    const options = [
        optionalModifier('Scene', sceneGuidelines),
        optionalModifier('Subject', subjectGuidelines),
        optionalModifier('Style', styleGuidelines),
        optionalModifier('Lighting', lightingGuidelines),
        optionalModifier('Colors', colorGuidelines),
        optionalModifier('Composition', compositionGuidelines),
    ].join('')

    return `Write a photography brief for a blog featured image.

## Article
- **Title**: "${title}"
- **Summary**: ${summary}${keywords ? `\n- **Keywords**: ${keywords}` : ''}

## Human Subject (explicitly approved by an art director)
${modelDescription}

## Art Direction${options}

## Instructions

Write exactly five sections (100-150 words total), each a level-2 heading:

## Scene
2-3 sentences on the environment. Specific materials, atmosphere and spatial detail, carrying the colour palette naturally.

## Subject
2-3 sentences on the person described above: specific age, skin warmth, hair, expression and a natural, unposed stance.

## Details
2-3 sentences on attire with named fabrics, minimal styling, and environmental props that complete the scene.

## Technical
2-3 sentences of camera specs: lens and aperture (85mm, f/2.8), light type, colour temperature, composition, ${aspectRatio} aspect ratio.

## Avoid
Comma-separated exclusions: medical equipment, surgical imagery, clinical coldness, stock photo poses, artificial expressions, heavy retouching, text overlays, watermarks, logos, before/after comparisons.

## Requirements
- Use SPECIFIC descriptors: "honey-blonde" not "blonde", "soft rim light" not "good lighting"
- Include realism cues: "natural skin texture", "soft catchlights in the eyes"
- Output ONLY the five-section markdown brief — no explanation
- Never mention "the blog post"; the brief must stand alone`
}

/**
 * Generate the user prompt for featured image generation.
 *
 * Dispatches on `modelDescription`: its presence means an admin opted into the
 * human-subject path, its absence (the default for every automated pipeline
 * run) produces a people-free artistic brief.
 */
export function getFeaturedImagePrompt(
    input: FeaturedImagePromptInput
): string {
    return input.modelDescription
        ? buildHumanSubjectBrief(input)
        : buildArtisticBrief(input)
}

/**
 * Headings that describe what an image actually depicts, in priority order.
 * `Concept` belongs to the artistic brief, `Subject`/`Scene` to the human one.
 */
const CONCEPT_HEADINGS = ['Concept', 'Subject', 'Scene'] as const

/**
 * Pull the human-readable concept out of a generated image brief.
 *
 * Alt text should describe what the image shows, not the brief that produced
 * it — and a brief is mostly camera notes, palette lists and exclusions. This
 * extracts just the section that names the subject, so callers can pass it as
 * `concept` to `generateImageAlt`.
 *
 * Returns `undefined` when no recognisable section is present (for example a
 * hand-written prompt), letting the caller fall back to the full prompt.
 *
 * @param prompt - A generated markdown image brief
 * @returns The concept text, or `undefined` if none could be found
 *
 * @example
 * ```typescript
 * extractImageConcept('## Concept\nA single fold of cream silk...\n\n## Composition\n...')
 * // 'A single fold of cream silk...'
 * ```
 */
export function extractImageConcept(prompt?: string): string | undefined {
    if (!prompt) return undefined

    const sections = new Map<string, string[]>()
    let currentHeading: string | undefined

    for (const line of prompt.split('\n')) {
        const headingMatch = /^##\s+(.*?)\s*$/.exec(line)

        if (headingMatch?.[1]) {
            currentHeading = headingMatch[1].toLowerCase()
            sections.set(currentHeading, [])
            continue
        }

        if (currentHeading) {
            sections.get(currentHeading)?.push(line)
        }
    }

    for (const heading of CONCEPT_HEADINGS) {
        const body = sections.get(heading.toLowerCase())?.join('\n').trim()
        if (body) return body
    }

    return undefined
}
