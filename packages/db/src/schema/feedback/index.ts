/**
 * Feedback Schema Exports
 *
 * @module packages/db/src/schema/feedback
 */
export {
    DEVICE_TYPES,
    BROWSER_TYPES,
    NAVIGATION_EASE_OPTIONS,
    betaFeedback,
    type DeviceType,
    type BrowserType,
    type NavigationEase,
    type BetaFeedback,
    type InsertBetaFeedback,
} from './beta-feedback.table'

export {
    BUG_SEVERITY_LEVELS,
    BUG_STATUS_OPTIONS,
    bugReport,
    type BugSeverity,
    type BugStatus,
    type BugReport,
    type InsertBugReport,
} from './bug-report.table'
