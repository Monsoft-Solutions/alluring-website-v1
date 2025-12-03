import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@workspace/ui/components/avatar'
import { Badge } from '@workspace/ui/components/badge'
import { Card, CardContent } from '@workspace/ui/components/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table'
import { FileText } from 'lucide-react'

import { getAuthors } from '@/lib/queries/blog.query'

export const dynamic = 'force-dynamic'

export default async function AuthorsPage() {
    const authors = await getAuthors()

    return (
        <div className='space-y-6'>
            <div>
                <h1 className='text-2xl font-semibold'>Authors</h1>
                <p className='text-muted-foreground'>
                    Manage blog post authors ({authors.length} total)
                </p>
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
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {authors.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className='text-muted-foreground py-8 text-center'
                                    >
                                        No authors found
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
                                                <span className='font-medium'>
                                                    {author.name}
                                                </span>
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
                                                {new Date(
                                                    author.createdAt
                                                ).toLocaleDateString()}
                                            </span>
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
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}
