/**
 * Pagination
 *
 * SSR-rendered pagination. Every page is a real `<a>`, so crawlers follow the
 * whole set and a visitor without JavaScript still gets through it.
 *
 * Routes differ in how they encode the page — `/instagram?page=2` versus
 * `/reviews/page/2` — so callers supply `hrefForPage` rather than the component
 * guessing from a base path.
 *
 * @module components/shared/pagination
 */
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type PaginationProps = {
    /** 1-based page currently being viewed */
    readonly currentPage: number
    /** Total number of pages */
    readonly totalPages: number
    /** Builds the href for a given 1-based page number */
    readonly hrefForPage: (page: number) => string
    /** Accessible name for the nav landmark. Defaults to `Pagination`. */
    readonly label?: string
}

/** Number of pages below which every page number is shown without ellipses. */
const ELLIPSIS_THRESHOLD = 7

/**
 * The page numbers to render: first, last, the current page and its immediate
 * neighbours, with ellipses standing in for the gaps.
 */
function getPageNumbers(
    currentPage: number,
    totalPages: number
): (number | 'ellipsis')[] {
    if (totalPages <= ELLIPSIS_THRESHOLD) {
        return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const pages: (number | 'ellipsis')[] = [1]

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

    return pages
}

const ARROW_ACTIVE =
    'flex h-10 w-10 items-center justify-center rounded-md border border-stone-200 text-stone-600 transition-colors hover:bg-stone-100'
const ARROW_DISABLED =
    'flex h-10 w-10 items-center justify-center rounded-md border border-stone-100 text-stone-300'

type PaginationLinksProps = {
    /** 1-based page currently being viewed */
    readonly currentPage: number
    /** Total number of pages */
    readonly totalPages: number
    /** Builds the absolute URL for a given 1-based page number */
    readonly hrefForPage: (page: number) => string
}

/**
 * `<link rel="prev">` and `<link rel="next">` for a paginated set.
 *
 * These cannot go through Next's `Metadata.alternates`, which models only
 * `canonical`, `languages`, `media` and `types`. Assigning `prev`/`next` there
 * type-checks behind a cast and then renders nothing at all — verified against
 * production, where `/instagram?page=3` has a canonical and no prev/next
 * despite the code appearing to set both.
 *
 * Rendered as real elements instead; React hoists `<link>` into `<head>`.
 *
 * Google stopped using rel prev/next as an indexing signal in 2019, but Bing
 * still reads it — which matters here, because Bing's index is what backs
 * ChatGPT's search.
 */
export function PaginationLinks({
    currentPage,
    totalPages,
    hrefForPage,
}: PaginationLinksProps) {
    return (
        <>
            {currentPage > 1 && (
                <link rel='prev' href={hrefForPage(currentPage - 1)} />
            )}
            {currentPage < totalPages && (
                <link rel='next' href={hrefForPage(currentPage + 1)} />
            )}
        </>
    )
}

export function Pagination({
    currentPage,
    totalPages,
    hrefForPage,
    label = 'Pagination',
}: PaginationProps) {
    if (totalPages <= 1) return null

    const hasPreviousPage = currentPage > 1
    const hasNextPage = currentPage < totalPages

    return (
        <nav
            /*
             * Wraps rather than overflows. Nine 40px controls plus their gaps
             * need ~390px; a 390px phone leaves ~342px inside the content
             * wrapper's padding, so a nowrap row puts the last page number
             * off-screen and the document into horizontal scroll. Wrapping also
             * keeps this correct for /instagram, which has 34 pages.
             *
             * The controls are direct children — with the page numbers in their
             * own nested flex row, a wrap would break between the arrows and
             * the numbers instead of between numbers.
             */
            className='flex flex-wrap items-center justify-center gap-1 py-8'
            aria-label={label}
        >
            {/* Previous */}
            {hasPreviousPage ? (
                <Link
                    href={hrefForPage(currentPage - 1)}
                    className={ARROW_ACTIVE}
                    aria-label='Previous page'
                    rel='prev'
                >
                    <ChevronLeft className='h-5 w-5' />
                </Link>
            ) : (
                <span className={ARROW_DISABLED} aria-hidden='true'>
                    <ChevronLeft className='h-5 w-5' />
                </span>
            )}

            {/* Page numbers */}
            {getPageNumbers(currentPage, totalPages).map((page, index) =>
                page === 'ellipsis' ? (
                    <span
                        key={`ellipsis-${index}`}
                        className='flex h-10 w-6 items-center justify-center text-stone-400'
                        aria-hidden='true'
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
                        href={hrefForPage(page)}
                        className='flex h-10 w-10 items-center justify-center rounded-md border border-stone-200 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100'
                        aria-label={`Page ${page}`}
                    >
                        {page}
                    </Link>
                )
            )}

            {/* Next */}
            {hasNextPage ? (
                <Link
                    href={hrefForPage(currentPage + 1)}
                    className={ARROW_ACTIVE}
                    aria-label='Next page'
                    rel='next'
                >
                    <ChevronRight className='h-5 w-5' />
                </Link>
            ) : (
                <span className={ARROW_DISABLED} aria-hidden='true'>
                    <ChevronRight className='h-5 w-5' />
                </span>
            )}
        </nav>
    )
}
