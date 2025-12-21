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
} from '@/lib/types/gallery/gallery-media.type'
import { SelectableMediaGrid } from '@/components/shared/selectable-media-grid.component'
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
        hasGroup?: boolean | null
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

    // State for infinite scroll in grid view
    const [loadedMedia, setLoadedMedia] =
        useState<GalleryMediaListItem[]>(media)
    const [currentPage, setCurrentPage] = useState(currentFilters.page)
    const [totalCount, setTotalCount] = useState(total)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [loadError, setLoadError] = useState<string | null>(null)
    const isFetchingRef = useRef(false)

    const hasMore = loadedMedia.length < totalCount

    // Reset loaded media when filters change (via URL navigation)
    useEffect(() => {
        setLoadedMedia(media)
        setCurrentPage(currentFilters.page)
        setTotalCount(total)
        setSelectedIds(new Set())
        setLoadError(null)
    }, [
        media,
        total,
        currentFilters.page,
        currentFilters.sortBy,
        currentFilters.sortOrder,
        currentFilters.status,
        currentFilters.type,
        currentFilters.groupId,
        currentFilters.hasGroup,
    ])

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

    const handleLoadMore = useCallback(async () => {
        if (isFetchingRef.current || isLoadingMore || !hasMore) {
            return
        }

        isFetchingRef.current = true
        setIsLoadingMore(true)
        setLoadError(null)

        try {
            const nextPage = currentPage + 1
            const params = new URLSearchParams({
                page: String(nextPage),
                pageSize: '20',
                sortBy: currentFilters.sortBy,
                sortOrder: currentFilters.sortOrder,
                status: currentFilters.status,
                type: currentFilters.type,
            })

            if (currentFilters.groupId) {
                params.append('groupId', currentFilters.groupId)
            }

            if (
                currentFilters.hasGroup !== null &&
                currentFilters.hasGroup !== undefined
            ) {
                params.append('hasGroup', String(currentFilters.hasGroup))
            }

            const response = await fetch(
                `/api/gallery/media?${params.toString()}`,
                {
                    method: 'GET',
                    cache: 'no-store',
                }
            )

            if (!response.ok) {
                throw new Error('Failed to load more media')
            }

            const data = (await response.json()) as {
                media: GalleryMediaListItem[]
                total: number
            }

            setLoadedMedia((prev) => {
                // Deduplicate in case of race conditions
                const seen = new Set(prev.map((m) => m.id))
                const newMedia = data.media.filter(
                    (m: GalleryMediaListItem) => !seen.has(m.id)
                )
                return [...prev, ...newMedia]
            })
            setCurrentPage(nextPage)
            setTotalCount(data.total)
        } catch (error) {
            console.error('Error loading more media:', error)
            setLoadError('Failed to load more media. Please try again.')
        } finally {
            setIsLoadingMore(false)
            isFetchingRef.current = false
        }
    }, [
        isLoadingMore,
        hasMore,
        currentPage,
        currentFilters.sortBy,
        currentFilters.sortOrder,
        currentFilters.status,
        currentFilters.type,
        currentFilters.groupId,
        currentFilters.hasGroup,
    ])

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
        if (selectedIds.size === loadedMedia.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(loadedMedia.map((m) => m.id)))
        }
    }

    const handleClearSelection = useCallback(() => {
        setSelectedIds(new Set())
    }, [])

    const handleActionComplete = useCallback(() => {
        router.refresh()
    }, [router])

    const allSelected =
        selectedIds.size === loadedMedia.length && loadedMedia.length > 0

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

                {viewMode === 'grid' && loadedMedia.length > 0 && (
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
                                {selectedIds.size} of {loadedMedia.length}{' '}
                                selected
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
                <SelectableMediaGrid
                    media={loadedMedia}
                    selectedIds={selectedIds}
                    onToggleSelection={handleToggle}
                    isLoading={false}
                    isLoadingMore={isLoadingMore}
                    hasMore={hasMore}
                    onLoadMore={handleLoadMore}
                    error={loadError}
                />
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
