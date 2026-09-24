'use client'

/**
 * /ads — what did the money buy? Spend against the paid leads the website
 * stored, per day and per campaign, with what needs attention.
 */
import { AdsAttentionList } from '@/components/ads/ads-attention-list.component'
import { AdsCampaignTable } from '@/components/ads/ads-campaign-table.component'
import { AdsHeader } from '@/components/ads/ads-header.component'
import { useAdsRange } from '@/components/ads/ads-range.context'
import { AdsSpendChart } from '@/components/ads/ads-spend-chart.component'
import {
    AdsPanel,
    AdsQueryState,
    KpiRow,
    KpiTile,
} from '@/components/ads/ads-ui.component'
import { useAdsOverview } from '@/hooks/use-ads.hook'
import type { AdsOverview } from '@/lib/types/ads/ads.type'
import {
    formatConversions,
    formatCount,
    formatMoney,
    formatMoneyWhole,
    formatPercent,
    formatRange,
} from '@/lib/utils/ads/ads-format.util'

function OverviewKpis({ overview }: { overview: AdsOverview }) {
    const { kpis } = overview
    const multiple =
        kpis.costPerLead !== null && kpis.baselineCostPerLead
            ? Math.round((kpis.costPerLead / kpis.baselineCostPerLead) * 10) /
              10
            : null
    const matchRate =
        kpis.leads > 0 ? kpis.clickMatchedLeads / kpis.leads : null

    return (
        <KpiRow>
            <KpiTile
                label='Spend'
                value={formatMoney(kpis.cost)}
                note={`${formatCount(kpis.clicks)} clicks · ${formatMoney(kpis.cpc)} CPC`}
            />
            <KpiTile
                label='Paid leads'
                value={formatCount(kpis.leads)}
                note={`${formatCount(kpis.clickMatchedLeads)} matched to a click`}
                accent
            />
            <KpiTile
                label='Cost per lead'
                value={formatMoney(kpis.costPerLead)}
                note={
                    multiple === null
                        ? kpis.baselineCostPerLead
                            ? `Trailing 90 days: ${formatMoneyWhole(kpis.baselineCostPerLead)}`
                            : 'No earlier data to compare'
                        : `${multiple}× the 90 days before (${formatMoneyWhole(kpis.baselineCostPerLead)})`
                }
                noteTone={
                    multiple === null
                        ? undefined
                        : multiple >= 2
                          ? 'bad'
                          : multiple <= 1
                            ? 'good'
                            : undefined
                }
                accent
            />
            <KpiTile
                label='Google conversions'
                value={formatConversions(kpis.googleConversions)}
                note={`${formatConversions(kpis.formConversions)} forms · ${formatConversions(kpis.callConversions)} calls`}
            />
            <KpiTile
                label='Click match rate'
                value={formatPercent(matchRate)}
                note={`${formatCount(kpis.clickMatchedLeads)} of ${formatCount(kpis.leads)} leads`}
                noteTone={
                    matchRate === null
                        ? undefined
                        : matchRate >= 0.9
                          ? 'good'
                          : 'bad'
                }
            />
        </KpiRow>
    )
}

export function AdsOverviewView() {
    const { range } = useAdsRange()
    const query = useAdsOverview(range)

    return (
        <div className='space-y-6'>
            <AdsHeader
                title='Ads'
                description='Google Ads spend against the leads it produced'
            />
            <AdsQueryState query={query}>
                {(overview) => (
                    <div className='space-y-4'>
                        <OverviewKpis overview={overview} />
                        <div className='grid items-start gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]'>
                            <AdsPanel
                                title='Daily spend and leads'
                                description={formatRange(range.from, range.to)}
                            >
                                <AdsSpendChart
                                    daily={overview.daily}
                                    markers={overview.changeMarkers}
                                />
                            </AdsPanel>
                            <AdsPanel
                                title='Needs attention'
                                description={`${overview.attention.length} item${overview.attention.length === 1 ? '' : 's'}`}
                            >
                                <AdsAttentionList items={overview.attention} />
                            </AdsPanel>
                        </div>
                        <AdsPanel
                            title='Campaigns'
                            description='Leads are website leads matched by click id or campaign id; cost per lead is coloured against the 90 days before the window. * fewer than 3 leads.'
                            contentClassName='p-0 sm:p-2'
                        >
                            <AdsCampaignTable
                                campaigns={overview.campaigns}
                                unassignedLeads={overview.unassignedLeads}
                                baseline={overview.kpis.baselineCostPerLead}
                            />
                        </AdsPanel>
                        <p className='text-muted-foreground max-w-[80ch] text-xs'>
                            Attribution is last paid click — the one touch the
                            site stores per lead. &ldquo;Google conv.&rdquo; is
                            Google&apos;s Conversions column (what bidding
                            learns from); &ldquo;Leads&rdquo; comes from the
                            website database.
                        </p>
                    </div>
                )}
            </AdsQueryState>
        </div>
    )
}
