import {
    PROCEDURE_PAGES as SHARED_PROCEDURE_PAGES,
    WEBSITE_PAGES as SHARED_WEBSITE_PAGES,
    SURGEON_PAGES as SHARED_SURGEON_PAGES,
    type SitePage,
} from '@workspace/shared'

/**
 * Internal Pages Data
 *
 * Static data for all internal website pages available for linking.
 * Used for context injection in content generation to enable natural internal linking.
 *
 * @module @workspace/ai/data/internal-pages
 */

/**
 * Internal page definition
 */
export type InternalPage = SitePage

/**
 * Procedure pages
 */
export const PROCEDURE_PAGES: InternalPage[] = SHARED_PROCEDURE_PAGES

/**
 * Website pages (non-procedure)
 */
export const WEBSITE_PAGES: InternalPage[] = [
    ...SHARED_WEBSITE_PAGES,
    ...SHARED_SURGEON_PAGES,
]

/**
 * Get all internal pages
 */
export function getAllInternalPages(): InternalPage[] {
    return [...PROCEDURE_PAGES, ...WEBSITE_PAGES]
}

/**
 * Format internal pages for prompt context injection
 * This format is optimized for the AI to understand and use for linking
 */
export function getInternalPagesContext(): string {
    const procedureSection = PROCEDURE_PAGES.map(
        (p) =>
            `- [${p.title}](${p.url}) - ${p.description} | Keywords: ${p.keywords.join(', ')}`
    ).join('\n')

    const resourceSection = WEBSITE_PAGES.map(
        (p) =>
            `- [${p.title}](${p.url}) - ${p.description} | Keywords: ${p.keywords.join(', ')}`
    ).join('\n')

    return `## Available Internal Pages for Linking

### Procedures
${procedureSection}

### Resources
${resourceSection}

**Internal Linking Instructions:**
- Naturally link 3-5 of these pages throughout your content
- Use descriptive anchor text that flows naturally in the sentence
- Only link to pages that are genuinely relevant to the content
- Prefer procedure pages when discussing specific treatments
- Link to financing when discussing costs or affordability
- Link to gallery when mentioning results or outcomes`
}
