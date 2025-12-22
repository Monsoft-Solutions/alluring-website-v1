/**
 * Featured Image Customization Options
 *
 * Defines configurable options for generating featured blog post images
 * across 6 categories: Scene, Subject, Style, Lighting, Color Palette, and Composition.
 */

// =============================================================================
// SCENE / ENVIRONMENT OPTIONS
// =============================================================================

export const SCENE_OPTIONS = [
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
        id: 'elegant-model',
        name: 'Elegant Model',
        icon: 'User',
        description: 'Confident, stylish person as focal point',
        promptGuidelines:
            'Elegant diverse model, confident pose, natural beauty, tasteful fashion, editorial style, sophisticated appearance, healthy radiant skin',
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
// IMAGE STYLE OPTIONS
// =============================================================================

export const STYLE_OPTIONS = [
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
}

/**
 * Default featured image options
 */
export const DEFAULT_FEATURED_IMAGE_OPTIONS: FeaturedImageOptions = {
    scene: 'luxury-clinic',
    subject: 'elegant-model',
    style: 'luxury-lifestyle',
    lighting: 'golden-hour',
    colorPalette: 'stone-gold',
    composition: 'centered-focus',
}
