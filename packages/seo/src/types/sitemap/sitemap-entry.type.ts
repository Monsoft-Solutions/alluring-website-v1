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
 * Sitemap Video Entry
 *
 * Represents a video to include in the sitemap for better video SEO.
 * @see https://developers.google.com/search/docs/crawling-indexing/sitemaps/video-sitemaps
 */
export type SitemapVideo = {
    /** URL pointing to the video thumbnail image */
    thumbnailUrl: string
    /** The title of the video */
    title: string
    /** Description of the video */
    description: string
    /** Direct URL to the video file (MP4, etc.) */
    contentUrl?: string
    /** URL of the video embed player */
    playerUrl?: string
    /** Duration of the video in seconds */
    duration?: number
    /** Date the video was published (ISO 8601) */
    publicationDate?: string
    /** Whether the video is a live stream */
    live?: boolean
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
    /** Videos associated with this page for video sitemap support */
    videos?: SitemapVideo[]
}
