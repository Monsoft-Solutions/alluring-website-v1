import { NextResponse } from 'next/server'
import { db } from '@workspace/db/client'
import { contactSubmission } from '@workspace/db/schema/contact'
import { desc } from 'drizzle-orm'

export async function GET() {
    try {
        const contacts = await db
            .select({
                id: contactSubmission.id,
                name: contactSubmission.name,
                firstName: contactSubmission.firstName,
                lastName: contactSubmission.lastName,
                email: contactSubmission.email,
                phone: contactSubmission.phone,
                subject: contactSubmission.subject,
                message: contactSubmission.message,
                procedure: contactSubmission.procedure,
                preferredContactTime: contactSubmission.preferredContactTime,
                source: contactSubmission.source,
                utmSource: contactSubmission.utmSource,
                utmMedium: contactSubmission.utmMedium,
                utmCampaign: contactSubmission.utmCampaign,
                utmContent: contactSubmission.utmContent,
                utmTerm: contactSubmission.utmTerm,
                gclid: contactSubmission.gclid,
                fbclid: contactSubmission.fbclid,
                ttclid: contactSubmission.ttclid,
                referrer: contactSubmission.referrer,
                landingPage: contactSubmission.landingPage,
                ipAddress: contactSubmission.ipAddress,
                createdAt: contactSubmission.createdAt,
            })
            .from(contactSubmission)
            .orderBy(desc(contactSubmission.createdAt))

        // Generate CSV
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
            escapeCSV(contact.message ?? ''),
            contact.procedure ?? '',
            contact.preferredContactTime ?? '',
            contact.source ?? '',
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
