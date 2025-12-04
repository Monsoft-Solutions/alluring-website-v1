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
    TrendingUp,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import {
    getBlogPosts,
    type BlogPostSortBy,
    type BlogPostSortOrder,
} from '@/lib/queries/blog.query'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<{
    page?: string
    sortBy?: string
    sortOrder?: string
}>

const VALID_SORT_BY: BlogPostSortBy[] = ['createdAt', 'views', 'publishedAt']
const VALID_SORT_ORDER: BlogPostSortOrder[] = ['asc', 'desc']

function isValidSortBy(value: string | undefined): value is BlogPostSortBy {
    return VALID_SORT_BY.includes(value as BlogPostSortBy)
}

function isValidSortOrder(
    value: string | undefined
): value is BlogPostSortOrder {
    return VALID_SORT_ORDER.includes(value as BlogPostSortOrder)
}

export default async function BlogPostsPage({
    searchParams,
}: {
    searchParams: SearchParams
}) {
    const params = await searchParams
    const page = Number(params.page) || 1
    const sortBy: BlogPostSortBy = isValidSortBy(params.sortBy)
        ? params.sortBy
        : 'createdAt'
    const sortOrder: BlogPostSortOrder = isValidSortOrder(params.sortOrder)
        ? params.sortOrder
        : 'desc'

    const { posts, total } = await getBlogPosts({
        page,
        pageSize: 10,
        sortBy,
        sortOrder,
    })
    const totalPages = Math.ceil(total / 10)

    // Helper to build URL with sort params
    const buildSortUrl = (newSortBy: BlogPostSortBy) => {
        const newOrder =
            sortBy === newSortBy && sortOrder === 'desc' ? 'asc' : 'desc'
        return `/blog/posts?sortBy=${newSortBy}&sortOrder=${newOrder}`
    }

    // Helper to build pagination URL preserving sort
    const buildPageUrl = (newPage: number) => {
        return `/blog/posts?page=${newPage}&sortBy=${sortBy}&sortOrder=${sortOrder}`
    }

    const SortIcon = ({ column }: { column: BlogPostSortBy }) => {
        if (sortBy !== column) return <span className='ml-1 inline-block w-3' />
        return sortOrder === 'asc' ? (
            <ArrowUp className='ml-1 inline h-3 w-3' />
        ) : (
            <ArrowDown className='ml-1 inline h-3 w-3' />
        )
    }

    const isSortedByViews = sortBy === 'views' && sortOrder === 'desc'

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-2xl font-semibold'>Blog Posts</h1>
                    <p className='text-muted-foreground'>
                        Manage your blog posts ({total} total)
                    </p>
                </div>
                <div className='flex items-center gap-3'>
                    <Button
                        variant={isSortedByViews ? 'secondary' : 'outline'}
                        size='sm'
                        asChild
                    >
                        <Link href='/blog/posts?sortBy=views&sortOrder=desc'>
                            <TrendingUp className='mr-2 h-4 w-4' />
                            Most Viewed
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href='/blog/posts/new'>
                            <Plus className='mr-2 h-4 w-4' />
                            New Post
                        </Link>
                    </Button>
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
                                <TableHead>Author</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className='text-right'>
                                    <Link
                                        href={buildSortUrl('views')}
                                        className='hover:text-foreground inline-flex items-center'
                                    >
                                        Views
                                        <SortIcon column='views' />
                                    </Link>
                                </TableHead>
                                <TableHead>
                                    <Link
                                        href={buildSortUrl('publishedAt')}
                                        className='hover:text-foreground inline-flex items-center'
                                    >
                                        Published
                                        <SortIcon column='publishedAt' />
                                    </Link>
                                </TableHead>
                                <TableHead className='w-[120px]'>
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {posts.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className='text-muted-foreground py-8 text-center'
                                    >
                                        No blog posts found.{' '}
                                        <Link
                                            href='/blog/posts/new'
                                            className='text-blue-600 hover:underline'
                                        >
                                            Create your first post
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                posts.map((post) => (
                                    <TableRow key={post.id}>
                                        <TableCell>
                                            {post.featuredImageUrl ? (
                                                <div className='relative h-12 w-16 overflow-hidden rounded-md bg-stone-100'>
                                                    <Image
                                                        src={
                                                            post.featuredImageUrl
                                                        }
                                                        alt={post.title}
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
                                            <div className='max-w-[300px]'>
                                                <Link
                                                    href={`/blog/posts/${post.id}/edit`}
                                                    className='truncate font-medium hover:text-blue-600 hover:underline'
                                                >
                                                    {post.title}
                                                </Link>
                                                <p className='text-muted-foreground truncate text-sm'>
                                                    /{post.slug}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className='text-sm'>
                                                {post.authorName ?? 'No author'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={post.status} />
                                        </TableCell>
                                        <TableCell className='text-right'>
                                            <div className='flex items-center justify-end gap-1'>
                                                <Eye className='text-muted-foreground h-3 w-3' />
                                                <span className='text-sm'>
                                                    {post.views.toLocaleString()}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className='text-muted-foreground text-sm'>
                                                {post.publishedAt
                                                    ? new Date(
                                                          post.publishedAt
                                                      ).toLocaleDateString()
                                                    : 'Not published'}
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
                                                        href={`/blog/posts/${post.id}/edit`}
                                                    >
                                                        <Pencil className='h-4 w-4' />
                                                    </Link>
                                                </Button>
                                                {post.status ===
                                                    'published' && (
                                                    <Button
                                                        variant='ghost'
                                                        size='sm'
                                                        asChild
                                                    >
                                                        <Link
                                                            href={`/blog/${post.slug}`}
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

function StatusBadge({
    status,
}: {
    status: 'draft' | 'readyToPublish' | 'published' | null
}) {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
        published: 'default',
        readyToPublish: 'secondary',
        draft: 'outline',
    }

    const labels: Record<string, string> = {
        published: 'Published',
        readyToPublish: 'Ready',
        draft: 'Draft',
    }

    const statusKey = status ?? 'draft'

    return (
        <Badge variant={variants[statusKey] ?? 'outline'}>
            {labels[statusKey] ?? 'Draft'}
        </Badge>
    )
}
