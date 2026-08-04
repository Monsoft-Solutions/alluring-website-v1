/**
 * Brand Suffix Stripping Utility
 *
 * The root layout (apps/web/app/layout.tsx) applies the title template
 * `%s | Alluring Plastic Surgery` to every child page. DB-sourced
 * `seoTitle` values sometimes already end with the brand name, which
 * would otherwise render the brand twice (e.g. "Gallery Feb 2026 |
 * Alluring Plastic Surgery | Alluring Plastic Surgery").
 *
 * Call this on any title before it is handed to `toNextMetadata` so the
 * layout template only ever appends the brand once.
 */
import { siteConfig } from '@/lib/data/site-config'

/**
 * Strip a trailing "| {business name}" suffix (any surrounding
 * whitespace, case-insensitive) from a title.
 */
export function stripBrandSuffix(title: string): string {
    const escapedBrand = siteConfig.business.name.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
    )
    const suffixPattern = new RegExp(`\\s*\\|\\s*${escapedBrand}\\s*$`, 'i')
    return title.replace(suffixPattern, '').trimEnd()
}
