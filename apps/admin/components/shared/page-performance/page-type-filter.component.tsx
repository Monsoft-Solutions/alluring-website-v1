'use client'

import {
    FileText,
    Stethoscope,
    Globe,
    LayoutList,
    Image,
    Tag,
    HelpCircle,
} from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'

import type { PageType } from '@/lib/types/search-console/search-console.type'

type PageTypeOption = {
    value: PageType | 'all'
    label: string
    icon: React.ReactNode
}

const PAGE_TYPE_OPTIONS: PageTypeOption[] = [
    { value: 'all', label: 'All', icon: <Globe className='h-4 w-4' /> },
    {
        value: 'blog',
        label: 'Blog Posts',
        icon: <FileText className='h-4 w-4' />,
    },
    {
        value: 'blog-listing',
        label: 'Blog Listing',
        icon: <LayoutList className='h-4 w-4' />,
    },
    {
        value: 'procedure',
        label: 'Procedures',
        icon: <Stethoscope className='h-4 w-4' />,
    },
    {
        value: 'pages',
        label: 'Pages',
        icon: <Globe className='h-4 w-4' />,
    },
    {
        value: 'gallery',
        label: 'Gallery',
        icon: <Image className='h-4 w-4' />,
    },
    {
        value: 'promotion',
        label: 'Promotions',
        icon: <Tag className='h-4 w-4' />,
    },
    {
        value: 'other',
        label: 'Other',
        icon: <HelpCircle className='h-4 w-4' />,
    },
]

type PageTypeFilterProps = {
    /** Currently selected page type */
    value: PageType | 'all'
    /** Callback when selection changes */
    onChange: (value: PageType | 'all') => void
    /** Additional class names */
    className?: string
}

/**
 * Filter buttons for page type selection.
 * Shared component for filtering pages by category.
 */
export function PageTypeFilter({
    value,
    onChange,
    className,
}: PageTypeFilterProps) {
    return (
        <div className={cn('flex flex-wrap gap-2', className)}>
            {PAGE_TYPE_OPTIONS.map((option) => (
                <Button
                    key={option.value}
                    variant={value === option.value ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => onChange(option.value)}
                    className='gap-2'
                >
                    {option.icon}
                    {option.label}
                </Button>
            ))}
        </div>
    )
}
