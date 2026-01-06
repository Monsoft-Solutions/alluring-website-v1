/**
 * Blog Ideas Constants
 *
 * Shared configuration constants for blog idea management,
 * including priority levels, pipeline stages, and content types.
 */

/**
 * Priority level configuration for blog ideas
 */
export const PRIORITY_CONFIG = {
    low: { label: 'Low', class: 'bg-stone-100 text-stone-600' },
    medium: { label: 'Medium', class: 'bg-blue-100 text-blue-600' },
    high: { label: 'High', class: 'bg-amber-100 text-amber-600' },
    urgent: { label: 'Urgent', class: 'bg-red-100 text-red-600' },
} as const

/**
 * Pipeline stage configuration for blog ideas
 */
export const STAGE_CONFIG = {
    backlog: { label: 'Backlog', class: 'bg-stone-100 text-stone-700' },
    researching: { label: 'Researching', class: 'bg-blue-100 text-blue-700' },
    approved: { label: 'Approved', class: 'bg-emerald-100 text-emerald-700' },
    in_progress: { label: 'In Progress', class: 'bg-amber-100 text-amber-700' },
    published: { label: 'Published', class: 'bg-purple-100 text-purple-700' },
} as const

/**
 * Content type labels for display
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
 * Content types for form selection
 */
export const CONTENT_TYPES = [
    { value: 'tutorial', label: 'Tutorial' },
    { value: 'guide', label: 'Comprehensive Guide' },
    { value: 'how_to', label: 'How-To / Step-by-Step' },
    { value: 'case_study', label: 'Case Study' },
    { value: 'comparison', label: 'Comparison' },
    { value: 'faq', label: 'FAQ / Q&A' },
    { value: 'listicle', label: 'List Article' },
    { value: 'announcement', label: 'Announcement' },
    { value: 'thought_leadership', label: 'Thought Leadership' },
] as const

/**
 * Priority levels for form selection
 */
export const PRIORITIES = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
] as const

/**
 * Procedure focus options for blog idea generation
 */
export const PROCEDURES = [
    { value: 'bbl', label: 'Brazilian Butt Lift (BBL)' },
    { value: 'mommy-makeover', label: 'Mommy Makeover' },
    { value: 'tummy-tuck', label: 'Tummy Tuck' },
    { value: 'breast-augmentation', label: 'Breast Augmentation' },
    { value: 'breast-lift', label: 'Breast Lift' },
    { value: 'liposuction', label: 'Liposuction' },
    { value: 'general', label: 'General Plastic Surgery' },
] as const

/**
 * Target audience options for blog idea generation
 */
export const AUDIENCES = [
    { value: 'considering', label: 'Patients considering surgery' },
    { value: 'post-surgery', label: 'Post-surgery recovery' },
    { value: 'researching', label: 'Early-stage researchers' },
    { value: 'financing', label: 'Cost/financing focused' },
] as const

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
