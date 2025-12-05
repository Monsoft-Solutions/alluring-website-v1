/**
 * Chat Conversations List Page
 *
 * Displays all chat conversations with pagination and filtering.
 *
 * @module app/(dashboard)/chat/conversations/page
 */
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
import { Eye, ArrowLeft, Phone, Mail, Globe } from 'lucide-react'
import Link from 'next/link'

import { getChatSessions } from '@/lib/queries/chat.query'
import { formatRelativeTime, formatPhoneNumber } from '@workspace/chat/utils'

export const dynamic = 'force-dynamic'

type PageProps = {
    searchParams: Promise<{ page?: string }>
}

export default async function ConversationsPage({ searchParams }: PageProps) {
    const params = await searchParams
    const page = parseInt(params.page ?? '1', 10)
    const { sessions, total, totalPages } = await getChatSessions(page, 20)

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex items-center gap-4'>
                <Button asChild variant='ghost' size='sm'>
                    <Link href='/chat'>
                        <ArrowLeft className='mr-2 h-4 w-4' />
                        Back to Chat
                    </Link>
                </Button>
            </div>

            <div>
                <h1 className='text-2xl font-semibold'>Conversations</h1>
                <p className='text-muted-foreground'>
                    {total} total conversation{total !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Conversations Table */}
            <Card>
                <CardContent className='p-0'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Contact</TableHead>
                                <TableHead>Messages</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Source</TableHead>
                                <TableHead>Started</TableHead>
                                <TableHead className='w-[60px]'></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sessions.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className='text-muted-foreground py-8 text-center'
                                    >
                                        No conversations yet
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sessions.map((session) => (
                                    <TableRow key={session.id}>
                                        <TableCell>
                                            <div>
                                                <p className='font-medium'>
                                                    {session.fullName}
                                                </p>
                                                <div className='text-muted-foreground flex items-center gap-3 text-sm'>
                                                    <span className='flex items-center gap-1'>
                                                        <Phone className='h-3 w-3' />
                                                        {formatPhoneNumber(
                                                            session.phone
                                                        )}
                                                    </span>
                                                    {session.email && (
                                                        <span className='flex items-center gap-1'>
                                                            <Mail className='h-3 w-3' />
                                                            {session.email}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className='font-medium'>
                                                {session.messageCount}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    session.status === 'active'
                                                        ? 'default'
                                                        : session.status ===
                                                            'closed'
                                                          ? 'secondary'
                                                          : 'outline'
                                                }
                                            >
                                                {session.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {session.pageUrl ? (
                                                <span
                                                    className='text-muted-foreground flex items-center gap-1 text-sm'
                                                    title={session.pageUrl}
                                                >
                                                    <Globe className='h-3 w-3' />
                                                    {getPathname(
                                                        session.pageUrl
                                                    )}
                                                </span>
                                            ) : (
                                                <span className='text-muted-foreground text-sm'>
                                                    —
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className='text-muted-foreground text-sm'>
                                                {formatRelativeTime(
                                                    session.createdAt
                                                )}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant='ghost'
                                                size='sm'
                                                asChild
                                            >
                                                <Link
                                                    href={`/chat/conversations/${session.id}`}
                                                >
                                                    <Eye className='h-4 w-4' />
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
                <div className='flex items-center justify-between'>
                    <p className='text-muted-foreground text-sm'>
                        Page {page} of {totalPages}
                    </p>
                    <div className='flex gap-2'>
                        <Button
                            variant='outline'
                            size='sm'
                            disabled={page <= 1}
                            asChild
                        >
                            <Link href={`/chat/conversations?page=${page - 1}`}>
                                Previous
                            </Link>
                        </Button>
                        <Button
                            variant='outline'
                            size='sm'
                            disabled={page >= totalPages}
                            asChild
                        >
                            <Link href={`/chat/conversations?page=${page + 1}`}>
                                Next
                            </Link>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

function getPathname(url: string): string {
    try {
        return new URL(url).pathname
    } catch {
        return url || '/'
    }
}
