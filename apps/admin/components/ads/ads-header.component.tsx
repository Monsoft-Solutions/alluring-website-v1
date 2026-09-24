'use client'

/**
 * The header every /ads screen shares: title, the last sync, the date window
 * and a "Sync now" button.
 */
import type { ReactNode } from 'react'
import { Calendar, Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@workspace/ui/components/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select'
import { cn } from '@workspace/ui/lib/utils'

import {
    ADS_RANGE_PRESETS,
    useAdsRange,
    type AdsRangePreset,
} from '@/components/ads/ads-range.context'
import { CustomDateRangePicker } from '@/components/analytics/leads/custom-date-range-picker.component'
import { useAdsStatus, useAdsSync } from '@/hooks/use-ads.hook'
import {
    formatClock,
    formatCount,
    formatDay,
    isoToLocalDate,
} from '@/lib/utils/ads/ads-format.util'

function SyncStatus() {
    const { data } = useAdsStatus()
    const status = data?.configured ? data.data : null
    const snapshot = status?.snapshot
    if (!snapshot) return null

    const failed = snapshot.status === 'failed'
    const running = snapshot.status === 'running'
    const when = snapshot.finishedAt ?? snapshot.startedAt
    const today = when.slice(0, 10)
    const label = failed
        ? `Sync failed ${formatDay(today)} ${formatClock(when)}`
        : running
          ? 'Syncing…'
          : `Synced ${formatDay(today)} ${formatClock(when)}`

    const detail = [
        snapshot.error,
        status.leadClicks?.finishedAt
            ? `Lead clicks resolved ${formatDay(status.leadClicks.finishedAt.slice(0, 10))} ${formatClock(status.leadClicks.finishedAt)}`
            : null,
        `${formatCount(status.operationsToday)} API operations today (2,880 allowed)`,
        status.earliestDate
            ? `Snapshot holds ${formatDay(status.earliestDate)} ${status.earliestDate.slice(0, 4)} – ${formatDay(status.latestDate)}`
            : null,
    ]
        .filter(Boolean)
        .join('\n')

    return (
        <span
            title={detail}
            className={cn(
                'inline-flex items-center gap-1.5 text-xs',
                failed ? 'text-rose-700' : 'text-emerald-700'
            )}
        >
            <span
                aria-hidden
                className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    failed ? 'bg-rose-600' : 'bg-emerald-600'
                )}
            />
            {label}
        </span>
    )
}

function SyncNowButton() {
    const sync = useAdsSync()
    return (
        <Button
            variant='outline'
            size='sm'
            disabled={sync.isPending}
            onClick={() =>
                sync.mutate(undefined, {
                    onSuccess: (result) => {
                        const leads = result.data?.leadClicks
                        toast.success(
                            `Synced — ${leads ? `${leads.written} lead matches updated, ` : ''}${
                                (result.data?.snapshot.apiOperations ?? 0) +
                                (leads?.apiOperations ?? 0)
                            } API operations`
                        )
                    },
                    onError: (error) =>
                        toast.error(
                            error instanceof Error
                                ? error.message
                                : 'Sync failed'
                        ),
                })
            }
        >
            {sync.isPending ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
                <RefreshCw className='mr-2 h-4 w-4' />
            )}
            Sync now
        </Button>
    )
}

export function AdsRangeControls() {
    const { range, preset, setPreset, setCustomRange } = useAdsRange()
    return (
        <div className='flex flex-wrap items-center gap-2'>
            <Select
                value={preset}
                onValueChange={(value) => {
                    const next = value as AdsRangePreset
                    if (next !== 'custom') setPreset(next)
                    else
                        setCustomRange(
                            isoToLocalDate(range.from),
                            isoToLocalDate(range.to)
                        )
                }}
            >
                <SelectTrigger
                    className='h-8 w-[150px]'
                    aria-label='Date range'
                >
                    <Calendar className='mr-2 h-4 w-4' />
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {ADS_RANGE_PRESETS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {preset === 'custom' && (
                <CustomDateRangePicker
                    startDate={isoToLocalDate(range.from)}
                    endDate={isoToLocalDate(range.to)}
                    onChange={setCustomRange}
                />
            )}
        </div>
    )
}

export function AdsHeader({
    title,
    description,
    children,
}: {
    title: ReactNode
    description: ReactNode
    /** Extra controls, placed before the date window. */
    children?: ReactNode
}) {
    return (
        <header className='flex flex-col gap-3 2xl:flex-row 2xl:items-end 2xl:justify-between'>
            <div className='min-w-0'>
                <h1 className='font-serif text-3xl'>{title}</h1>
                <p className='text-muted-foreground text-sm'>{description}</p>
            </div>
            <div className='flex flex-wrap items-center gap-2'>
                <SyncStatus />
                {children}
                <AdsRangeControls />
                <SyncNowButton />
            </div>
        </header>
    )
}
