import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@workspace/ui/components/avatar'
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
import { FileText, Plus, Pencil } from 'lucide-react'
import Link from 'next/link'

import { getAuthors } from '@/lib/queries/blog.query'

export const dynamic = 'force-dynamic'

export default async function AuthorsPage() {
    const authors = await getAuthors()

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-2xl font-semibold'>Authors</h1>
                    <p className='text-muted-foreground'>
                        Manage blog post authors ({authors.length} total)
                    </p>
                </div>
                <Button asChild>
                    <Link href='/blog/authors/new'>
                        <Plus className='mr-2 h-4 w-4' />
                        New Author
                    </Link>
                </Button>
            </div>

            <Card>
                <CardContent className='p-0'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Author</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className='text-right'>
                                    Posts
                                </TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className='w-[80px]'>
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {authors.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className='text-muted-foreground py-8 text-center'
                                    >
                                        No authors found.{' '}
                                        <Link
                                            href='/blog/authors/new'
                                            className='text-blue-600 hover:underline'
                                        >
                                            Create your first author
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                authors.map((author) => (
                                    <TableRow key={author.id}>
                                        <TableCell>
                                            <div className='flex items-center gap-3'>
                                                <Avatar className='h-10 w-10'>
                                                    <AvatarImage
                                                        src={
                                                            author.avatarUrl ??
                                                            undefined
                                                        }
                                                        alt={author.name}
                                                    />
                                                    <AvatarFallback>
                                                        {getInitials(
                                                            author.name
                                                        )}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <Link
                                                    href={`/blog/authors/${author.id}/edit`}
                                                    className='font-medium hover:text-blue-600 hover:underline'
                                                >
                                                    {author.name}
                                                </Link>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className='text-muted-foreground text-sm'>
                                                {author.email}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    author.isActive
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {author.isActive
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className='flex items-center justify-end gap-1'>
                                                <FileText className='text-muted-foreground h-3 w-3' />
                                                <span className='text-sm'>
                                                    {author.postCount}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className='text-muted-foreground text-sm'>
                                                {author.createdAt
                                                    ? new Date(
                                                          author.createdAt
                                                      ).toLocaleDateString()
                                                    : '—'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant='ghost'
                                                size='sm'
                                                asChild
                                            >
                                                <Link
                                                    href={`/blog/authors/${author.id}/edit`}
                                                >
                                                    <Pencil className='h-4 w-4' />
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
        </div>
    )
}

function getInitials(name: string): string {
    const trimmed = name.trim()
    if (!trimmed) return ''

    const segments = trimmed
        .split(/\s+/)
        .filter((segment) => segment.length > 0)
        .map((segment) => segment[0])
        .filter((char) => char !== undefined)
        .join('')
        .toUpperCase()
        .slice(0, 2)

    return segments || ''
}
