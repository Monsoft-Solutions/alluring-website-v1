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
import { Eye, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { getBlogPosts } from '@/lib/queries/blog.query'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<{ page?: string }>

export default async function BlogPostsPage({
    searchParams,
}: {
    searchParams: SearchParams
}) {
    const params = await searchParams
    const page = Number(params.page) || 1
    const { posts, total } = await getBlogPosts(page, 10)
    const totalPages = Math.ceil(total / 10)

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-2xl font-semibold'>Blog Posts</h1>
                    <p className='text-muted-foreground'>
                        Manage your blog posts ({total} total)
                    </p>
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
                                    Views
                                </TableHead>
                                <TableHead>Published</TableHead>
                                <TableHead className='w-[100px]'>
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
                                        No blog posts found
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
                                                <p className='truncate font-medium'>
                                                    {post.title}
                                                </p>
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
                                            <Button
                                                variant='ghost'
                                                size='sm'
                                                asChild
                                            >
                                                <Link
                                                    href={`/${post.slug}`}
                                                    target='_blank'
                                                >
                                                    <ExternalLink className='h-4 w-4' />
                                                </Link>
                                            </Button>
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
                            <Link href={`/blog/posts?page=${page - 1}`}>
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
                            <Link href={`/blog/posts?page=${page + 1}`}>
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
