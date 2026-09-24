'use client'

/**
 * /ads/campaigns and /ads/campaigns/[id]: every campaign's spend against its
 * leads, and one campaign's trend, keywords, terms, pages and lead mix.
 */
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'

import { AdsCampaignTable } from '@/components/ads/ads-campaign-table.component'
import { AdsHeader } from '@/components/ads/ads-header.component'
import {
    AdsKeywordsTable,
    AdsLandingPagesTable,
    AdsSearchTermsTable,
} from '@/components/ads/ads-keywords.view'
import { useAdsRange } from '@/components/ads/ads-range.context'
import { AdsSpendChart } from '@/components/ads/ads-spend-chart.component'
import {
    AdsEmpty,
    AdsPanel,
    AdsQueryState,
    KpiRow,
    KpiTile,
} from '@/components/ads/ads-ui.component'
import {
    useAdsCampaignDetail,
    useAdsCampaigns,
    useAdsKeywords,
    useAdsLandingPages,
    useAdsSearchTerms,
} from '@/hooks/use-ads.hook'
import type { AdsLeadMixEntry } from '@/lib/types/ads/ads.type'
import {
    formatConversions,
    formatCount,
    formatMoney,
    formatMoneyWhole,
    formatRange,
    humanizeEnum,
} from '@/lib/utils/ads/ads-format.util'

export function AdsCampaignsView() {
    const { range } = useAdsRange()
    const query = useAdsCampaigns(range)
    return (
        <div className='space-y-6'>
            <AdsHeader
                title='Campaigns'
                description='Spend, Google conversions and paid leads per campaign'
            />
            <AdsQueryState query={query}>
                {(data) =>
                    data.campaigns.length === 0 ? (
                        <AdsPanel>
                            <AdsEmpty
                                title='No campaign spent or produced a lead'
                                description={formatRange(range.from, range.to)}
                            />
                        </AdsPanel>
                    ) : (
                        <AdsPanel contentClassName='p-0 sm:p-2'>
                            <AdsCampaignTable
                                campaigns={data.campaigns}
                                baseline={data.baselineCostPerLead}
                            />
                        </AdsPanel>
                    )
                }
            </AdsQueryState>
        </div>
    )
}

function LeadMix({
    title,
    entries,
}: {
    title: string
    entries: AdsLeadMixEntry[]
}) {
    const total = entries.reduce((sum, entry) => sum + entry.leads, 0)
    return (
        <div className='min-w-0'>
            <h3 className='text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase'>
                {title}
            </h3>
            {entries.length === 0 ? (
                <p className='text-muted-foreground text-sm'>No leads.</p>
            ) : (
                <ul className='grid gap-1.5'>
                    {entries.slice(0, 6).map((entry) => (
                        <li key={entry.value} className='text-sm'>
                            <div className='flex justify-between gap-2'>
                                <span className='truncate'>{entry.value}</span>
                                <span className='tabular-nums'>
                                    {entry.leads}
                                </span>
                            </div>
                            <div className='mt-0.5 h-1.5 overflow-hidden rounded-full bg-stone-100'>
                                <div
                                    className='bg-gold-400 h-full'
                                    style={{
                                        width: `${Math.round((entry.leads / total) * 100)}%`,
                                    }}
                                />
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export function AdsCampaignDetailView({ campaignId }: { campaignId: string }) {
    const { range } = useAdsRange()
    const detail = useAdsCampaignDetail(range, campaignId)
    const keywords = useAdsKeywords(range, campaignId)
    const terms = useAdsSearchTerms(range, campaignId)
    const pages = useAdsLandingPages(range, { campaignId })

    const name =
        detail.data?.configured && detail.data.data
            ? detail.data.data.campaign.campaignName
            : 'Campaign'

    return (
        <div className='space-y-6'>
            <Button variant='ghost' size='sm' asChild className='-ml-2'>
                <Link href='/ads/campaigns'>
                    <ArrowLeft className='mr-2 h-4 w-4' />
                    Campaigns
                </Link>
            </Button>
            <AdsHeader title={name} description={`Campaign ${campaignId}`} />
            <AdsQueryState query={detail}>
                {(data) =>
                    data ? (
                        <div className='space-y-4'>
                            <KpiRow>
                                <KpiTile
                                    label='Spend'
                                    value={formatMoney(data.campaign.cost)}
                                    note={`${formatCount(data.campaign.clicks)} clicks · ${formatMoney(data.campaign.cpc)} CPC`}
                                />
                                <KpiTile
                                    label='Paid leads'
                                    value={formatCount(data.campaign.leads)}
                                    accent
                                />
                                <KpiTile
                                    label='Cost per lead'
                                    value={formatMoneyWhole(
                                        data.campaign.costPerLead
                                    )}
                                    accent
                                />
                                <KpiTile
                                    label='Google conversions'
                                    value={formatConversions(
                                        data.campaign.googleConversions
                                    )}
                                />
                                <KpiTile
                                    label='Setup'
                                    value={humanizeEnum(data.campaign.status)}
                                    note={[
                                        humanizeEnum(data.campaign.channel),
                                        data.campaign.dailyBudget !== null
                                            ? `${formatMoneyWhole(data.campaign.dailyBudget)}/day`
                                            : null,
                                    ]
                                        .filter(Boolean)
                                        .join(' · ')}
                                />
                            </KpiRow>
                            <AdsPanel
                                title='Daily spend and leads'
                                description={formatRange(range.from, range.to)}
                            >
                                <AdsSpendChart
                                    daily={data.daily}
                                    markers={[]}
                                />
                            </AdsPanel>
                            <AdsPanel
                                title='Who the leads were'
                                description="What this campaign's leads asked for — its lead quality."
                            >
                                <div className='grid gap-6 md:grid-cols-3'>
                                    <LeadMix
                                        title='Procedure'
                                        entries={data.leadMix.procedure}
                                    />
                                    <LeadMix
                                        title='Timeline'
                                        entries={data.leadMix.timeline}
                                    />
                                    <LeadMix
                                        title='Financing interest'
                                        entries={data.leadMix.financingInterest}
                                    />
                                </div>
                            </AdsPanel>
                            {data.campaign.channel !== 'PERFORMANCE_MAX' && (
                                <>
                                    <AdsPanel
                                        title='Keywords'
                                        contentClassName='p-0 sm:p-2'
                                    >
                                        <AdsQueryState
                                            query={keywords}
                                            loading={
                                                <p className='p-4 text-sm'>
                                                    Loading…
                                                </p>
                                            }
                                        >
                                            {(report) => (
                                                <AdsKeywordsTable
                                                    keywords={report.keywords}
                                                    hideCampaign
                                                />
                                            )}
                                        </AdsQueryState>
                                    </AdsPanel>
                                    <AdsPanel
                                        title='Search terms'
                                        contentClassName='p-0 sm:p-2'
                                    >
                                        <AdsQueryState
                                            query={terms}
                                            loading={
                                                <p className='p-4 text-sm'>
                                                    Loading…
                                                </p>
                                            }
                                        >
                                            {(report) => (
                                                <AdsSearchTermsTable
                                                    terms={report.terms}
                                                    hideCampaign
                                                />
                                            )}
                                        </AdsQueryState>
                                    </AdsPanel>
                                </>
                            )}
                            <AdsPanel
                                title='Landing pages'
                                contentClassName='p-0 sm:p-2'
                            >
                                <AdsQueryState
                                    query={pages}
                                    loading={
                                        <p className='p-4 text-sm'>Loading…</p>
                                    }
                                >
                                    {(report) => (
                                        <AdsLandingPagesTable
                                            pages={report.pages}
                                        />
                                    )}
                                </AdsQueryState>
                            </AdsPanel>
                        </div>
                    ) : (
                        <AdsPanel>
                            <AdsEmpty
                                title='Campaign not found'
                                description='The snapshot has no rows for this campaign id.'
                            />
                        </AdsPanel>
                    )
                }
            </AdsQueryState>
        </div>
    )
}
