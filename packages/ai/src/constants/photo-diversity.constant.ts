/**
 * Photo Diversity Requirements Constant
 *
 * Defines mandatory diversity requirements for all photo-style images.
 * Automatically injected into photo prompts to ensure inclusive representation.
 *
 * @module @workspace/ai/constants/photo-diversity
 */

/**
 * Diversity requirements text to be injected into all photo prompts
 */
export const PHOTO_DIVERSITY_REQUIREMENTS = `
DIVERSITY REQUIREMENTS (MANDATORY for all photo images):
- Feature people of diverse ethnicities and backgrounds
- Include varied skin tones (light, medium, dark complexions)
- Represent the target demographic: women aged 25-55
- Show age-appropriate diversity within the 25-55 range
- Ensure natural, authentic representation without stereotyping
- Maintain medical context appropriateness
`

/**
 * Combines base photo guidelines with diversity requirements
 *
 * @param baseGuidelines - The base photo style guidelines
 * @returns Combined guidelines with diversity requirements appended
 */
export function getPhotoGuidelinesWithDiversity(
    baseGuidelines: string
): string {
    return `${baseGuidelines}\n\n${PHOTO_DIVERSITY_REQUIREMENTS}`
}
