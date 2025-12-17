/**
 * Sitemap Image Entry
 *
 * Represents an image to include in the sitemap for better image SEO.
 * @see https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps
 */
export type SitemapImage = {
    /** The URL of the image */
    url: string
    /** Optional title for the image */
    title?: string
    /** Optional caption/description for the image */
    caption?: string
}

/**
 * SitemapEntry
 *
 * Represents a single URL entry in the sitemap with optional metadata.
 */
export type SitemapEntry = {
    /** The full URL of the page */
    url: string
    /** Last modification date in ISO format */
    lastModified?: string
    /** How frequently the page is likely to change */
    changeFrequency?:
        | 'always'
        | 'hourly'
        | 'daily'
        | 'weekly'
        | 'monthly'
        | 'yearly'
        | 'never'
    /** Priority of this URL relative to other URLs (0.0 to 1.0) */
    priority?: number
    /** Alternate language versions of the page */
    alternates?: { hreflang: string; href: string }[]
    /** Images associated with this page for image sitemap support */
    images?: SitemapImage[]
}
