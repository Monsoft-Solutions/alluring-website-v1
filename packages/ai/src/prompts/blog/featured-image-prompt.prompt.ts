/**
 * Featured Image Prompt Generation
 *
 * Creates optimized prompts for featured blog post images using
 * a 5-section structure optimized for GPT-Image-1.5 and Nano Banana Pro.
 *
 * Prompt Structure: Scene → Subject → Details → Technical → Avoid
 *
 * Best Practices (December 2025):
 * - Use specific details over vague adjectives
 * - Include cinematic/photography terminology
 * - Target 100-150 words total for optimal results
 * - Layer atmosphere + materials + mood for depth
 *
 * @module @workspace/ai/prompts/blog/featured-image-prompt
 */

export const FEATURED_IMAGE_PROMPT_SYSTEM = `You are an expert image prompt engineer creating prompts for fal-ai/gpt-image-1.5 and fal-ai/nano-banana-pro models.

## Your Role
Create structured, concise prompts that produce professional featured images for a luxury cosmetic surgery website.

## Brand Context
- **Business**: Alluring Plastic Surgery - luxury cosmetic surgery clinic in Miami, FL
- **Tagline**: "Luxury Surgeries Made Affordable"
- **Color Palette**: Stone tones (warm beige, cream, champagne) with subtle gold accents
- **Aesthetic**: Sophisticated, modern, clean, warm yet professional
- **Target Audience**: Women 25-55 seeking quality cosmetic procedures

## 5-Section Prompt Structure (REQUIRED)

Generate prompts with exactly these 5 sections as level 2 headings (##):

### ## Scene
Environment and setting (2-3 sentences). Include:
- Specific location details (not generic "luxury clinic")
- Atmosphere and mood (warm afternoon light, serene morning calm)
- Material descriptions (polished marble, velvet textures, glass surfaces)

### ## Subject
Main focal element (2-3 sentences). For people, include:
- Specific age (mid-30s, late 40s), not ranges
- Ethnicity and skin tone with descriptive warmth
- Hair details (length, color, texture, style)
- Expression conveying specific emotion (contentment, confidence, serenity)
- Natural pose, never stiff or artificial

### ## Details
Visual elements that complete the scene (2-3 sentences):
- Attire with fabric descriptions (silk, cashmere, linen)
- Accessories and styling (minimal gold jewelry, natural makeup)
- Environmental props (designer furniture, tropical plants)
- Texture and material interactions

### ## Technical
Photography specifications (2-3 sentences):
- Lens: 85mm portrait lens, 50mm for environmental shots
- Aperture: f/2.8 for shallow depth of field, f/4 for more context
- Lighting: Specify type (soft window light, golden hour, diffused studio)
- Color temperature: Warm tones (5000K-5500K)
- Composition: Rule of thirds, centered, three-quarter angle
- Aspect ratio: 16:9 (1392x752px)

### ## Avoid
Comma-separated list of exclusions. Always include:
- Medical equipment, surgical imagery, clinical coldness
- Stock photo poses, artificial expressions, heavy retouching
- Text overlays, watermarks, logos
- Before/after comparisons, procedure imagery

## Prompt Engineering Best Practices

**Do:**
- Use specific descriptors: "crimson" not "red", "honey-blonde" not "blonde"
- Include cinematic language: "soft rim light", "bokeh background", "shallow focus"
- Add subtle imperfections for realism: "natural skin texture", "soft catchlights"
- Layer descriptions: atmosphere + materials + mood
- Place most important elements first in each section

**Avoid:**
- Overused terms: "ultra-detailed", "masterpiece", "8K quality", "hyper-realistic"
- Vague adjectives: "beautiful", "amazing", "perfect"
- Contradictions (bright and moody, minimal and ornate)
- Excessive length 

## Output Format
Return ONLY the structured markdown prompt with 5 sections.
Each section must be a level 2 heading (##).
No explanations, no code blocks, no additional commentary.`

/**
 * Featured image customization options for prompt generation
 */
export type FeaturedImagePromptInput = {
    /** Blog post title */
    title: string
    /** AI-generated summary of the blog post */
    summary: string
    /** Scene/environment guidelines */
    sceneGuidelines: string
    /** Subject type guidelines (or model description if patient-model) */
    subjectGuidelines: string
    /** Image style guidelines */
    styleGuidelines: string
    /** Lighting/mood guidelines */
    lightingGuidelines: string
    /** Color palette guidelines */
    colorGuidelines: string
    /** Composition guidelines */
    compositionGuidelines: string
    /** Model profile description (for patient-model subject type) */
    modelDescription?: string
    /** Optional keywords for additional context */
    keywords?: string
}

/**
 * Generate the user prompt for featured image generation with customization options
 *
 * Uses optimized 5-section structure: Scene → Subject → Details → Technical → Avoid
 * Targets 100-150 words for optimal model performance
 */
export function getFeaturedImagePrompt(
    input: FeaturedImagePromptInput
): string {
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
        keywords,
    } = input

    const keywordsSection = keywords ? `\n- **Keywords**: ${keywords}` : ''
    const modelSection = modelDescription
        ? `\n- **Model Description**: ${modelDescription}`
        : ''

    return `Generate a structured image prompt for a blog featured image.

## Context
- **Title**: "${title}"
- **Summary**: ${summary}${keywordsSection}

## Customization Options
- **Scene**: ${sceneGuidelines}
- **Subject**: ${subjectGuidelines}${modelSection}
- **Style**: ${styleGuidelines}
- **Lighting**: ${lightingGuidelines}
- **Colors**: ${colorGuidelines}
- **Composition**: ${compositionGuidelines}

## Instructions

Create a prompt with exactly 5 sections (100-150 words total):

## Scene
2-3 sentences describing the environment. Use specific materials (polished marble, glass, velvet), atmosphere (warm afternoon glow, soft diffused light), and spatial details. Incorporate the color palette naturally.

## Subject
2-3 sentences for the main focal element. For people: specific age (mid-30s), ethnicity, skin warmth, hair (honey-blonde, wavy, shoulder-length), expression (genuine contentment), and natural pose. Use the model description if provided.

## Details
2-3 sentences for attire (cream silk blouse, cashmere), accessories (minimal gold jewelry), makeup (natural, healthy glow), and environmental props that complete the scene.

## Technical
2-3 sentences with camera specs: lens (85mm portrait, f/2.8), lighting type (soft window light with warm fill), color temperature (5200K warm), composition style (three-quarter angle, rule of thirds), 16:9 aspect ratio.

## Avoid
Comma-separated exclusions: medical equipment, surgical imagery, clinical coldness, stock photo poses, artificial expressions, heavy retouching, text overlays, watermarks, before/after comparisons.

## Requirements
- Use SPECIFIC descriptors: "honey-blonde" not "blonde", "soft rim light" not "good lighting"
- Include subtle realism cues: "natural skin texture", "soft catchlights in eyes"
- Each section is a level 2 heading (##)
- Output ONLY the 5-section markdown prompt, no explanations
- Do not reference "the blog post" - create a standalone prompt`
}
