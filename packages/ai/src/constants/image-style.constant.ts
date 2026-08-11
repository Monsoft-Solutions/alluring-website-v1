/**
 * Artistic Image Style Constants
 *
 * Single source of truth for the artistic (people-free) image style presets
 * used across blog featured images and inline images.
 *
 * Design direction: Alluring Plastic Surgery blog imagery is *artistic*, never
 * a photorealistic "patient model in a luxury clinic". No person is ever the
 * main figure. Every preset renders in the brand's stone + gold palette with a
 * luxury-editorial mood.
 *
 * The human-subject path still exists but is opt-in only, driven explicitly by
 * an admin in the featured-image dialog. See
 * `apps/admin/lib/constants/featured-image-options.constant.ts`.
 *
 * @module @workspace/ai/constants/image-style
 */

/**
 * Supported artistic image style IDs (canonical list)
 */
export const ARTISTIC_IMAGE_STYLE_IDS = [
    'abstract-material-macro',
    'botanical-still-life',
    'painterly-editorial',
] as const

export type ArtisticImageStyleId = (typeof ARTISTIC_IMAGE_STYLE_IDS)[number]

/**
 * Placement slots that require different framing.
 *
 * - `featured` — blog hero / featured image (wide)
 * - `inline` — in-content supporting image (landscape, less extreme)
 * - `square` — social / thumbnail crops
 */
export const ARTISTIC_IMAGE_SLOTS = ['featured', 'inline', 'square'] as const

export type ArtisticImageSlot = (typeof ARTISTIC_IMAGE_SLOTS)[number]

/**
 * Aspect ratio tokens understood by the image generation service.
 *
 * NOTE: these are ratio tokens, not pixel strings. Each model takes different
 * sizing parameters — `gpt-image-2` accepts explicit `{width, height}` (so it
 * hits exact ratios), `gpt-image-1.5` takes an `image_size` enum
 * (`1024x1024` | `1536x1024` | `1024x1536`) and `nano-banana-pro` takes an
 * `aspect_ratio` enum. Translating a ratio token to per-model parameters is the
 * job of `apps/admin/lib/services/fal-image-generation.service.ts`.
 */
export type ArtisticImageAspectRatio = '16:9' | '3:2' | '1:1'

/**
 * Image generation models available for artistic presets.
 * Mirrors `IMAGE_MODELS` in the admin fal service.
 */
export type ArtisticImagePreferredModel =
    | 'gpt-image-2'
    | 'gpt-image-1.5'
    | 'nano-banana-pro'

/**
 * Data model for an artistic image style preset.
 */
export type ArtisticImageStyleDefinition = {
    id: ArtisticImageStyleId
    /** Human-readable label for admin UI and prompt interpolation */
    name: string
    /** One-line summary used in selection prompts */
    description: string
    /**
     * Rich art-direction paragraph: medium, subject vocabulary, palette,
     * composition, lighting and mood. Fed verbatim into prompt generation.
     */
    promptBlock: string
    /**
     * Preset-specific exclusions. Combine with
     * {@link ARTISTIC_IMAGE_UNIVERSAL_NEGATIVES} via
     * {@link getArtisticStyleNegatives} — never use alone.
     */
    negativeBlock: string
    /** Blog topics this preset suits, used to steer AI selection */
    topicHints: readonly string[]
    /** Preferred aspect ratio per placement slot */
    aspectRatios: Readonly<Record<ArtisticImageSlot, ArtisticImageAspectRatio>>
    /** Model that renders this register best */
    preferredModel: ArtisticImagePreferredModel
}

/**
 * Exclusions that apply to EVERY artistic preset.
 *
 * The people-free rule is the whole point of this system, so it is stated
 * first, exhaustively, and repeated in the QA gate.
 */
export const ARTISTIC_IMAGE_UNIVERSAL_NEGATIVES =
    'no people, no person, no human figure, no face, no portrait, no hands, no fingers, no arms, no legs, no torso, no skin, no hair, no body silhouette, no mannequin, no doll, no human statue or bust; ' +
    'no text, letters, words, numbers, captions, labels, logos, watermarks or signatures; ' +
    'no medical or surgical equipment, operating rooms, exam tables, syringes, scalpels, monitors or clinic interiors; ' +
    'no before/after comparison framing; ' +
    'no stock-photo staging, no glossy plastic AI sheen, no oversaturated HDR, no cluttered composition; ' +
    'no cool blue or magenta clinical color cast'

/**
 * Canonical list of artistic image style presets.
 */
export const ARTISTIC_IMAGE_STYLES: readonly ArtisticImageStyleDefinition[] = [
    {
        id: 'abstract-material-macro',
        name: 'Abstract Material Macro',
        description:
            'Extreme-macro fine-art studies of luxurious inert materials — marble veining, silk drape, gold leaf, water and light. Pure texture and materiality with zero human affordance.',
        promptBlock:
            'Extreme-macro fine-art photography of luxurious inert materials. Subject vocabulary: honed Calacatta or travertine veining, a fractured stone edge catching light, heavy silk and crepe folding into shadow, gold leaf fragments and brushed-brass planes, a single bead of water refracting light across polished marble, poured resin and liquid glass, fine sand ripples, alabaster translucence. ' +
            'Treat the material as sculpture: one dominant gesture — a fold, a vein, an edge, a droplet — filling most of the frame, surrounded by generous quiet negative space. ' +
            'Palette is warm neutral: bone, cream, oat, taupe and warm greige, lifted by a single restrained gold or champagne highlight; no more than two hues plus the metal note. ' +
            'Light is soft and strongly directional, raking across the surface so texture reads as topography, falling off gently into deep warm shadow with no harsh speculars. Shallow depth of field, one crisp plane of focus. ' +
            'Mood: still, expensive, contemplative, gallery-wall calm — a Kinfolk or Cereal magazine material study, never a product shot.',
        negativeBlock:
            'no product packaging or branded cosmetics, no jewelry presented as a product hero, no laboratory glassware, no plastic or synthetic sheen, no busy collage of many objects, no literal illustration of a procedure',
        topicHints: [
            'procedure explainers and technique overviews',
            'cost, pricing and financing',
            'consultation, planning and surgeon selection',
            'brand, evergreen and general-interest topics',
            'any topic without an obvious literal subject',
        ],
        aspectRatios: {
            featured: '16:9',
            inline: '3:2',
            square: '1:1',
        },
        preferredModel: 'gpt-image-2',
    },
    {
        id: 'botanical-still-life',
        name: 'Botanical Still Life',
        description:
            'Quiet botanical still life in natural light — orchids, palm shadows, stone vessels and organic forms. The restorative register for recovery, healing and wellness topics.',
        promptBlock:
            'Quiet botanical still life photographed in natural light. Subject vocabulary: a single white or blush phalaenopsis orchid stem, monstera and palm fronds casting hard-edged shadows across a limewash plaster wall, eucalyptus or dried grasses in a hand-thrown unglazed stone vessel, folded raw linen, a shallow bowl of still water, smooth river stones, a bare magnolia branch against an empty wall. ' +
            'Compose like a painter: one or two objects only, asymmetric placement, a large expanse of empty wall or table, and shadow used as a second subject. ' +
            'Palette is warm stone — plaster white, oat, clay, sand and warm gray — with muted sage or soft blush greens and one small brass or gold note. ' +
            'Light is late-afternoon daylight through a sheer curtain: soft key, long directional shadows, warm ambient bounce, air that feels completely still. Surfaces are matte and tactile: limewash plaster, raw linen, unpolished stone, aged brass. ' +
            'Mood: restorative, unhurried, clean and quietly luxurious — spa-adjacent without a single spa cliché.',
        negativeBlock:
            'no candles, rolled towels, hot stones or generic spa-flatlay props, no orchid-on-a-massage-table cliché, no tropical resort or beach scenery, no vivid saturated florals, no clinical white sterility, no potted-houseplant catalogue look',
        topicHints: [
            'recovery, aftercare and healing timelines',
            'wellness, rest and self-care',
            'pre-op preparation and post-op instructions',
            'scar care, swelling and skin health',
            'emotional readiness and expectations',
        ],
        aspectRatios: {
            featured: '16:9',
            inline: '3:2',
            square: '1:1',
        },
        preferredModel: 'gpt-image-2',
    },
    {
        id: 'painterly-editorial',
        name: 'Painterly Editorial',
        description:
            'Abstract editorial illustration — watercolor washes, contour line studies and soft gradient fields. For concept-heavy topics where abstraction beats photography.',
        promptBlock:
            'Editorial illustration in a painterly, abstract register — imagery that thinks rather than depicts. Medium vocabulary: layered watercolor and ink washes with visible paper tooth and bloom edges, single-weight continuous contour line drawing, soft airbrushed gradient fields, torn-paper and risograph-style overlapping shapes, and gold leaf applied as one deliberate stroke. ' +
            'Subject vocabulary is abstract and diagrammatic: flowing contour lines that suggest form without depicting a body, nested arcs and concentric bands for stages and timelines, two overlapping translucent fields for comparisons, an ascending sequence of soft shapes for progression. ' +
            'Composition is graphic and generous: large calm areas, one clear focal gesture, deliberate asymmetry, plenty of paper white. ' +
            'Palette: warm paper white and bone ground, oat and clay washes, one muted accent of soft terracotta or sage, and a restrained gold line. ' +
            'Mood: intelligent and editorial — a New York Times op-ed illustration crossed with luxury brand collateral, abstract enough that nothing ever resolves into a person.',
        negativeBlock:
            'no lettering, labels, numbers, captioned arrows or chart axes, no infographic layout, no cartoon or vector-clipart look, no anatomical rendering of organs or body parts, no medical textbook diagram, no 3D render, no neon or high-saturation palette',
        topicHints: [
            'comparisons, versus posts and decision guides',
            'timelines and step-by-step processes',
            'anatomy-adjacent and technique explainers',
            'myth-busting and misconception content',
            'concept-heavy educational content',
        ],
        aspectRatios: {
            featured: '16:9',
            inline: '3:2',
            square: '1:1',
        },
        preferredModel: 'gpt-image-2',
    },
] as const

/**
 * Default preset — used for most topics and whenever selection is absent or
 * refers to an unknown/legacy id.
 */
export const DEFAULT_ARTISTIC_STYLE_ID: ArtisticImageStyleId =
    'abstract-material-macro'

/**
 * Convenience map for fast lookups.
 */
const ARTISTIC_IMAGE_STYLE_BY_ID: Record<
    ArtisticImageStyleId,
    ArtisticImageStyleDefinition
> = Object.fromEntries(ARTISTIC_IMAGE_STYLES.map((s) => [s.id, s])) as Record<
    ArtisticImageStyleId,
    ArtisticImageStyleDefinition
>

/**
 * Type guard for artistic style IDs.
 *
 * Used to safely narrow values read back from persisted pipeline state, which
 * may predate this registry.
 */
export function isArtisticImageStyleId(
    value: unknown
): value is ArtisticImageStyleId {
    return (
        typeof value === 'string' &&
        (ARTISTIC_IMAGE_STYLE_IDS as readonly string[]).includes(value)
    )
}

/**
 * Get an artistic style definition by ID.
 */
export function getArtisticStyleById(
    id: ArtisticImageStyleId
): ArtisticImageStyleDefinition {
    return ARTISTIC_IMAGE_STYLE_BY_ID[id]
}

/**
 * Resolve an arbitrary (possibly legacy or undefined) value to a valid preset.
 *
 * Never throws — unknown values fall back to {@link DEFAULT_ARTISTIC_STYLE_ID},
 * so stored option values from before this registry keep working.
 */
export function resolveArtisticStyle(
    id?: string | null
): ArtisticImageStyleDefinition {
    return isArtisticImageStyleId(id)
        ? ARTISTIC_IMAGE_STYLE_BY_ID[id]
        : ARTISTIC_IMAGE_STYLE_BY_ID[DEFAULT_ARTISTIC_STYLE_ID]
}

/**
 * Get the aspect ratio a preset wants for a given placement slot.
 */
export function getArtisticStyleAspectRatio(
    id: ArtisticImageStyleId,
    slot: ArtisticImageSlot
): ArtisticImageAspectRatio {
    return ARTISTIC_IMAGE_STYLE_BY_ID[id].aspectRatios[slot]
}

/**
 * Build the complete exclusion list for a preset.
 *
 * Universal negatives come first because the people-free rule outranks every
 * preset-specific concern.
 */
export function getArtisticStyleNegatives(id: ArtisticImageStyleId): string {
    return `${ARTISTIC_IMAGE_UNIVERSAL_NEGATIVES}, ${ARTISTIC_IMAGE_STYLE_BY_ID[id].negativeBlock}`
}

/**
 * Render the preset catalog as markdown for interpolation into selection
 * prompts.
 *
 * Prompts import this instead of restating the vocabulary, so the registry
 * stays the single source of truth.
 */
export function buildArtisticStyleCatalog(): string {
    return ARTISTIC_IMAGE_STYLES.map((style) => {
        const hints = style.topicHints.map((hint) => `  - ${hint}`).join('\n')

        return `### \`${style.id}\` — ${style.name}\n${style.description}\n\nBest for:\n${hints}`
    }).join('\n\n')
}

/**
 * Reinforce a generated prompt with a hard people-free constraint.
 *
 * Used by the no-people QA gate when a first attempt slipped a human figure
 * into an artistic image, and by any caller that wants belt-and-braces safety.
 */
export function buildReinforcedNegativePrompt(
    prompt: string,
    id: ArtisticImageStyleId
): string {
    return `${prompt}

## Absolute Constraint (highest priority — overrides everything above)
This image MUST contain NO people whatsoever. No human figure, no face, no portrait, no hands, no fingers, no limbs, no torso, no skin, no hair, no body silhouette, no reflection or shadow of a person, no mannequin or human statue. The frame contains only materials, objects, plants, light and abstract form.
If any element of the description above could be read as implying a person, render the material or abstract form instead.
Also avoid: ${getArtisticStyleNegatives(id)}.`
}
