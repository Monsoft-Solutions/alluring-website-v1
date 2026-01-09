/**
 * Blog Content Constants
 *
 * Shared configuration constants for blog content planning and generation.
 * Used by the pipeline system for content type classification and search intent targeting.
 */

/**
 * Content type labels for display
 * Maps content type values to human-readable labels
 */
export const CONTENT_TYPE_LABELS: Record<string, string> = {
    tutorial: 'Tutorial',
    guide: 'Guide',
    how_to: 'How-To',
    case_study: 'Case Study',
    comparison: 'Comparison',
    faq: 'FAQ',
    listicle: 'Listicle',
    announcement: 'Announcement',
    thought_leadership: 'Thought Leadership',
}

/**
 * Search intent options for AI topic generation
 *
 * - informational: Educational content (guides, how-tos, FAQs)
 * - commercial: Comparison and research content (cost guides, vs articles)
 * - transactional: Conversion-focused content (booking, consultation CTAs)
 * - mixed: Balanced mix of all intents
 */
export const SEARCH_INTENTS = [
    {
        value: 'mixed',
        label: 'Mixed (Balanced)',
        description: 'Generate a balanced mix of all content types',
    },
    {
        value: 'informational',
        label: 'Informational',
        description: 'Educational content: guides, how-tos, recovery tips',
    },
    {
        value: 'commercial',
        label: 'Commercial',
        description: 'Research content: cost guides, comparisons, reviews',
    },
    {
        value: 'transactional',
        label: 'Transactional',
        description: 'Conversion content: booking, consultation, next steps',
    },
] as const

export type SearchIntent = (typeof SEARCH_INTENTS)[number]['value']
