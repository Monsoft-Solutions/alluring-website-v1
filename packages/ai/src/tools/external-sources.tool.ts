/**
 * External Sources Tool
 *
 * Provides AI agents with curated external sources for authoritative linking.
 * Only returns sources from trusted medical and consumer health websites.
 *
 * @module @workspace/ai/tools/external-sources
 */
import { z } from 'zod'

/**
 * Source type classification
 */
export type SourceType =
    | 'authority' // Official medical organizations (ASPS, AMA)
    | 'medical' // Major medical institutions (Mayo Clinic, Cleveland Clinic)
    | 'research' // Research/academic sources (PubMed, NIH)
    | 'consumer' // Consumer health sites (Healthline, WebMD)
    | 'government' // Government health agencies (FDA, CDC)

/**
 * Trusted external source
 */
export type TrustedSource = {
    domain: string
    name: string
    type: SourceType
    description: string
    /** Topics this source is particularly good for */
    specialties: string[]
    /** Base URL for the source */
    baseUrl: string
}

/**
 * External source suggestion
 */
export type ExternalSourceSuggestion = {
    source: TrustedSource
    relevanceScore: number
    suggestedSearchTerms: string[]
}

/**
 * External sources result
 */
export type ExternalSourcesResult = {
    topic: string
    suggestions: ExternalSourceSuggestion[]
    recommendedCount: number
}

/**
 * External sources parameters schema
 */
export const externalSourcesParametersSchema = z.object({
    topic: z
        .string()
        .describe('The topic to find relevant external sources for'),
    sourceTypes: z
        .array(
            z.enum([
                'authority',
                'medical',
                'research',
                'consumer',
                'government',
            ])
        )
        .optional()
        .describe('Optional filter for specific source types'),
    maxResults: z.number().min(1).max(10).default(5),
})

export type ExternalSourcesParameters = z.infer<
    typeof externalSourcesParametersSchema
>

/**
 * Curated list of trusted medical authority sources
 */
export const TRUSTED_MEDICAL_SOURCES: TrustedSource[] = [
    // Authority Sources - Official Medical Organizations
    {
        domain: 'plasticsurgery.org',
        name: 'American Society of Plastic Surgeons (ASPS)',
        type: 'authority',
        description: 'Official resource for plastic surgery information',
        specialties: [
            'plastic surgery',
            'cosmetic surgery',
            'reconstructive surgery',
            'board certification',
            'surgeon qualifications',
        ],
        baseUrl: 'https://www.plasticsurgery.org',
    },
    {
        domain: 'surgery.org',
        name: 'American Society for Aesthetic Plastic Surgery (ASAPS)',
        type: 'authority',
        description: 'Leading organization for aesthetic plastic surgery',
        specialties: [
            'aesthetic surgery',
            'cosmetic procedures',
            'statistics',
            'trends',
        ],
        baseUrl: 'https://www.surgery.org',
    },

    // Medical Institution Sources
    {
        domain: 'mayoclinic.org',
        name: 'Mayo Clinic',
        type: 'medical',
        description: 'World-renowned medical institution',
        specialties: [
            'medical conditions',
            'symptoms',
            'treatments',
            'recovery',
            'risks',
            'general health',
        ],
        baseUrl: 'https://www.mayoclinic.org',
    },
    {
        domain: 'clevelandclinic.org',
        name: 'Cleveland Clinic',
        type: 'medical',
        description: 'Top-ranked hospital and health information',
        specialties: [
            'medical procedures',
            'health conditions',
            'patient education',
            'recovery guidelines',
        ],
        baseUrl: 'https://www.clevelandclinic.org',
    },
    {
        domain: 'hopkinsmedicine.org',
        name: 'Johns Hopkins Medicine',
        type: 'medical',
        description: 'Academic medical center and research institution',
        specialties: [
            'medical research',
            'treatment options',
            'patient care',
            'health conditions',
        ],
        baseUrl: 'https://www.hopkinsmedicine.org',
    },

    // Research Sources
    {
        domain: 'ncbi.nlm.nih.gov',
        name: 'PubMed / NCBI',
        type: 'research',
        description: 'Medical research database and studies',
        specialties: [
            'clinical studies',
            'research',
            'statistics',
            'medical evidence',
            'peer-reviewed',
        ],
        baseUrl: 'https://pubmed.ncbi.nlm.nih.gov',
    },
    {
        domain: 'nih.gov',
        name: 'National Institutes of Health',
        type: 'research',
        description: 'Federal agency for medical research',
        specialties: [
            'medical research',
            'health guidelines',
            'clinical trials',
            'health statistics',
        ],
        baseUrl: 'https://www.nih.gov',
    },

    // Consumer Health Sources
    {
        domain: 'healthline.com',
        name: 'Healthline',
        type: 'consumer',
        description: 'Medical-reviewed health information',
        specialties: [
            'health articles',
            'procedure explanations',
            'recovery tips',
            'wellness',
            'patient guides',
        ],
        baseUrl: 'https://www.healthline.com',
    },
    {
        domain: 'webmd.com',
        name: 'WebMD',
        type: 'consumer',
        description: 'Popular health information resource',
        specialties: [
            'symptoms',
            'conditions',
            'treatments',
            'drugs',
            'patient information',
        ],
        baseUrl: 'https://www.webmd.com',
    },
    {
        domain: 'medicalnewstoday.com',
        name: 'Medical News Today',
        type: 'consumer',
        description: 'Health news and information',
        specialties: [
            'health news',
            'medical updates',
            'research summaries',
            'health tips',
        ],
        baseUrl: 'https://www.medicalnewstoday.com',
    },
    {
        domain: 'verywellhealth.com',
        name: 'Verywell Health',
        type: 'consumer',
        description: 'Expert-reviewed health information',
        specialties: [
            'health conditions',
            'wellness',
            'patient guides',
            'medical procedures',
        ],
        baseUrl: 'https://www.verywellhealth.com',
    },

    // Government Sources
    {
        domain: 'fda.gov',
        name: 'U.S. Food and Drug Administration',
        type: 'government',
        description: 'Federal agency regulating medical devices and drugs',
        specialties: [
            'medical devices',
            'implants',
            'drug safety',
            'regulations',
            'approvals',
        ],
        baseUrl: 'https://www.fda.gov',
    },
    {
        domain: 'medlineplus.gov',
        name: 'MedlinePlus',
        type: 'government',
        description: 'NIH consumer health information',
        specialties: [
            'health topics',
            'drugs',
            'supplements',
            'medical encyclopedia',
        ],
        baseUrl: 'https://medlineplus.gov',
    },
]

/**
 * Domains that should never be linked to (competitors, low-quality sites)
 */
export const BLOCKED_DOMAINS: string[] = [
    // Add competitor clinic domains here
    // Add known AI content farms
    // Add low-quality health sites
]

/**
 * Calculate relevance between a topic and a source
 */
function calculateSourceRelevance(
    topic: string,
    source: TrustedSource
): number {
    const topicLower = topic.toLowerCase()
    const words = topicLower.split(/\s+/)

    let score = 0

    // Check specialty matches
    for (const specialty of source.specialties) {
        const specialtyLower = specialty.toLowerCase()
        if (topicLower.includes(specialtyLower)) {
            score += 15
        } else if (words.some((word) => specialtyLower.includes(word))) {
            score += 8
        }
    }

    // Boost authority sources for medical topics
    if (source.type === 'authority') {
        score += 5
    }

    // Boost medical sources for procedure topics
    if (
        source.type === 'medical' &&
        (topicLower.includes('surgery') ||
            topicLower.includes('procedure') ||
            topicLower.includes('recovery'))
    ) {
        score += 5
    }

    // Boost research sources for statistics/studies
    if (
        source.type === 'research' &&
        (topicLower.includes('study') ||
            topicLower.includes('research') ||
            topicLower.includes('statistics'))
    ) {
        score += 10
    }

    return score
}

/**
 * Generate suggested search terms for a source
 */
function generateSearchTerms(topic: string, source: TrustedSource): string[] {
    const terms: string[] = []
    const topicWords = topic
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 3)

    // Add direct topic search
    terms.push(topic)

    // Add topic + source specialty combinations
    for (const specialty of source.specialties.slice(0, 2)) {
        if (topicWords.some((word) => !specialty.includes(word))) {
            terms.push(`${topic} ${specialty}`)
        }
    }

    return terms.slice(0, 3)
}

/**
 * Get relevant external sources for a topic
 */
export function getExternalSources(
    topic: string,
    options?: {
        types?: SourceType[]
        maxResults?: number
    }
): ExternalSourcesResult {
    const { types, maxResults = 5 } = options || {}

    // Filter by type if specified
    const sources = types
        ? TRUSTED_MEDICAL_SOURCES.filter((s) => types.includes(s.type))
        : TRUSTED_MEDICAL_SOURCES

    // Score and sort by relevance
    const suggestions = sources
        .map((source) => ({
            source,
            relevanceScore: calculateSourceRelevance(topic, source),
            suggestedSearchTerms: generateSearchTerms(topic, source),
        }))
        .filter((item) => item.relevanceScore > 0)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, maxResults)

    return {
        topic,
        suggestions,
        recommendedCount: Math.min(2, suggestions.length), // Recommend 1-2 external links
    }
}

/**
 * Execute external sources lookup
 */
export function executeExternalSources(
    params: ExternalSourcesParameters
): ExternalSourcesResult {
    return getExternalSources(params.topic, {
        types: params.sourceTypes,
        maxResults: params.maxResults,
    })
}

/**
 * Check if a domain is trusted
 */
export function isTrustedDomain(domain: string): boolean {
    const domainLower = domain.toLowerCase()
    return TRUSTED_MEDICAL_SOURCES.some(
        (source) =>
            domainLower.includes(source.domain) ||
            source.domain.includes(domainLower)
    )
}

/**
 * Check if a domain is blocked
 */
export function isBlockedDomain(domain: string): boolean {
    const domainLower = domain.toLowerCase()
    return BLOCKED_DOMAINS.some(
        (blocked) =>
            domainLower.includes(blocked) || blocked.includes(domainLower)
    )
}

/**
 * Get all trusted sources (for context)
 */
export function getAllTrustedSources(): TrustedSource[] {
    return TRUSTED_MEDICAL_SOURCES
}

/**
 * Get sources by type
 */
export function getSourcesByType(type: SourceType): TrustedSource[] {
    return TRUSTED_MEDICAL_SOURCES.filter((s) => s.type === type)
}

/**
 * Tool definition for AI agents
 */
export const externalSourcesToolDefinition = {
    description:
        'Get recommended trusted external sources to cite in the content. Use this to find 1-2 authoritative external links from medical organizations, hospitals, or research institutions.',
    parameters: externalSourcesParametersSchema,
}
