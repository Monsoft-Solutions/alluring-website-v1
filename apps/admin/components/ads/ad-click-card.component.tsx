/**
 * "Ad click" card on /contacts/[id]: which Google Ads click brought this
 * lead, as the lead click resolver stored it (epic #288). Server-rendered.
 */
import Link from 'next/link'
import { Target } from 'lucide-react'

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'

import { MATCH_META } from '@/components/ads/ads-match.constant'
import { AdsChip } from '@/components/ads/ads-ui.component'
import type { ContactAdClick } from '@/lib/types/ads/ads.type'
import {
    formatDay,
    formatWallTime,
    humanizeEnum,
} from '@/lib/utils/ads/ads-format.util'

function clickTiming(click: ContactAdClick): string | null {
    if (!click.clickDate) return null
    if (click.clickDate === click.leadDate) {
        return `${formatDay(click.clickDate)}, same day as the lead`
    }
    const days = Math.round(
        (Date.parse(`${click.leadDate}T12:00:00Z`) -
            Date.parse(`${click.clickDate}T12:00:00Z`)) /
            86_400_000
    )
    return `${formatDay(click.clickDate)}, ${days} day${days === 1 ? '' : 's'} before the lead`
}

function Field({ label, value }: { label: string; value: string | null }) {
    return (
        <div className='min-w-0'>
            <dt className='text-muted-foreground text-[11px] tracking-wider uppercase'>
                {label}
            </dt>
            <dd className='mt-0.5 font-medium break-words'>{value ?? '—'}</dd>
        </div>
    )
}

export function AdClickCard({ click }: { click: ContactAdClick }) {
    const meta = MATCH_META[click.match]
    const note = click.pending
        ? `Still looking the click up (attempt ${click.attempts}); retried hourly for 3 days.`
        : click.clickIdSource === 'landing_url'
          ? 'Click id recovered from the landing URL.'
          : null

    return (
        <Card>
            <CardHeader>
                <CardTitle className='flex flex-wrap items-center gap-2'>
                    <Target className='h-5 w-5' />
                    Ad click
                    <AdsChip tone={meta.tone}>{meta.label}</AdsChip>
                </CardTitle>
                <CardDescription>
                    {meta.legend}
                    {note ? ` · ${note}` : ''}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <dl className='grid grid-cols-2 gap-x-6 gap-y-3 text-sm md:grid-cols-3'>
                    <Field
                        label='Campaign'
                        value={
                            click.campaignName ??
                            (click.campaignId
                                ? `Campaign ${click.campaignId}`
                                : null)
                        }
                    />
                    <Field label='Ad group' value={click.adGroupName} />
                    <Field
                        label='Keyword'
                        value={
                            click.keyword
                                ? `${click.keyword} · ${humanizeEnum(click.keywordMatchType).toLowerCase()}`
                                : click.match === 'click'
                                  ? 'none (Performance Max)'
                                  : null
                        }
                    />
                    <Field label='Clicked' value={clickTiming(click)} />
                    <Field
                        label='Device · network'
                        value={
                            click.device
                                ? `${humanizeEnum(click.device)} · ${humanizeEnum(click.network)}`
                                : null
                        }
                    />
                    <Field label='Landed on' value={click.landingPath} />
                </dl>
                <p className='text-muted-foreground mt-4 text-xs'>
                    {click.resolvedAt
                        ? `Resolved ${formatWallTime(click.resolvedAt)}.`
                        : 'Not final yet.'}{' '}
                    {click.campaignId && (
                        <Link
                            href={`/ads/campaigns/${click.campaignId}`}
                            className='text-gold-700 hover:underline'
                        >
                            Open the campaign in the Ads console
                        </Link>
                    )}
                </p>
            </CardContent>
        </Card>
    )
}
