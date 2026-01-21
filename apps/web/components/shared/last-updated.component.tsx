/**
 * LastUpdated Component
 *
 * Displays a "last updated" timestamp for freshness signals.
 * This helps both users and search engines/LLMs understand content recency.
 *
 * Uses semantic HTML with proper time element and dateTime attribute
 * for machine readability.
 *
 * @example
 * ```tsx
 * <LastUpdated date="2024-01-15" />
 * <LastUpdated date={new Date()} label="Updated" />
 * ```
 */
import { cn } from '@workspace/ui/lib/utils'

export type LastUpdatedProps = {
    /** The date to display (ISO string, Date object, or timestamp) */
    date: string | Date | number
    /** Optional label prefix (defaults to "Last updated") */
    label?: string
    /** Optional className for customization */
    className?: string
    /** Whether to show relative time (e.g., "2 days ago") */
    showRelative?: boolean
    /** Variant style */
    variant?: 'default' | 'subtle' | 'badge'
}

/**
 * Check if a date is valid
 */
function isValidDate(date: Date): boolean {
    return !isNaN(date.getTime())
}

/**
 * Format a date to a human-readable string
 */
function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}

/**
 * Get relative time string
 */
function getRelativeTime(date: Date): string {
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return 'today'
    if (diffInDays === 1) return 'yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) {
        const weeks = Math.floor(diffInDays / 7)
        return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`
    }
    if (diffInDays < 365) {
        const months = Math.floor(diffInDays / 30)
        return `${months} ${months === 1 ? 'month' : 'months'} ago`
    }

    const years = Math.floor(diffInDays / 365)
    return `${years} ${years === 1 ? 'year' : 'years'} ago`
}

/**
 * Variant styles
 */
const variantStyles = {
    default: 'text-sm text-stone-500',
    subtle: 'text-xs text-stone-400',
    badge: 'text-xs text-stone-600 bg-stone-100 px-2 py-1 rounded inline-block',
}

export function LastUpdated({
    date,
    label = 'Last updated',
    className,
    showRelative = false,
    variant = 'default',
}: LastUpdatedProps) {
    // Normalize date to Date object
    const dateObj =
        typeof date === 'string'
            ? new Date(date)
            : typeof date === 'number'
              ? new Date(date)
              : date

    // Validate date before using it to avoid SSR errors
    if (!isValidDate(dateObj)) {
        return null
    }

    // Get ISO string for machine-readable dateTime attribute
    const isoString = dateObj.toISOString()

    // Format the display text
    const displayText = showRelative
        ? getRelativeTime(dateObj)
        : formatDate(dateObj)

    return (
        <p
            className={cn(variantStyles[variant], className)}
            itemProp='dateModified'
            content={isoString}
        >
            {label}: <time dateTime={isoString}>{displayText}</time>
        </p>
    )
}

/**
 * PublishedAndUpdated Component
 *
 * Shows both published and updated dates together.
 * Useful for blog posts and content pages.
 */
export type PublishedAndUpdatedProps = {
    publishedDate: string | Date | number
    updatedDate?: string | Date | number
    className?: string
    variant?: 'default' | 'subtle' | 'badge'
}

export function PublishedAndUpdated({
    publishedDate,
    updatedDate,
    className,
    variant = 'default',
}: PublishedAndUpdatedProps) {
    const publishedObj =
        typeof publishedDate === 'string'
            ? new Date(publishedDate)
            : typeof publishedDate === 'number'
              ? new Date(publishedDate)
              : publishedDate

    const updatedObj = updatedDate
        ? typeof updatedDate === 'string'
            ? new Date(updatedDate)
            : typeof updatedDate === 'number'
              ? new Date(updatedDate)
              : updatedDate
        : null

    // Validate published date - it's required
    if (!isValidDate(publishedObj)) {
        return null
    }

    // Validate updated date if provided
    const hasValidUpdatedDate = updatedObj && isValidDate(updatedObj)

    const publishedIso = publishedObj.toISOString()
    const updatedIso = hasValidUpdatedDate
        ? updatedObj.toISOString()
        : undefined

    return (
        <div className={cn('flex flex-wrap gap-x-4 gap-y-1', className)}>
            <p
                className={variantStyles[variant]}
                itemProp='datePublished'
                content={publishedIso}
            >
                Published:{' '}
                <time dateTime={publishedIso}>{formatDate(publishedObj)}</time>
            </p>
            {hasValidUpdatedDate && (
                <p
                    className={variantStyles[variant]}
                    itemProp='dateModified'
                    content={updatedIso}
                >
                    Updated:{' '}
                    <time dateTime={updatedIso}>{formatDate(updatedObj)}</time>
                </p>
            )}
        </div>
    )
}
