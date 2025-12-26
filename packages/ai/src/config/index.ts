/**
 * @workspace/ai/config
 *
 * Configuration files for AI agents and tools.
 *
 * @module @workspace/ai/config
 */

// Trusted sources configuration
export {
    TIER1_SOURCES,
    TIER2_SOURCES,
    TIER3_SOURCES,
    ALL_TRUSTED_SOURCES,
    BLOCKED_DOMAINS_CONFIG,
    getTrustedDomains,
    getSourcesByTier,
    isUrlFromTrustedSource,
    isUrlBlocked,
    getUrlCredibility,
    type CredibilityTier,
    type TrustedSourceConfig,
} from './trusted-sources.config'

// Banned phrases configuration for AI slop detection
export {
    CORPORATE_JARGON,
    AI_TELLTALE_PHRASES,
    MEDICAL_RED_FLAGS,
    FILLER_PHRASES,
    ALL_BANNED_PHRASES,
    getPhrasesBySeverity,
    getPhrasesByCategory,
    findBannedPhrases,
    calculateAISlopScore,
    type PhraseSeverity,
    type BannedPhrase,
} from './banned-phrases.config'

// Search sources configuration for web search tools
export {
    MEDICAL_SOURCES,
    ACADEMIC_SOURCES,
    NEWS_SOURCES,
    CONSUMER_HEALTH_SOURCES,
    GOVERNMENT_SOURCES,
    EDUCATIONAL_SOURCES,
    SEARCH_PRESETS,
    getSourcesForPreset,
    combineSources,
    type SearchPresetKey,
} from './search-sources.config'
