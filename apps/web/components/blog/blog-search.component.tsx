'use client'

/**
 * BlogSearch Component
 *
 * Client-side search modal for blog posts with fuzzy matching.
 * Features:
 * - Pre-loaded search index for instant results
 * - Fuzzy search with highlighting
 * - Keyboard navigation (Escape to close, Enter to select)
 * - Mobile-friendly modal overlay
 *
 * Uses client-side fuzzy search for fast, responsive results.
 */
import { Search, X, FileText } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

import { cn } from '@workspace/ui/lib/utils'

import type { SearchIndexPost } from '@/lib/queries/blog/search-posts.query'

type BlogSearchProps = {
    searchIndex: SearchIndexPost[]
}

/**
 * Simple fuzzy search function
 * Returns posts where the query appears in title or excerpt (case-insensitive)
 */
function fuzzySearch(
    posts: SearchIndexPost[],
    query: string
): SearchIndexPost[] {
    const normalizedQuery = query.toLowerCase().trim()

    if (normalizedQuery.length < 2) {
        return []
    }

    const queryWords = normalizedQuery.split(/\s+/)

    return posts
        .filter((post) => {
            const title = post.title.toLowerCase()
            const excerpt = (post.excerpt ?? '').toLowerCase()
            const combined = `${title} ${excerpt}`

            // Check if all query words appear in title or excerpt
            return queryWords.every((word) => combined.includes(word))
        })
        .slice(0, 8) // Limit results
}

/**
 * Highlight matching text in a string
 */
function highlightMatch(text: string, query: string): string {
    if (!query || query.length < 2) return text

    const queryWords = query.toLowerCase().split(/\s+/)
    let result = text

    queryWords.forEach((word) => {
        const regex = new RegExp(`(${word})`, 'gi')
        result = result.replace(
            regex,
            '<mark class="bg-gold-200 text-stone-900">$1</mark>'
        )
    })

    return result
}

export function BlogSearch({ searchIndex }: BlogSearchProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [selectedIndex, setSelectedIndex] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)
    const resultsRef = useRef<HTMLDivElement>(null)

    // Memoize search results
    const results = useMemo(
        () => fuzzySearch(searchIndex, query),
        [searchIndex, query]
    )

    // Handle query change - reset selected index when query changes
    const handleQueryChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setQuery(e.target.value)
            setSelectedIndex(0)
        },
        []
    )

    // Open modal handler
    const openModal = useCallback(() => {
        setIsOpen(true)
    }, [])

    // Close modal handler - resets state when closing
    const closeModal = useCallback(() => {
        setIsOpen(false)
        setQuery('')
        setSelectedIndex(0)
    }, [])

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus()
        }
    }, [isOpen])

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Open search with Cmd/Ctrl + K
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                openModal()
            }

            // Close with Escape
            if (e.key === 'Escape' && isOpen) {
                closeModal()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, openModal, closeModal])

    // Handle keyboard navigation in results
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault()
                setSelectedIndex((prev) =>
                    prev < results.length - 1 ? prev + 1 : prev
                )
            } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev))
            } else if (e.key === 'Enter' && results[selectedIndex]) {
                e.preventDefault()
                window.location.href = `/${results[selectedIndex].slug}`
            }
        },
        [results, selectedIndex]
    )

    // Scroll selected item into view
    useEffect(() => {
        if (resultsRef.current && results.length > 0) {
            const selectedElement = resultsRef.current.children[
                selectedIndex
            ] as HTMLElement
            selectedElement?.scrollIntoView({ block: 'nearest' })
        }
    }, [selectedIndex, results.length])

    return (
        <>
            {/* Search trigger button */}
            <button
                onClick={openModal}
                className='group flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-500 shadow-sm transition-all duration-200 hover:border-stone-300 hover:bg-stone-50 hover:shadow-md sm:px-4 sm:py-2'
                aria-label='Open search'
            >
                <Search className='h-5 w-5 text-stone-400 transition-colors group-hover:text-stone-600 sm:h-4 sm:w-4' />
                <span className='hidden sm:inline'>Search articles...</span>
                <kbd className='text-gold-600 hidden rounded border border-stone-200 bg-stone-50 px-1.5 py-0.5 text-xs font-medium md:inline'>
                    ⌘K
                </kbd>
            </button>

            {/* Modal overlay */}
            {isOpen && (
                <div
                    className='fixed inset-0 z-50 flex items-start justify-center bg-stone-900/60 backdrop-blur-sm'
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            closeModal()
                        }
                    }}
                >
                    {/* Modal content */}
                    <div className='animate-fade-in-up mx-4 mt-[15vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl'>
                        {/* Search input */}
                        <div className='relative border-b border-stone-200'>
                            <Search className='absolute top-1/2 left-5 h-5 w-5 -translate-y-1/2 text-stone-400' />
                            <input
                                ref={inputRef}
                                type='text'
                                value={query}
                                onChange={handleQueryChange}
                                onKeyDown={handleKeyDown}
                                placeholder='Search articles...'
                                className='w-full border-0 bg-transparent py-5 pr-12 pl-14 text-lg text-stone-900 outline-none placeholder:text-stone-400'
                            />
                            <button
                                onClick={closeModal}
                                className='absolute top-1/2 right-4 -translate-y-1/2 rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600'
                            >
                                <X className='h-5 w-5' />
                            </button>
                        </div>

                        {/* Results */}
                        <div
                            ref={resultsRef}
                            className='max-h-[60vh] overflow-y-auto'
                        >
                            {query.length >= 2 && results.length === 0 && (
                                <div className='flex flex-col items-center justify-center py-12 text-center'>
                                    <FileText className='mb-3 h-10 w-10 text-stone-300' />
                                    <p className='text-sm font-medium text-stone-600'>
                                        No results found
                                    </p>
                                    <p className='mt-1 text-xs text-stone-400'>
                                        Try different keywords or browse
                                        categories
                                    </p>
                                </div>
                            )}

                            {results.length > 0 && (
                                <ul className='py-2'>
                                    {results.map((post, index) => (
                                        <li key={post.slug}>
                                            <Link
                                                href={`/${post.slug}`}
                                                className={cn(
                                                    'flex items-start gap-4 px-5 py-4 transition-colors',
                                                    index === selectedIndex
                                                        ? 'bg-gold-50'
                                                        : 'hover:bg-stone-50'
                                                )}
                                                onClick={closeModal}
                                            >
                                                {/* Icon */}
                                                <div
                                                    className={cn(
                                                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                                                        index === selectedIndex
                                                            ? 'bg-gold-500 text-white'
                                                            : 'bg-stone-100 text-stone-500'
                                                    )}
                                                >
                                                    <FileText className='h-5 w-5' />
                                                </div>

                                                {/* Content */}
                                                <div className='min-w-0 flex-1'>
                                                    <h4
                                                        className='line-clamp-1 font-medium text-stone-900'
                                                        dangerouslySetInnerHTML={{
                                                            __html: highlightMatch(
                                                                post.title,
                                                                query
                                                            ),
                                                        }}
                                                    />
                                                    {post.excerpt && (
                                                        <p
                                                            className='mt-1 line-clamp-2 text-sm text-stone-500'
                                                            dangerouslySetInnerHTML={{
                                                                __html: highlightMatch(
                                                                    post.excerpt,
                                                                    query
                                                                ),
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {query.length < 2 && (
                                <div className='py-8 text-center'>
                                    <p className='text-sm text-stone-400'>
                                        Type at least 2 characters to search
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className='flex items-center justify-between border-t border-stone-200 bg-stone-50 px-5 py-3'>
                            <div className='flex items-center gap-4 text-xs text-stone-500'>
                                <span className='flex items-center gap-1'>
                                    <kbd className='rounded border border-stone-200 bg-white px-1.5 py-0.5 font-mono'>
                                        ↑
                                    </kbd>
                                    <kbd className='rounded border border-stone-200 bg-white px-1.5 py-0.5 font-mono'>
                                        ↓
                                    </kbd>
                                    <span className='ml-1'>Navigate</span>
                                </span>
                                <span className='flex items-center gap-1'>
                                    <kbd className='rounded border border-stone-200 bg-white px-1.5 py-0.5 font-mono'>
                                        ↵
                                    </kbd>
                                    <span className='ml-1'>Select</span>
                                </span>
                                <span className='flex items-center gap-1'>
                                    <kbd className='rounded border border-stone-200 bg-white px-1.5 py-0.5 font-mono'>
                                        Esc
                                    </kbd>
                                    <span className='ml-1'>Close</span>
                                </span>
                            </div>
                            <span className='text-xs text-stone-400'>
                                {searchIndex.length} articles
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
