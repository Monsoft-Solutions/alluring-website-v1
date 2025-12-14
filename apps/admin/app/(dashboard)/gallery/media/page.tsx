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
    ImageIcon,
    Video,
    Plus,
    Pencil,
    ExternalLink,
    Star,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import {
    getGalleryMedia,
    getGalleryGroupsForSelect,
    type GalleryMediaSortBy,
    type GalleryMediaSortOrder,
    type GalleryMediaStatusFilter,
    type GalleryMediaTypeFilter,
} from '@/lib/queries/gallery.query'
import { MediaLibraryClient } from './media-library-client.component'
import { GroupFilterSelect } from './group-filter-select.component'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<{
    page?: string
    sortBy?: string
    sortOrder?: string
    status?: string
    type?: string
    groupId?: string
    search?: string
}>

const VALID_SORT_BY: GalleryMediaSortBy[] = [
    'createdAt',
    'title',
    'displayOrder',
]
const VALID_SORT_ORDER: GalleryMediaSortOrder[] = ['asc', 'desc']
const VALID_STATUS: GalleryMediaStatusFilter[] = [
    'all',
    'draft',
    'published',
    'archived',
]
const VALID_TYPE: GalleryMediaTypeFilter[] = ['all', 'image', 'video']

function isValidSortBy(value: string | undefined): value is GalleryMediaSortBy {
    return VALID_SORT_BY.includes(value as GalleryMediaSortBy)
}

function isValidSortOrder(
    value: string | undefined
): value is GalleryMediaSortOrder {
    return VALID_SORT_ORDER.includes(value as GalleryMediaSortOrder)
}

function isValidStatus(
    value: string | undefined
): value is GalleryMediaStatusFilter {
    return VALID_STATUS.includes(value as GalleryMediaStatusFilter)
}

function isValidType(
    value: string | undefined
): value is GalleryMediaTypeFilter {
    return VALID_TYPE.includes(value as GalleryMediaTypeFilter)
}

function SortIcon({
    column,
    sortBy,
    sortOrder,
}: {
    column: GalleryMediaSortBy
    sortBy: GalleryMediaSortBy
    sortOrder: GalleryMediaSortOrder
}) {
    if (sortBy !== column) return <span className='ml-1 inline-block w-3' />
    return sortOrder === 'asc' ? (
        <ArrowUp className='ml-1 inline h-3 w-3' />
    ) : (
        <ArrowDown className='ml-1 inline h-3 w-3' />
    )
}

export default async function GalleryMediaPage({
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

    const sortBy: GalleryMediaSortBy = isValidSortBy(params.sortBy)
        ? params.sortBy
        : 'createdAt'
    const sortOrder: GalleryMediaSortOrder = isValidSortOrder(params.sortOrder)
        ? params.sortOrder
        : 'desc'
    const status: GalleryMediaStatusFilter = isValidStatus(params.status)
        ? params.status
        : 'all'
    const type: GalleryMediaTypeFilter = isValidType(params.type)
        ? params.type
        : 'all'
    const groupId = params.groupId

    // Fetch groups for filter dropdown
    const groups = await getGalleryGroupsForSelect()

    const { media: initialMedia, total } = await getGalleryMedia({
        page: requestedPage,
        pageSize,
        sortBy,
        sortOrder,
        status,
        type,
        groupId,
        search: params.search,
    })

    const totalPages = Math.ceil(total / pageSize)
    const page = Math.min(requestedPage, Math.max(1, totalPages))

    let media = initialMedia
    if (page !== requestedPage && media.length === 0 && totalPages > 0) {
        const refetch = await getGalleryMedia({
            page,
            pageSize,
            sortBy,
            sortOrder,
            status,
            type,
            search: params.search,
        })
        media = refetch.media
    }

    const buildSortUrl = (newSortBy: GalleryMediaSortBy) => {
        const newOrder =
            sortBy === newSortBy && sortOrder === 'desc' ? 'asc' : 'desc'
        const params = new URLSearchParams()
        params.set('sortBy', newSortBy)
        params.set('sortOrder', newOrder)
        if (status !== 'all') params.set('status', status)
        if (type !== 'all') params.set('type', type)
        if (groupId) params.set('groupId', groupId)
        return `/gallery/media?${params.toString()}`
    }

    const buildFilterUrl = (
        newStatus?: string,
        newType?: string,
        newGroupId?: string
    ) => {
        const params = new URLSearchParams()
        params.set('sortBy', sortBy)
        params.set('sortOrder', sortOrder)
        if (newStatus && newStatus !== 'all') params.set('status', newStatus)
        if (newType && newType !== 'all') params.set('type', newType)
        if (newGroupId) params.set('groupId', newGroupId)
        return `/gallery/media?${params.toString()}`
    }

    const buildPageUrl = (newPage: number) => {
        const params = new URLSearchParams()
        params.set('page', String(newPage))
        params.set('sortBy', sortBy)
        params.set('sortOrder', sortOrder)
        if (status !== 'all') params.set('status', status)
        if (type !== 'all') params.set('type', type)
        if (groupId) params.set('groupId', groupId)
        return `/gallery/media?${params.toString()}`
    }

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-2xl font-semibold'>Media Library</h1>
                    <p className='text-muted-foreground'>
                        Manage your images and videos ({total} total)
                    </p>
                </div>
                <Button asChild>
                    <Link href='/gallery/media/new'>
                        <Plus className='mr-2 h-4 w-4' />
                        Upload Media
                    </Link>
                </Button>
            </div>

            {/* Filters */}
            <div className='flex flex-wrap items-center gap-2'>
                <span className='text-muted-foreground text-sm'>Filter:</span>
                <div className='flex gap-1'>
                    <Button
                        variant={status === 'all' ? 'secondary' : 'outline'}
                        size='sm'
                        asChild
                    >
                        <Link href={buildFilterUrl('all', type, groupId)}>
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
                        <Link href={buildFilterUrl('published', type, groupId)}>
                            Published
                        </Link>
                    </Button>
                    <Button
                        variant={status === 'draft' ? 'secondary' : 'outline'}
                        size='sm'
                        asChild
                    >
                        <Link href={buildFilterUrl('draft', type, groupId)}>
                            Draft
                        </Link>
                    </Button>
                    <Button
                        variant={
                            status === 'archived' ? 'secondary' : 'outline'
                        }
                        size='sm'
                        asChild
                    >
                        <Link href={buildFilterUrl('archived', type, groupId)}>
                            Archived
                        </Link>
                    </Button>
                </div>
                <span className='text-muted-foreground mx-2'>|</span>
                <div className='flex gap-1'>
                    <Button
                        variant={type === 'all' ? 'secondary' : 'outline'}
                        size='sm'
                        asChild
                    >
                        <Link href={buildFilterUrl(status, 'all', groupId)}>
                            All Types
                        </Link>
                    </Button>
                    <Button
                        variant={type === 'image' ? 'secondary' : 'outline'}
                        size='sm'
                        asChild
                    >
                        <Link href={buildFilterUrl(status, 'image', groupId)}>
                            <ImageIcon className='mr-1 h-3 w-3' />
                            Images
                        </Link>
                    </Button>
                    <Button
                        variant={type === 'video' ? 'secondary' : 'outline'}
                        size='sm'
                        asChild
                    >
                        <Link href={buildFilterUrl(status, 'video', groupId)}>
                            <Video className='mr-1 h-3 w-3' />
                            Videos
                        </Link>
                    </Button>
                </div>
                <span className='text-muted-foreground mx-2'>|</span>
                <GroupFilterSelect
                    groups={groups}
                    selectedGroupId={groupId}
                    currentStatus={status}
                    currentType={type}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                />
            </div>

            {/* Media Library with view switching and bulk actions */}
            <MediaLibraryClient
                media={media}
                total={total}
                currentFilters={{
                    page,
                    sortBy,
                    sortOrder,
                    status,
                    type,
                    groupId,
                }}
                tableView={
                    <>
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
                                                    href={buildSortUrl('title')}
                                                    className='hover:text-foreground inline-flex items-center'
                                                >
                                                    Title
                                                    <SortIcon
                                                        column='title'
                                                        sortBy={sortBy}
                                                        sortOrder={sortOrder}
                                                    />
                                                </Link>
                                            </TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>
                                                <Link
                                                    href={buildSortUrl(
                                                        'displayOrder'
                                                    )}
                                                    className='hover:text-foreground inline-flex items-center'
                                                >
                                                    Order
                                                    <SortIcon
                                                        column='displayOrder'
                                                        sortBy={sortBy}
                                                        sortOrder={sortOrder}
                                                    />
                                                </Link>
                                            </TableHead>
                                            <TableHead>
                                                <Link
                                                    href={buildSortUrl(
                                                        'createdAt'
                                                    )}
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
                                        {media.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={7}
                                                    className='text-muted-foreground py-8 text-center'
                                                >
                                                    No media found.{' '}
                                                    <Link
                                                        href='/gallery/media/new'
                                                        className='text-blue-600 hover:underline'
                                                    >
                                                        Upload your first media
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            media.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell>
                                                        <div className='relative h-12 w-16 overflow-hidden rounded-md bg-stone-100'>
                                                            {item.type ===
                                                            'image' ? (
                                                                <Image
                                                                    src={
                                                                        item.url
                                                                    }
                                                                    alt={
                                                                        item.title
                                                                    }
                                                                    fill
                                                                    className='object-cover'
                                                                    sizes='64px'
                                                                />
                                                            ) : (
                                                                <div className='flex h-full items-center justify-center'>
                                                                    <Video className='text-muted-foreground h-5 w-5' />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className='max-w-[300px]'>
                                                            <div className='flex items-center gap-2'>
                                                                <Link
                                                                    href={`/gallery/media/${item.id}/edit`}
                                                                    className='truncate font-medium hover:text-blue-600 hover:underline'
                                                                >
                                                                    {item.title}
                                                                </Link>
                                                                {item.isFeatured && (
                                                                    <Star className='h-3 w-3 fill-yellow-400 text-yellow-400' />
                                                                )}
                                                            </div>
                                                            <p className='text-muted-foreground truncate text-sm'>
                                                                /gallery/
                                                                {item.slug}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className='flex items-center gap-1'>
                                                            {item.type ===
                                                            'image' ? (
                                                                <ImageIcon className='h-4 w-4' />
                                                            ) : (
                                                                <Video className='h-4 w-4' />
                                                            )}
                                                            <span className='text-sm capitalize'>
                                                                {item.type}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusBadge
                                                            status={item.status}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className='text-muted-foreground text-sm'>
                                                            {item.displayOrder}
                                                        </span>
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
                                                                    href={`/gallery/media/${item.id}/edit`}
                                                                >
                                                                    <Pencil className='h-4 w-4' />
                                                                </Link>
                                                            </Button>
                                                            {item.status ===
                                                                'published' && (
                                                                <Button
                                                                    variant='ghost'
                                                                    size='sm'
                                                                    asChild
                                                                >
                                                                    <Link
                                                                        href={`/gallery/${item.slug}`}
                                                                        target='_blank'
                                                                    >
                                                                        <ExternalLink className='h-4 w-4' />
                                                                    </Link>
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
                                        <Link href={buildPageUrl(page + 1)}>
                                            Next
                                        </Link>
                                    ) : (
                                        <span>Next</span>
                                    )}
                                </Button>
                            </div>
                        )}
                    </>
                }
            />
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
