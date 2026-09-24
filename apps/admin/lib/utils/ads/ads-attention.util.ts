/**
 * The Ads console's "Needs attention" rules.
 *
 * Pure functions over snapshot rows, so each rule is unit-testable and the
 * overview query only gathers data. Thresholds live here, named, so the page
 * and the tests agree on them.
 *
 * @module @/lib/utils/ads/ads-attention.util
 */

// ============================================
// Thresholds
// ============================================

/** Cost per lead this many times the trailing-90-day figure is flagged… */
export const CPL_ALERT_MULTIPLE = 2
/** …once a campaign has at least this many leads… */
export const CPL_MIN_LEADS = 3
/** …or has spent at least this much. */
export const CPL_MIN_SPEND = 300

/** Account spend this many times the day's combined budgets is flagged. */
export const OVERSPEND_MULTIPLE = 1.5

/** A campaign spending this many days in a row with no lead is flagged. */
export const NO_LEAD_STREAK_DAYS = 5

/** Counted form conversions this far from paid leads (relative) is a gap… */
export const TRACKING_GAP_RATIO = 0.3
/** …measured over the last this-many days of the window… */
export const TRACKING_GAP_DAYS = 7
/** …once there are at least this many leads to compare with. */
export const TRACKING_GAP_MIN_LEADS = 3

/** A form action that counted before and then nothing for this many days. */
export const TRACKING_SILENT_DAYS = 3

// ============================================
// Types
// ============================================

export type AttentionSeverity = 'bad' | 'warn' | 'info'

export type AttentionItem = {
    id: string
    severity: AttentionSeverity
    title: string
    detail: string
    /** Which screen explains it. */
    area: 'campaigns' | 'daily' | 'terms' | 'changes' | 'tracking'
}

export type CampaignWindowStats = {
    campaignId: string
    campaignName: string
    cost: number
    leads: number
}

export type AccountDay = {
    date: string
    cost: number
    /** Sum of daily budgets of the campaigns that delivered that day. */
    budget: number | null
}

export type CampaignDay = {
    date: string
    campaignId: string
    campaignName: string
    cost: number
    leads: number
}

export type TrackingDay = {
    date: string
    /** Google's Conversions column for primary, non-call actions. */
    formConversions: number
    paidLeads: number
}

export type ActionDay = {
    date: string
    actionId: string
    actionName: string
    conversions: number
}

// ============================================
// Helpers
// ============================================

const money = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
})

const moneyCents = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})

/** `2026-09-14` → `14 Sep`. */
export function shortDate(date: string): string {
    const [, month, day] = date.split('-').map(Number)
    const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
    ]
    return `${day} ${months[(month ?? 1) - 1]}`
}

/** Cost per lead, or null with no leads. */
export function costPerLead(cost: number, leads: number): number | null {
    return leads > 0 ? Math.round((cost / leads) * 100) / 100 : null
}

/** Group sorted YYYY-MM-DD dates into runs of consecutive days. */
export function consecutiveRuns(dates: readonly string[]): string[][] {
    const runs: string[][] = []
    for (const date of [...dates].sort()) {
        const run = runs.at(-1)
        const previous = run?.at(-1)
        if (
            run &&
            previous &&
            Date.parse(`${date}T12:00:00Z`) -
                Date.parse(`${previous}T12:00:00Z`) ===
                86_400_000
        ) {
            run.push(date)
        } else {
            runs.push([date])
        }
    }
    return runs
}

function runLabel(run: readonly string[]): string {
    const first = run[0]!
    const last = run.at(-1)!
    return first === last
        ? shortDate(first)
        : `${shortDate(first)}–${shortDate(last)}`
}

// ============================================
// Rules
// ============================================

/**
 * Campaigns whose cost per lead is over CPL_ALERT_MULTIPLE × the account's
 * trailing figure, once the sample is big enough to mean something. A
 * campaign that spent CPL_MIN_SPEND with no lead at all is flagged too.
 */
export function cplAlerts(
    campaigns: readonly CampaignWindowStats[],
    baselineCpl: number | null
): AttentionItem[] {
    if (baselineCpl === null || baselineCpl <= 0) return []
    const items: AttentionItem[] = []

    for (const campaign of campaigns) {
        const enoughSample =
            campaign.leads >= CPL_MIN_LEADS || campaign.cost >= CPL_MIN_SPEND
        if (!enoughSample) continue

        const cpl = costPerLead(campaign.cost, campaign.leads)
        if (cpl === null) {
            if (campaign.cost < CPL_MIN_SPEND) continue
            items.push({
                id: `cpl-${campaign.campaignId}`,
                severity: 'bad',
                title: `${campaign.campaignName}: ${moneyCents.format(campaign.cost)} with no lead.`,
                detail: `Account trailing cost per lead is ${money.format(baselineCpl)}.`,
                area: 'campaigns',
            })
            continue
        }
        if (cpl <= baselineCpl * CPL_ALERT_MULTIPLE) continue

        const multiple = Math.round((cpl / baselineCpl) * 10) / 10
        items.push({
            id: `cpl-${campaign.campaignId}`,
            severity: 'bad',
            title: `${campaign.campaignName}: ${moneyCents.format(campaign.cost)} for ${campaign.leads} lead${campaign.leads === 1 ? '' : 's'}.`,
            detail: `${money.format(cpl)} per lead, ${multiple}× the trailing ${money.format(baselineCpl)}${campaign.leads < CPL_MIN_LEADS ? ' — a small sample, read it as a warning' : ''}.`,
            area: 'campaigns',
        })
    }
    return items
}

/** Days the account spent over OVERSPEND_MULTIPLE × its combined daily budgets. */
export function overspendAlerts(days: readonly AccountDay[]): AttentionItem[] {
    const over = days.filter(
        (day) =>
            day.budget !== null &&
            day.budget > 0 &&
            day.cost > day.budget * OVERSPEND_MULTIPLE
    )
    if (over.length === 0) return []

    const byDate = new Map(over.map((day) => [day.date, day]))
    return consecutiveRuns(over.map((day) => day.date)).map((run) => {
        const spends = run
            .map((date) => money.format(byDate.get(date)!.cost))
            .join(', ')
        const budgets = [
            ...new Set(run.map((date) => byDate.get(date)!.budget!)),
        ]
        const budgetLabel =
            budgets.length === 1
                ? money.format(budgets[0]!)
                : 'the daily budget'
        const peak = Math.max(
            ...run.map((date) => {
                const day = byDate.get(date)!
                return day.cost / day.budget!
            })
        )
        return {
            id: `overspend-${run[0]}`,
            severity: 'warn' as const,
            title: `Spent ${Math.round(peak * 10) / 10}× the daily budget on ${runLabel(run)}`,
            detail: `${spends} against ${budgetLabel}. Google may spend up to 2× a day's budget and balance it over the month.`,
            area: 'daily' as const,
        }
    })
}

/**
 * Campaigns with NO_LEAD_STREAK_DAYS or more consecutive days of spend and no
 * lead. Reports each campaign's longest such streak in the window.
 */
export function noLeadStreakAlerts(
    days: readonly CampaignDay[]
): AttentionItem[] {
    const byCampaign = new Map<string, CampaignDay[]>()
    for (const day of days) {
        const list = byCampaign.get(day.campaignId) ?? []
        list.push(day)
        byCampaign.set(day.campaignId, list)
    }

    const items: AttentionItem[] = []
    for (const [campaignId, list] of byCampaign) {
        const byDate = new Map(list.map((day) => [day.date, day]))
        // A day with a lead breaks the streak even if it spent nothing.
        const dryDates = list
            .filter((day) => day.cost > 0 && day.leads === 0)
            .map((day) => day.date)
        const longest = consecutiveRuns(dryDates).reduce<string[]>(
            (best, run) => (run.length > best.length ? run : best),
            []
        )
        if (longest.length < NO_LEAD_STREAK_DAYS) continue

        const spent = longest.reduce(
            (sum, date) => sum + (byDate.get(date)?.cost ?? 0),
            0
        )
        items.push({
            id: `streak-${campaignId}`,
            severity: 'warn',
            title: `${list[0]!.campaignName}: ${longest.length} days of spend with no lead`,
            detail: `${moneyCents.format(spent)} on ${runLabel(longest)}.`,
            area: 'campaigns',
        })
    }
    return items
}

/**
 * Google's counted form conversions against the paid leads the website
 * stored, over the last TRACKING_GAP_DAYS of the window. Bidding learns from
 * Google's number, so a gap means it optimizes on a partial signal.
 */
export function trackingGapAlert(
    days: readonly TrackingDay[]
): AttentionItem | null {
    const recent = [...days]
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-TRACKING_GAP_DAYS)
    const counted = recent.reduce((sum, day) => sum + day.formConversions, 0)
    const leads = recent.reduce((sum, day) => sum + day.paidLeads, 0)
    if (leads < TRACKING_GAP_MIN_LEADS) return null

    const gap = Math.abs(leads - counted) / leads
    if (gap <= TRACKING_GAP_RATIO) return null

    const countedLabel = Math.round(counted * 10) / 10
    return {
        id: 'tracking-gap',
        severity: 'bad',
        title: `Google counted ${countedLabel} form conversions against ${leads} paid leads.`,
        detail:
            counted < leads
                ? `Last ${recent.length} days. Bidding learns from the ${countedLabel}. First thing to check: the thank-you tag's trigger on each form.`
                : `Last ${recent.length} days. Google counts more than the site stored — look for a tag firing twice or on a page that isn't a lead.`,
        area: 'tracking',
    }
}

/**
 * Primary form actions that counted earlier in the window, then nothing for
 * the last TRACKING_SILENT_DAYS while paid leads kept arriving — the
 * signature of a tag that broke.
 */
export function silentActionAlerts(
    actionDays: readonly ActionDay[],
    trackingDays: readonly TrackingDay[]
): AttentionItem[] {
    const dates = [...new Set(trackingDays.map((day) => day.date))].sort()
    const tail = new Set(dates.slice(-TRACKING_SILENT_DAYS))
    if (tail.size < TRACKING_SILENT_DAYS) return []

    const leadsInTail = trackingDays
        .filter((day) => tail.has(day.date))
        .reduce((sum, day) => sum + day.paidLeads, 0)
    if (leadsInTail === 0) return []

    const byAction = new Map<
        string,
        { name: string; before: number; tail: number }
    >()
    for (const day of actionDays) {
        const entry = byAction.get(day.actionId) ?? {
            name: day.actionName,
            before: 0,
            tail: 0,
        }
        if (tail.has(day.date)) entry.tail += day.conversions
        else entry.before += day.conversions
        byAction.set(day.actionId, entry)
    }

    return [...byAction.entries()]
        .filter(([, entry]) => entry.before > 0 && entry.tail === 0)
        .map(([actionId, entry]) => ({
            id: `silent-${actionId}`,
            severity: 'bad' as const,
            title: `"${entry.name}" counted nothing for ${TRACKING_SILENT_DAYS} days.`,
            detail: `${leadsInTail} paid lead${leadsInTail === 1 ? '' : 's'} arrived in the same days. It counted ${Math.round(entry.before * 10) / 10} earlier in the window.`,
            area: 'tracking' as const,
        }))
}
