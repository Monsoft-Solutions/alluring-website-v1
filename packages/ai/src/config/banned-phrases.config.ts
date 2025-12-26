/**
 * Banned Phrases Configuration
 *
 * Lists of phrases that indicate AI-generated content ("AI slop").
 * Used by the AI Slop Detector agent to identify and flag problematic content.
 *
 * @module @workspace/ai/config/banned-phrases
 */

/**
 * Severity level for banned phrases
 */
export type PhraseSeverity = 'critical' | 'warning' | 'minor'

/**
 * Banned phrase configuration
 */
export type BannedPhrase = {
    phrase: string
    severity: PhraseSeverity
    category: string
    replacement?: string
    description: string
}

/**
 * Corporate jargon and buzzwords - Dead giveaways of AI content
 */
export const CORPORATE_JARGON: BannedPhrase[] = [
    {
        phrase: 'leverage',
        severity: 'warning',
        category: 'corporate',
        replacement: 'use',
        description: 'Corporate jargon',
    },
    {
        phrase: 'synergy',
        severity: 'critical',
        category: 'corporate',
        replacement: 'combination',
        description: 'Corporate buzzword',
    },
    {
        phrase: 'paradigm shift',
        severity: 'critical',
        category: 'corporate',
        description: 'Overused business cliché',
    },
    {
        phrase: 'game-changer',
        severity: 'warning',
        category: 'corporate',
        description: 'Overused buzzword',
    },
    {
        phrase: 'best-in-class',
        severity: 'warning',
        category: 'corporate',
        description: 'Empty marketing speak',
    },
    {
        phrase: 'cutting-edge',
        severity: 'warning',
        category: 'corporate',
        description: 'Overused marketing term',
    },
    {
        phrase: 'state-of-the-art',
        severity: 'minor',
        category: 'corporate',
        replacement: 'modern',
        description: 'Consider more specific language',
    },
    {
        phrase: 'world-class',
        severity: 'warning',
        category: 'corporate',
        description: 'Vague superlative',
    },
    {
        phrase: 'industry-leading',
        severity: 'warning',
        category: 'corporate',
        description: 'Unsubstantiated claim',
    },
]

/**
 * AI-specific phrases - Common in AI-generated content
 */
export const AI_TELLTALE_PHRASES: BannedPhrase[] = [
    {
        phrase: 'in conclusion',
        severity: 'minor',
        category: 'ai-pattern',
        replacement: 'To summarize',
        description: 'Overly formal transition',
    },
    {
        phrase: 'it is important to note',
        severity: 'warning',
        category: 'ai-pattern',
        description: 'Common AI filler phrase',
    },
    {
        phrase: "it's worth noting",
        severity: 'minor',
        category: 'ai-pattern',
        description: 'Common AI transition',
    },
    {
        phrase: 'in this article, we will',
        severity: 'warning',
        category: 'ai-pattern',
        description: 'Robotic introduction',
    },
    {
        phrase: 'delve into',
        severity: 'critical',
        category: 'ai-pattern',
        replacement: 'explore',
        description: 'Classic AI-generated phrase',
    },
    {
        phrase: 'delve deeper',
        severity: 'critical',
        category: 'ai-pattern',
        description: 'Classic AI-generated phrase',
    },
    {
        phrase: 'dive deep',
        severity: 'warning',
        category: 'ai-pattern',
        replacement: 'look closely at',
        description: 'Overused AI phrase',
    },
    {
        phrase: 'embark on',
        severity: 'warning',
        category: 'ai-pattern',
        replacement: 'start',
        description: 'Overly dramatic for most contexts',
    },
    {
        phrase: 'journey towards',
        severity: 'warning',
        category: 'ai-pattern',
        replacement: 'path to',
        description: 'Metaphor overuse',
    },
    {
        phrase: 'tapestry of',
        severity: 'critical',
        category: 'ai-pattern',
        description: 'AI metaphor cliché',
    },
    {
        phrase: 'realm of',
        severity: 'warning',
        category: 'ai-pattern',
        replacement: 'area of',
        description: 'Unnecessarily dramatic',
    },
    {
        phrase: 'myriad of',
        severity: 'minor',
        category: 'ai-pattern',
        replacement: 'many',
        description: 'Overly formal word choice',
    },
    {
        phrase: 'plethora of',
        severity: 'minor',
        category: 'ai-pattern',
        replacement: 'many',
        description: 'Overly formal word choice',
    },
    {
        phrase: 'multifaceted',
        severity: 'minor',
        category: 'ai-pattern',
        replacement: 'complex',
        description: 'Unnecessarily complex word',
    },
    {
        phrase: 'navigating the',
        severity: 'warning',
        category: 'ai-pattern',
        description: 'Overused metaphor',
    },
    {
        phrase: 'unlock the power',
        severity: 'critical',
        category: 'ai-pattern',
        description: 'Marketing cliché',
    },
    {
        phrase: 'unleash the potential',
        severity: 'critical',
        category: 'ai-pattern',
        description: 'Marketing cliché',
    },
    {
        phrase: 'revolutionize',
        severity: 'warning',
        category: 'ai-pattern',
        description: 'Hyperbolic claim',
    },
    {
        phrase: 'transform your',
        severity: 'minor',
        category: 'ai-pattern',
        description: 'Common marketing phrase',
    },
    {
        phrase: 'seamlessly',
        severity: 'warning',
        category: 'ai-pattern',
        replacement: 'smoothly',
        description: 'Overused adverb',
    },
    {
        phrase: 'holistic approach',
        severity: 'warning',
        category: 'ai-pattern',
        replacement: 'comprehensive approach',
        description: 'Buzzword',
    },
    {
        phrase: 'foster a sense of',
        severity: 'warning',
        category: 'ai-pattern',
        description: 'Wordy phrase',
    },
]

/**
 * Medical content red flags - Inappropriate for medical content
 */
export const MEDICAL_RED_FLAGS: BannedPhrase[] = [
    {
        phrase: 'miracle',
        severity: 'critical',
        category: 'medical-claim',
        description: 'Inappropriate medical claim',
    },
    {
        phrase: 'guaranteed results',
        severity: 'critical',
        category: 'medical-claim',
        description: 'Cannot guarantee medical outcomes',
    },
    {
        phrase: '100% safe',
        severity: 'critical',
        category: 'medical-claim',
        description: 'No procedure is 100% safe',
    },
    {
        phrase: 'risk-free',
        severity: 'critical',
        category: 'medical-claim',
        description: 'All procedures have risks',
    },
    {
        phrase: 'no downtime',
        severity: 'warning',
        category: 'medical-claim',
        replacement: 'minimal downtime',
        description: 'May overstate recovery ease',
    },
    {
        phrase: 'instant results',
        severity: 'critical',
        category: 'medical-claim',
        description: 'Results take time to develop',
    },
    {
        phrase: 'painless procedure',
        severity: 'warning',
        category: 'medical-claim',
        description: 'Most procedures involve some discomfort',
    },
    {
        phrase: 'permanent solution',
        severity: 'warning',
        category: 'medical-claim',
        replacement: 'long-lasting results',
        description: 'Avoid absolute claims',
    },
]

/**
 * Weak or filler phrases - Add no value
 */
export const FILLER_PHRASES: BannedPhrase[] = [
    {
        phrase: 'at the end of the day',
        severity: 'minor',
        category: 'filler',
        description: 'Cliché filler phrase',
    },
    {
        phrase: 'it goes without saying',
        severity: 'minor',
        category: 'filler',
        description: "If it goes without saying, don't say it",
    },
    {
        phrase: 'needless to say',
        severity: 'minor',
        category: 'filler',
        description: 'Redundant phrase',
    },
    {
        phrase: 'in order to',
        severity: 'minor',
        category: 'filler',
        replacement: 'to',
        description: 'Unnecessarily wordy',
    },
    {
        phrase: 'due to the fact that',
        severity: 'minor',
        category: 'filler',
        replacement: 'because',
        description: 'Unnecessarily wordy',
    },
    {
        phrase: 'the fact that',
        severity: 'minor',
        category: 'filler',
        replacement: 'that',
        description: 'Unnecessarily wordy',
    },
    {
        phrase: "in today's world",
        severity: 'warning',
        category: 'filler',
        description: 'Vague time reference',
    },
    {
        phrase: 'in this day and age',
        severity: 'warning',
        category: 'filler',
        description: 'Cliché',
    },
]

/**
 * All banned phrases combined
 */
export const ALL_BANNED_PHRASES: BannedPhrase[] = [
    ...CORPORATE_JARGON,
    ...AI_TELLTALE_PHRASES,
    ...MEDICAL_RED_FLAGS,
    ...FILLER_PHRASES,
]

/**
 * Get banned phrases by severity
 */
export function getPhrasesBySeverity(severity: PhraseSeverity): BannedPhrase[] {
    return ALL_BANNED_PHRASES.filter((phrase) => phrase.severity === severity)
}

/**
 * Get banned phrases by category
 */
export function getPhrasesByCategory(category: string): BannedPhrase[] {
    return ALL_BANNED_PHRASES.filter((phrase) => phrase.category === category)
}

/**
 * Check content for banned phrases
 * Returns all found banned phrases with their locations
 */
export function findBannedPhrases(
    content: string
): Array<{ phrase: BannedPhrase; count: number; positions: number[] }> {
    const contentLower = content.toLowerCase()
    const results: Array<{
        phrase: BannedPhrase
        count: number
        positions: number[]
    }> = []

    for (const phrase of ALL_BANNED_PHRASES) {
        const positions: number[] = []
        let pos = 0

        while (
            (pos = contentLower.indexOf(phrase.phrase.toLowerCase(), pos)) !==
            -1
        ) {
            positions.push(pos)
            pos += phrase.phrase.length
        }

        if (positions.length > 0) {
            results.push({
                phrase,
                count: positions.length,
                positions,
            })
        }
    }

    // Sort by severity (critical first) then by count
    return results.sort((a, b) => {
        const severityOrder = { critical: 0, warning: 1, minor: 2 }
        const severityDiff =
            severityOrder[a.phrase.severity] - severityOrder[b.phrase.severity]
        if (severityDiff !== 0) return severityDiff
        return b.count - a.count
    })
}

/**
 * Calculate AI slop score (0-100, lower is better)
 */
export function calculateAISlopScore(content: string): number {
    const wordCount = content.split(/\s+/).length
    const foundPhrases = findBannedPhrases(content)

    let score = 0

    for (const found of foundPhrases) {
        const severityWeight =
            found.phrase.severity === 'critical'
                ? 15
                : found.phrase.severity === 'warning'
                  ? 8
                  : 3

        score += severityWeight * found.count
    }

    // Normalize by word count (longer content gets more leeway)
    const normalizedScore = Math.min(100, (score / wordCount) * 500)

    return Math.round(normalizedScore)
}
