/**
 * Instagram Pagination Component
 *
 * SSR-friendly pagination links for Instagram grid.
 *
 * @module components/instagram/instagram-pagination
 */
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type InstagramPaginationProps = {
    currentPage: number
    totalPages: number
    basePath?: string
}

export function InstagramPagination({
    currentPage,
    totalPages,
    basePath = '/instagram',
}: InstagramPaginationProps) {
    if (totalPages <= 1) return null

    const hasPreviousPage = currentPage > 1
    const hasNextPage = currentPage < totalPages

    // Generate page numbers to show
    const getPageNumbers = (): (number | 'ellipsis')[] => {
        const pages: (number | 'ellipsis')[] = []
        const showEllipsisThreshold = 7

        if (totalPages <= showEllipsisThreshold) {
            // Show all pages
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            // Show first, last, current, and neighbors with ellipsis
            pages.push(1)

            if (currentPage > 3) {
                pages.push('ellipsis')
            }

            const start = Math.max(2, currentPage - 1)
            const end = Math.min(totalPages - 1, currentPage + 1)

            for (let i = start; i <= end; i++) {
                pages.push(i)
            }

            if (currentPage < totalPages - 2) {
                pages.push('ellipsis')
            }

            pages.push(totalPages)
        }

        return pages
    }

    const getPageHref = (page: number): string => {
        if (page === 1) return basePath
        return `${basePath}?page=${page}`
    }

    return (
        <nav
            className='flex items-center justify-center gap-1 py-8'
            aria-label='Pagination'
        >
            {/* Previous Button */}
            {hasPreviousPage ? (
                <Link
                    href={getPageHref(currentPage - 1)}
                    className='flex h-10 w-10 items-center justify-center rounded-md border border-stone-200 text-stone-600 transition-colors hover:bg-stone-100'
                    aria-label='Previous page'
                >
                    <ChevronLeft className='h-5 w-5' />
                </Link>
            ) : (
                <span className='flex h-10 w-10 items-center justify-center rounded-md border border-stone-100 text-stone-300'>
                    <ChevronLeft className='h-5 w-5' />
                </span>
            )}

            {/* Page Numbers */}
            <div className='flex items-center gap-1'>
                {getPageNumbers().map((page, index) =>
                    page === 'ellipsis' ? (
                        <span
                            key={`ellipsis-${index}`}
                            className='flex h-10 w-10 items-center justify-center text-stone-400'
                        >
                            ...
                        </span>
                    ) : page === currentPage ? (
                        <span
                            key={page}
                            className='flex h-10 w-10 items-center justify-center rounded-md bg-stone-900 text-sm font-medium text-white'
                            aria-current='page'
                        >
                            {page}
                        </span>
                    ) : (
                        <Link
                            key={page}
                            href={getPageHref(page)}
                            className='flex h-10 w-10 items-center justify-center rounded-md border border-stone-200 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100'
                        >
                            {page}
                        </Link>
                    )
                )}
            </div>

            {/* Next Button */}
            {hasNextPage ? (
                <Link
                    href={getPageHref(currentPage + 1)}
                    className='flex h-10 w-10 items-center justify-center rounded-md border border-stone-200 text-stone-600 transition-colors hover:bg-stone-100'
                    aria-label='Next page'
                >
                    <ChevronRight className='h-5 w-5' />
                </Link>
            ) : (
                <span className='flex h-10 w-10 items-center justify-center rounded-md border border-stone-100 text-stone-300'>
                    <ChevronRight className='h-5 w-5' />
                </span>
            )}
        </nav>
    )
}
