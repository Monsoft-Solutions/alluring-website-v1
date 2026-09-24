'use client'

import Link from 'next/link'

import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table'

import { useAdsRange } from '@/components/ads/ads-range.context'
import {
    AdsChip,
    CPL_TONE_CLASS,
    type ChipTone,
} from '@/components/ads/ads-ui.component'
import type { AdsCampaignRow } from '@/lib/types/ads/ads.type'
import {
    costPerLeadTone,
    formatConversions,
    formatCount,
    formatMoney,
    formatMoneyWhole,
    humanizeEnum,
} from '@/lib/utils/ads/ads-format.util'
import { CPL_MIN_LEADS, costPerLead } from '@/lib/utils/ads/ads-attention.util'

const STATUS_TONES: Record<string, ChipTone> = {
    ENABLED: 'good',
    PAUSED: 'neutral',
    REMOVED: 'bad',
}

function subline(row: AdsCampaignRow): string {
    return [
        row.channel ? humanizeEnum(row.channel) : null,
        row.biddingStrategy ? humanizeEnum(row.biddingStrategy) : null,
        row.dailyBudget !== null
            ? `${formatMoneyWhole(row.dailyBudget)}/day`
            : null,
    ]
        .filter(Boolean)
        .join(' · ')
}

/**
 * Spend, Google's conversions and the website's paid leads per campaign.
 * "Google conv." is what Google bids on; "Leads" is the database — when they
 * disagree, tracking is off.
 */
export function AdsCampaignTable({
    campaigns,
    unassignedLeads = 0,
    baseline,
}: {
    campaigns: AdsCampaignRow[]
    unassignedLeads?: number
    baseline: number | null
}) {
    const { query } = useAdsRange()
    const total = campaigns.reduce(
        (acc, row) => ({
            cost: acc.cost + row.cost,
            clicks: acc.clicks + row.clicks,
            conversions: acc.conversions + row.googleConversions,
            leads: acc.leads + row.leads,
        }),
        { cost: 0, clicks: 0, conversions: 0, leads: 0 }
    )
    const totalLeads = total.leads + unassignedLeads

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='text-right'>Spend</TableHead>
                    <TableHead className='text-right'>Clicks</TableHead>
                    <TableHead className='text-right'>CPC</TableHead>
                    <TableHead className='text-right'>Google conv.</TableHead>
                    <TableHead className='text-right'>Leads</TableHead>
                    <TableHead className='text-right'>Cost / lead</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {campaigns.map((row) => {
                    const tone = costPerLeadTone(
                        row.costPerLead,
                        baseline,
                        row.leads,
                        row.cost
                    )
                    return (
                        <TableRow key={row.campaignId}>
                            <TableCell className='max-w-[280px]'>
                                <Link
                                    href={`/ads/campaigns/${row.campaignId}?${query}`}
                                    className='font-medium hover:underline'
                                >
                                    {row.campaignName}
                                </Link>
                                <span className='text-muted-foreground block truncate text-xs'>
                                    {subline(row)}
                                </span>
                            </TableCell>
                            <TableCell>
                                {row.status && (
                                    <AdsChip
                                        tone={
                                            STATUS_TONES[row.status] ??
                                            'neutral'
                                        }
                                    >
                                        {humanizeEnum(row.status)}
                                    </AdsChip>
                                )}
                            </TableCell>
                            <TableCell className='text-right tabular-nums'>
                                {row.cost > 0 ? formatMoney(row.cost) : '—'}
                            </TableCell>
                            <TableCell className='text-right tabular-nums'>
                                {formatCount(row.clicks)}
                            </TableCell>
                            <TableCell className='text-right tabular-nums'>
                                {formatMoney(row.cpc)}
                            </TableCell>
                            <TableCell className='text-right tabular-nums'>
                                {formatConversions(row.googleConversions)}
                            </TableCell>
                            <TableCell className='text-right font-medium tabular-nums'>
                                {formatCount(row.leads)}
                            </TableCell>
                            <TableCell
                                className={`text-right tabular-nums ${CPL_TONE_CLASS[tone]}`}
                                title={
                                    row.leads > 0 && row.leads < CPL_MIN_LEADS
                                        ? 'Small sample — a warning, not a verdict'
                                        : undefined
                                }
                            >
                                {row.costPerLead !== null
                                    ? formatMoneyWhole(row.costPerLead)
                                    : row.cost > 0
                                      ? 'no lead'
                                      : '—'}
                                {row.leads > 0 && row.leads < CPL_MIN_LEADS && (
                                    <sup className='text-muted-foreground ml-0.5'>
                                        *
                                    </sup>
                                )}
                            </TableCell>
                        </TableRow>
                    )
                })}
                {unassignedLeads > 0 && (
                    <TableRow className='text-muted-foreground'>
                        <TableCell>
                            Unassigned
                            <span className='block text-xs'>
                                tagged Google Ads, no campaign id
                            </span>
                        </TableCell>
                        <TableCell />
                        <TableCell className='text-right'>—</TableCell>
                        <TableCell className='text-right'>—</TableCell>
                        <TableCell className='text-right'>—</TableCell>
                        <TableCell className='text-right'>—</TableCell>
                        <TableCell className='text-right tabular-nums'>
                            {unassignedLeads}
                        </TableCell>
                        <TableCell className='text-right'>—</TableCell>
                    </TableRow>
                )}
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TableCell>Total</TableCell>
                    <TableCell />
                    <TableCell className='text-right tabular-nums'>
                        {formatMoney(total.cost)}
                    </TableCell>
                    <TableCell className='text-right tabular-nums'>
                        {formatCount(total.clicks)}
                    </TableCell>
                    <TableCell className='text-right tabular-nums'>
                        {formatMoney(
                            total.clicks > 0 ? total.cost / total.clicks : null
                        )}
                    </TableCell>
                    <TableCell className='text-right tabular-nums'>
                        {formatConversions(total.conversions)}
                    </TableCell>
                    <TableCell className='text-right tabular-nums'>
                        {formatCount(totalLeads)}
                    </TableCell>
                    <TableCell className='text-right tabular-nums'>
                        {formatMoneyWhole(costPerLead(total.cost, totalLeads))}
                    </TableCell>
                </TableRow>
            </TableFooter>
        </Table>
    )
}
