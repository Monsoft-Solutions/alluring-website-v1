import { notFound } from 'next/navigation'

import { AdsCampaignDetailView } from '@/components/ads/ads-campaigns.view'

export const metadata = {
    title: 'Ads campaign | Admin',
}

type PageProps = { params: Promise<{ id: string }> }

export default async function AdsCampaignPage({ params }: PageProps) {
    const { id } = await params
    if (!/^\d+$/.test(id)) notFound()
    return <AdsCampaignDetailView campaignId={id} />
}
