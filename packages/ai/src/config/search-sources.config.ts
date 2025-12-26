/**
 * Search Sources Configuration
 *
 * Pre-configured source lists for web searches.
 * Use these with the Google Custom Search tool to restrict
 * searches to trusted, authoritative domains.
 *
 * @module @workspace/ai/config/search-sources
 */

/**
 * Medical and health-related sources
 * Includes hospitals, government health agencies, and professional organizations
 */
export const MEDICAL_SOURCES = [
    // Government health agencies
    'nih.gov',
    'nlm.nih.gov',
    'cdc.gov',
    'fda.gov',
    'medlineplus.gov',
    // Major medical institutions
    'mayoclinic.org',
    'clevelandclinic.org',
    'hopkinsmedicine.org',
    'health.harvard.edu',
    // Professional organizations
    'plasticsurgery.org',
    'theaestheticsociety.org',
    'surgery.org',
    'isaps.org',
    'cosmeticsurgery.org',
] as const

/**
 * Academic and research sources
 * Includes peer-reviewed journals, research databases, and educational institutions
 */
export const ACADEMIC_SOURCES = [
    // Research databases
    'pubmed.ncbi.nlm.nih.gov',
    'ncbi.nlm.nih.gov',
    'scholar.google.com',
    // Academic publishers
    'academic.oup.com',
    'jamanetwork.com',
    'lww.com',
    'nature.com',
    'sciencedirect.com',
    'springer.com',
    'wiley.com',
    // Preprint servers
    'arxiv.org',
    'medrxiv.org',
    'biorxiv.org',
] as const

/**
 * News and media sources
 * Major news outlets for current events and trends
 */
export const NEWS_SOURCES = [
    'nytimes.com',
    'wsj.com',
    'bbc.com',
    'reuters.com',
    'apnews.com',
    'theguardian.com',
    'washingtonpost.com',
    'npr.org',
] as const

/**
 * Consumer health information sources
 * Reputable consumer-facing health websites
 */
export const CONSUMER_HEALTH_SOURCES = [
    'healthline.com',
    'webmd.com',
    'verywellhealth.com',
    'medicalnewstoday.com',
] as const

/**
 * Government sources (general)
 * Use wildcard pattern for any .gov domain
 */
export const GOVERNMENT_SOURCES = ['*.gov'] as const

/**
 * Educational institution sources
 * Use wildcard pattern for any .edu domain
 */
export const EDUCATIONAL_SOURCES = ['*.edu'] as const

/**
 * Convenience presets for common search types
 */
export const SEARCH_PRESETS = {
    /** Medical and health sources */
    medical: MEDICAL_SOURCES,
    /** Academic and research sources */
    academic: ACADEMIC_SOURCES,
    /** News and media sources */
    news: NEWS_SOURCES,
    /** Consumer health websites */
    consumerHealth: CONSUMER_HEALTH_SOURCES,
    /** Government domains (*.gov) */
    government: GOVERNMENT_SOURCES,
    /** Educational institutions (*.edu) */
    educational: EDUCATIONAL_SOURCES,
    /** Combined medical + academic for research */
    medicalResearch: [...MEDICAL_SOURCES, ...ACADEMIC_SOURCES],
    /** All trusted health sources */
    allHealth: [
        ...MEDICAL_SOURCES,
        ...CONSUMER_HEALTH_SOURCES,
        ...ACADEMIC_SOURCES,
    ],
} as const

export type SearchPresetKey = keyof typeof SEARCH_PRESETS

/**
 * Get sources for a preset
 */
export function getSourcesForPreset(
    preset: SearchPresetKey
): readonly string[] {
    return SEARCH_PRESETS[preset]
}

/**
 * Combine multiple source lists
 */
export function combineSources(
    ...sourceLists: (readonly string[])[]
): string[] {
    const combined = new Set<string>()
    for (const list of sourceLists) {
        for (const source of list) {
            combined.add(source)
        }
    }
    return Array.from(combined)
}
