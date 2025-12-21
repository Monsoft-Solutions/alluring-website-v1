/**
 * Shared types for XML sitemap structure
 * Used across sitemap validation and Google indexing scripts
 */

export type SitemapIndexEntry = {
    loc?: string[]
}

export type UrlEntry = {
    loc?: string[]
    priority?: string[]
    lastmod?: string[]
    changefreq?: string[]
    ['image:image']?: Array<{
        ['image:loc']?: string[]
    }>
}

export type ParsedSitemapXml = {
    sitemapindex?: {
        sitemap?: SitemapIndexEntry[]
    }
    urlset?: {
        url?: UrlEntry[]
    }
}
