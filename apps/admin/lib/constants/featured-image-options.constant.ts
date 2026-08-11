/**
 * Featured Image Customization Options
 *
 * Defines configurable options for generating featured blog post images
 * across 6 categories: Scene, Subject, Style, Lighting, Color Palette, and Composition.
 *
 * The default direction is ARTISTIC and people-free: the `Style` axis carries
 * one of the artistic presets defined in
 * `packages/ai/src/constants/image-style.constant.ts`, and Scene/Subject are set
 * to their artistic bridge values. The rich art direction (prompt blocks,
 * exclusions, aspect ratios, preferred models) lives in that registry — this
 * file only carries what the admin UI needs to render pickers.
 *
 * The human-subject options (`patient-model` plus the MODEL_* profile axes)
 * remain here as a deliberate OPT-IN: an admin can still choose them in the
 * featured-image dialog, and only then does a person appear in an image. The
 * automated pipeline never selects them.
 */
import { ARTISTIC_IMAGE_STYLES } from '@workspace/ai'

/**
 * Re-export of the canonical artistic style registry, for admin UI that wants
 * to show preset descriptions. Single source of truth is `@workspace/ai`.
 */
export { ARTISTIC_IMAGE_STYLES }

// =============================================================================
// SCENE / ENVIRONMENT OPTIONS
// =============================================================================

export const SCENE_OPTIONS = [
    {
        id: 'material-study',
        name: 'Material Study',
        icon: 'Gem',
        description:
            'No environment — the material or abstract field is the scene',
        promptGuidelines:
            'No depicted environment: the material, botanical or abstract field fills the frame and is the scene, surrounded by generous negative space',
    },
    {
        id: 'luxury-clinic',
        name: 'Luxury Clinic',
        icon: 'Building2',
        description: 'Elegant clinic interior with premium finishes',
        promptGuidelines:
            'Luxurious private clinic interior, marble floors, designer furniture, floor-to-ceiling windows, premium medical spa aesthetic, clean modern architecture',
    },
    {
        id: 'miami-lifestyle',
        name: 'Miami Lifestyle',
        icon: 'Palmtree',
        description: 'Vibrant Miami scenery and atmosphere',
        promptGuidelines:
            'Sunny Miami backdrop, palm trees, ocean views, art deco architecture, tropical paradise setting, South Beach vibes, luxury lifestyle environment',
    },
    {
        id: 'abstract-wellness',
        name: 'Abstract Wellness',
        icon: 'Sparkles',
        description: 'Conceptual wellness and beauty imagery',
        promptGuidelines:
            'Abstract wellness concept, flowing organic shapes, soft gradients, ethereal atmosphere, beauty and self-care symbolism, minimalist modern design',
    },
    {
        id: 'spa-retreat',
        name: 'Spa Retreat',
        icon: 'Flower2',
        description: 'Serene spa and relaxation environment',
        promptGuidelines:
            'Tranquil spa setting, natural elements, bamboo and stone accents, calming water features, zen atmosphere, peaceful retreat ambiance',
    },
    {
        id: 'modern-minimalist',
        name: 'Modern Minimalist',
        icon: 'Square',
        description: 'Clean, contemporary minimal space',
        promptGuidelines:
            'Ultra-modern minimalist interior, clean lines, white walls, sculptural furniture, gallery-like space, contemporary luxury, uncluttered elegance',
    },
] as const

export type SceneId = (typeof SCENE_OPTIONS)[number]['id']

// =============================================================================
// SUBJECT TYPE OPTIONS
// =============================================================================

export const SUBJECT_OPTIONS = [
    {
        id: 'artistic-composition',
        name: 'Artistic Composition',
        icon: 'Sparkles',
        description:
            'People-free artistic subject governed by the selected style preset',
        promptGuidelines:
            'Artistic composition with no people: the selected style preset governs the subject matter — materials, botanicals or abstract form',
    },
    {
        id: 'patient-model',
        name: 'Patient Model (opt-in)',
        icon: 'User',
        description:
            'Customizable patient-like person as focal point — the only option that renders a person',
        promptGuidelines:
            'Patient-like model with customizable appearance (see model profile options below)',
    },
    {
        id: 'luxury-space',
        name: 'Luxury Space',
        icon: 'Home',
        description: 'Interior or architectural focus',
        promptGuidelines:
            'Focus on luxurious interior design, architectural details, premium materials, design-forward space, sophisticated environment without people',
    },
    {
        id: 'wellness-concept',
        name: 'Wellness Concept',
        icon: 'Heart',
        description: 'Abstract representation of wellness',
        promptGuidelines:
            'Symbolic wellness imagery, self-care concept, beauty and health representation, abstract visualization of confidence and transformation',
    },
    {
        id: 'lifestyle-scene',
        name: 'Lifestyle Scene',
        icon: 'Coffee',
        description: 'Aspirational daily life moment',
        promptGuidelines:
            'Aspirational lifestyle moment, relaxed luxury living, everyday elegance, premium quality of life, sophisticated casual scene',
    },
    {
        id: 'beauty-details',
        name: 'Beauty Details',
        icon: 'Gem',
        description: 'Close-up beauty and skincare focus',
        promptGuidelines:
            'Macro beauty details, flawless skin texture, luxury skincare elements, premium cosmetic aesthetic, detailed product-like quality',
    },
] as const

export type SubjectId = (typeof SUBJECT_OPTIONS)[number]['id']

// =============================================================================
// MODEL PROFILE OPTIONS (Patient-like customization)
// =============================================================================

export const MODEL_AGE_OPTIONS = [
    {
        id: 'young-adult',
        name: 'Young Adult (25-35)',
        description: 'Fresh, vibrant energy',
        promptGuidelines:
            'woman in her late 20s to early 30s, youthful appearance',
    },
    {
        id: 'mid-adult',
        name: 'Mid Adult (35-45)',
        description: 'Confident, established presence',
        promptGuidelines:
            'woman in her late 30s to early 40s, confident and poised',
    },
    {
        id: 'mature-adult',
        name: 'Mature Adult (45-55)',
        description: 'Sophisticated, elegant maturity',
        promptGuidelines:
            'woman in her late 40s to mid 50s, elegant and sophisticated',
    },
] as const

export type ModelAgeId = (typeof MODEL_AGE_OPTIONS)[number]['id']

export const MODEL_ETHNICITY_OPTIONS = [
    {
        id: 'latina-hispanic',
        name: 'Latina/Hispanic',
        description: 'Latin American heritage',
        promptGuidelines: 'Latina woman, Latin American heritage',
    },
    {
        id: 'caribbean',
        name: 'Caribbean',
        description: 'Caribbean island heritage',
        promptGuidelines: 'Caribbean woman, island heritage',
    },
    {
        id: 'african-american',
        name: 'African American',
        description: 'African American heritage',
        promptGuidelines: 'African American woman',
    },
    {
        id: 'caucasian',
        name: 'Caucasian',
        description: 'European heritage',
        promptGuidelines: 'Caucasian woman, European heritage',
    },
    {
        id: 'asian',
        name: 'Asian',
        description: 'Asian heritage',
        promptGuidelines: 'Asian woman',
    },
    {
        id: 'middle-eastern',
        name: 'Middle Eastern',
        description: 'Middle Eastern heritage',
        promptGuidelines: 'Middle Eastern woman',
    },
    {
        id: 'mixed-heritage',
        name: 'Mixed Heritage',
        description: 'Diverse mixed background',
        promptGuidelines: 'mixed heritage woman, diverse ethnic background',
    },
] as const

export type ModelEthnicityId = (typeof MODEL_ETHNICITY_OPTIONS)[number]['id']

export const MODEL_BODY_TYPE_OPTIONS = [
    {
        id: 'slim',
        name: 'Slim',
        description: 'Slender figure',
        promptGuidelines: 'slim body type, slender figure',
    },
    {
        id: 'athletic',
        name: 'Athletic',
        description: 'Toned, fit physique',
        promptGuidelines: 'athletic body type, toned and fit physique',
    },
    {
        id: 'average',
        name: 'Average',
        description: 'Natural, balanced figure',
        promptGuidelines: 'average body type, natural balanced figure',
    },
    {
        id: 'curvy',
        name: 'Curvy',
        description: 'Full, curvaceous figure',
        promptGuidelines: 'curvy body type, full feminine curves',
    },
    {
        id: 'plus-size',
        name: 'Plus Size',
        description: 'Beautiful fuller figure',
        promptGuidelines: 'plus size body type, beautiful fuller figure',
    },
] as const

export type ModelBodyTypeId = (typeof MODEL_BODY_TYPE_OPTIONS)[number]['id']

export const MODEL_HAIR_COLOR_OPTIONS = [
    {
        id: 'blonde',
        name: 'Blonde',
        promptGuidelines: 'blonde hair',
    },
    {
        id: 'brunette',
        name: 'Brunette',
        promptGuidelines: 'brunette hair, rich brown tones',
    },
    {
        id: 'black',
        name: 'Black',
        promptGuidelines: 'jet black hair',
    },
    {
        id: 'auburn',
        name: 'Auburn',
        promptGuidelines: 'auburn hair, warm reddish-brown tones',
    },
    {
        id: 'gray-silver',
        name: 'Gray/Silver',
        promptGuidelines: 'elegant gray or silver hair',
    },
    {
        id: 'highlighted',
        name: 'Highlighted',
        promptGuidelines: 'hair with professional highlights',
    },
] as const

export type ModelHairColorId = (typeof MODEL_HAIR_COLOR_OPTIONS)[number]['id']

export const MODEL_HAIR_LENGTH_OPTIONS = [
    {
        id: 'short',
        name: 'Short',
        promptGuidelines: 'short hair',
    },
    {
        id: 'medium',
        name: 'Medium',
        promptGuidelines: 'medium-length hair',
    },
    {
        id: 'long',
        name: 'Long',
        promptGuidelines: 'long flowing hair',
    },
] as const

export type ModelHairLengthId = (typeof MODEL_HAIR_LENGTH_OPTIONS)[number]['id']

export const MODEL_HAIR_STYLE_OPTIONS = [
    {
        id: 'straight',
        name: 'Straight',
        promptGuidelines: 'straight sleek hair',
    },
    {
        id: 'wavy',
        name: 'Wavy',
        promptGuidelines: 'soft wavy hair',
    },
    {
        id: 'curly',
        name: 'Curly',
        promptGuidelines: 'natural curly hair',
    },
    {
        id: 'braided',
        name: 'Braided',
        promptGuidelines: 'elegantly braided hair',
    },
    {
        id: 'updo',
        name: 'Updo',
        promptGuidelines: 'sophisticated updo hairstyle',
    },
] as const

export type ModelHairStyleId = (typeof MODEL_HAIR_STYLE_OPTIONS)[number]['id']

export const MODEL_SKIN_TONE_OPTIONS = [
    {
        id: 'fair',
        name: 'Fair',
        promptGuidelines: 'fair skin tone',
    },
    {
        id: 'light',
        name: 'Light',
        promptGuidelines: 'light skin tone',
    },
    {
        id: 'medium',
        name: 'Medium',
        promptGuidelines: 'medium skin tone',
    },
    {
        id: 'olive',
        name: 'Olive',
        promptGuidelines: 'warm olive skin tone',
    },
    {
        id: 'tan',
        name: 'Tan',
        promptGuidelines: 'sun-kissed tan skin tone',
    },
    {
        id: 'deep',
        name: 'Deep',
        promptGuidelines: 'deep skin tone',
    },
    {
        id: 'rich',
        name: 'Rich',
        promptGuidelines: 'rich dark skin tone',
    },
] as const

export type ModelSkinToneId = (typeof MODEL_SKIN_TONE_OPTIONS)[number]['id']

export const MODEL_EXPRESSION_OPTIONS = [
    {
        id: 'confident-smile',
        name: 'Confident Smile',
        promptGuidelines: 'confident genuine smile, warm expression',
    },
    {
        id: 'serene-peaceful',
        name: 'Serene/Peaceful',
        promptGuidelines: 'serene and peaceful expression, calm demeanor',
    },
    {
        id: 'contemplative',
        name: 'Contemplative',
        promptGuidelines: 'thoughtful contemplative expression',
    },
    {
        id: 'joyful',
        name: 'Joyful',
        promptGuidelines: 'joyful radiant expression, genuine happiness',
    },
    {
        id: 'natural-relaxed',
        name: 'Natural/Relaxed',
        promptGuidelines: 'natural relaxed expression, at ease',
    },
] as const

export type ModelExpressionId = (typeof MODEL_EXPRESSION_OPTIONS)[number]['id']

export const MODEL_POSE_OPTIONS = [
    {
        id: 'front-facing',
        name: 'Front-Facing Portrait',
        promptGuidelines:
            'front-facing portrait pose, direct eye contact with camera',
    },
    {
        id: 'three-quarter',
        name: 'Three-Quarter View',
        promptGuidelines: 'three-quarter angle pose, slight turn to the side',
    },
    {
        id: 'profile',
        name: 'Profile',
        promptGuidelines: 'elegant profile pose, side view',
    },
    {
        id: 'full-body',
        name: 'Full Body',
        promptGuidelines: 'full body pose, head to toe visible',
    },
    {
        id: 'upper-body',
        name: 'Upper Body',
        promptGuidelines: 'upper body portrait, waist up',
    },
] as const

export type ModelPoseId = (typeof MODEL_POSE_OPTIONS)[number]['id']

export const MODEL_ATTIRE_OPTIONS = [
    {
        id: 'clinical',
        name: 'Clinical',
        description: 'Patient gown or spa robe',
        promptGuidelines: 'wearing elegant white spa robe or patient gown',
    },
    {
        id: 'casual-elegant',
        name: 'Casual Elegant',
        description: 'Sophisticated everyday wear',
        promptGuidelines:
            'wearing sophisticated casual elegant attire, tasteful fashion',
    },
    {
        id: 'athleisure',
        name: 'Athleisure',
        description: 'Premium sporty comfort',
        promptGuidelines: 'wearing premium athleisure wear, sporty yet elegant',
    },
    {
        id: 'professional',
        name: 'Professional',
        description: 'Business or formal attire',
        promptGuidelines:
            'wearing professional business attire, polished and refined',
    },
    {
        id: 'spa-wellness',
        name: 'Spa/Wellness',
        description: 'Relaxed wellness attire',
        promptGuidelines:
            'wearing spa or wellness attire, relaxed and comfortable',
    },
] as const

export type ModelAttireId = (typeof MODEL_ATTIRE_OPTIONS)[number]['id']

/**
 * Complete Model Profile Type
 */
export type ModelProfile = {
    age: ModelAgeId
    ethnicity: ModelEthnicityId
    bodyType: ModelBodyTypeId
    hairColor: ModelHairColorId
    hairLength: ModelHairLengthId
    hairStyle: ModelHairStyleId
    skinTone: ModelSkinToneId
    expression: ModelExpressionId
    pose: ModelPoseId
    attire: ModelAttireId
}

/**
 * Default model profile
 */
export const DEFAULT_MODEL_PROFILE: ModelProfile = {
    age: 'mid-adult',
    ethnicity: 'latina-hispanic',
    bodyType: 'athletic',
    hairColor: 'brunette',
    hairLength: 'medium',
    hairStyle: 'wavy',
    skinTone: 'olive',
    expression: 'confident-smile',
    pose: 'three-quarter',
    attire: 'casual-elegant',
}

/**
 * Helper functions to get model profile options
 */
export function getModelAgeOption(id: ModelAgeId) {
    return MODEL_AGE_OPTIONS.find((opt) => opt.id === id)
}

export function getModelEthnicityOption(id: ModelEthnicityId) {
    return MODEL_ETHNICITY_OPTIONS.find((opt) => opt.id === id)
}

export function getModelBodyTypeOption(id: ModelBodyTypeId) {
    return MODEL_BODY_TYPE_OPTIONS.find((opt) => opt.id === id)
}

export function getModelHairColorOption(id: ModelHairColorId) {
    return MODEL_HAIR_COLOR_OPTIONS.find((opt) => opt.id === id)
}

export function getModelHairLengthOption(id: ModelHairLengthId) {
    return MODEL_HAIR_LENGTH_OPTIONS.find((opt) => opt.id === id)
}

export function getModelHairStyleOption(id: ModelHairStyleId) {
    return MODEL_HAIR_STYLE_OPTIONS.find((opt) => opt.id === id)
}

export function getModelSkinToneOption(id: ModelSkinToneId) {
    return MODEL_SKIN_TONE_OPTIONS.find((opt) => opt.id === id)
}

export function getModelExpressionOption(id: ModelExpressionId) {
    return MODEL_EXPRESSION_OPTIONS.find((opt) => opt.id === id)
}

export function getModelPoseOption(id: ModelPoseId) {
    return MODEL_POSE_OPTIONS.find((opt) => opt.id === id)
}

export function getModelAttireOption(id: ModelAttireId) {
    return MODEL_ATTIRE_OPTIONS.find((opt) => opt.id === id)
}

/**
 * Build model description from profile for prompt generation
 */
export function buildModelDescription(profile: ModelProfile): string {
    const age = getModelAgeOption(profile.age)
    const ethnicity = getModelEthnicityOption(profile.ethnicity)
    const bodyType = getModelBodyTypeOption(profile.bodyType)
    const hairColor = getModelHairColorOption(profile.hairColor)
    const hairLength = getModelHairLengthOption(profile.hairLength)
    const hairStyle = getModelHairStyleOption(profile.hairStyle)
    const skinTone = getModelSkinToneOption(profile.skinTone)
    const expression = getModelExpressionOption(profile.expression)
    const pose = getModelPoseOption(profile.pose)
    const attire = getModelAttireOption(profile.attire)

    const parts = [
        age?.promptGuidelines,
        ethnicity?.promptGuidelines,
        bodyType?.promptGuidelines,
        `${hairLength?.promptGuidelines} ${hairStyle?.promptGuidelines} ${hairColor?.promptGuidelines}`,
        skinTone?.promptGuidelines,
        `with healthy radiant glow`,
        expression?.promptGuidelines,
        pose?.promptGuidelines,
        attire?.promptGuidelines,
    ].filter(Boolean)

    return parts.join(', ')
}

// =============================================================================
// IMAGE STYLE OPTIONS
// =============================================================================

export const STYLE_OPTIONS = [
    {
        id: 'abstract-material-macro',
        name: 'Abstract Material Macro',
        icon: 'ZoomIn',
        description:
            'Macro studies of marble, silk, gold leaf, water and light',
        promptGuidelines:
            'Extreme-macro fine-art study of luxurious inert materials — marble veining, silk drape, gold leaf, water refraction — one dominant gesture, generous negative space, warm stone palette with a single gold note, raking directional light, no people',
    },
    {
        id: 'botanical-still-life',
        name: 'Botanical Still Life',
        icon: 'Flower2',
        description: 'Orchids, palm shadows and stone vessels in natural light',
        promptGuidelines:
            'Quiet botanical still life in natural light — orchid stems, palm shadows on plaster, stone vessels, folded linen — asymmetric placement, shadow as a second subject, warm stone palette, soft late-afternoon light, no people',
    },
    {
        id: 'painterly-editorial',
        name: 'Painterly Editorial',
        icon: 'Paintbrush',
        description: 'Watercolor washes, contour lines and gradient fields',
        promptGuidelines:
            'Abstract editorial illustration — watercolor and ink washes, single-weight contour line, soft gradient fields, torn-paper shapes, gold leaf as one deliberate stroke, warm paper palette, generous white space, no people and no lettering',
    },
    {
        id: 'editorial-photo',
        name: 'Editorial Photography',
        icon: 'Camera',
        description: 'High-fashion magazine quality',
        promptGuidelines:
            'High-end editorial photography, magazine quality, Vogue-style aesthetic, professional fashion shoot, polished and refined',
    },
    {
        id: 'luxury-lifestyle',
        name: 'Luxury Lifestyle',
        icon: 'Crown',
        description: 'Premium aspirational imagery',
        promptGuidelines:
            'Luxury lifestyle photography, aspirational imagery, premium brand aesthetic, sophisticated elegance, exclusive feel',
    },
    {
        id: 'clinical-clean',
        name: 'Clinical Clean',
        icon: 'Stethoscope',
        description: 'Professional medical aesthetic',
        promptGuidelines:
            'Clean clinical aesthetic, professional medical imagery, pristine environment, trustworthy and credible, healthcare quality',
    },
    {
        id: 'warm-aspirational',
        name: 'Warm Aspirational',
        icon: 'Sun',
        description: 'Inviting and emotionally warm',
        promptGuidelines:
            'Warm inviting photography, emotionally resonant, approachable elegance, comfortable luxury, welcoming atmosphere',
    },
    {
        id: 'artistic-conceptual',
        name: 'Artistic Conceptual',
        icon: 'Palette',
        description: 'Creative and artistic approach',
        promptGuidelines:
            'Artistic conceptual photography, creative composition, fine art influence, unique perspective, gallery-worthy aesthetic',
    },
] as const

export type StyleId = (typeof STYLE_OPTIONS)[number]['id']

// =============================================================================
// LIGHTING / MOOD OPTIONS
// =============================================================================

export const LIGHTING_OPTIONS = [
    {
        id: 'golden-hour',
        name: 'Golden Hour',
        icon: 'Sunrise',
        description: 'Warm sunset/sunrise lighting',
        promptGuidelines:
            'Golden hour lighting, warm sunset tones, soft diffused sunlight, romantic atmosphere, flattering warm glow',
    },
    {
        id: 'studio-soft',
        name: 'Studio Soft',
        icon: 'Lightbulb',
        description: 'Professional soft studio lighting',
        promptGuidelines:
            'Professional studio lighting, soft diffused light, beauty lighting setup, flattering shadows, controlled illumination',
    },
    {
        id: 'natural-bright',
        name: 'Natural Bright',
        icon: 'CloudSun',
        description: 'Bright natural daylight',
        promptGuidelines:
            'Bright natural daylight, clean illumination, airy atmosphere, window light, fresh and energetic mood',
    },
    {
        id: 'dramatic-moody',
        name: 'Dramatic Moody',
        icon: 'Moon',
        description: 'High contrast dramatic lighting',
        promptGuidelines:
            'Dramatic lighting, bold shadows, high contrast, moody atmosphere, cinematic quality, striking visual impact',
    },
    {
        id: 'soft-ethereal',
        name: 'Soft Ethereal',
        icon: 'Cloud',
        description: 'Dreamy and ethereal glow',
        promptGuidelines:
            'Soft ethereal lighting, dreamy glow, gentle luminosity, heavenly atmosphere, delicate and refined',
    },
] as const

export type LightingId = (typeof LIGHTING_OPTIONS)[number]['id']

// =============================================================================
// COLOR PALETTE OPTIONS
// =============================================================================

export const COLOR_OPTIONS = [
    {
        id: 'stone-gold',
        name: 'Stone & Gold',
        icon: 'Circle',
        description: 'Brand signature palette',
        promptGuidelines:
            'Stone and gold color palette, warm beige tones, cream and champagne accents, subtle gold highlights, elegant neutral base',
    },
    {
        id: 'ocean-blues',
        name: 'Ocean Blues',
        icon: 'Waves',
        description: 'Miami ocean-inspired blues',
        promptGuidelines:
            'Ocean blue palette, turquoise and teal accents, Miami coastal colors, aquamarine tones, refreshing water inspiration',
    },
    {
        id: 'warm-neutrals',
        name: 'Warm Neutrals',
        icon: 'Paintbrush',
        description: 'Sophisticated warm tones',
        promptGuidelines:
            'Warm neutral palette, soft browns and tans, creamy whites, subtle rose undertones, cozy sophisticated colors',
    },
    {
        id: 'blush-rose',
        name: 'Blush & Rose',
        icon: 'Heart',
        description: 'Feminine soft pink tones',
        promptGuidelines:
            'Blush and rose palette, soft pink tones, dusty rose accents, feminine elegance, romantic color scheme',
    },
    {
        id: 'monochrome-elegant',
        name: 'Monochrome Elegant',
        icon: 'Contrast',
        description: 'Sophisticated black and white',
        promptGuidelines:
            'Monochrome palette, elegant black and white, grayscale sophistication, timeless contrast, classic refined aesthetic',
    },
] as const

export type ColorPaletteId = (typeof COLOR_OPTIONS)[number]['id']

// =============================================================================
// COMPOSITION OPTIONS
// =============================================================================

export const COMPOSITION_OPTIONS = [
    {
        id: 'centered-focus',
        name: 'Centered Focus',
        icon: 'Target',
        description: 'Subject centered in frame',
        promptGuidelines:
            'Centered composition, subject as focal point, symmetrical balance, direct visual impact, hero image framing',
    },
    {
        id: 'rule-of-thirds',
        name: 'Rule of Thirds',
        icon: 'LayoutGrid',
        description: 'Classic balanced composition',
        promptGuidelines:
            'Rule of thirds composition, off-center subject placement, dynamic balance, professional photography framing, visual flow',
    },
    {
        id: 'close-up-detail',
        name: 'Close-up Detail',
        icon: 'ZoomIn',
        description: 'Intimate detailed framing',
        promptGuidelines:
            'Close-up composition, intimate framing, detailed focus, shallow depth of field, macro-style attention to detail',
    },
    {
        id: 'wide-environmental',
        name: 'Wide Environmental',
        icon: 'Maximize',
        description: 'Wide shot showing context',
        promptGuidelines:
            'Wide environmental shot, context-rich framing, establishing scene, spacious composition, panoramic feel',
    },
    {
        id: 'negative-space',
        name: 'Negative Space',
        icon: 'Square',
        description: 'Minimal with breathing room',
        promptGuidelines:
            'Negative space composition, minimalist framing, breathing room around subject, clean and uncluttered, modern design aesthetic',
    },
] as const

export type CompositionId = (typeof COMPOSITION_OPTIONS)[number]['id']

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get scene option by ID
 */
export function getSceneOption(id: SceneId) {
    return SCENE_OPTIONS.find((opt) => opt.id === id)
}

/**
 * Get subject option by ID
 */
export function getSubjectOption(id: SubjectId) {
    return SUBJECT_OPTIONS.find((opt) => opt.id === id)
}

/**
 * Get style option by ID
 */
export function getStyleOption(id: StyleId) {
    return STYLE_OPTIONS.find((opt) => opt.id === id)
}

/**
 * Get lighting option by ID
 */
export function getLightingOption(id: LightingId) {
    return LIGHTING_OPTIONS.find((opt) => opt.id === id)
}

/**
 * Get color palette option by ID
 */
export function getColorOption(id: ColorPaletteId) {
    return COLOR_OPTIONS.find((opt) => opt.id === id)
}

/**
 * Get composition option by ID
 */
export function getCompositionOption(id: CompositionId) {
    return COMPOSITION_OPTIONS.find((opt) => opt.id === id)
}

/**
 * Featured Image Customization Options Type
 */
export type FeaturedImageOptions = {
    scene: SceneId
    subject: SubjectId
    style: StyleId
    lighting: LightingId
    colorPalette: ColorPaletteId
    composition: CompositionId
    /** Model profile — only used when subject is `patient-model` */
    modelProfile: ModelProfile
}

/**
 * Default featured image options
 *
 * Points at the artistic, people-free path. `modelProfile` is retained so the
 * dialog has something to render if an admin switches the subject to
 * `patient-model`, but it is ignored on every other subject.
 */
export const DEFAULT_FEATURED_IMAGE_OPTIONS: FeaturedImageOptions = {
    scene: 'material-study',
    subject: 'artistic-composition',
    style: 'abstract-material-macro',
    lighting: 'soft-ethereal',
    colorPalette: 'stone-gold',
    composition: 'close-up-detail',
    modelProfile: DEFAULT_MODEL_PROFILE,
}
