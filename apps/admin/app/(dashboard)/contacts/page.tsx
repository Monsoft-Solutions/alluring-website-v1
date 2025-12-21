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

import { getContacts } from '@/lib/queries/contacts.query'
import type { ContactListItem } from '@/lib/types/contacts/contacts.type'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export const metadata = {
    title: 'Contact Submissions | Admin',
    description: 'View and manage contact form submissions',
}

type SearchParams = Promise<{ page?: string }>

export default async function ContactsPage({
    searchParams,
}: {
    searchParams: SearchParams
}) {
    const params = await searchParams

    const MAX_PAGE = 1000
    let page = Number(params.page)

    // Validate: ensure it's a finite integer and positive
    if (!Number.isInteger(page) || !Number.isFinite(page) || page < 1) {
        page = 1
    }

    // Clamp to safe range
    page = Math.min(page, MAX_PAGE)

    const { contacts, total } = await getContacts(page, 10)
    const totalPages = Math.ceil(total / 10)

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
                    <a href='/api/contacts/export' download>
                        <Download className='mr-2 h-4 w-4' />
                        Export CSV
                    </a>
                </Button>
            </div>

            <Card>
                <CardContent className='p-0'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Contact</TableHead>
                                <TableHead>Subject / Procedure</TableHead>
                                <TableHead>Source</TableHead>
                                <TableHead>UTM</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className='w-[100px]'>
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {contacts.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className='text-muted-foreground py-8 text-center'
                                    >
                                        No contact submissions yet
                                    </TableCell>
                                </TableRow>
                            ) : (
                                contacts.map((contact) => (
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
                                            <span className='text-muted-foreground text-sm'>
                                                {contact.source ?? 'Direct'}
                                            </span>
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

            {/* Pagination */}
            {totalPages > 1 && (
                <div className='flex items-center justify-center gap-2'>
                    <Button
                        variant='outline'
                        size='sm'
                        disabled={page <= 1}
                        asChild={page > 1}
                    >
                        {page > 1 ? (
                            <Link href={`/contacts?page=${page - 1}`}>
                                Previous
                            </Link>
                        ) : (
                            <span>Previous</span>
                        )}
                    </Button>
                    <span className='text-muted-foreground text-sm'>
                        Page {page} of {totalPages}
                    </span>
                    <Button
                        variant='outline'
                        size='sm'
                        disabled={page >= totalPages}
                        asChild={page < totalPages}
                    >
                        {page < totalPages ? (
                            <Link href={`/contacts?page=${page + 1}`}>
                                Next
                            </Link>
                        ) : (
                            <span>Next</span>
                        )}
                    </Button>
                </div>
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
