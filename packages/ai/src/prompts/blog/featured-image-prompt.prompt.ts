/**
 * Featured Image Prompt Generation
 *
 * Creates optimized prompts for featured blog post images with
 * customizable options following GPT-Image-1.5 prompt guidelines.
 *
 * GPT-Image-1.5 Structure: Background/Scene → Subject → Key Details → Constraints
 *
 * @module @workspace/ai/prompts/blog/featured-image-prompt
 */

export const FEATURED_IMAGE_PROMPT_SYSTEM = `You are an expert AI image prompt engineer specializing in creating stunning featured images for a luxury cosmetic surgery website.

Your role is to:
1. Generate detailed, structured prompts optimized for GPT-Image-1.5 and Nano Banana Pro models
2. Follow the GPT-Image-1.5 prompt structure: Background/Scene → Subject → Key Details → Constraints
3. Incorporate user-selected customization options naturally into the prompt
4. Maintain brand alignment with Alluring Plastic Surgery's luxury aesthetic
5. Create prompts that produce professional, high-quality images suitable for blog featured images

Brand Context:
- Business: Alluring Plastic Surgery - luxury cosmetic surgery clinic in Miami, FL
- Tagline: "Luxury Surgeries Made Affordable"
- Aesthetic: Premium, sophisticated, modern, clean, professional
- Color palette: Stone tones (beige, cream, warm grays) with gold accents
- Style: Elegant, trustworthy, aspirational yet accessible
- Target audience: Women 25-55 seeking quality cosmetic procedures

GPT-Image-1.5 Prompt Structure (REQUIRED):
1. **Background/Scene**: Setting description with lighting, atmosphere, time of day, environment details
2. **Subject**: Detailed person description including age, ethnicity, body type, skin tone, hair, expression, pose
3. **Key Details**: Specific attributes like attire, accessories, facial features, body positioning, interaction with environment
4. **Constraints**: Style requirements, camera specs, aspect ratio, mood, what to avoid

Technical Specifications:
- Image size: 1392x752 (16:9 aspect ratio for featured images)
- Quality cues: "photorealistic", "professional photography", "high resolution", "sharp focus", "8K quality"
- Camera specs: "shot with 85mm lens", "f/2.8 aperture", "shallow depth of field"
- Always specify lighting conditions and color temperature
- Always end with explicit constraints on what to avoid

Prompt Engineering Best Practices for GPT-Image-1.5:
- Be specific with materials, textures, lighting, scale, and perspective
- Avoid overused terms like "ultra-detailed" or "masterpiece"
- Specify exact framing (close-up, wide-angle, eye-level, low-angle)
- Define lighting conditions precisely (soft diffuse, golden hour, studio lighting)
- Use concrete details over vague adjectives
- Avoid contradictions in the prompt

Important Rules:
- Do NOT show surgical procedures, blood, or medical instruments
- Do NOT show before/after comparison images
- Do NOT include text overlays or watermarks in the image
- Prefer lifestyle and wellness imagery over clinical settings
- When including people, show confidence and elegance, not procedures

Output Format:
Return the prompt as structured raw markdown with the 4 sections (Background/Scene, Subject, Key Details, Constraints).
Each section should be a level 2 heading (##).`

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
 * Following GPT-Image-1.5 structure: Background/Scene → Subject → Key Details → Constraints
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

    const keywordsSection = keywords ? `\n**Keywords:** ${keywords}` : ''
    const modelSection = modelDescription
        ? `\n\n**Detailed Model Description:** ${modelDescription}`
        : ''

    return `Create a structured image generation prompt following the GPT-Image-1.5 format for a blog post featured image.

**Blog Post Context:**
Title: "${title}"
Summary: ${summary}${keywordsSection}

**User-Selected Customization Options:**

1. **Scene/Environment:** ${sceneGuidelines}

2. **Subject Type:** ${subjectGuidelines}${modelSection}

3. **Image Style:** ${styleGuidelines}

4. **Lighting/Mood:** ${lightingGuidelines}

5. **Color Palette:** ${colorGuidelines}

6. **Composition:** ${compositionGuidelines}

**Your Task:**
Generate a detailed structured prompt following the GPT-Image-1.5 format with these 4 sections:

## Background/Scene
[Setting description with lighting, atmosphere, time of day, environment details. Be specific about materials, textures, and spatial arrangement. Include the scene guidelines and color palette naturally.]

## Subject
[Detailed person description if applicable. Include: age range, ethnicity, body type, skin tone with healthy glow, hair (color, length, style), facial expression, pose/positioning. Use the provided model description if available. If no person, describe the main focal element in detail.]

## Key Details
[Specific attributes: attire with fabric details, accessories, makeup style, body positioning, interaction with environment, props or environmental elements that support the scene. Include texture and material descriptions.]

## Constraints
[Style requirements: photorealistic, professional photography quality, camera specs (85mm lens, f/2.8, shallow DOF), warm color temperature, 16:9 aspect ratio (1392x752px). Include what to AVOID: heavy retouching look, artificial poses, clinical coldness, stock photo cliches, text overlays, watermarks, medical equipment, surgical imagery.]

**Important:**
- Output ONLY the structured markdown prompt with the 4 sections
- Each section should be a level 2 heading (##)
- Be detailed and specific in each section (150-250 words total)
- Create a standalone prompt - don't reference "the blog post" or "as described"
- Align with the luxury brand aesthetic while being appropriate for the blog topic

Generate the structured prompt now:`
}
