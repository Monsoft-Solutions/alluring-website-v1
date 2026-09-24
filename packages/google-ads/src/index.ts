/**
 * Google Ads data layer
 *
 * Read-only access to the practice's Google Ads account, shared by the
 * `google-ads` MCP server and the admin app.
 *
 * @module @workspace/google-ads
 */
export {
    DEFAULT_API_VERSION,
    DEFAULT_TIME_ZONE,
    getGoogleAdsConfig,
    isGoogleAdsConfigured,
    normalizeCustomerId,
} from './google-ads-config.util.js'
export {
    DEFAULT_MAX_ROWS,
    searchGaql,
    searchGaqlRaw,
    searchGoogleAdsFields,
} from './google-ads-client.service.js'
export type {
    GoogleAdsFieldInfo,
    RawSearchResult,
} from './google-ads-client.service.js'
export {
    GoogleAdsApiError,
    isTransientGoogleAdsError,
    parseGoogleAdsError,
    withGoogleAdsRetry,
} from './google-ads-error.util.js'
export {
    addDays,
    daysBetween,
    resolveDateRange,
    todayIn,
} from './google-ads-dates.util.js'
export {
    assertNumericId,
    assertSelectQuery,
    dateClause,
    gaqlLikeContains,
    gaqlString,
} from './google-ads-gaql.util.js'
export { flattenRow, toGaqlFieldName } from './google-ads-rows.util.js'
export {
    CHANGE_HISTORY_MAX_DAYS,
    CLICK_VIEW_MAX_AGE_DAYS,
    getAccountOverview,
    getCampaignPerformance,
    getChangeHistory,
    getConversionActions,
    getDailyTrend,
    getKeywordPerformance,
    getLandingPages,
    getReportRange,
    getSearchTerms,
    landingPagePath,
    lookupClicks,
    runGaql,
    totalsOf,
} from './google-ads-reports.service.js'
export type {
    CampaignPerformanceRow,
    ChangeEventRow,
    ClickRow,
    ConversionActionRow,
    DailyTrendRow,
    DeliveryMetrics,
    KeywordRow,
    LandingPageRow,
    RangeInput,
    ReportOrder,
    SearchTermRow,
} from './google-ads-reports.service.js'
export type {
    DateRange,
    FlatRow,
    GaqlSearchOptions,
    GaqlSearchResult,
    GoogleAdsConfig,
    RawRow,
} from './google-ads.type.js'
