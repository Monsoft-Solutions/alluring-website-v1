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
import {
    ArrowDown,
    ArrowUp,
    Plus,
    Pencil,
    ExternalLink,
    Star,
    Instagram,
    Video,
    FileText,
    Upload,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import {
    getTestimonials,
    getTestimonialStats,
} from '@/lib/queries/testimonial.query'
import { TestimonialListClient } from '@/components/testimonials/testimonial-list-client.component'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

type SearchParams = Promise<{
    page?: string
    sortBy?: string
    sortOrder?: string
    status?: string
    sourceType?: string
    isFeatured?: string
    search?: string
}>

type TestimonialSortBy = 'createdAt' | 'displayOrder' | 'patientName' | 'rating'
type TestimonialSortOrder = 'asc' | 'desc'
type TestimonialStatusFilter = 'all' | 'draft' | 'published' | 'archived'
type TestimonialSourceFilter = 'all' | 'instagram' | 'direct' | 'manual'

const VALID_SORT_BY: TestimonialSortBy[] = [
    'createdAt',
    'displayOrder',
    'patientName',
    'rating',
]
const VALID_SORT_ORDER: TestimonialSortOrder[] = ['asc', 'desc']
const VALID_STATUS: TestimonialStatusFilter[] = [
    'all',
    'draft',
    'published',
    'archived',
]
const VALID_SOURCE: TestimonialSourceFilter[] = [
    'all',
    'instagram',
    'direct',
    'manual',
]

function isValidSortBy(value: string | undefined): value is TestimonialSortBy {
    return VALID_SORT_BY.includes(value as TestimonialSortBy)
}

function isValidSortOrder(
    value: string | undefined
): value is TestimonialSortOrder {
    return VALID_SORT_ORDER.includes(value as TestimonialSortOrder)
}

function isValidStatus(
    value: string | undefined
): value is TestimonialStatusFilter {
    return VALID_STATUS.includes(value as TestimonialStatusFilter)
}

function isValidSource(
    value: string | undefined
): value is TestimonialSourceFilter {
    return VALID_SOURCE.includes(value as TestimonialSourceFilter)
}

function SortIcon({
    column,
    sortBy,
    sortOrder,
}: {
    column: TestimonialSortBy
    sortBy: TestimonialSortBy
    sortOrder: TestimonialSortOrder
}) {
    if (sortBy !== column) return <span className='ml-1 inline-block w-3' />
    return sortOrder === 'asc' ? (
        <ArrowUp className='ml-1 inline h-3 w-3' />
    ) : (
        <ArrowDown className='ml-1 inline h-3 w-3' />
    )
}

function SourceTypeIcon({ sourceType }: { sourceType: string }) {
    switch (sourceType) {
        case 'instagram':
            return <Instagram className='h-4 w-4 text-pink-500' />
        case 'direct':
            return <Upload className='h-4 w-4 text-blue-500' />
        case 'manual':
            return <FileText className='h-4 w-4 text-stone-500' />
        default:
            return null
    }
}

export default async function TestimonialsPage({
    searchParams,
}: {
    searchParams: SearchParams
}) {
    const params = await searchParams
    const pageSize = 20

    let requestedPage = Number(params.page)
    if (!Number.isFinite(requestedPage) || requestedPage < 1) {
        requestedPage = 1
    }
    requestedPage = Math.floor(requestedPage)

    const sortBy: TestimonialSortBy = isValidSortBy(params.sortBy)
        ? params.sortBy
        : 'createdAt'
    const sortOrder: TestimonialSortOrder = isValidSortOrder(params.sortOrder)
        ? params.sortOrder
        : 'desc'
    const status: TestimonialStatusFilter = isValidStatus(params.status)
        ? params.status
        : 'all'
    const sourceType: TestimonialSourceFilter = isValidSource(params.sourceType)
        ? params.sourceType
        : 'all'
    const isFeatured =
        params.isFeatured === 'true'
            ? true
            : params.isFeatured === 'false'
              ? false
              : null

    const [{ testimonials: initialTestimonials, total }, stats] =
        await Promise.all([
            getTestimonials({
                page: requestedPage,
                pageSize,
                sortBy,
                sortOrder,
                status,
                sourceType,
                isFeatured,
                search: params.search,
            }),
            getTestimonialStats(),
        ])

    const totalPages = Math.ceil(total / pageSize)
    const page = Math.min(requestedPage, Math.max(1, totalPages))

    let testimonials = initialTestimonials
    if (page !== requestedPage && testimonials.length === 0 && totalPages > 0) {
        const refetch = await getTestimonials({
            page,
            pageSize,
            sortBy,
            sortOrder,
            status,
            sourceType,
            isFeatured,
            search: params.search,
        })
        testimonials = refetch.testimonials
    }

    const buildSortUrl = (newSortBy: TestimonialSortBy) => {
        const newOrder =
            sortBy === newSortBy && sortOrder === 'desc' ? 'asc' : 'desc'
        const params = new URLSearchParams()
        params.set('sortBy', newSortBy)
        params.set('sortOrder', newOrder)
        if (status !== 'all') params.set('status', status)
        if (sourceType !== 'all') params.set('sourceType', sourceType)
        if (isFeatured !== null) params.set('isFeatured', String(isFeatured))
        return `/testimonials?${params.toString()}`
    }

    const buildFilterUrl = (
        newStatus?: string,
        newSourceType?: string,
        newIsFeatured?: boolean | null
    ) => {
        const params = new URLSearchParams()
        params.set('sortBy', sortBy)
        params.set('sortOrder', sortOrder)
        if (newStatus && newStatus !== 'all') params.set('status', newStatus)
        if (newSourceType && newSourceType !== 'all')
            params.set('sourceType', newSourceType)
        if (newIsFeatured !== null && newIsFeatured !== undefined)
            params.set('isFeatured', String(newIsFeatured))
        return `/testimonials?${params.toString()}`
    }

    const buildPageUrl = (newPage: number) => {
        const params = new URLSearchParams()
        params.set('page', String(newPage))
        params.set('sortBy', sortBy)
        params.set('sortOrder', sortOrder)
        if (status !== 'all') params.set('status', status)
        if (sourceType !== 'all') params.set('sourceType', sourceType)
        if (isFeatured !== null) params.set('isFeatured', String(isFeatured))
        return `/testimonials?${params.toString()}`
    }

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-2xl font-semibold'>Testimonials</h1>
                    <p className='text-muted-foreground'>
                        Manage patient testimonials ({total} total)
                    </p>
                </div>
                <Button asChild>
                    <Link href='/testimonials/new'>
                        <Plus className='mr-2 h-4 w-4' />
                        Add Testimonial
                    </Link>
                </Button>
            </div>

            {/* Stats */}
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                <Card>
                    <CardContent className='p-4'>
                        <div className='text-muted-foreground text-sm'>
                            Published
                        </div>
                        <div className='text-2xl font-semibold'>
                            {stats.publishedTestimonials}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className='p-4'>
                        <div className='text-muted-foreground text-sm'>
                            Featured
                        </div>
                        <div className='text-2xl font-semibold'>
                            {stats.featuredTestimonials}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className='p-4'>
                        <div className='text-muted-foreground text-sm'>
                            Avg. Rating
                        </div>
                        <div className='text-2xl font-semibold'>
                            {stats.averageRating.toFixed(1)} / 5
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className='p-4'>
                        <div className='text-muted-foreground text-sm'>
                            Draft
                        </div>
                        <div className='text-2xl font-semibold'>
                            {stats.draftTestimonials}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className='flex flex-wrap items-center gap-2'>
                <span className='text-muted-foreground text-sm'>Status:</span>
                <div className='flex gap-1'>
                    <Button
                        variant={status === 'all' ? 'secondary' : 'outline'}
                        size='sm'
                        asChild
                    >
                        <Link
                            href={buildFilterUrl('all', sourceType, isFeatured)}
                        >
                            All
                        </Link>
                    </Button>
                    <Button
                        variant={
                            status === 'published' ? 'secondary' : 'outline'
                        }
                        size='sm'
                        asChild
                    >
                        <Link
                            href={buildFilterUrl(
                                'published',
                                sourceType,
                                isFeatured
                            )}
                        >
                            Published
                        </Link>
                    </Button>
                    <Button
                        variant={status === 'draft' ? 'secondary' : 'outline'}
                        size='sm'
                        asChild
                    >
                        <Link
                            href={buildFilterUrl(
                                'draft',
                                sourceType,
                                isFeatured
                            )}
                        >
                            Draft
                        </Link>
                    </Button>
                </div>

                <span className='text-muted-foreground mx-2'>|</span>

                <span className='text-muted-foreground text-sm'>Source:</span>
                <div className='flex gap-1'>
                    <Button
                        variant={sourceType === 'all' ? 'secondary' : 'outline'}
                        size='sm'
                        asChild
                    >
                        <Link href={buildFilterUrl(status, 'all', isFeatured)}>
                            All
                        </Link>
                    </Button>
                    <Button
                        variant={
                            sourceType === 'instagram' ? 'secondary' : 'outline'
                        }
                        size='sm'
                        asChild
                    >
                        <Link
                            href={buildFilterUrl(
                                status,
                                'instagram',
                                isFeatured
                            )}
                        >
                            <Instagram className='mr-1 h-3 w-3' />
                            Instagram
                        </Link>
                    </Button>
                    <Button
                        variant={
                            sourceType === 'direct' ? 'secondary' : 'outline'
                        }
                        size='sm'
                        asChild
                    >
                        <Link
                            href={buildFilterUrl(status, 'direct', isFeatured)}
                        >
                            <Upload className='mr-1 h-3 w-3' />
                            Direct
                        </Link>
                    </Button>
                    <Button
                        variant={
                            sourceType === 'manual' ? 'secondary' : 'outline'
                        }
                        size='sm'
                        asChild
                    >
                        <Link
                            href={buildFilterUrl(status, 'manual', isFeatured)}
                        >
                            <FileText className='mr-1 h-3 w-3' />
                            Manual
                        </Link>
                    </Button>
                </div>

                <span className='text-muted-foreground mx-2'>|</span>

                <Button
                    variant={isFeatured === true ? 'secondary' : 'outline'}
                    size='sm'
                    asChild
                >
                    <Link
                        href={buildFilterUrl(
                            status,
                            sourceType,
                            isFeatured === true ? null : true
                        )}
                    >
                        <Star className='mr-1 h-3 w-3' />
                        Featured Only
                    </Link>
                </Button>
            </div>

            {/* Testimonials List with client actions */}
            <TestimonialListClient>
                {/* Table */}
                <Card>
                    <CardContent className='p-0'>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className='w-[80px]'>
                                        Preview
                                    </TableHead>
                                    <TableHead>
                                        <Link
                                            href={buildSortUrl('patientName')}
                                            className='hover:text-foreground inline-flex items-center'
                                        >
                                            Patient
                                            <SortIcon
                                                column='patientName'
                                                sortBy={sortBy}
                                                sortOrder={sortOrder}
                                            />
                                        </Link>
                                    </TableHead>
                                    <TableHead>Procedure</TableHead>
                                    <TableHead>Source</TableHead>
                                    <TableHead>
                                        <Link
                                            href={buildSortUrl('rating')}
                                            className='hover:text-foreground inline-flex items-center'
                                        >
                                            Rating
                                            <SortIcon
                                                column='rating'
                                                sortBy={sortBy}
                                                sortOrder={sortOrder}
                                            />
                                        </Link>
                                    </TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>
                                        <Link
                                            href={buildSortUrl('createdAt')}
                                            className='hover:text-foreground inline-flex items-center'
                                        >
                                            Created
                                            <SortIcon
                                                column='createdAt'
                                                sortBy={sortBy}
                                                sortOrder={sortOrder}
                                            />
                                        </Link>
                                    </TableHead>
                                    <TableHead className='w-[100px]'>
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {testimonials.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            className='text-muted-foreground py-8 text-center'
                                        >
                                            No testimonials found.{' '}
                                            <Link
                                                href='/testimonials/new'
                                                className='text-blue-600 hover:underline'
                                            >
                                                Add your first testimonial
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    testimonials.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className='relative h-12 w-16 overflow-hidden rounded-md bg-stone-100'>
                                                    {item.mediaThumbnailUrl ||
                                                    item.mediaUrl ? (
                                                        <>
                                                            <Image
                                                                src={
                                                                    item.mediaThumbnailUrl ||
                                                                    item.mediaUrl ||
                                                                    ''
                                                                }
                                                                alt={
                                                                    item.patientName
                                                                }
                                                                fill
                                                                className='object-cover'
                                                                sizes='64px'
                                                            />
                                                            {item.mediaType ===
                                                                'video' && (
                                                                <div className='absolute inset-0 flex items-center justify-center bg-black/30'>
                                                                    <Video className='h-4 w-4 text-white' />
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div className='flex h-full items-center justify-center'>
                                                            <FileText className='text-muted-foreground h-5 w-5' />
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className='max-w-[200px]'>
                                                    <div className='flex items-center gap-2'>
                                                        <Link
                                                            href={`/testimonials/${item.id}/edit`}
                                                            className='truncate font-medium hover:text-blue-600 hover:underline'
                                                        >
                                                            {item.patientName}
                                                        </Link>
                                                        {item.isFeatured && (
                                                            <Star className='h-3 w-3 fill-yellow-400 text-yellow-400' />
                                                        )}
                                                    </div>
                                                    <p className='text-muted-foreground line-clamp-1 text-sm'>
                                                        {item.quote.slice(
                                                            0,
                                                            50
                                                        )}
                                                        {item.quote.length >
                                                            50 && '...'}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className='text-sm'>
                                                    {item.procedure}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className='flex items-center gap-1'>
                                                    <SourceTypeIcon
                                                        sourceType={
                                                            item.sourceType
                                                        }
                                                    />
                                                    <span className='text-sm capitalize'>
                                                        {item.sourceType}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className='flex items-center gap-0.5'>
                                                    {Array.from({
                                                        length: 5,
                                                    }).map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`h-3 w-3 ${
                                                                i < item.rating
                                                                    ? 'fill-yellow-400 text-yellow-400'
                                                                    : 'text-stone-200'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge
                                                    status={item.status}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <span className='text-muted-foreground text-sm'>
                                                    {new Date(
                                                        item.createdAt
                                                    ).toLocaleDateString()}
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
                                                            href={`/testimonials/${item.id}/edit`}
                                                        >
                                                            <Pencil className='h-4 w-4' />
                                                        </Link>
                                                    </Button>
                                                    {item.instagramPermalink && (
                                                        <Button
                                                            variant='ghost'
                                                            size='sm'
                                                            asChild
                                                        >
                                                            <a
                                                                href={
                                                                    item.instagramPermalink
                                                                }
                                                                target='_blank'
                                                                rel='noopener noreferrer'
                                                            >
                                                                <ExternalLink className='h-4 w-4' />
                                                            </a>
                                                        </Button>
                                                    )}
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
                                <Link href={buildPageUrl(page - 1)}>
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
                                <Link href={buildPageUrl(page + 1)}>Next</Link>
                            ) : (
                                <span>Next</span>
                            )}
                        </Button>
                    </div>
                )}
            </TestimonialListClient>
        </div>
    )
}

function StatusBadge({
    status,
}: {
    status: 'draft' | 'published' | 'archived'
}) {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
        published: 'default',
        draft: 'secondary',
        archived: 'outline',
    }

    const labels: Record<string, string> = {
        published: 'Published',
        draft: 'Draft',
        archived: 'Archived',
    }

    return (
        <Badge variant={variants[status] ?? 'outline'}>
            {labels[status] ?? 'Draft'}
        </Badge>
    )
}
