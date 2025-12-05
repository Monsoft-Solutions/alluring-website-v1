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
    Eye,
    ExternalLink,
    Plus,
    Pencil,
    MousePointer,
    Calendar,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { env } from '@/env'
import {
    getPromotions,
    type PromotionSortBy,
    type PromotionSortOrder,
    type PromotionStatus,
    type PromotionType,
} from '@/lib/queries/promotion.query'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<{
    page?: string
    sortBy?: string
    sortOrder?: string
    status?: string
    type?: string
}>

const VALID_SORT_BY: PromotionSortBy[] = [
    'createdAt',
    'priority',
    'startsAt',
    'views',
]
const VALID_SORT_ORDER: PromotionSortOrder[] = ['asc', 'desc']
const VALID_STATUSES: PromotionStatus[] = [
    'draft',
    'scheduled',
    'active',
    'paused',
    'expired',
]
const VALID_TYPES: PromotionType[] = [
    'discount',
    'seasonal',
    'bundle',
    'financing',
]

function isValidSortBy(value: string | undefined): value is PromotionSortBy {
    return VALID_SORT_BY.includes(value as PromotionSortBy)
}

function isValidSortOrder(
    value: string | undefined
): value is PromotionSortOrder {
    return VALID_SORT_ORDER.includes(value as PromotionSortOrder)
}

function isValidStatus(value: string | undefined): value is PromotionStatus {
    return VALID_STATUSES.includes(value as PromotionStatus)
}

function isValidType(value: string | undefined): value is PromotionType {
    return VALID_TYPES.includes(value as PromotionType)
}

export default async function PromotionsPage({
    searchParams,
}: {
    searchParams: SearchParams
}) {
    const params = await searchParams
    const page = Number(params.page) || 1
    const sortBy: PromotionSortBy = isValidSortBy(params.sortBy)
        ? params.sortBy
        : 'createdAt'
    const sortOrder: PromotionSortOrder = isValidSortOrder(params.sortOrder)
        ? params.sortOrder
        : 'desc'
    const status = isValidStatus(params.status) ? params.status : undefined
    const type = isValidType(params.type) ? params.type : undefined

    const { promotions, total } = await getPromotions({
        page,
        pageSize: 10,
        sortBy,
        sortOrder,
        status,
        type,
    })
    const totalPages = Math.ceil(total / 10)

    // Helper to build URL with sort params
    const buildSortUrl = (newSortBy: PromotionSortBy) => {
        const newOrder =
            sortBy === newSortBy && sortOrder === 'desc' ? 'asc' : 'desc'
        const statusParam = status ? `&status=${status}` : ''
        const typeParam = type ? `&type=${type}` : ''
        return `/promotions?sortBy=${newSortBy}&sortOrder=${newOrder}${statusParam}${typeParam}`
    }

    // Helper to build pagination URL preserving filters
    const buildPageUrl = (newPage: number) => {
        const statusParam = status ? `&status=${status}` : ''
        const typeParam = type ? `&type=${type}` : ''
        return `/promotions?page=${newPage}&sortBy=${sortBy}&sortOrder=${sortOrder}${statusParam}${typeParam}`
    }

    // Helper to build filter URL
    const buildFilterUrl = (filterStatus?: string, filterType?: string) => {
        const statusParam = filterStatus ? `&status=${filterStatus}` : ''
        const typeParam = filterType ? `&type=${filterType}` : ''
        return `/promotions?sortBy=${sortBy}&sortOrder=${sortOrder}${statusParam}${typeParam}`
    }

    const SortIcon = ({ column }: { column: PromotionSortBy }) => {
        if (sortBy !== column) return <span className='ml-1 inline-block w-3' />
        return sortOrder === 'asc' ? (
            <ArrowUp className='ml-1 inline h-3 w-3' />
        ) : (
            <ArrowDown className='ml-1 inline h-3 w-3' />
        )
    }

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-2xl font-semibold'>Promotions</h1>
                    <p className='text-muted-foreground'>
                        Manage your promotional campaigns ({total} total)
                    </p>
                </div>
                <Button asChild>
                    <Link href='/promotions/new'>
                        <Plus className='mr-2 h-4 w-4' />
                        New Promotion
                    </Link>
                </Button>
            </div>

            {/* Filters */}
            <div className='flex flex-wrap gap-2'>
                <div className='flex items-center gap-2'>
                    <span className='text-muted-foreground text-sm'>
                        Status:
                    </span>
                    <Link
                        href={buildFilterUrl(undefined, type)}
                        className={`rounded-md px-3 py-1 text-sm ${!status ? 'bg-stone-900 text-white' : 'bg-stone-100 hover:bg-stone-200'}`}
                    >
                        All
                    </Link>
                    {VALID_STATUSES.map((s) => (
                        <Link
                            key={s}
                            href={buildFilterUrl(s, type)}
                            className={`rounded-md px-3 py-1 text-sm capitalize ${status === s ? 'bg-stone-900 text-white' : 'bg-stone-100 hover:bg-stone-200'}`}
                        >
                            {s}
                        </Link>
                    ))}
                </div>

                <div className='flex items-center gap-2'>
                    <span className='text-muted-foreground text-sm'>Type:</span>
                    <Link
                        href={buildFilterUrl(status, undefined)}
                        className={`rounded-md px-3 py-1 text-sm ${!type ? 'bg-stone-900 text-white' : 'bg-stone-100 hover:bg-stone-200'}`}
                    >
                        All
                    </Link>
                    {VALID_TYPES.map((t) => (
                        <Link
                            key={t}
                            href={buildFilterUrl(status, t)}
                            className={`rounded-md px-3 py-1 text-sm capitalize ${type === t ? 'bg-stone-900 text-white' : 'bg-stone-100 hover:bg-stone-200'}`}
                        >
                            {t}
                        </Link>
                    ))}
                </div>
            </div>

            <Card>
                <CardContent className='p-0'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='w-[80px]'>
                                    Image
                                </TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>
                                    <Link
                                        href={buildSortUrl('startsAt')}
                                        className='hover:text-foreground inline-flex items-center'
                                    >
                                        <Calendar className='mr-1 h-3 w-3' />
                                        Dates
                                        <SortIcon column='startsAt' />
                                    </Link>
                                </TableHead>
                                <TableHead className='text-right'>
                                    <Link
                                        href={buildSortUrl('views')}
                                        className='hover:text-foreground inline-flex items-center'
                                    >
                                        Stats
                                        <SortIcon column='views' />
                                    </Link>
                                </TableHead>
                                <TableHead>
                                    <Link
                                        href={buildSortUrl('priority')}
                                        className='hover:text-foreground inline-flex items-center'
                                    >
                                        Priority
                                        <SortIcon column='priority' />
                                    </Link>
                                </TableHead>
                                <TableHead className='w-[100px]'>
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {promotions.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className='text-muted-foreground py-8 text-center'
                                    >
                                        No promotions found.{' '}
                                        <Link
                                            href='/promotions/new'
                                            className='text-blue-600 hover:underline'
                                        >
                                            Create your first promotion
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                promotions.map((promo) => (
                                    <TableRow key={promo.id}>
                                        <TableCell>
                                            {promo.imageUrl ? (
                                                <div className='relative h-12 w-16 overflow-hidden rounded-md bg-stone-100'>
                                                    <Image
                                                        src={promo.imageUrl}
                                                        alt={promo.title}
                                                        fill
                                                        className='object-cover'
                                                        sizes='64px'
                                                    />
                                                </div>
                                            ) : (
                                                <div className='h-12 w-16 rounded-md bg-stone-100' />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className='max-w-[200px]'>
                                                <Link
                                                    href={`/promotions/${promo.id}/edit`}
                                                    className='truncate font-medium hover:text-blue-600 hover:underline'
                                                >
                                                    {promo.title}
                                                </Link>
                                                <p className='text-muted-foreground truncate text-sm'>
                                                    /{promo.slug}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <TypeBadge type={promo.type} />
                                            {promo.type === 'discount' &&
                                                promo.discountValue && (
                                                    <span className='text-muted-foreground ml-2 text-xs'>
                                                        {promo.discountTypeValue ===
                                                        'percentage'
                                                            ? `${promo.discountValue}%`
                                                            : `$${promo.discountValue}`}
                                                    </span>
                                                )}
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge
                                                status={promo.status}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className='text-muted-foreground text-xs'>
                                                {promo.startsAt && (
                                                    <div>
                                                        Start:{' '}
                                                        {new Date(
                                                            promo.startsAt
                                                        ).toLocaleDateString()}
                                                    </div>
                                                )}
                                                {promo.endsAt && (
                                                    <div>
                                                        End:{' '}
                                                        {new Date(
                                                            promo.endsAt
                                                        ).toLocaleDateString()}
                                                    </div>
                                                )}
                                                {!promo.startsAt &&
                                                    !promo.endsAt && (
                                                        <span>
                                                            No dates set
                                                        </span>
                                                    )}
                                            </div>
                                        </TableCell>
                                        <TableCell className='text-right'>
                                            <div className='flex flex-col items-end gap-1'>
                                                <div className='flex items-center gap-1'>
                                                    <Eye className='text-muted-foreground h-3 w-3' />
                                                    <span className='text-xs'>
                                                        {promo.views.toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className='flex items-center gap-1'>
                                                    <MousePointer className='text-muted-foreground h-3 w-3' />
                                                    <span className='text-xs'>
                                                        {promo.clicks.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className='text-sm'>
                                                {promo.priority}
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
                                                        href={`/promotions/${promo.id}/edit`}
                                                    >
                                                        <Pencil className='h-4 w-4' />
                                                    </Link>
                                                </Button>
                                                {promo.status === 'active' && (
                                                    <Button
                                                        variant='ghost'
                                                        size='sm'
                                                        asChild
                                                    >
                                                        <Link
                                                            href={`${env.NEXT_PUBLIC_WEB_URL}/promotions/${promo.slug}`}
                                                            target='_blank'
                                                            rel='noopener noreferrer'
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
                            <Link href={buildPageUrl(page - 1)}>Previous</Link>
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
        </div>
    )
}

function StatusBadge({ status }: { status: PromotionStatus }) {
    const variants: Record<
        PromotionStatus,
        'default' | 'secondary' | 'outline' | 'destructive'
    > = {
        active: 'default',
        scheduled: 'secondary',
        draft: 'outline',
        paused: 'secondary',
        expired: 'destructive',
    }

    const labels: Record<PromotionStatus, string> = {
        active: 'Active',
        scheduled: 'Scheduled',
        draft: 'Draft',
        paused: 'Paused',
        expired: 'Expired',
    }

    return <Badge variant={variants[status]}>{labels[status]}</Badge>
}

function TypeBadge({ type }: { type: PromotionType }) {
    const colors: Record<PromotionType, string> = {
        discount: 'bg-green-100 text-green-800',
        seasonal: 'bg-orange-100 text-orange-800',
        bundle: 'bg-purple-100 text-purple-800',
        financing: 'bg-blue-100 text-blue-800',
    }

    const labels: Record<PromotionType, string> = {
        discount: 'Discount',
        seasonal: 'Seasonal',
        bundle: 'Bundle',
        financing: 'Financing',
    }

    return (
        <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[type]}`}
        >
            {labels[type]}
        </span>
    )
}
