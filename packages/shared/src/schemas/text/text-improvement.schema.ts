/**
 * Text Improvement Schema
 *
 * Shared types and constants for AI-powered text improvement operations.
 * Used across admin UI components, API routes, and AI package.
 *
 * @module @workspace/shared/schemas/text
 */

/**
 * Text operation types
 * 7 general operations + 5 industry-specific operations
 */
export type TextOperation =
    // General operations
    | 'improve'
    | 'shorter'
    | 'longer'
    | 'fix-grammar'
    | 'professional'
    | 'casual'
    | 'custom'
    // Industry-specific operations (plastic surgery)
    | 'seo-optimize'
    | 'benefit-focused'
    | 'empathetic'
    | 'luxury-tone'
    | 'add-cta'

/**
 * Operation metadata for UI display
 */
export type OperationConfig = {
    /** Operation key */
    operation: TextOperation
    /** Display label */
    label: string
    /** Short description */
    description: string
    /** Icon name (from lucide-react) */
    icon: string
    /** Group for UI organization */
    group: 'general' | 'industry'
}

/**
 * All available operations with their configurations
 */
export const OPERATIONS: OperationConfig[] = [
    // General operations
    {
        operation: 'improve',
        label: 'Improve',
        description: 'Enhance clarity and readability',
        icon: 'Sparkles',
        group: 'general',
    },
    {
        operation: 'shorter',
        label: 'Make Shorter',
        description: 'Make text more concise',
        icon: 'Minimize2',
        group: 'general',
    },
    {
        operation: 'longer',
        label: 'Make Longer',
        description: 'Expand with more detail',
        icon: 'Maximize2',
        group: 'general',
    },
    {
        operation: 'fix-grammar',
        label: 'Fix Grammar',
        description: 'Correct grammar and spelling',
        icon: 'Check',
        group: 'general',
    },
    {
        operation: 'professional',
        label: 'Professional',
        description: 'Formal, business tone',
        icon: 'Briefcase',
        group: 'general',
    },
    {
        operation: 'casual',
        label: 'Casual',
        description: 'Friendly, conversational tone',
        icon: 'MessageCircle',
        group: 'general',
    },
    {
        operation: 'custom',
        label: 'Custom',
        description: 'Provide your own instruction',
        icon: 'Pencil',
        group: 'general',
    },
    // Industry-specific operations
    {
        operation: 'seo-optimize',
        label: 'SEO Optimize',
        description: 'Add cosmetic surgery keywords',
        icon: 'Search',
        group: 'industry',
    },
    {
        operation: 'benefit-focused',
        label: 'Benefit-Focused',
        description: 'Emphasize patient outcomes',
        icon: 'Heart',
        group: 'industry',
    },
    {
        operation: 'empathetic',
        label: 'Empathetic',
        description: 'Add warmth for patients',
        icon: 'HeartHandshake',
        group: 'industry',
    },
    {
        operation: 'luxury-tone',
        label: 'Luxury Tone',
        description: 'Align with brand positioning',
        icon: 'Crown',
        group: 'industry',
    },
    {
        operation: 'add-cta',
        label: 'Add CTA',
        description: 'Strengthen call-to-action',
        icon: 'PhoneCall',
        group: 'industry',
    },
]

/**
 * Array of all valid text operations (for validation)
 */
export const TEXT_OPERATIONS: TextOperation[] = OPERATIONS.map(
    (op) => op.operation
)

/**
 * Get operations by group
 */
export function getOperationsByGroup(
    group: 'general' | 'industry'
): OperationConfig[] {
    return OPERATIONS.filter((op) => op.group === group)
}
