'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { CheckSquare, Square } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'

import type { GalleryMediaListItem } from '@/lib/queries/gallery.query'
import { SelectableCurrentMediaCard } from './selectable-current-media-card.component'
import { BulkActionToolbar } from './bulk-action-toolbar.component'

type CurrentMediaGridProps = {
    groupId: string
    groupMedia: GalleryMediaListItem[]
}

export function CurrentMediaGrid({
    groupId,
    groupMedia,
}: CurrentMediaGridProps) {
    const router = useRouter()
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const mediaCountRef = useRef(groupMedia.length)

    // Clear selection when bulk operations complete (media count changes)
    // Using queueMicrotask to avoid synchronous setState in effect
    useEffect(() => {
        if (mediaCountRef.current !== groupMedia.length) {
            mediaCountRef.current = groupMedia.length
            queueMicrotask(() => {
                setSelectedIds(new Set())
            })
        }
    }, [groupMedia.length])

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
        if (selectedIds.size === groupMedia.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(groupMedia.map((m) => m.id)))
        }
    }

    const handleClearSelection = useCallback(() => {
        setSelectedIds(new Set())
    }, [])

    const handleActionComplete = useCallback(() => {
        router.refresh()
    }, [router])

    if (groupMedia.length === 0) {
        return (
            <div className='text-muted-foreground py-8 text-center'>
                No media in this group yet. Upload new media or select from the
                gallery.
            </div>
        )
    }

    const allSelected = selectedIds.size === groupMedia.length

    return (
        <div className='space-y-4'>
            {/* Header with selection controls */}
            <div className='flex items-center justify-between'>
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
                            {selectedIds.size} of {groupMedia.length} selected
                        </p>
                    )}
                </div>

                {selectedIds.size > 0 && (
                    <Button
                        variant='ghost'
                        size='sm'
                        onClick={handleClearSelection}
                    >
                        Clear Selection
                    </Button>
                )}
            </div>

            {/* Grid */}
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                {groupMedia.map((media) => (
                    <SelectableCurrentMediaCard
                        key={media.id}
                        media={media}
                        isSelected={selectedIds.has(media.id)}
                        onToggle={handleToggle}
                    />
                ))}
            </div>

            {/* Bulk action toolbar (sticky at bottom) */}
            <BulkActionToolbar
                groupId={groupId}
                selectedIds={Array.from(selectedIds)}
                onClearSelection={handleClearSelection}
                onActionComplete={handleActionComplete}
            />

            {/* Bottom padding to prevent toolbar overlap */}
            {selectedIds.size > 0 && <div className='h-24' />}
        </div>
    )
}
