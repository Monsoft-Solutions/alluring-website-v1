import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'

/**
 * Homepage Metadata
 *
 * Implements SEO best practices for the homepage including:
 * - Unique, descriptive title (< 60 characters)
 * - Compelling meta description (< 160 characters)
 * - Open Graph tags for social sharing
 * - Twitter Card configuration
 * - Canonical URL
 */
export const metadata = toNextMetadata(seoConfig, {
    // Canonical URL for homepage
    canonical: '/',

    // Page-specific metadata
    title: 'Alluring Plastic Surgery',
    description:
        'Alluring Plastic Surgery - Expert cosmetic and reconstructive surgery services.',

    // Open Graph tags for social sharing
    openGraph: {
        title: 'Alluring Plastic Surgery',
        description:
            'Alluring Plastic Surgery - Expert cosmetic and reconstructive surgery services.',
        url: seoConfig.siteUrl,
        type: 'website',
        siteName: seoConfig.siteName,
        images: seoConfig.defaultMetadata.image
            ? [
                  {
                      url: seoConfig.defaultMetadata.image.url,
                      width: seoConfig.defaultMetadata.image.width ?? 1200,
                      height: seoConfig.defaultMetadata.image.height ?? 630,
                      alt: seoConfig.defaultMetadata.image.alt,
                  },
              ]
            : undefined,
    },

    // Twitter Card tags
    twitter: {
        card: seoConfig.twitter?.cardType ?? 'summary_large_image',
        title: 'Alluring Plastic Surgery',
        description:
            'Alluring Plastic Surgery - Expert cosmetic and reconstructive surgery services.',
        site: seoConfig.twitter?.site,
        creator: seoConfig.twitter?.creator ?? seoConfig.twitter?.handle,
        images: seoConfig.defaultMetadata.image
            ? [seoConfig.defaultMetadata.image.url]
            : undefined,
    },

    // Keywords (if available)
    keywords: seoConfig.defaultMetadata.keywords,

    // Additional metadata
    authors: seoConfig.defaultMetadata.author
        ? [{ name: seoConfig.defaultMetadata.author }]
        : undefined,
})

/**
 * Homepage Component
 */
export default function Page() {
    return <div>HomePage of Alluring</div>
}
