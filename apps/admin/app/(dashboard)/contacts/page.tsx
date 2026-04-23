import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table'
import { Mail, Phone, Eye, Download } from 'lucide-react'
import Link from 'next/link'

import { ContactsFilterBar } from '@/components/contacts/contacts-filter-bar.component'
import {
    getContactsPageData,
    parseContactFilters,
} from '@/lib/queries/contacts-filters'
import type {
    ClassifiedContactListItem,
    ContactListItem,
} from '@/lib/types/contacts/contacts.type'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export const metadata = {
    title: 'Contact Submissions | Admin',
    description: 'View and manage contact form submissions',
}

const PAGE_SIZE = 10
const MAX_PAGE = 1000

type SearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function ContactsPage({
    searchParams,
}: {
    searchParams: SearchParams
}) {
    const params = await searchParams

    let page = Number(params.page)
    if (!Number.isInteger(page) || !Number.isFinite(page) || page < 1) page = 1
    page = Math.min(page, MAX_PAGE)

    const filters = parseContactFilters(params)
    const { contacts, total, sourceOptions, mediumOptions } =
        await getContactsPageData(filters)

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
    const safePage = Math.min(page, totalPages)
    const pageStart = (safePage - 1) * PAGE_SIZE
    const pageContacts = contacts.slice(pageStart, pageStart + PAGE_SIZE)

    const hasFilterState =
        filters.sources.length > 0 ||
        filters.mediums.length > 0 ||
        filters.dateRangePreset !== '28d'

    const exportHref = buildExportHref(params)
    const pageHref = (targetPage: number) => buildPageHref(params, targetPage)

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-2xl font-semibold'>
                        Contact Submissions
                    </h1>
                    <p className='text-muted-foreground'>
                        View contact form submissions with UTM tracking ({total}{' '}
                        total)
                    </p>
                </div>
                <Button variant='outline' asChild>
                    <a href={exportHref} download>
                        <Download className='mr-2 h-4 w-4' />
                        Export CSV
                    </a>
                </Button>
            </div>

            <ContactsFilterBar
                sourceOptions={sourceOptions}
                mediumOptions={mediumOptions}
                selectedSources={filters.sources}
                selectedMediums={filters.mediums}
                dateRangePreset={filters.dateRangePreset}
                startDate={filters.startDate}
                endDate={filters.endDate}
            />

            <Card>
                <CardContent className='p-0'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Contact</TableHead>
                                <TableHead>Subject / Procedure</TableHead>
                                <TableHead>Attribution</TableHead>
                                <TableHead>UTM</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className='w-[100px]'>
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pageContacts.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className='text-muted-foreground py-10 text-center'
                                    >
                                        {hasFilterState ? (
                                            <div className='space-y-2'>
                                                <p>
                                                    No contacts match these
                                                    filters.
                                                </p>
                                                <Link
                                                    href='/contacts'
                                                    className='text-foreground underline-offset-4 hover:underline'
                                                >
                                                    Clear filters
                                                </Link>
                                            </div>
                                        ) : (
                                            'No contact submissions yet'
                                        )}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pageContacts.map((contact) => (
                                    <TableRow key={contact.id}>
                                        <TableCell>
                                            <div className='space-y-1'>
                                                <p className='font-medium'>
                                                    {contact.firstName &&
                                                    contact.lastName
                                                        ? `${contact.firstName} ${contact.lastName}`
                                                        : contact.name}
                                                </p>
                                                <div className='text-muted-foreground flex items-center gap-1 text-sm'>
                                                    <Mail className='h-3 w-3' />
                                                    <a
                                                        href={`mailto:${contact.email}`}
                                                        className='hover:text-foreground'
                                                    >
                                                        {contact.email}
                                                    </a>
                                                </div>
                                                {contact.phone && (
                                                    <div className='text-muted-foreground flex items-center gap-1 text-sm'>
                                                        <Phone className='h-3 w-3' />
                                                        <a
                                                            href={`tel:${contact.phone}`}
                                                            className='hover:text-foreground'
                                                        >
                                                            {contact.phone}
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className='space-y-1'>
                                                {contact.subject && (
                                                    <p className='text-sm font-medium'>
                                                        {contact.subject}
                                                    </p>
                                                )}
                                                {contact.procedure && (
                                                    <Badge
                                                        variant='secondary'
                                                        className='text-xs'
                                                    >
                                                        {contact.procedure}
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <AttributionCell
                                                contact={contact}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <UtmBadges contact={contact} />
                                        </TableCell>
                                        <TableCell>
                                            <span className='text-muted-foreground text-sm'>
                                                {formatDate(contact.createdAt)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className='flex items-center gap-1'>
                                                <Button
                                                    variant='ghost'
                                                    size='sm'
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/contacts/${contact.id}`}
                                                    >
                                                        <Eye className='h-4 w-4' />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant='ghost'
                                                    size='sm'
                                                    asChild
                                                >
                                                    <a
                                                        href={`mailto:${contact.email}`}
                                                    >
                                                        <Mail className='h-4 w-4' />
                                                    </a>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {totalPages > 1 && (
                <div className='flex items-center justify-center gap-2'>
                    <Button
                        variant='outline'
                        size='sm'
                        disabled={safePage <= 1}
                        asChild={safePage > 1}
                    >
                        {safePage > 1 ? (
                            <Link href={pageHref(safePage - 1)}>Previous</Link>
                        ) : (
                            <span>Previous</span>
                        )}
                    </Button>
                    <span className='text-muted-foreground text-sm'>
                        Page {safePage} of {totalPages}
                    </span>
                    <Button
                        variant='outline'
                        size='sm'
                        disabled={safePage >= totalPages}
                        asChild={safePage < totalPages}
                    >
                        {safePage < totalPages ? (
                            <Link href={pageHref(safePage + 1)}>Next</Link>
                        ) : (
                            <span>Next</span>
                        )}
                    </Button>
                </div>
            )}
        </div>
    )
}

function AttributionCell({ contact }: { contact: ClassifiedContactListItem }) {
    return (
        <div className='flex flex-col gap-1'>
            <div className='flex items-center gap-1'>
                <Badge variant='secondary' className='text-xs'>
                    {contact.attribution.source}
                </Badge>
                <Badge variant='outline' className='text-xs'>
                    {contact.attribution.medium}
                </Badge>
            </div>
            {contact.source &&
                contact.source !== contact.attribution.source && (
                    <span className='text-muted-foreground text-xs'>
                        raw: {contact.source}
                    </span>
                )}
        </div>
    )
}

function UtmBadges({ contact }: { contact: ContactListItem }) {
    const hasUtm =
        contact.utmSource ||
        contact.utmMedium ||
        contact.utmCampaign ||
        contact.gclid ||
        contact.fbclid ||
        contact.ttclid

    if (!hasUtm) {
        return <span className='text-muted-foreground text-xs'>—</span>
    }

    return (
        <div className='flex flex-wrap gap-1'>
            {contact.utmSource && (
                <Badge variant='outline' className='text-xs'>
                    {contact.utmSource}
                </Badge>
            )}
            {contact.gclid && (
                <Badge variant='outline' className='bg-blue-50 text-xs'>
                    Google
                </Badge>
            )}
            {contact.fbclid && (
                <Badge variant='outline' className='bg-indigo-50 text-xs'>
                    Meta
                </Badge>
            )}
            {contact.ttclid && (
                <Badge variant='outline' className='bg-pink-50 text-xs'>
                    TikTok
                </Badge>
            )}
        </div>
    )
}

function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(date))
}

function serializeParams(
    params: Record<string, string | string[] | undefined>
): URLSearchParams {
    const out = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
        if (value === undefined) continue
        if (Array.isArray(value)) {
            for (const v of value) if (v) out.append(key, v)
        } else {
            if (value) out.set(key, value)
        }
    }
    return out
}

function buildPageHref(
    params: Record<string, string | string[] | undefined>,
    targetPage: number
): string {
    const next = serializeParams(params)
    if (targetPage <= 1) next.delete('page')
    else next.set('page', String(targetPage))
    const query = next.toString()
    return query ? `/contacts?${query}` : '/contacts'
}

function buildExportHref(
    params: Record<string, string | string[] | undefined>
): string {
    const next = serializeParams(params)
    next.delete('page')
    const query = next.toString()
    return query ? `/api/contacts/export?${query}` : '/api/contacts/export'
}
