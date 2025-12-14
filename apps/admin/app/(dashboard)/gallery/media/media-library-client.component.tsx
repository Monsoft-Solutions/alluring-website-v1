'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
    CheckSquare,
    Square,
    Grid3X3,
    List,
    Upload as UploadIcon,
} from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@workspace/ui/components/dialog'

import type {
    GalleryMediaListItem,
    GalleryMediaSortBy,
    GalleryMediaSortOrder,
    GalleryMediaStatusFilter,
    GalleryMediaTypeFilter,
} from '@/lib/queries/gallery.query'
import { SelectableMediaCard } from '@/components/shared/selectable-media-card.component'
import { BulkActionToolbar } from '@/components/shared/gallery/bulk-action-toolbar.component'
import { BulkUploadSection } from '@/components/shared/gallery/bulk-upload-section.component'

type ViewMode = 'table' | 'grid'

type MediaLibraryClientProps = {
    media: GalleryMediaListItem[]
    total: number
    currentFilters: {
        page: number
        sortBy: GalleryMediaSortBy
        sortOrder: GalleryMediaSortOrder
        status: GalleryMediaStatusFilter
        type: GalleryMediaTypeFilter
        groupId?: string
    }
    tableView: React.ReactNode
}

export function MediaLibraryClient({
    media,
    total,
    currentFilters,
    tableView,
}: MediaLibraryClientProps) {
    const router = useRouter()
    const [viewMode, setViewMode] = useState<ViewMode>('table')
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false)
    const mediaCountRef = useRef(total)

    // Clear selection when media count changes (after bulk operations)
    useEffect(() => {
        if (mediaCountRef.current !== total) {
            mediaCountRef.current = total
            queueMicrotask(() => {
                setSelectedIds(new Set())
            })
        }
    }, [total])

    // Handle ESC key to clear selection
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && selectedIds.size > 0) {
                setSelectedIds(new Set())
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [selectedIds.size])

    const handleToggle = useCallback((mediaId: string) => {
        setSelectedIds((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(mediaId)) {
                newSet.delete(mediaId)
            } else {
                newSet.add(mediaId)
            }
            return newSet
        })
    }, [])

    const handleSelectAll = () => {
        if (selectedIds.size === media.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(media.map((m) => m.id)))
        }
    }

    const handleClearSelection = useCallback(() => {
        setSelectedIds(new Set())
    }, [])

    const handleActionComplete = useCallback(() => {
        router.refresh()
    }, [router])

    const allSelected = selectedIds.size === media.length && media.length > 0

    return (
        <div className='space-y-4'>
            {/* View mode controls */}
            <div className='flex items-center justify-between gap-4'>
                <div className='flex items-center gap-2'>
                    <Button
                        variant={viewMode === 'table' ? 'secondary' : 'outline'}
                        size='sm'
                        onClick={() => {
                            setViewMode('table')
                            setSelectedIds(new Set())
                        }}
                    >
                        <List className='mr-1.5 h-4 w-4' />
                        Table
                    </Button>
                    <Button
                        variant={viewMode === 'grid' ? 'secondary' : 'outline'}
                        size='sm'
                        onClick={() => setViewMode('grid')}
                    >
                        <Grid3X3 className='mr-1.5 h-4 w-4' />
                        Grid
                    </Button>
                </div>

                {viewMode === 'grid' && media.length > 0 && (
                    <div className='flex items-center gap-2'>
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={handleSelectAll}
                        >
                            {allSelected ? (
                                <>
                                    <CheckSquare className='mr-1.5 h-4 w-4' />
                                    Deselect All
                                </>
                            ) : (
                                <>
                                    <Square className='mr-1.5 h-4 w-4' />
                                    Select All
                                </>
                            )}
                        </Button>
                        {selectedIds.size > 0 && (
                            <p className='text-muted-foreground text-sm'>
                                {selectedIds.size} of {media.length} selected
                            </p>
                        )}
                    </div>
                )}

                <Dialog
                    open={isBulkUploadOpen}
                    onOpenChange={setIsBulkUploadOpen}
                >
                    <DialogTrigger asChild>
                        <Button variant='outline' size='sm'>
                            <UploadIcon className='mr-1.5 h-4 w-4' />
                            Bulk Upload
                        </Button>
                    </DialogTrigger>
                    <DialogContent className='max-w-4xl'>
                        <DialogHeader>
                            <DialogTitle>Bulk Upload Images</DialogTitle>
                            <DialogDescription>
                                Upload up to 20 images at once. They will be
                                automatically analyzed and saved as drafts.
                            </DialogDescription>
                        </DialogHeader>
                        <BulkUploadSection />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Content - either table or grid view */}
            {viewMode === 'table' ? (
                tableView
            ) : (
                <>
                    {media.length === 0 ? (
                        <div className='text-muted-foreground py-12 text-center'>
                            No media found matching your filters
                        </div>
                    ) : (
                        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                            {media.map((item) => (
                                <SelectableMediaCard
                                    key={item.id}
                                    media={item}
                                    isSelected={selectedIds.has(item.id)}
                                    onToggle={handleToggle}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Bulk action toolbar (sticky at bottom) */}
            {viewMode === 'grid' && (
                <>
                    <BulkActionToolbar
                        groupId={currentFilters.groupId}
                        selectedIds={Array.from(selectedIds)}
                        onClearSelection={handleClearSelection}
                        onActionComplete={handleActionComplete}
                    />

                    {/* Bottom padding to prevent toolbar overlap */}
                    {selectedIds.size > 0 && <div className='h-24' />}
                </>
            )}
        </div>
    )
}
