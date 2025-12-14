'use client'

import { useRef, useEffect } from 'react'
import { Loader2 } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'

import { SelectableMediaCard } from './selectable-media-card.component'
import type { GalleryMediaListItem } from '@/lib/queries/gallery.query'

type SelectableMediaGridProps = {
    media: GalleryMediaListItem[]
    selectedIds: Set<string>
    onToggleSelection: (mediaId: string) => void
    isLoading: boolean
    isLoadingMore: boolean
    hasMore: boolean
    onLoadMore: () => void
    error: string | null
}

export function SelectableMediaGrid({
    media,
    selectedIds,
    onToggleSelection,
    isLoading,
    isLoadingMore,
    hasMore,
    onLoadMore,
    error,
}: SelectableMediaGridProps) {
    const loadMoreRef = useRef<HTMLDivElement>(null)
    const hasMoreRef = useRef(hasMore)
    const isLoadingMoreRef = useRef(isLoadingMore)

    // Keep refs in sync with props
    useEffect(() => {
        hasMoreRef.current = hasMore
        isLoadingMoreRef.current = isLoadingMore
    }, [hasMore, isLoadingMore])

    // IntersectionObserver for infinite scroll
    useEffect(() => {
        const node = loadMoreRef.current
        if (!node) return

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries
                if (entry?.isIntersecting) {
                    // Check if we should load more before calling onLoadMore
                    if (!hasMoreRef.current || isLoadingMoreRef.current) {
                        return
                    }
                    onLoadMore()
                }
            },
            { rootMargin: '200px' }
        )

        observer.observe(node)
        return () => observer.disconnect()
    }, [onLoadMore])

    if (isLoading) {
        return (
            <div className='flex items-center justify-center py-12'>
                <Loader2 className='h-8 w-8 animate-spin' />
            </div>
        )
    }

    if (error) {
        return <div className='py-12 text-center text-red-600'>{error}</div>
    }

    if (media.length === 0) {
        return (
            <div className='text-muted-foreground py-12 text-center'>
                No media found matching your filters
            </div>
        )
    }

    return (
        <>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                {media.map((item) => (
                    <SelectableMediaCard
                        key={item.id}
                        media={item}
                        isSelected={selectedIds.has(item.id)}
                        onToggle={onToggleSelection}
                    />
                ))}
            </div>

            {/* Infinite scroll trigger */}
            {hasMore && (
                <div ref={loadMoreRef} className='py-4 text-center'>
                    {isLoadingMore ? (
                        <Loader2 className='mx-auto h-6 w-6 animate-spin' />
                    ) : (
                        <Button
                            variant='outline'
                            onClick={onLoadMore}
                            disabled={isLoadingMore}
                        >
                            Load More
                        </Button>
                    )}
                </div>
            )}
        </>
    )
}
