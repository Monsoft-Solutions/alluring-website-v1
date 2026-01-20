/**
 * CategoryPills Component
 *
 * Horizontal scrollable category filter pills for the blog landing page.
 * Features:
 * - Horizontal scroll on mobile
 * - Click navigates to category page
 * - "All" pill as first option
 * - Gold accent on active pill
 *
 * SSR-compatible server component.
 */
import Link from 'next/link'

import type { BlogCategoryItem } from '@/lib/types/blog/taxonomy.type'

type CategoryPillsProps = {
    categories: BlogCategoryItem[]
    activeSlug?: string
}

export function CategoryPills({ categories, activeSlug }: CategoryPillsProps) {
    // Filter to only show categories with posts
    const categoriesWithPosts = categories.filter((c) => c.count && c.count > 0)

    if (categoriesWithPosts.length === 0) {
        return null
    }

    const isAllActive = !activeSlug

    return (
        <nav
            aria-label='Filter posts by category'
            className='relative w-full overflow-hidden'
        >
            {/* Gradient fade indicators for horizontal scroll */}
            <div className='pointer-events-none absolute top-0 left-0 z-10 h-full w-8 bg-gradient-to-r from-white to-transparent md:hidden' />
            <div className='pointer-events-none absolute top-0 right-0 z-10 h-full w-8 bg-gradient-to-l from-white to-transparent md:hidden' />

            <div className='no-scrollbar flex gap-2 overflow-x-auto px-1 py-2 md:flex-wrap md:justify-center md:gap-3 md:overflow-visible'>
                {/* "All" pill - always first */}
                <Link
                    href='/blog'
                    className={`shrink-0 rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                        isAllActive
                            ? 'border-gold-500 bg-gold-500 shadow-gold-500/20 text-white shadow-md'
                            : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50'
                    }`}
                >
                    All Posts
                </Link>

                {/* Category pills */}
                {categoriesWithPosts.map((category) => {
                    const isActive = activeSlug === category.slug

                    return (
                        <Link
                            key={category.id}
                            href={`/blog/categories/${category.slug}`}
                            className={`shrink-0 rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                                isActive
                                    ? 'border-gold-500 bg-gold-500 shadow-gold-500/20 text-white shadow-md'
                                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50'
                            }`}
                        >
                            {category.name}
                            {category.count && category.count > 0 && (
                                <span
                                    className={`ml-1.5 text-xs ${
                                        isActive
                                            ? 'text-white/80'
                                            : 'text-stone-400'
                                    }`}
                                >
                                    ({category.count})
                                </span>
                            )}
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
