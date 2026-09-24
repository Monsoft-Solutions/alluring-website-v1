import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { getAdsLeads } from '@/lib/queries/ads/ads-leads.query'
import {
    numericParam,
    parseAdsRange,
    parseMatch,
} from '@/lib/utils/ads/ads-route.util'
import { isAuthenticated } from '@/lib/utils/auth.util'

export const runtime = 'nodejs'

const HEADERS = [
    'Lead ID',
    'Name',
    'Created (Miami)',
    'Form',
    'Procedure',
    'Match',
    'Pending',
    'Click ID type',
    'Click ID from',
    'Click date',
    'Campaign ID',
    'Campaign',
    'Ad group',
    'Keyword',
    'Keyword match type',
    'Device',
    'Network',
    'Landing path',
]

/**
 * Quote a CSV cell. A leading `=`, `+`, `-`, `@`, tab or carriage return
 * gets a `'` so a spreadsheet shows the text instead of running it as a
 * formula (lead names come from a public form).
 */
function cell(value: string | null | boolean): string {
    const text = value === null ? '' : String(value)
    const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text
    return `"${safe.replace(/"/g, '""').replace(/[\r\n]+/g, ' ')}"`
}

/**
 * GET /api/admin/ads/leads/export?from&to[&match][&campaignId]
 * The paid-leads table as CSV. Same auth as the contacts export.
 */
export async function GET(request: NextRequest) {
    try {
        if (!(await isAuthenticated())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const searchParams = request.nextUrl.searchParams
        const parsed = parseAdsRange(searchParams)
        if ('error' in parsed) return parsed.error

        const { leads } = await getAdsLeads(parsed.range, {
            match: parseMatch(searchParams.get('match')),
            campaignId: numericParam(searchParams, 'campaignId'),
        })

        const rows = leads.map((lead) =>
            [
                lead.leadId,
                lead.name,
                lead.createdAt.replace('T', ' '),
                lead.form,
                lead.procedure,
                lead.match,
                lead.pending,
                lead.clickIdType,
                lead.clickIdSource,
                lead.clickDate,
                lead.campaignId,
                lead.campaignName,
                lead.adGroupName,
                lead.keyword,
                lead.keywordMatchType,
                lead.device,
                lead.network,
                lead.landingPath,
            ]
                .map(cell)
                .join(',')
        )

        const csv = [HEADERS.map(cell).join(','), ...rows].join('\n')
        const filename = `paid-leads-${parsed.range.from}-to-${parsed.range.to}.csv`

        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        })
    } catch (error) {
        console.error('Error exporting paid leads:', error)
        return NextResponse.json(
            { error: 'Failed to export paid leads' },
            { status: 500 }
        )
    }
}
