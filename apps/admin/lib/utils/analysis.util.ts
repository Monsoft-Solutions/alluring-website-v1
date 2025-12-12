/**
 * Utility functions for analysis operations
 *
 * @module apps/admin/lib/utils/analysis.util
 */

/**
 * Generate a default name for an analysis
 */
export function generateAnalysisName(
    source: 'instagram' | 'gallery',
    type: 'bulk' | 'single',
    date: Date = new Date()
): string {
    const dateStr = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
    const timeStr = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
    })

    const sourceLabel = source === 'instagram' ? 'Instagram' : 'Gallery'
    const typeLabel = type === 'bulk' ? 'Bulk' : 'Single'

    return `${sourceLabel} ${typeLabel} - ${dateStr} at ${timeStr}`
}
