'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import {
    Plus,
    Pencil,
    Trash2,
    MoreHorizontal,
    Eye,
    EyeOff,
    ImageIcon,
} from 'lucide-react'
import Image from 'next/image'

import { GroupFormDialog } from '@/components/gallery/group-form.component'
import {
    deleteGalleryGroup,
    toggleGroupVisibility,
} from '@/lib/actions/gallery.action'
import type { GalleryGroupListItem } from '@/lib/queries/gallery.query'

type GroupsPageClientProps = {
    groups: GalleryGroupListItem[]
}

export function GroupsPageClient({ groups }: GroupsPageClientProps) {
    const router = useRouter()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingGroup, setEditingGroup] =
        useState<GalleryGroupListItem | null>(null)

    const handleCreate = () => {
        setEditingGroup(null)
        setDialogOpen(true)
    }

    const handleEdit = (group: GalleryGroupListItem) => {
        setEditingGroup(group)
        setDialogOpen(true)
    }

    const handleToggleVisibility = async (id: string, isVisible: boolean) => {
        await toggleGroupVisibility(id, !isVisible)
        router.refresh()
    }

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this group?')) {
            await deleteGalleryGroup(id)
            router.refresh()
        }
    }

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-2xl font-semibold'>Gallery Groups</h1>
                    <p className='text-muted-foreground'>
                        Organize your media into collections ({groups.length}{' '}
                        groups)
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className='mr-2 h-4 w-4' />
                    Create Group
                </Button>
            </div>

            {/* Table */}
            <Card>
                <CardContent className='p-0'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='w-[80px]'>
                                    Cover
                                </TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Media</TableHead>
                                <TableHead>Order</TableHead>
                                <TableHead>Visibility</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className='w-[80px]'>
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {groups.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className='text-muted-foreground py-8 text-center'
                                    >
                                        No groups created yet.{' '}
                                        <button
                                            onClick={handleCreate}
                                            className='text-blue-600 hover:underline'
                                        >
                                            Create your first group
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                groups.map((group) => (
                                    <TableRow key={group.id}>
                                        <TableCell>
                                            <div className='relative h-12 w-16 overflow-hidden rounded-md bg-stone-100'>
                                                {group.coverImageUrl ? (
                                                    <Image
                                                        src={
                                                            group.coverImageUrl
                                                        }
                                                        alt={group.name}
                                                        fill
                                                        className='object-cover'
                                                        sizes='64px'
                                                    />
                                                ) : (
                                                    <div className='flex h-full items-center justify-center'>
                                                        <ImageIcon className='text-muted-foreground h-5 w-5' />
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <button
                                                    onClick={() =>
                                                        handleEdit(group)
                                                    }
                                                    className='font-medium hover:text-blue-600 hover:underline'
                                                >
                                                    {group.name}
                                                </button>
                                                <p className='text-muted-foreground text-sm'>
                                                    /{group.slug}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className='text-sm'>
                                                {group.mediaCount} items
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className='text-muted-foreground text-sm'>
                                                {group.displayOrder}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    group.isVisible
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {group.isVisible ? (
                                                    <>
                                                        <Eye className='mr-1 h-3 w-3' />
                                                        Visible
                                                    </>
                                                ) : (
                                                    <>
                                                        <EyeOff className='mr-1 h-3 w-3' />
                                                        Hidden
                                                    </>
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className='text-muted-foreground text-sm'>
                                                {new Date(
                                                    group.createdAt
                                                ).toLocaleDateString()}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant='ghost'
                                                        size='sm'
                                                    >
                                                        <MoreHorizontal className='h-4 w-4' />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align='end'>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleEdit(group)
                                                        }
                                                    >
                                                        <Pencil className='mr-2 h-4 w-4' />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleToggleVisibility(
                                                                group.id,
                                                                group.isVisible
                                                            )
                                                        }
                                                    >
                                                        {group.isVisible ? (
                                                            <>
                                                                <EyeOff className='mr-2 h-4 w-4' />
                                                                Hide
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Eye className='mr-2 h-4 w-4' />
                                                                Show
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleDelete(
                                                                group.id
                                                            )
                                                        }
                                                        className='text-red-600'
                                                    >
                                                        <Trash2 className='mr-2 h-4 w-4' />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Dialog */}
            <GroupFormDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                initialData={
                    editingGroup
                        ? {
                              id: editingGroup.id,
                              name: editingGroup.name,
                              slug: editingGroup.slug,
                              description: editingGroup.description,
                              coverImageId: null,
                              displayOrder: editingGroup.displayOrder,
                              isVisible: editingGroup.isVisible,
                          }
                        : undefined
                }
                mode={editingGroup ? 'edit' : 'create'}
            />
        </div>
    )
}
