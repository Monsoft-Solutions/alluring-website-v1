'use client'

/**
 * /ads/changes — who touched what, and is Google told the truth?
 * The account's change log (kept past Google's 30 days) beside conversion
 * tracking checked against the paid leads the website stored.
 */
import { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@workspace/ui/components/collapsible'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table'

import { AdsAttentionList } from '@/components/ads/ads-attention-list.component'
import { AdsHeader } from '@/components/ads/ads-header.component'
import { useAdsRange } from '@/components/ads/ads-range.context'
import {
    AdsChip,
    AdsEmpty,
    AdsPanel,
    AdsQueryState,
} from '@/components/ads/ads-ui.component'
import { useAdsChanges, useAdsTracking } from '@/hooks/use-ads.hook'
import type {
    AdsChangeEventRow,
    AdsTrackingReport,
} from '@/lib/types/ads/ads.type'
import {
    TRACKING_GAP_DAYS,
    TRACKING_GAP_MIN_LEADS,
    TRACKING_GAP_RATIO,
} from '@/lib/utils/ads/ads-attention.util'
import { shortUser, summarizeChanges } from '@/lib/utils/ads/ads-changes.util'
import {
    formatConversions,
    formatDay,
    formatWallTime,
    humanizeEnum,
} from '@/lib/utils/ads/ads-format.util'

/** The organisation behind an account, read off its email domain. */
function orgOf(email: string): string {
    if (!email) return 'Google'
    return email.slice(email.indexOf('@') + 1)
}

/** Select value standing for changes with no user email (Google's own). */
const GOOGLE_USER = '__google__'

const CLIENT_LABELS: Record<string, string> = {
    GOOGLE_ADS_WEB_CLIENT: 'Web',
    GOOGLE_ADS_EDITOR: 'Editor',
    GOOGLE_ADS_BULK_UPLOAD: 'Bulk upload',
    GOOGLE_ADS_API: 'API',
    GOOGLE_ADS_AUTOMATED_RULE: 'Automated rule',
    GOOGLE_ADS_RECOMMENDATIONS: 'Recommendations',
    INTERNAL_TOOL: 'Google',
    SEARCH_ADS_360_SYNC: 'SA360',
}

function formatValue(value: unknown): string {
    if (value === null || value === undefined) return '—'
    if (typeof value === 'string') return value
    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value)
    }
    return JSON.stringify(value)
}

type DayGroup = {
    key: string
    date: string
    user: string
    clients: string[]
    events: AdsChangeEventRow[]
}

function groupByDayAndUser(events: AdsChangeEventRow[]): DayGroup[] {
    const groups = new Map<string, DayGroup>()
    for (const event of events) {
        const key = `${event.date}|${event.userEmail}`
        const group = groups.get(key) ?? {
            key,
            date: event.date,
            user: event.userEmail,
            clients: [],
            events: [],
        }
        group.events.push(event)
        const client =
            CLIENT_LABELS[event.clientType] ?? humanizeEnum(event.clientType)
        if (!group.clients.includes(client)) group.clients.push(client)
        groups.set(key, group)
    }
    return [...groups.values()]
}

function ChangeGroup({ group }: { group: DayGroup }) {
    const org = orgOf(group.user)
    return (
        <Collapsible className='grid grid-cols-[64px_1fr] gap-3 border-b py-3 last:border-0'>
            <div className='text-muted-foreground text-xs tabular-nums'>
                {formatDay(group.date)}
            </div>
            <div className='min-w-0'>
                <div className='flex flex-wrap items-center gap-2 text-sm font-semibold'>
                    {shortUser(group.user)}
                    <AdsChip>{org}</AdsChip>
                    {group.clients.map((client) => (
                        <AdsChip key={client} tone='info'>
                            {client}
                        </AdsChip>
                    ))}
                </div>
                <p className='text-muted-foreground mt-0.5 text-sm'>
                    {summarizeChanges(group.events)}
                </p>
                <CollapsibleTrigger className='text-gold-700 mt-1 inline-flex items-center gap-1 text-xs hover:underline'>
                    {group.events.length} change
                    {group.events.length === 1 ? '' : 's'}
                    <ChevronDown className='h-3 w-3' />
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <ul className='mt-2 grid gap-1.5 text-xs'>
                        {group.events.slice(0, 100).map((event) => (
                            <li
                                key={event.resourceName}
                                className='rounded-md bg-stone-50 px-2 py-1.5'
                            >
                                <span className='font-medium'>
                                    {humanizeEnum(event.operation)}{' '}
                                    {humanizeEnum(event.resourceType)}
                                </span>{' '}
                                <span className='text-muted-foreground'>
                                    {
                                        formatWallTime(event.changedAt).split(
                                            ' · '
                                        )[1]
                                    }
                                    {event.campaignName &&
                                        ` · ${event.campaignName}`}
                                    {event.adGroupName &&
                                        ` › ${event.adGroupName}`}
                                </span>
                                {event.values &&
                                    Object.keys(event.values).length > 0 &&
                                    event.operation === 'UPDATE' && (
                                        <ul className='mt-0.5 font-mono text-[11px]'>
                                            {Object.entries(event.values)
                                                .slice(0, 6)
                                                .map(([field, change]) => (
                                                    <li
                                                        key={field}
                                                        className='break-all'
                                                    >
                                                        {field}:{' '}
                                                        {formatValue(
                                                            change.old
                                                        )}{' '}
                                                        →{' '}
                                                        {formatValue(
                                                            change.new
                                                        )}
                                                    </li>
                                                ))}
                                        </ul>
                                    )}
                            </li>
                        ))}
                        {group.events.length > 100 && (
                            <li className='text-muted-foreground'>
                                …and {group.events.length - 100} more
                            </li>
                        )}
                    </ul>
                </CollapsibleContent>
            </div>
        </Collapsible>
    )
}

function ChangeFeed() {
    const { range } = useAdsRange()
    const [user, setUser] = useState<string>('all')
    const query = useAdsChanges(range, user === 'all' ? undefined : user)

    return (
        <AdsQueryState query={query}>
            {(report) => (
                <ChangeFeedPanel
                    events={report.events}
                    users={report.users}
                    user={user}
                    onUser={setUser}
                    oldestStored={report.oldestStored}
                />
            )}
        </AdsQueryState>
    )
}

function ChangeFeedPanel({
    events,
    users,
    user,
    onUser,
    oldestStored,
}: {
    events: AdsChangeEventRow[]
    users: string[]
    user: string
    onUser: (user: string) => void
    oldestStored: string | null
}) {
    const groups = useMemo(() => groupByDayAndUser(events), [events])
    return (
        <AdsPanel
            title='Change history'
            description={`Grouped by day and person${oldestStored ? ` · stored since ${formatDay(oldestStored)} ${oldestStored.slice(0, 4)}` : ''}`}
            actions={
                <Select value={user} onValueChange={onUser}>
                    <SelectTrigger
                        className='h-8 w-[200px]'
                        aria-label='Person'
                    >
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='all'>Everyone</SelectItem>
                        {users.map((email) => (
                            // Radix Select rejects an empty value; Google's
                            // own changes carry no email.
                            <SelectItem
                                key={email || GOOGLE_USER}
                                value={email || GOOGLE_USER}
                            >
                                {email || 'Google'}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            }
        >
            {groups.length === 0 ? (
                <AdsEmpty
                    title='No changes in this window'
                    description='Changes are stored from the first snapshot on; Google keeps only the last 30 days.'
                />
            ) : (
                <div>
                    {groups.map((group) => (
                        <ChangeGroup key={group.key} group={group} />
                    ))}
                </div>
            )}
        </AdsPanel>
    )
}

function TrackingPanel({ report }: { report: AdsTrackingReport }) {
    const recentLeads = report.days
        .slice(-TRACKING_GAP_DAYS)
        .reduce((sum, day) => sum + day.paidLeads, 0)
    const primary = report.actions.filter((action) => action.primaryForGoal)
    const secondary = report.actions.filter((action) => !action.primaryForGoal)
    return (
        <AdsPanel
            title='Tracking health'
            description='Primary actions feed the Conversions column bidding learns from'
        >
            <div className='space-y-4'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Conversion action</TableHead>
                            <TableHead className='text-right'>
                                Counted
                            </TableHead>
                            <TableHead className='text-right'>
                                Recorded
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...primary, ...secondary].map((action) => (
                            <TableRow
                                key={action.conversionActionId}
                                className={
                                    action.primaryForGoal
                                        ? undefined
                                        : 'text-muted-foreground'
                                }
                            >
                                <TableCell className='max-w-[240px]'>
                                    <span className='block truncate'>
                                        {action.actionName}
                                    </span>
                                    <span className='text-muted-foreground block text-xs'>
                                        {humanizeEnum(action.origin)} ·{' '}
                                        {action.primaryForGoal
                                            ? 'primary'
                                            : 'secondary'}
                                        {action.isCall ? ' · call' : ''}
                                    </span>
                                </TableCell>
                                <TableCell className='text-right tabular-nums'>
                                    {formatConversions(action.counted)}
                                </TableCell>
                                <TableCell className='text-right tabular-nums'>
                                    {formatConversions(action.recorded)}
                                </TableCell>
                            </TableRow>
                        ))}
                        <TableRow className='bg-gold-50'>
                            <TableCell>
                                <span className='font-semibold'>
                                    Paid leads in the website DB
                                </span>
                                <span className='text-muted-foreground block text-xs'>
                                    the number Google&apos;s form conversions
                                    should be close to
                                </span>
                            </TableCell>
                            <TableCell className='text-right font-semibold tabular-nums'>
                                {report.paidLeads}
                            </TableCell>
                            <TableCell className='text-right'>—</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                {report.alerts.length > 0 ? (
                    <AdsAttentionList items={report.alerts} />
                ) : (
                    <p className='text-muted-foreground text-sm'>
                        {recentLeads < TRACKING_GAP_MIN_LEADS
                            ? `Only ${recentLeads} paid lead${recentLeads === 1 ? '' : 's'} in the last ${TRACKING_GAP_DAYS} days of the window — too few to compare with Google's count.`
                            : `Google's counted form conversions are within ${Math.round(TRACKING_GAP_RATIO * 100)}% of paid leads over the last ${TRACKING_GAP_DAYS} days.`}
                    </p>
                )}
            </div>
        </AdsPanel>
    )
}

export function AdsChangesView() {
    const { range } = useAdsRange()
    const tracking = useAdsTracking(range)
    return (
        <div className='space-y-6'>
            <AdsHeader
                title='Changes & tracking'
                description="Account changes kept past Google's 30-day limit, and conversion tracking against real leads"
            />
            <div className='grid items-start gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]'>
                <ChangeFeed />
                <AdsQueryState query={tracking}>
                    {(report) => <TrackingPanel report={report} />}
                </AdsQueryState>
            </div>
        </div>
    )
}
