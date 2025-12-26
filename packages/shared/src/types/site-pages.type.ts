/**
 * Site Page Types
 *
 * Defines the types and interfaces for website pages used across the workspace.
 *
 * @module @workspace/shared/types/site-pages
 */

/**
 * Type of page for categorization
 */
export type PageType =
    | 'procedure'
    | 'blog'
    | 'page'
    | 'gallery'
    | 'legal'
    | 'surgeon'

/**
 * Site page definition
 */
export interface SitePage {
    /** URL path (relative or absolute) */
    url: string
    /** Page title for display */
    title: string
    /** Brief description for SEO or AI context */
    description: string
    /** Category for grouping */
    type: PageType
    /** Keywords associated with this page for search/matching */
    keywords: string[]
}
