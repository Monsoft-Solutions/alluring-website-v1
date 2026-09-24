/**
 * Plain-English summaries of Google Ads change events, for the change feed
 * (grouped by day and person) and the markers on the overview chart.
 *
 * @module @/lib/utils/ads/ads-changes.util
 */

export type ChangeLike = {
    userEmail: string
    resourceType: string
    operation: string
    changedFields: string[]
    values: Record<string, { old: unknown; new: unknown }> | null
}

/** Singular / plural nouns per change_event resource type. */
const RESOURCE_NOUNS: Record<string, [string, string]> = {
    CAMPAIGN: ['campaign', 'campaigns'],
    CAMPAIGN_BUDGET: ['budget', 'budgets'],
    AD_GROUP: ['ad group', 'ad groups'],
    AD_GROUP_AD: ['ad', 'ads'],
    AD: ['ad', 'ads'],
    AD_GROUP_CRITERION: ['keyword or audience', 'keywords and audiences'],
    CAMPAIGN_CRITERION: ['targeting criterion', 'targeting criteria'],
    AD_GROUP_BID_MODIFIER: ['bid adjustment', 'bid adjustments'],
    ASSET: ['asset', 'assets'],
    CAMPAIGN_ASSET: ['campaign asset link', 'campaign asset links'],
    AD_GROUP_ASSET: ['ad group asset link', 'ad group asset links'],
    CUSTOMER_ASSET: ['account asset link', 'account asset links'],
    ASSET_SET: ['asset set', 'asset sets'],
    FEED: ['feed', 'feeds'],
    FEED_ITEM: ['feed item', 'feed items'],
}

const VERBS: Record<string, string> = {
    CREATE: 'Created',
    UPDATE: 'Edited',
    REMOVE: 'Removed',
}

function noun(resourceType: string, count: number): string {
    const [one, many] = RESOURCE_NOUNS[resourceType] ?? [
        resourceType.toLowerCase().replace(/_/g, ' '),
        `${resourceType.toLowerCase().replace(/_/g, ' ')} changes`,
    ]
    return `${count} ${count === 1 ? one : many}`
}

/** The short name of an email: `angela@heydaymarketing.com` → `angela@`. */
export function shortUser(email: string): string {
    const at = email.indexOf('@')
    return at > 0 ? email.slice(0, at + 1) : email || 'Google'
}

/** "ENABLED → PAUSED" when the status changed, else null. */
function statusTransition(event: ChangeLike): string | null {
    const status = event.values?.status
    if (!status || typeof status.new !== 'string') return null
    const old = typeof status.old === 'string' ? status.old : '—'
    return `${old} → ${status.new}`
}

/**
 * Summarize one person's changes (usually one day's) in a sentence:
 * "4 campaigns ENABLED → PAUSED" or "Created 4 campaigns, 15 ad groups…;
 * edited 5 campaigns".
 */
export function summarizeChanges(events: readonly ChangeLike[]): string {
    // Status changes read best on their own.
    const transitions = new Map<string, number>()
    const rest: ChangeLike[] = []
    for (const event of events) {
        const transition =
            event.resourceType === 'CAMPAIGN' && event.operation === 'UPDATE'
                ? statusTransition(event)
                : null
        if (transition) {
            transitions.set(transition, (transitions.get(transition) ?? 0) + 1)
        } else {
            rest.push(event)
        }
    }

    const parts: string[] = []
    for (const [transition, count] of transitions) {
        parts.push(`${noun('CAMPAIGN', count)} ${transition}`)
    }

    const byOperation = new Map<string, Map<string, number>>()
    for (const event of rest) {
        const byType =
            byOperation.get(event.operation) ?? new Map<string, number>()
        byType.set(
            event.resourceType,
            (byType.get(event.resourceType) ?? 0) + 1
        )
        byOperation.set(event.operation, byType)
    }
    for (const operation of ['CREATE', 'UPDATE', 'REMOVE']) {
        const byType = byOperation.get(operation)
        if (!byType) continue
        const items = [...byType.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([type, count]) => noun(type, count))
        const verb = VERBS[operation] ?? operation
        parts.push(
            `${parts.length === 0 ? verb : verb.toLowerCase()} ${items.join(', ')}`
        )
    }

    return parts.join('; ')
}

/**
 * Whether a change edited a campaign's status or a budget's amount. Only
 * updates count: a CREATE lists every field as changed.
 */
export function isStatusOrBudgetChange(event: ChangeLike): boolean {
    if (event.operation !== 'UPDATE') return false
    if (event.resourceType === 'CAMPAIGN') {
        return event.changedFields.includes('status')
    }
    if (event.resourceType === 'CAMPAIGN_BUDGET') {
        return event.changedFields.includes('amount_micros')
    }
    return false
}

/**
 * A change event's account-zone timestamp ("2026-09-24 12:58:07.904879") as
 * a Date whose UTC fields hold that wall time — the convention
 * `timestamp` (without time zone) columns use here, as `contact_submission`
 * does for Miami time.
 */
export function wallTimeToDate(value: string): Date {
    const iso = value.trim().replace(' ', 'T')
    const date = new Date(`${iso.slice(0, 23)}Z`)
    if (Number.isNaN(date.getTime())) {
        throw new Error(`Unparseable change_date_time: "${value}"`)
    }
    return date
}
