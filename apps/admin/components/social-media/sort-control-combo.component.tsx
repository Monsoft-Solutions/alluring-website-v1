'use client'

import { ArrowDown, ArrowUp, Check } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@workspace/ui/components/popover'

import type {
    InstagramPostSortBy,
    InstagramPostSortDirection,
} from '@/lib/queries/social-media.query'

type SortControlComboProps = {
    sortBy: InstagramPostSortBy
    sortDirection: InstagramPostSortDirection
    onSortChange: (sortBy: InstagramPostSortBy) => void
    onDirectionChange: (direction: InstagramPostSortDirection) => void
    disabled?: boolean
}

const sortLabels: Record<InstagramPostSortBy, string> = {
    date: 'Date',
    likes: 'Likes',
    views: 'Views',
}

export function SortControlCombo({
    sortBy,
    sortDirection,
    onSortChange,
    onDirectionChange,
    disabled = false,
}: SortControlComboProps) {
    const handleSortSelect = (
        newSortBy: InstagramPostSortBy,
        newDirection: InstagramPostSortDirection
    ) => {
        if (newSortBy !== sortBy) {
            onSortChange(newSortBy)
        }
        if (newDirection !== sortDirection) {
            onDirectionChange(newDirection)
        }
    }

    const sortOptions: Array<{
        sortBy: InstagramPostSortBy
        direction: InstagramPostSortDirection
    }> = [
        { sortBy: 'date', direction: 'desc' },
        { sortBy: 'likes', direction: 'desc' },
        { sortBy: 'views', direction: 'desc' },
        { sortBy: 'date', direction: 'asc' },
        { sortBy: 'likes', direction: 'asc' },
        { sortBy: 'views', direction: 'asc' },
    ]

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant='outline'
                    disabled={disabled}
                    className='h-9 gap-0 px-0 transition-all hover:shadow-sm'
                    aria-label={`Sort by ${sortLabels[sortBy]}, ${sortDirection === 'desc' ? 'descending' : 'ascending'} order`}
                >
                    <span className='px-4 font-medium'>
                        {sortLabels[sortBy]}
                    </span>
                    <div className='bg-border h-full w-px' />
                    <span className='text-muted-foreground flex items-center gap-1.5 px-3'>
                        {sortDirection === 'desc' ? (
                            <>
                                <ArrowDown className='h-3.5 w-3.5' />
                                <span className='text-xs font-medium'>
                                    Desc
                                </span>
                            </>
                        ) : (
                            <>
                                <ArrowUp className='h-3.5 w-3.5' />
                                <span className='text-xs font-medium'>Asc</span>
                            </>
                        )}
                    </span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className='w-[320px] p-2' align='start'>
                <div className='grid grid-cols-3 gap-1'>
                    {sortOptions.map((option) => {
                        const isSelected =
                            option.sortBy === sortBy &&
                            option.direction === sortDirection
                        const Icon =
                            option.direction === 'desc' ? ArrowDown : ArrowUp

                        return (
                            <Button
                                key={`${option.sortBy}-${option.direction}`}
                                variant={isSelected ? 'secondary' : 'ghost'}
                                className='relative h-auto flex-col gap-1 py-3 transition-all hover:scale-105'
                                onClick={() =>
                                    handleSortSelect(
                                        option.sortBy,
                                        option.direction
                                    )
                                }
                                aria-label={`Sort by ${sortLabels[option.sortBy]} ${option.direction === 'desc' ? 'descending' : 'ascending'}`}
                            >
                                {isSelected && (
                                    <Check className='text-primary absolute top-1 right-1 h-3 w-3' />
                                )}
                                <Icon className='h-4 w-4' />
                                <span className='text-xs font-medium'>
                                    {sortLabels[option.sortBy]}
                                </span>
                                <span className='text-muted-foreground text-[10px] font-normal'>
                                    {option.direction === 'desc'
                                        ? 'High to Low'
                                        : 'Low to High'}
                                </span>
                            </Button>
                        )
                    })}
                </div>
            </PopoverContent>
        </Popover>
    )
}
