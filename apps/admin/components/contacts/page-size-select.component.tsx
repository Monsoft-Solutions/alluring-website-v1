'use client'

import { useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select'

import {
    DEFAULT_PAGE_SIZE,
    PAGE_SIZE_OPTIONS,
    type PageSize,
} from '@/components/contacts/page-size.constants'

type Props = {
    pageSize: PageSize
}

export function PageSizeSelect({ pageSize }: Props) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    const handleChange = (value: string) => {
        const next = new URLSearchParams(searchParams.toString())
        const parsed = Number(value) as PageSize
        if (parsed === DEFAULT_PAGE_SIZE) {
            next.delete('pageSize')
        } else {
            next.set('pageSize', String(parsed))
        }
        // Changing page size shifts what the current page number means, so
        // reset to the first page to avoid landing past the end.
        next.delete('page')
        const query = next.toString()
        const href = query ? `${pathname}?${query}` : pathname
        startTransition(() => {
            router.replace(href, { scroll: false })
        })
    }

    return (
        <div
            className='text-muted-foreground flex items-center gap-2 text-sm'
            data-pending={isPending || undefined}
        >
            <span>Rows per page</span>
            <Select value={String(pageSize)} onValueChange={handleChange}>
                <SelectTrigger className='h-8 w-[80px]'>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {PAGE_SIZE_OPTIONS.map((size) => (
                        <SelectItem key={size} value={String(size)}>
                            {size}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
