/**
 * Trusted Sources Configuration
 *
 * Curated list of trusted medical authority sources for external linking.
 * These sources are verified to be authoritative and non-competitive.
 *
 * @module @workspace/ai/config/trusted-sources
 */

/**
 * Business domain for Alluring Plastic Surgery
 */
export const BUSINESS_DOMAIN = 'alluringplasticsurgery.com'

/**
 * Source credibility tier
 */
export type CredibilityTier = 'tier1' | 'tier2' | 'tier3'

/**
 * Trusted source configuration
 */
export type TrustedSourceConfig = {
    domain: string
    name: string
    type: 'authority' | 'medical' | 'research' | 'consumer' | 'government'
    credibility: CredibilityTier
    description: string
}

/**
 * Tier 1: Highest credibility - Official medical organizations and government sources
 */
export const TIER1_SOURCES: TrustedSourceConfig[] = [
    {
        domain: 'plasticsurgery.org',
        name: 'American Society of Plastic Surgeons (ASPS)',
        type: 'authority',
        credibility: 'tier1',
        description: 'Official professional organization for plastic surgeons',
    },
    {
        domain: 'surgery.org',
        name: 'American Society for Aesthetic Plastic Surgery',
        type: 'authority',
        credibility: 'tier1',
        description: 'Leading organization for aesthetic plastic surgery',
    },
    {
        domain: 'fda.gov',
        name: 'U.S. Food and Drug Administration',
        type: 'government',
        credibility: 'tier1',
        description: 'Federal agency for medical device and drug regulation',
    },
    {
        domain: 'nih.gov',
        name: 'National Institutes of Health',
        type: 'government',
        credibility: 'tier1',
        description: 'Federal agency for medical research',
    },
    {
        domain: 'cdc.gov',
        name: 'Centers for Disease Control and Prevention',
        type: 'government',
        credibility: 'tier1',
        description: 'National public health agency',
    },
    {
        domain: 'ncbi.nlm.nih.gov',
        name: 'PubMed / National Library of Medicine',
        type: 'research',
        credibility: 'tier1',
        description: 'Medical research database',
    },
]

/**
 * Tier 2: High credibility - Major medical institutions
 */
export const TIER2_SOURCES: TrustedSourceConfig[] = [
    {
        domain: 'mayoclinic.org',
        name: 'Mayo Clinic',
        type: 'medical',
        credibility: 'tier2',
        description: 'World-renowned medical institution',
    },
    {
        domain: 'clevelandclinic.org',
        name: 'Cleveland Clinic',
        type: 'medical',
        credibility: 'tier2',
        description: 'Top-ranked hospital and health system',
    },
    {
        domain: 'hopkinsmedicine.org',
        name: 'Johns Hopkins Medicine',
        type: 'medical',
        credibility: 'tier2',
        description: 'Academic medical center',
    },
    {
        domain: 'medlineplus.gov',
        name: 'MedlinePlus',
        type: 'government',
        credibility: 'tier2',
        description: 'NIH consumer health information',
    },
    {
        domain: 'health.harvard.edu',
        name: 'Harvard Health Publishing',
        type: 'medical',
        credibility: 'tier2',
        description: 'Harvard Medical School health information',
    },
]

/**
 * Tier 3: Good credibility - Reputable consumer health sites
 */
export const TIER3_SOURCES: TrustedSourceConfig[] = [
    {
        domain: 'healthline.com',
        name: 'Healthline',
        type: 'consumer',
        credibility: 'tier3',
        description: 'Medical-reviewed health information',
    },
    {
        domain: 'webmd.com',
        name: 'WebMD',
        type: 'consumer',
        credibility: 'tier3',
        description: 'Popular health information resource',
    },
    {
        domain: 'verywellhealth.com',
        name: 'Verywell Health',
        type: 'consumer',
        credibility: 'tier3',
        description: 'Expert-reviewed health information',
    },
    {
        domain: 'medicalnewstoday.com',
        name: 'Medical News Today',
        type: 'consumer',
        credibility: 'tier3',
        description: 'Health news and information',
    },
]

/**
 * All trusted sources combined
 */
export const ALL_TRUSTED_SOURCES: TrustedSourceConfig[] = [
    ...TIER1_SOURCES,
    ...TIER2_SOURCES,
    ...TIER3_SOURCES,
]

/**
 * Blocked domains - competitors and low-quality sites
 */
export const BLOCKED_DOMAINS_CONFIG: string[] = [
    // Competitor plastic surgery clinics (add as needed)
    // 'competitor1.com',
    // 'competitor2.com',

    // Known AI content farms
    'articlebiz.com',
    'ezinearticles.com',
    'hubpages.com',

    // User-generated content with unreliable info
    'reddit.com',
    'quora.com',

    // Sites with heavy competitor advertising
    'realself.com',
    'zocdoc.com',
]

/**
 * Get all trusted domains as a simple list
 */
export function getTrustedDomains(): string[] {
    return ALL_TRUSTED_SOURCES.map((source) => source.domain)
}

/**
 * Get domains for Perplexity search domain filter (allowlist mode)
 * Includes business domain + all trusted medical sources
 */
export function getPerplexitySearchDomains(): string[] {
    return [BUSINESS_DOMAIN, ...getTrustedDomains()]
}

/**
 * Get sources by credibility tier
 */
export function getSourcesByTier(tier: CredibilityTier): TrustedSourceConfig[] {
    return ALL_TRUSTED_SOURCES.filter((source) => source.credibility === tier)
}

/**
 * Check if a URL is from a trusted source
 */
export function isUrlFromTrustedSource(url: string): boolean {
    try {
        const hostname = new URL(url).hostname.toLowerCase()
        return ALL_TRUSTED_SOURCES.some(
            (source) =>
                hostname === source.domain ||
                hostname.endsWith(`.${source.domain}`)
        )
    } catch {
        return false
    }
}

/**
 * Check if a URL is from a blocked domain
 */
export function isUrlBlocked(url: string): boolean {
    try {
        const hostname = new URL(url).hostname.toLowerCase()
        return BLOCKED_DOMAINS_CONFIG.some(
            (blocked) =>
                hostname === blocked || hostname.endsWith(`.${blocked}`)
        )
    } catch {
        return false
    }
}

/**
 * Get the credibility tier of a URL
 */
export function getUrlCredibility(url: string): CredibilityTier | null {
    try {
        const hostname = new URL(url).hostname.toLowerCase()
        const source = ALL_TRUSTED_SOURCES.find(
            (s) => hostname === s.domain || hostname.endsWith(`.${s.domain}`)
        )
        return source?.credibility || null
    } catch {
        return null
    }
}
