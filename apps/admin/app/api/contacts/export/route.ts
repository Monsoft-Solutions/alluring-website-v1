import { NextResponse, type NextRequest } from 'next/server'

import {
    getFilteredClassifiedContacts,
    parseContactFilters,
} from '@/lib/queries/contacts-filters'
import { isAuthenticated } from '@/lib/utils/auth.util'

export async function GET(request: NextRequest) {
    try {
        const authenticated = await isAuthenticated()
        if (!authenticated) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const filters = parseContactFilters(request.nextUrl.searchParams)
        const { contacts } = await getFilteredClassifiedContacts(filters)

        const headers = [
            'ID',
            'Name',
            'First Name',
            'Last Name',
            'Email',
            'Phone',
            'Subject',
            'Message',
            'Procedure',
            'Preferred Contact Time',
            'Source',
            'Classified Source',
            'Classified Medium',
            'Classification',
            'UTM Source',
            'UTM Medium',
            'UTM Campaign',
            'UTM Content',
            'UTM Term',
            'Google Ads ID',
            'Facebook Ads ID',
            'TikTok Ads ID',
            'Referrer',
            'Landing Page',
            'IP Address',
            'Created At',
        ]

        const rows = contacts.map((contact) => [
            contact.id,
            contact.name,
            contact.firstName ?? '',
            contact.lastName ?? '',
            contact.email,
            contact.phone ?? '',
            contact.subject ?? '',
            contact.message ?? '',
            contact.procedure ?? '',
            contact.preferredContactTime ?? '',
            contact.source ?? '',
            contact.attribution.source,
            contact.attribution.medium,
            contact.attribution.classification,
            contact.utmSource ?? '',
            contact.utmMedium ?? '',
            contact.utmCampaign ?? '',
            contact.utmContent ?? '',
            contact.utmTerm ?? '',
            contact.gclid ?? '',
            contact.fbclid ?? '',
            contact.ttclid ?? '',
            contact.referrer ?? '',
            contact.landingPage ?? '',
            contact.ipAddress ?? '',
            new Date(contact.createdAt).toISOString(),
        ])

        const csv = [
            headers.join(','),
            ...rows.map((row) =>
                row.map((cell) => `"${escapeCSV(String(cell))}"`).join(',')
            ),
        ].join('\n')

        const filename = `contacts-export-${new Date().toISOString().split('T')[0]}.csv`

        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        })
    } catch (error) {
        console.error('Error exporting contacts:', error)
        return NextResponse.json(
            { error: 'Failed to export contacts' },
            { status: 500 }
        )
    }
}

function escapeCSV(value: string): string {
    return value.replace(/"/g, '""').replace(/\n/g, ' ').replace(/\r/g, '')
}
