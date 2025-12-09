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
    Star,
    StarOff,
    ArrowRight,
} from 'lucide-react'
import Image from 'next/image'

import { BeforeAfterFormDialog } from '@/components/gallery/before-after-form.component'
import {
    deleteBeforeAfterPair,
    togglePairFeatured,
} from '@/lib/actions/gallery.action'
import type {
    BeforeAfterPairListItem,
    GalleryMediaOption,
} from '@/lib/queries/gallery.query'

type BeforeAfterPageClientProps = {
    pairs: BeforeAfterPairListItem[]
    mediaOptions: GalleryMediaOption[]
}

export function BeforeAfterPageClient({
    pairs,
    mediaOptions,
}: BeforeAfterPageClientProps) {
    const router = useRouter()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingPair, setEditingPair] =
        useState<BeforeAfterPairListItem | null>(null)

    const handleCreate = () => {
        setEditingPair(null)
        setDialogOpen(true)
    }

    const handleEdit = (pair: BeforeAfterPairListItem) => {
        setEditingPair(pair)
        setDialogOpen(true)
    }

    const handleToggleFeatured = async (id: string, isFeatured: boolean) => {
        await togglePairFeatured(id, !isFeatured)
        router.refresh()
    }

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this comparison?')) {
            await deleteBeforeAfterPair(id)
            router.refresh()
        }
    }

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-2xl font-semibold'>Before & After</h1>
                    <p className='text-muted-foreground'>
                        Manage transformation comparisons ({pairs.length} pairs)
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className='mr-2 h-4 w-4' />
                    Create Pair
                </Button>
            </div>

            {/* Table */}
            <Card>
                <CardContent className='p-0'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='w-[200px]'>
                                    Comparison
                                </TableHead>
                                <TableHead>Procedure</TableHead>
                                <TableHead>Timeframe</TableHead>
                                <TableHead>Order</TableHead>
                                <TableHead>Featured</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className='w-[80px]'>
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pairs.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className='text-muted-foreground py-8 text-center'
                                    >
                                        No comparisons created yet.{' '}
                                        <button
                                            onClick={handleCreate}
                                            className='text-blue-600 hover:underline'
                                        >
                                            Create your first pair
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pairs.map((pair) => (
                                    <TableRow key={pair.id}>
                                        <TableCell>
                                            <div className='flex items-center gap-2'>
                                                <div className='relative h-16 w-12 overflow-hidden rounded-md bg-stone-100'>
                                                    <Image
                                                        src={
                                                            pair.beforeMediaUrl
                                                        }
                                                        alt='Before'
                                                        fill
                                                        className='object-cover'
                                                        sizes='48px'
                                                    />
                                                    <div className='absolute right-0 bottom-0 left-0 bg-black/60 px-1 py-0.5 text-center text-[10px] text-white'>
                                                        Before
                                                    </div>
                                                </div>
                                                <ArrowRight className='text-muted-foreground h-4 w-4' />
                                                <div className='relative h-16 w-12 overflow-hidden rounded-md bg-stone-100'>
                                                    <Image
                                                        src={pair.afterMediaUrl}
                                                        alt='After'
                                                        fill
                                                        className='object-cover'
                                                        sizes='48px'
                                                    />
                                                    <div className='absolute right-0 bottom-0 left-0 bg-black/60 px-1 py-0.5 text-center text-[10px] text-white'>
                                                        After
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className='text-sm'>
                                                {pair.procedureType || '-'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className='text-muted-foreground text-sm'>
                                                {pair.timeframe || '-'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className='text-muted-foreground text-sm'>
                                                {pair.displayOrder}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {pair.isFeatured ? (
                                                <Badge variant='default'>
                                                    <Star className='mr-1 h-3 w-3 fill-current' />
                                                    Featured
                                                </Badge>
                                            ) : (
                                                <Badge variant='secondary'>
                                                    <StarOff className='mr-1 h-3 w-3' />
                                                    Normal
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className='text-muted-foreground text-sm'>
                                                {new Date(
                                                    pair.createdAt
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
                                                            handleEdit(pair)
                                                        }
                                                    >
                                                        <Pencil className='mr-2 h-4 w-4' />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleToggleFeatured(
                                                                pair.id,
                                                                pair.isFeatured
                                                            )
                                                        }
                                                    >
                                                        {pair.isFeatured ? (
                                                            <>
                                                                <StarOff className='mr-2 h-4 w-4' />
                                                                Unfeature
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Star className='mr-2 h-4 w-4' />
                                                                Feature
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleDelete(
                                                                pair.id
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
            <BeforeAfterFormDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                mediaOptions={mediaOptions}
                initialData={
                    editingPair
                        ? {
                              id: editingPair.id,
                              beforeMediaId: editingPair.beforeMediaId,
                              afterMediaId: editingPair.afterMediaId,
                              procedureType: editingPair.procedureType,
                              patientInfo: null,
                              timeframe: editingPair.timeframe,
                              isFeatured: editingPair.isFeatured,
                              displayOrder: editingPair.displayOrder,
                          }
                        : undefined
                }
                mode={editingPair ? 'edit' : 'create'}
            />
        </div>
    )
}
