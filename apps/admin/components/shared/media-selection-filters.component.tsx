'use client'

import { Search } from 'lucide-react'

import { Input } from '@workspace/ui/components/input'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select'

import type {
    GalleryMediaSortBy,
    GalleryMediaSortOrder,
    GalleryMediaStatusFilter,
    GalleryMediaTypeFilter,
} from '@/lib/queries/gallery.query'

type MediaSelectionFiltersProps = {
    search: string
    onSearchChange: (value: string) => void
    status: GalleryMediaStatusFilter
    onStatusChange: (value: GalleryMediaStatusFilter) => void
    type: GalleryMediaTypeFilter
    onTypeChange: (value: GalleryMediaTypeFilter) => void
    hasGroup: 'all' | 'yes' | 'no'
    onHasGroupChange: (value: 'all' | 'yes' | 'no') => void
    sortBy: GalleryMediaSortBy
    onSortByChange: (value: GalleryMediaSortBy) => void
    sortOrder: GalleryMediaSortOrder
    onSortOrderChange: (value: GalleryMediaSortOrder) => void
    selectedCount: number
    onSelectAllVisible: () => void
    onClearSelection: () => void
}

export function MediaSelectionFilters({
    search,
    onSearchChange,
    status,
    onStatusChange,
    type,
    onTypeChange,
    hasGroup,
    onHasGroupChange,
    sortBy,
    onSortByChange,
    sortOrder,
    onSortOrderChange,
    selectedCount,
    onSelectAllVisible,
    onClearSelection,
}: MediaSelectionFiltersProps) {
    return (
        <div className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                <div className='relative space-y-2'>
                    <Search className='text-muted-foreground absolute top-3 left-3 h-4 w-4' />
                    <Input
                        placeholder='Search by title...'
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className='pl-9'
                    />
                </div>

                <Select
                    value={status}
                    onValueChange={(v) =>
                        onStatusChange(v as GalleryMediaStatusFilter)
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder='Status' />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='all'>All Status</SelectItem>
                        <SelectItem value='draft'>Draft</SelectItem>
                        <SelectItem value='published'>Published</SelectItem>
                        <SelectItem value='archived'>Archived</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={type}
                    onValueChange={(v) =>
                        onTypeChange(v as GalleryMediaTypeFilter)
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder='Type' />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='all'>All Types</SelectItem>
                        <SelectItem value='image'>Images</SelectItem>
                        <SelectItem value='video'>Videos</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={hasGroup}
                    onValueChange={(v) =>
                        onHasGroupChange(v as 'all' | 'yes' | 'no')
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder='Group Status' />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='all'>All Media</SelectItem>
                        <SelectItem value='yes'>In a Group</SelectItem>
                        <SelectItem value='no'>Not in a Group</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                    <Select
                        value={sortBy}
                        onValueChange={(v) =>
                            onSortByChange(v as GalleryMediaSortBy)
                        }
                    >
                        <SelectTrigger className='w-[180px]'>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='createdAt'>
                                Date Created
                            </SelectItem>
                            <SelectItem value='title'>Title</SelectItem>
                            <SelectItem value='displayOrder'>
                                Display Order
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={sortOrder}
                        onValueChange={(v) =>
                            onSortOrderChange(v as GalleryMediaSortOrder)
                        }
                    >
                        <SelectTrigger className='w-[120px]'>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='asc'>Ascending</SelectItem>
                            <SelectItem value='desc'>Descending</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {selectedCount > 0 && (
                    <div className='flex items-center gap-2'>
                        <Badge variant='secondary'>
                            {selectedCount} selected
                        </Badge>
                        <Button
                            variant='ghost'
                            size='sm'
                            onClick={onSelectAllVisible}
                        >
                            Select All Visible
                        </Button>
                        <Button
                            variant='ghost'
                            size='sm'
                            onClick={onClearSelection}
                        >
                            Clear
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
