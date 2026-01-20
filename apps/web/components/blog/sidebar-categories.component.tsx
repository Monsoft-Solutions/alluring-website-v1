/**
 * SidebarCategories Component
 *
 * Displays a list of blog categories with post counts in the sidebar.
 * Encourages category exploration from any blog post.
 *
 * SSR-compatible server component.
 */
import { FolderOpen, ChevronRight } from 'lucide-react'
import Link from 'next/link'

import type { BlogCategoryItem } from '@/lib/types/blog/taxonomy.type'

type SidebarCategoriesProps = {
    categories: BlogCategoryItem[]
    /**
     * Maximum number of categories to display before showing "View All"
     */
    maxDisplay?: number
}

export function SidebarCategories({
    categories,
    maxDisplay = 6,
}: SidebarCategoriesProps) {
    // Filter to categories with posts and sort by count
    const categoriesWithPosts = categories
        .filter((c) => c.count && c.count > 0)
        .sort((a, b) => (b.count ?? 0) - (a.count ?? 0))

    if (categoriesWithPosts.length === 0) {
        return null
    }

    const displayCategories = categoriesWithPosts.slice(0, maxDisplay)
    const hasMore = categoriesWithPosts.length > maxDisplay

    return (
        <div className='rounded-xl border border-stone-200 bg-stone-50/50 p-5'>
            {/* Header */}
            <div className='mb-4 flex items-center gap-2'>
                <div className='bg-gold-500/10 flex h-8 w-8 items-center justify-center rounded-full'>
                    <FolderOpen className='text-gold-600 h-4 w-4' />
                </div>
                <h3 className='text-xs font-bold tracking-[0.15em] text-stone-500 uppercase'>
                    Browse by Topic
                </h3>
            </div>

            {/* Categories list */}
            <ul className='space-y-1'>
                {displayCategories.map((category) => (
                    <li key={category.id}>
                        <Link
                            href={`/blog/categories/${category.slug}`}
                            className='group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-white'
                        >
                            <span className='font-medium text-stone-700 transition-colors group-hover:text-stone-900'>
                                {category.name}
                            </span>
                            <span className='text-gold-600 text-xs font-medium'>
                                {category.count}
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>

            {/* View all link */}
            {hasMore && (
                <Link
                    href='/blog/categories'
                    className='text-gold-600 hover:text-gold-700 mt-4 flex items-center justify-center gap-1 text-sm font-medium transition-colors'
                >
                    View All Categories
                    <ChevronRight className='h-4 w-4' />
                </Link>
            )}
        </div>
    )
}
