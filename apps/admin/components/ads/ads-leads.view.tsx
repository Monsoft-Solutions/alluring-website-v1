'use client'

/**
 * /ads/leads — which ad brought this person? Every paid Google lead with the
 * click behind it and how it was matched.
 */
import { useState } from 'react'
import Link from 'next/link'
import { Download } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
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

import { AdsHeader } from '@/components/ads/ads-header.component'
import { useAdsRange } from '@/components/ads/ads-range.context'
import {
    AdsChip,
    AdsEmpty,
    AdsPanel,
    AdsQueryState,
} from '@/components/ads/ads-ui.component'
import { MATCH_META, MATCH_ORDER } from '@/components/ads/ads-match.constant'
import { useAdsLeads } from '@/hooks/use-ads.hook'
import type { AdsLeadRow, LeadAdMatch } from '@/lib/types/ads/ads.type'
import {
    formatDay,
    formatWallTime,
    humanizeEnum,
} from '@/lib/utils/ads/ads-format.util'

export function MatchCoverageBar({
    coverage,
    total,
}: {
    coverage: Record<LeadAdMatch, number>
    total: number
}) {
    const parts = MATCH_ORDER.filter((match) => coverage[match] > 0)
    return (
        <div className='space-y-2'>
            <div
                className='flex h-3 overflow-hidden rounded-full bg-stone-100'
                role='img'
                aria-label={parts
                    .map(
                        (match) =>
                            `${coverage[match]} ${MATCH_META[match].legend}`
                    )
                    .join(', ')}
            >
                {parts.map((match) => (
                    <span
                        key={match}
                        className={MATCH_META[match].bar}
                        style={{ width: `${(coverage[match] / total) * 100}%` }}
                    />
                ))}
            </div>
            <div className='flex flex-wrap gap-x-4 gap-y-1 text-xs'>
                {MATCH_ORDER.filter(
                    (match) =>
                        coverage[match] > 0 ||
                        match === 'ios_click' ||
                        match === 'tagged_only'
                ).map((match) => (
                    <span
                        key={match}
                        className='inline-flex items-center gap-1.5'
                    >
                        <i
                            className={`inline-block h-2 w-2 rounded-sm ${MATCH_META[match].bar}`}
                        />
                        {MATCH_META[match].legend} · {coverage[match]}
                    </span>
                ))}
            </div>
        </div>
    )
}

function LeadRow({ lead }: { lead: AdsLeadRow }) {
    const meta = MATCH_META[lead.match]
    return (
        <TableRow>
            <TableCell>
                <Link
                    href={`/contacts/${lead.leadId}`}
                    className='font-medium hover:underline'
                >
                    {lead.name}
                </Link>
                <span className='text-muted-foreground block text-xs'>
                    {formatWallTime(lead.createdAt)}
                </span>
            </TableCell>
            <TableCell className='text-xs'>{lead.form || '—'}</TableCell>
            <TableCell className='text-xs'>{lead.procedure || '—'}</TableCell>
            <TableCell className='max-w-[220px]'>
                {lead.campaignName ? (
                    <span className='block truncate text-sm'>
                        {lead.campaignName}
                    </span>
                ) : lead.campaignId ? (
                    <span className='text-muted-foreground text-sm'>
                        Campaign {lead.campaignId}
                    </span>
                ) : (
                    <span className='text-muted-foreground'>—</span>
                )}
                {lead.adGroupName && (
                    <span className='text-muted-foreground block truncate text-xs'>
                        {lead.adGroupName}
                    </span>
                )}
            </TableCell>
            <TableCell className='max-w-[220px]'>
                {lead.keyword ? (
                    <>
                        <span className='block truncate text-sm'>
                            {lead.keyword}
                        </span>
                        <span className='text-muted-foreground block text-xs'>
                            {humanizeEnum(lead.keywordMatchType)}
                        </span>
                    </>
                ) : (
                    <span className='text-muted-foreground text-xs'>
                        {lead.match === 'click' ? 'none (PMax)' : '—'}
                    </span>
                )}
            </TableCell>
            <TableCell className='text-xs'>
                {lead.clickDate ? (
                    <>
                        {formatDay(lead.clickDate)}
                        <span className='text-muted-foreground block'>
                            {humanizeEnum(lead.device)} ·{' '}
                            {humanizeEnum(lead.network)}
                        </span>
                    </>
                ) : (
                    '—'
                )}
            </TableCell>
            <TableCell>
                <AdsChip
                    tone={meta.tone}
                    title={
                        lead.pending
                            ? 'Still looking the click up — retried hourly for 3 days'
                            : lead.clickIdSource === 'landing_url'
                              ? 'Click id recovered from the landing URL'
                              : undefined
                    }
                >
                    {meta.label}
                    {lead.pending && ' …'}
                </AdsChip>
            </TableCell>
        </TableRow>
    )
}

export function AdsLeadsView() {
    const { range, query: rangeQuery } = useAdsRange()
    const [match, setMatch] = useState<LeadAdMatch | 'all'>('all')
    const query = useAdsLeads(range, {
        match: match === 'all' ? undefined : match,
    })
    const exportHref = `/api/admin/ads/leads/export?${rangeQuery}${match === 'all' ? '' : `&match=${match}`}`

    return (
        <div className='space-y-6'>
            <AdsHeader
                title='Paid leads'
                description='Every lead with a Google Ads click, and what that click was'
            >
                <Select
                    value={match}
                    onValueChange={(value) =>
                        setMatch(value as LeadAdMatch | 'all')
                    }
                >
                    <SelectTrigger className='h-8 w-[150px]' aria-label='Match'>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='all'>Any match</SelectItem>
                        {MATCH_ORDER.map((value) => (
                            <SelectItem key={value} value={value}>
                                {MATCH_META[value].label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button variant='outline' size='sm' asChild>
                    <a href={exportHref}>
                        <Download className='mr-2 h-4 w-4' />
                        Export CSV
                    </a>
                </Button>
            </AdsHeader>
            <AdsQueryState query={query}>
                {(report) => (
                    <div className='space-y-4'>
                        <AdsPanel
                            title='How each lead was matched'
                            description={`${report.total} paid lead${report.total === 1 ? '' : 's'}`}
                        >
                            {report.total > 0 ? (
                                <MatchCoverageBar
                                    coverage={report.coverage}
                                    total={report.total}
                                />
                            ) : (
                                <p className='text-muted-foreground text-sm'>
                                    No paid leads in this window.
                                </p>
                            )}
                        </AdsPanel>
                        <AdsPanel contentClassName='p-0 sm:p-2'>
                            {report.leads.length === 0 ? (
                                <AdsEmpty title='No leads match' />
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Lead</TableHead>
                                            <TableHead>Form</TableHead>
                                            <TableHead>Procedure</TableHead>
                                            <TableHead>
                                                Campaign · ad group
                                            </TableHead>
                                            <TableHead>Keyword</TableHead>
                                            <TableHead>Click</TableHead>
                                            <TableHead>Match</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {report.leads.map((lead) => (
                                            <LeadRow
                                                key={lead.leadId}
                                                lead={lead}
                                            />
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </AdsPanel>
                        <p className='text-muted-foreground max-w-[80ch] text-xs'>
                            Google keeps click details for 90 days. An hourly
                            job resolves every new paid lead and stores the
                            answer, so a lead keeps its keyword long after
                            Google forgets the click. Older leads keep their
                            campaign when the landing URL carried{' '}
                            <code>gad_campaignid</code>.
                        </p>
                    </div>
                )}
            </AdsQueryState>
        </div>
    )
}
