/**
 * Quick Replies Admin Page
 *
 * Manage quick reply buttons for the chat widget.
 *
 * @module app/(dashboard)/chat/quick-replies/page
 */
import Link from 'next/link'
import { ArrowLeft, Plus, MessageSquare } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@workspace/ui/components/dialog'

import { getQuickReplies } from '@/lib/queries/chat.query'
import { QuickReplyForm } from '@/components/chat/quick-reply-form.component'
import { QuickReplyActions } from './quick-reply-actions.component'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const CATEGORY_LABELS: Record<string, string> = {
    initial: 'Initial',
    procedures: 'Procedures',
    pricing: 'Pricing',
    scheduling: 'Scheduling',
    general: 'General',
    closing: 'Closing',
}

const CATEGORY_COLORS: Record<string, string> = {
    initial: 'bg-blue-100 text-blue-800',
    procedures: 'bg-purple-100 text-purple-800',
    pricing: 'bg-green-100 text-green-800',
    scheduling: 'bg-yellow-100 text-yellow-800',
    general: 'bg-stone-100 text-stone-800',
    closing: 'bg-red-100 text-red-800',
}

export default async function QuickRepliesPage() {
    const quickReplies = await getQuickReplies()

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

            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-2xl font-semibold'>Quick Replies</h1>
                    <p className='text-muted-foreground'>
                        Manage quick reply buttons shown in the chat widget
                    </p>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className='mr-2 h-4 w-4' />
                            Add Quick Reply
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Quick Reply</DialogTitle>
                            <DialogDescription>
                                Add a new quick reply button for the chat widget
                            </DialogDescription>
                        </DialogHeader>
                        <QuickReplyForm />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats */}
            <div className='grid gap-4 md:grid-cols-3'>
                <Card>
                    <CardHeader className='pb-2'>
                        <CardTitle className='text-sm font-medium'>
                            Total Quick Replies
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>
                            {quickReplies.length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className='pb-2'>
                        <CardTitle className='text-sm font-medium'>
                            Active
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>
                            {quickReplies.filter((r) => r.isActive).length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className='pb-2'>
                        <CardTitle className='text-sm font-medium'>
                            Total Clicks
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>
                            {quickReplies.reduce(
                                (sum, r) => sum + r.clickCount,
                                0
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Replies Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Quick Replies</CardTitle>
                    <CardDescription>
                        Quick replies are shown to users based on conversation
                        context
                    </CardDescription>
                </CardHeader>
                <CardContent className='p-0'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Label</TableHead>
                                <TableHead>Message</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead className='text-center'>
                                    Clicks
                                </TableHead>
                                <TableHead className='text-center'>
                                    Status
                                </TableHead>
                                <TableHead className='w-[100px]'></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {quickReplies.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className='py-8 text-center'
                                    >
                                        <MessageSquare className='text-muted-foreground mx-auto mb-2 h-8 w-8' />
                                        <p className='text-muted-foreground'>
                                            No quick replies yet
                                        </p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                quickReplies.map((reply) => (
                                    <TableRow key={reply.id}>
                                        <TableCell className='font-medium'>
                                            {reply.label}
                                        </TableCell>
                                        <TableCell className='max-w-[300px] truncate text-sm text-stone-600'>
                                            {reply.message}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant='outline'
                                                className={
                                                    CATEGORY_COLORS[
                                                        reply.category
                                                    ] ?? ''
                                                }
                                            >
                                                {CATEGORY_LABELS[
                                                    reply.category
                                                ] ?? reply.category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className='text-center tabular-nums'>
                                            {reply.clickCount}
                                        </TableCell>
                                        <TableCell className='text-center'>
                                            <Badge
                                                variant={
                                                    reply.isActive
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {reply.isActive
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <QuickReplyActions reply={reply} />
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
