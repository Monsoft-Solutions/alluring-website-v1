'use client'

import { useState, useEffect, useRef, useCallback, useTransition } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog'
import { Button } from '@workspace/ui/components/button'

import { addMediaToGroup } from '@/lib/actions/gallery-bulk.action'
import { MediaSelectionFilters } from './media-selection-filters.component'
import { SelectableMediaGrid } from './selectable-media-grid.component'

import type {
    GalleryMediaListItem,
    GalleryMediaSortBy,
    GalleryMediaSortOrder,
    GalleryMediaStatusFilter,
    GalleryMediaTypeFilter,
} from '@/lib/queries/gallery.query'

type MediaSelectionDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSelect: (mediaIds: string[]) => void
    groupId: string
    multiSelect?: boolean
    excludeMediaIds?: string[]
}

const PAGE_SIZE = 24

export function MediaSelectionDialog({
    open,
    onOpenChange,
    onSelect,
    groupId,
    multiSelect = true,
    excludeMediaIds = [],
}: MediaSelectionDialogProps) {
    const [isPending, startTransition] = useTransition()
    const [media, setMedia] = useState<GalleryMediaListItem[]>([])
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [page, setPage] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Filters
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState<GalleryMediaStatusFilter>('all')
    const [type, setType] = useState<GalleryMediaTypeFilter>('all')
    const [hasGroup, setHasGroup] = useState<'all' | 'yes' | 'no'>('all')
    const [sortBy, setSortBy] = useState<GalleryMediaSortBy>('createdAt')
    const [sortOrder, setSortOrder] = useState<GalleryMediaSortOrder>('desc')

    const isFetchingRef = useRef(false)
    const hasHydrated = useRef(false)
    const prevFiltersRef = useRef({
        search,
        status,
        type,
        hasGroup,
        sortBy,
        sortOrder,
    })
    const handleLoadMoreRef = useRef<() => void>(() => {})

    const hasMore = media.length < totalCount

    const mergeMedia = useCallback(
        (incoming: GalleryMediaListItem[], replace: boolean) => {
            if (replace) {
                setMedia(incoming)
                return
            }

            setMedia((current) => {
                const seen = new Set(current.map((m) => m.id))
                const merged = [...current]

                for (const item of incoming) {
                    if (!seen.has(item.id)) {
                        merged.push(item)
                        seen.add(item.id)
                    }
                }

                return merged
            })
        },
        []
    )

    const fetchPage = useCallback(
        async (nextPage: number, { replace }: { replace: boolean }) => {
            if (isFetchingRef.current) return
            isFetchingRef.current = true

            setError(null)
            if (replace) {
                setIsLoading(true)
            } else {
                setIsLoadingMore(true)
            }

            try {
                const params = new URLSearchParams({
                    page: String(nextPage),
                    pageSize: String(PAGE_SIZE),
                    sortBy,
                    sortOrder,
                    status,
                    type,
                })

                if (search) {
                    params.append('search', search)
                }

                if (hasGroup !== 'all') {
                    params.append(
                        'hasGroup',
                        hasGroup === 'yes' ? 'true' : 'false'
                    )
                }

                if (excludeMediaIds.length > 0) {
                    params.append('excludeMediaIds', excludeMediaIds.join(','))
                }

                const response = await fetch(
                    `/api/gallery/media/selection?${params.toString()}`,
                    {
                        method: 'GET',
                        cache: 'no-store',
                    }
                )

                if (!response.ok) {
                    throw new Error('Failed to load media')
                }

                const data = await response.json()
                mergeMedia(data.media ?? [], replace)
                setTotalCount(data.total ?? 0)
                setPage(nextPage)
            } catch (fetchError) {
                console.error('Error loading media', fetchError)
                setError('Unable to load media. Please try again.')
            } finally {
                if (replace) {
                    setIsLoading(false)
                } else {
                    setIsLoadingMore(false)
                }
                isFetchingRef.current = false
            }
        },
        [
            mergeMedia,
            sortBy,
            sortOrder,
            status,
            type,
            search,
            hasGroup,
            excludeMediaIds,
        ]
    )

    // Update the handleLoadMore ref whenever dependencies change
    useEffect(() => {
        handleLoadMoreRef.current = () => {
            if (isFetchingRef.current || media.length >= totalCount) return
            void fetchPage(page + 1, { replace: false })
        }
    }, [fetchPage, page, media.length, totalCount])

    // Stable callback that delegates to the ref
    const handleLoadMore = useCallback(() => {
        handleLoadMoreRef.current()
    }, [])

    // Handle filter changes
    useEffect(() => {
        if (!open) return

        if (!hasHydrated.current) {
            hasHydrated.current = true
            void fetchPage(1, { replace: true })
            return
        }

        const prev = prevFiltersRef.current
        if (
            prev.search !== search ||
            prev.status !== status ||
            prev.type !== type ||
            prev.hasGroup !== hasGroup ||
            prev.sortBy !== sortBy ||
            prev.sortOrder !== sortOrder
        ) {
            prevFiltersRef.current = {
                search,
                status,
                type,
                hasGroup,
                sortBy,
                sortOrder,
            }
            void fetchPage(1, { replace: true })
        }
    }, [open, search, status, type, hasGroup, sortBy, sortOrder, fetchPage])

    // Reset when dialog closes
    useEffect(() => {
        if (!open) {
            setSelectedIds(new Set())
            setSearch('')
            setStatus('all')
            setType('all')
            setHasGroup('all')
            setSortBy('createdAt')
            setSortOrder('desc')
            setMedia([])
            setPage(1)
            setTotalCount(0)
            hasHydrated.current = false
        }
    }, [open])

    const toggleSelection = (mediaId: string) => {
        if (!multiSelect) {
            setSelectedIds(new Set([mediaId]))
            return
        }

        setSelectedIds((prev) => {
            const next = new Set(prev)
            if (next.has(mediaId)) {
                next.delete(mediaId)
            } else {
                next.add(mediaId)
            }
            return next
        })
    }

    const selectAllVisible = () => {
        setSelectedIds(new Set(media.map((m) => m.id)))
    }

    const clearSelection = () => {
        setSelectedIds(new Set())
    }

    const handleAddToGroup = () => {
        if (selectedIds.size === 0) {
            toast.error('Please select at least one media item')
            return
        }

        startTransition(async () => {
            try {
                const result = await addMediaToGroup(
                    groupId,
                    Array.from(selectedIds)
                )

                if (result.success) {
                    toast.success(`Added ${selectedIds.size} item(s) to group`)
                    onSelect(Array.from(selectedIds))
                    onOpenChange(false)
                } else {
                    toast.error(result.error || 'Failed to add media to group')
                }
            } catch (error) {
                console.error('Error adding media to group:', error)
                toast.error('An unexpected error occurred')
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent size='xl'>
                <DialogHeader>
                    <DialogTitle>Select Media from Gallery</DialogTitle>
                    <DialogDescription>
                        Choose media items to add to this group
                    </DialogDescription>
                </DialogHeader>

                {/* Filters */}
                <MediaSelectionFilters
                    search={search}
                    onSearchChange={setSearch}
                    status={status}
                    onStatusChange={setStatus}
                    type={type}
                    onTypeChange={setType}
                    hasGroup={hasGroup}
                    onHasGroupChange={setHasGroup}
                    sortBy={sortBy}
                    onSortByChange={setSortBy}
                    sortOrder={sortOrder}
                    onSortOrderChange={setSortOrder}
                    selectedCount={selectedIds.size}
                    onSelectAllVisible={selectAllVisible}
                    onClearSelection={clearSelection}
                />

                {/* Media Grid */}
                <div className='max-h-[60vh] overflow-y-auto'>
                    <SelectableMediaGrid
                        media={media}
                        selectedIds={selectedIds}
                        onToggleSelection={toggleSelection}
                        isLoading={isLoading}
                        isLoadingMore={isLoadingMore}
                        hasMore={hasMore}
                        onLoadMore={handleLoadMore}
                        error={error}
                    />
                </div>

                <DialogFooter>
                    <div className='flex w-full items-center justify-between'>
                        <p className='text-muted-foreground text-sm'>
                            Showing {media.length} of {totalCount} items
                        </p>
                        <div className='flex gap-2'>
                            <Button
                                variant='outline'
                                onClick={() => onOpenChange(false)}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAddToGroup}
                                disabled={isPending || selectedIds.size === 0}
                            >
                                {isPending && (
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                )}
                                Add {selectedIds.size} to Group
                            </Button>
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
