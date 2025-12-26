/**
 * @workspace/ai/tools
 *
 * AI tool definitions and utility functions.
 * Tools enable AI agents to perform actions like web search,
 * finding internal links, and accessing curated external sources.
 *
 * @module @workspace/ai/tools
 */

// Web Search Tool - Tavily integration for real-time web search
export {
    searchWeb,
    executeWebSearch,
    executeMedicalSearch,
    webSearchParametersSchema,
    webSearchToolDefinition,
    medicalSearchToolDefinition,
    type WebSearchResult,
    type WebSearchToolResult,
    type WebSearchParameters,
} from './web-search-tavily.tool'

// Internal Links Tool - Find relevant internal pages to link to
export {
    getInternalLinks,
    executeInternalLinks,
    getAllInternalPages,
    getProcedurePages,
    internalLinksParametersSchema,
    internalLinksToolDefinition,
    type InternalLink,
    type InternalLinksResult,
    type InternalLinksParameters,
} from './internal-links.tool'

// External Sources Tool - Curated authoritative sources for linking
export {
    getExternalSources,
    executeExternalSources,
    getAllTrustedSources,
    getSourcesByType,
    isTrustedDomain,
    isBlockedDomain,
    externalSourcesParametersSchema,
    externalSourcesToolDefinition,
    TRUSTED_MEDICAL_SOURCES,
    BLOCKED_DOMAINS,
    type TrustedSource,
    type SourceType,
    type ExternalSourceSuggestion,
    type ExternalSourcesResult,
    type ExternalSourcesParameters,
} from './external-sources.tool'

// Google Custom Search Tool - Extensible search with site restrictions
export {
    executeGoogleSearch,
    searchGoogle,
    searchMedicalGoogle,
    searchAcademicGoogle,
    buildQueryString,
    buildSiteRestrictions,
    buildSiteExclusions,
    buildCompleteQuery,
    googleSearchParametersSchema,
    googleSearchToolDefinition,
    medicalGoogleSearchToolDefinition,
    type GoogleSearchResult,
    type GoogleSearchToolResult,
    type GoogleSearchOptions,
    type GoogleSearchParameters,
    type QueryGroup,
} from './web-search-google.tool'

/**
 * Tool version for tracking changes
 */
export const TOOLS_VERSION = '1.1.0'
